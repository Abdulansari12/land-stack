import { describe, it, expect } from "vitest";
import { normalizeParcel } from "@/lib/schemaAdapter";
import { LandParcelPropertiesSchema } from "@/lib/schemas";

describe("Cross-State Schema Adapter: normalizeParcel()", () => {
  it("correctly maps Tamil Nadu e-Services (Patta/Chitta) raw data to the canonical ULPIN schema", () => {
    const rawTamilNaduData = {
      patta_no: "TN-2026-PATTA-88219",
      survey_subdivision: "142/3A",
      pattadar_name: "K. Subramanian",
      classification: "Nanjai (Wet Land / Agricultural)",
      dispute_status: "No active civil disputes",
      ec_status: "Nil Encumbrance (Free from bank liens)",
      extent_hectares: "1.45",
      tax_paid_status: "Paid (FY 2025-26)",
      utility_feeders: ["TANGEDCO 11kV Rural Feeder", "Palar River Irrigation"],
      guideline_val_inr: 4500000,
    };

    const normalized = normalizeParcel(rawTamilNaduData, "Tamil Nadu");

    // 1. Structural assertions
    expect(normalized.ulpin).toBe("TN-2026-PATTA-88219");
    expect(normalized.khasraNo).toBe("142/3A");
    expect(normalized.ownerName).toBe("K. Subramanian");
    expect(normalized.landUse).toBe("Agricultural");
    expect(normalized.rorStatus).toBe("Verified");
    expect(normalized.clearOrDisputed).toBe("Clear");
    expect(normalized.taxStatus).toBe("Paid");
    expect(normalized.areaInHectares).toBe(1.45);
    expect(normalized.marketValueInINR).toBe(4500000);
    expect(normalized.sourceState).toBe("Tamil Nadu");
    expect(normalized.rawSourceData).toBeDefined();

    // 2. Strict Zod schema validation
    const validation = LandParcelPropertiesSchema.safeParse(normalized);
    expect(validation.success).toBe(true);
  });

  it("correctly maps Chandigarh Estate Office raw data to the canonical ULPIN schema", () => {
    const rawChandigarhData = {
      propertyId: "CH-SEC17-SCO-2041",
      sectorPlotNo: "SCO 42, Sector 17-C",
      ownerFullName: "Harpreet Singh Dhillon",
      useType: "Commercial SCO / Office Complex",
      disputeFlag: false,
      encumbranceSummary: "Nil (Estate Office NOC Clear)",
      plotAreaHa: 0.35,
      propertyTaxDues: "Zero Dues (Paid)",
      collectorRateValuation: 24000000,
      utilityInfrastructure: ["Underground Power Grid", "MC Municipal Water"],
    };

    const normalized = normalizeParcel(rawChandigarhData, "Chandigarh");

    // 1. Structural assertions
    expect(normalized.ulpin).toBe("CH-SEC17-SCO-2041");
    expect(normalized.khasraNo).toBe("SCO 42, Sector 17-C");
    expect(normalized.ownerName).toBe("Harpreet Singh Dhillon");
    expect(normalized.landUse).toBe("Commercial");
    expect(normalized.rorStatus).toBe("Digitally Signed");
    expect(normalized.clearOrDisputed).toBe("Clear");
    expect(normalized.taxStatus).toBe("Paid");
    expect(normalized.areaInHectares).toBe(0.35);
    expect(normalized.marketValueInINR).toBe(24000000);
    expect(normalized.sourceState).toBe("Chandigarh");

    // 2. Strict Zod schema validation
    const validation = LandParcelPropertiesSchema.safeParse(normalized);
    expect(validation.success).toBe(true);
  });

  it("correctly identifies disputed parcels across state variants", () => {
    const disputedTN = {
      patta_no: "TN-DISPUTE-01",
      survey_subdivision: "88/1",
      pattadar_name: "M. Kumar",
      classification: "Nanjai",
      dispute_status: "Civil Suit 412/2023 Pending (Disputed)",
      ec_status: "Interim Stay Order",
    };

    const normalized = normalizeParcel(disputedTN, "Tamil Nadu");
    expect(normalized.rorStatus).toBe("Disputed");
    expect(normalized.clearOrDisputed).toBe("Disputed");
  });

  it("gracefully falls back on corrupt or malformed input without crashing", () => {
    // 1. Null input triggers safe fallback catch block
    const nullFallback = normalizeParcel(null as any, "Tamil Nadu");
    expect(nullFallback.ulpin).toBe("MALFORMED-PARCEL");
    expect(nullFallback.clearOrDisputed).toBe("Disputed");
    expect(nullFallback.areaInHectares).toBe(0);

    // 2. Incomplete object input returns valid canonical structure
    const partialInput = { unexpectedField: 12345 };
    const normalized = normalizeParcel(partialInput, "Unknown State");
    expect(normalized.ulpin).toBeDefined();
    expect(normalized.landUse).toBe("Agricultural");
  });
});
