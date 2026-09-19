import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
} from "@/data/parcels";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import {
  LandParcelFeatureCollectionSchema,
  LandParcelFeatureSchema,
  formatZodError,
  type LandParcelFeatureCollection,
} from "@/lib/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

const QueryParamsSchema = z.object({
  state: z
    .string()
    .max(50, "State parameter too long")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Invalid characters in state parameter")
    .optional(),
});

/**
 * GET /api/parcels
 * Returns full GeoJSON FeatureCollection of land parcels reading from data/parcels.ts.
 * Supports optional ?state query filter (e.g. ?state=Tamil Nadu | Chandigarh | Uttar Pradesh | all).
 * Performs runtime schema validation on query params and outgoing FeatureCollection.
 *
 * PRODUCTION ARCHITECTURE & SECURITY SPECIFICATION:
 * 1. Production Authentication & RBAC:
 *    - In production, requests to this endpoint must be authenticated via NextAuth / Auth.js or API Gateway.
 *    - Citizen endpoints accept anonymous or DigiLocker OAuth2 / e-Pramaan sessions.
 *    - Officer endpoints enforce JWT Bearer tokens with Role-Based Access Control (RBAC) and DSC verification:
 *      e.g. `const session = await getServerSession(authOptions); if (!session) return unauthorized();`
 * 2. Distributed Rate Limiting:
 *    - Currently uses in-memory sliding window stub (`lib/rateLimit.ts`) enforcing 60 req/min per IP.
 *    - In production, replace with Upstash Redis / Redis cluster middleware in `middleware.ts`:
 *      e.g. `const { success } = await redisRatelimit.limit(clientIp); if (!success) return 429;`
 */
export async function GET(request: Request) {
  try {
    // Rate Limiting Check (Production: Redis sliding window middleware)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`parcels:get:${clientIp}`, 60, 60000);
    const rateHeaders = getRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded. Maximum 60 requests per minute. Retry in ${rateLimit.retryAfterSeconds}s.`,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429, headers: rateHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawState = searchParams.get("state") ?? undefined;

    // Validate query parameters
    const paramValidation = QueryParamsSchema.safeParse({ state: rawState });
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Invalid query parameter",
          details: formatZodError(paramValidation.error),
        },
        { status: 400 }
      );
    }

    const stateParam = paramValidation.data.state?.toLowerCase();

    const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
    const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");

    let features = [...up.features, ...tn.features, ...ch.features];

    if (stateParam && stateParam !== "all") {
      if (stateParam.includes("tamil") || stateParam === "tn") {
        features = tn.features;
      } else if (stateParam.includes("chandigarh") || stateParam === "ch") {
        features = ch.features;
      } else if (stateParam.includes("uttar") || stateParam === "up") {
        features = up.features;
      }
    }

    const rawCollection = {
      type: "FeatureCollection",
      features,
    };

    // Runtime validate outgoing collection against Zod canonical schema
    const validationResult = LandParcelFeatureCollectionSchema.safeParse(rawCollection);
    if (!validationResult.success) {
      console.error(
        "[GET /api/parcels] Runtime validation failed for FeatureCollection:",
        validationResult.error
      );
      return NextResponse.json(
        {
          error: "Internal Data Integrity Error",
          message: "Cadastral FeatureCollection failed runtime schema validation",
          details: formatZodError(validationResult.error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(validationResult.data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        ...rateHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve parcel GeoJSON collection";
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/parcels
 * Ingests and validates a single LandParcelFeature or LandParcelFeatureCollection entering the app.
 * Rejects malformed records with HTTP 400 and detailed Zod validation diagnostics.
 *
 * PRODUCTION ARCHITECTURE & SECURITY SPECIFICATION:
 * 1. Production Authentication & Mutation Permissions:
 *    - Ingesting and mutating land records requires strict government officer / system-to-system authentication.
 *    - Must verify HMAC-SHA256 signature from trusted state registries (e.g. NIC Bhulekh, Tamil Nilam)
 *      or enforce Officer token with `mutation:write` claim:
 *      e.g. `const session = await getOfficerSession(req); if (!session?.hasPermission("CADASTRAL_MUTATION")) return forbidden();`
 * 2. Distributed Rate Limiting:
 *    - Currently uses in-memory rate limiter stub (30 mutations/min).
 *    - In production, configure Redis token bucket middleware with mTLS IP whitelisting.
 */
export async function POST(request: Request) {
  try {
    // Rate Limiting Check (Production: Redis sliding window middleware)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`parcels:post:${clientIp}`, 30, 60000);
    const rateHeaders = getRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Mutation rate limit exceeded. Maximum 30 submissions per minute. Retry in ${rateLimit.retryAfterSeconds}s.`,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429, headers: rateHeaders }
      );
    }

    const body = await request.json();

    // Check if input is a FeatureCollection or a single Feature
    if (body?.type === "FeatureCollection") {
      const collectionValidation = LandParcelFeatureCollectionSchema.safeParse(body);
      if (!collectionValidation.success) {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Malformed FeatureCollection data",
            details: formatZodError(collectionValidation.error),
            issues: collectionValidation.error.issues,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: true,
          message: "FeatureCollection successfully validated",
          count: collectionValidation.data.features.length,
          data: collectionValidation.data,
        },
        { status: 200, headers: rateHeaders }
      );
    }

    // Default: Validate as a single LandParcelFeature
    const featureValidation = LandParcelFeatureSchema.safeParse(body);
    if (!featureValidation.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Malformed LandParcelFeature record",
          details: formatZodError(featureValidation.error),
          issues: featureValidation.error.issues,
        },
        { status: 400, headers: rateHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Parcel record successfully validated",
        ulpin: featureValidation.data.properties.ulpin,
        data: featureValidation.data,
      },
      { status: 200, headers: rateHeaders }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to parse JSON body";
    return NextResponse.json(
      {
        error: "Bad Request",
        message: "Malformed JSON payload in request body",
        details: errorMessage,
      },
      { status: 400 }
    );
  }
}

