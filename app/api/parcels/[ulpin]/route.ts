import { NextResponse, type NextRequest } from "next/server";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
} from "@/data/parcels";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import {
  UlpinParamSchema,
  LandParcelFeatureSchema,
  formatZodError,
  type LandParcelFeature,
} from "@/lib/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

/**
 * GET /api/parcels/[ulpin]
 * Returns a single land parcel GeoJSON Feature by its ULPIN or property ID.
 * Reads from data/parcels.ts normalized across all state registries.
 * Enforces runtime Zod validation on incoming ULPIN parameter and outgoing parcel feature.
 *
 * PRODUCTION ARCHITECTURE & SECURITY SPECIFICATION:
 * 1. Production Authentication & Privacy Protection:
 *    - In production, this endpoint serves public title data to citizens, but sensitive PII
 *      (e.g., linked encumbrances, banking mortgages, dispute records) is filtered based on DPDP consent.
 *    - Officers requesting unmasked owner records must provide an authenticated session token:
 *      e.g. `const session = await auth(); if (!session?.user) maskPrivateFields(parcel);`
 * 2. Distributed Rate Limiting:
 *    - Currently uses in-memory sliding window stub (`lib/rateLimit.ts`) enforcing 60 req/min per IP.
 *    - In production, configure Upstash Redis / Redis cluster middleware in `middleware.ts` to defend against cadastral scraping.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ulpin: string }> }
) {
  try {
    // Rate Limiting Check (Production: Redis sliding window middleware)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`parcels:ulpin:${clientIp}`, 60, 60000);
    const rateHeaders = getRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Lookup rate limit exceeded. Maximum 60 requests per minute. Retry in ${rateLimit.retryAfterSeconds}s.`,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        { status: 429, headers: rateHeaders }
      );
    }

    const rawParams = await params;

    // Validate the incoming ULPIN route parameter
    const paramValidation = UlpinParamSchema.safeParse(rawParams?.ulpin);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Malformed or missing ULPIN parameter",
          details: formatZodError(paramValidation.error),
        },
        { status: 400 }
      );
    }

    const ulpin = paramValidation.data;
    const decodedUlpin = decodeURIComponent(ulpin).trim().toLowerCase();

    // Aggregate all parcels across states normalized into canonical ULPIN schema
    const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
    const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");

    const allFeatures: LandParcelFeature[] = [
      ...up.features,
      ...tn.features,
      ...ch.features,
    ];

    // Find parcel by ULPIN or feature ID (case-insensitive)
    const matchedParcel = allFeatures.find(
      (f) =>
        f.properties.ulpin.toLowerCase() === decodedUlpin ||
        f.id.toLowerCase() === decodedUlpin ||
        f.properties.khasraNo.toLowerCase() === decodedUlpin
    );

    if (!matchedParcel) {
      return NextResponse.json(
        {
          error: "Parcel not found",
          requestedUlpin: ulpin,
          availableSampleUlpins: [
            "UP09K2452M",
            "UP26A8941B",
            "UP80B3184X",
            "TN04M4910A",
            "CH17C0440A",
          ],
        },
        { status: 404 }
      );
    }

    // Runtime validate the matched parcel against the canonical Feature schema
    const parcelValidation = LandParcelFeatureSchema.safeParse(matchedParcel);
    if (!parcelValidation.success) {
      console.error(
        `[GET /api/parcels/${ulpin}] Runtime validation failed for parcel record:`,
        parcelValidation.error
      );
      return NextResponse.json(
        {
          error: "Internal Data Integrity Error",
          message: "Parcel record failed runtime schema validation",
          details: formatZodError(parcelValidation.error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parcelValidation.data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        ...rateHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve parcel record";
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

