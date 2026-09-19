import { NextRequest, NextResponse } from "next/server";
import { parseNLQuery } from "@/lib/nlQuery";
import { dummyLandParcels } from "@/data/parcels";
import {
  NLQueryRequestSchema,
  formatZodError,
  type LandParcelFeature,
} from "@/lib/schemas";
import { sanitizeNLQuery } from "@/lib/sanitize";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

/**
 * POST /api/nl-query
 * Natural Language Cadastral Query endpoint with hybrid rule-engine and LLM fallback.
 *
 * Security & Production Hardening:
 * 1. Input Sanitization: Strips HTML tags, script elements, and prompt injection prefixes via `sanitizeNLQuery()`.
 * 2. Production Authentication & Abuse Prevention:
 *    - In production, protect this LLM-backed route against automated scraping and prompt abuse.
 *    - Require authenticated user sessions via DigiLocker / MeriPehchaan or verified API keys.
 *    - Example: `const session = await getServerSession(); if (!session) return unauthorized();`
 * 3. Distributed Rate Limiting:
 *    - Currently enforced at 30 queries/min per IP via sliding window stub (`lib/rateLimit.ts`).
 *    - In production, back with Upstash Redis token bucket to mitigate LLM denial-of-wallet attacks.
 * 4. Strict Zod schema parameter validation (`NLQueryRequestSchema`).
 */
export async function POST(req: NextRequest) {
  try {
    // Rate Limiting Check (Production: Redis sliding window middleware)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`nl-query:${clientIp}`, 30, 60000);
    const rateHeaders = getRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `NL Query rate limit exceeded. Maximum 30 queries per minute. Retry in ${rateLimit.retryAfterSeconds}s.`,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429, headers: rateHeaders }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Request body must be a valid JSON object",
        },
        { status: 400, headers: rateHeaders }
      );
    }

    const validation = NLQueryRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Malformed request parameters",
          details: formatZodError(validation.error),
          issues: validation.error.issues,
        },
        { status: 400, headers: rateHeaders }
      );
    }

    const { query: rawQuery, parcels = dummyLandParcels.features } = validation.data;
    const typedParcels = parcels as LandParcelFeature[];

    // Sanitize user input to neutralize XSS payloads & prompt injection
    const query = sanitizeNLQuery(rawQuery);
    if (!query) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Query contains invalid or empty characters after sanitization",
        },
        { status: 400, headers: rateHeaders }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. If real API key is configured (Gemini or OpenAI)
    if (geminiKey) {
      try {
        const prompt = `You are a cadastral GIS AI parsing natural language queries for Indian land records.
Query: "${query}"

Parcels available:
${JSON.stringify(
  typedParcels.map((p) => ({
    ulpin: p.properties?.ulpin,
    khasraNo: p.properties?.khasraNo,
    ownerName: p.properties?.ownerName,
    landUse: p.properties?.landUse,
    rorStatus: p.properties?.rorStatus,
    clearOrDisputed: p.properties?.clearOrDisputed,
    taxStatus: p.properties?.taxStatus,
    areaInHectares: p.properties?.areaInHectares,
    marketValueInINR: p.properties?.marketValueInINR,
  }))
)}

Return ONLY valid JSON with this schema:
{
  "matchingParcelUlpins": string[],
  "matchedKeywords": string[],
  "intentDescription": string,
  "intentCategory": "dispute" | "tax" | "landuse" | "encroachment" | "title" | "valuation" | "area" | "general",
  "filterSummary": string,
  "explanation": string
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (res.ok) {
          const geminiData = await res.json();
          const responseText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = JSON.parse(responseText);
            return NextResponse.json(
              {
                ...parsed,
                isSimulatedLLM: false,
                model: "gemini-1.5-flash",
              },
              { status: 200, headers: rateHeaders }
            );
          }
        }
      } catch (llmErr) {
        console.warn("[NLQuery API] Gemini LLM invocation failed, falling back to rule parser:", llmErr);
      }
    } else if (openaiKey) {
      try {
        const prompt = `You are a cadastral GIS AI parsing natural language queries for Indian land records.
Query: "${query}"

Parcels available:
${JSON.stringify(
  typedParcels.map((p) => ({
    ulpin: p.properties?.ulpin,
    khasraNo: p.properties?.khasraNo,
    ownerName: p.properties?.ownerName,
    landUse: p.properties?.landUse,
    rorStatus: p.properties?.rorStatus,
    clearOrDisputed: p.properties?.clearOrDisputed,
    taxStatus: p.properties?.taxStatus,
    areaInHectares: p.properties?.areaInHectares,
    marketValueInINR: p.properties?.marketValueInINR,
  }))
)}

Respond ONLY in JSON. Return matchingParcelUlpins, matchedKeywords, intentDescription, intentCategory, filterSummary, explanation.`;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        });

        if (res.ok) {
          const openaiData = await res.json();
          const content = openaiData?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json(
              {
                ...parsed,
                isSimulatedLLM: false,
                model: "gpt-4o-mini",
              },
              { status: 200, headers: rateHeaders }
            );
          }
        }
      } catch (llmErr) {
        console.warn("[NLQuery API] OpenAI LLM invocation failed, falling back to rule parser:", llmErr);
      }
    }

    // 2. Default: Fallback to high-precision rule parser with simulated LLM indicator
    const ruleResult = parseNLQuery(query, typedParcels);
    return NextResponse.json(
      {
        ...ruleResult,
        isSimulatedLLM: true,
        model: "deterministic-nlp-engine",
        notice: "Real AI Mode active. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local to route queries directly to live cloud LLMs.",
      },
      { status: 200, headers: rateHeaders }
    );
  } catch (error: unknown) {
    console.error("[NLQuery API] Internal Error:", error);
    const details = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: "Failed to process natural language query", details },
      { status: 500 }
    );
  }
}
