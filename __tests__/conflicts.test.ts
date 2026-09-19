import { describe, it, expect } from "vitest";
import { detectConflicts, detectConflictResult } from "@/lib/conflicts";
import type { LandParcelProperties } from "@/lib/schemas";

describe("Inter-Departmental Conflict Detection: detectConflicts()", () => {
  const mismatchedParcel: Partial<LandParcelProperties> = {
    ulpin: "UP26A8941B",
    khasraNo: "412",
    landUse: "Agricultural",
    buildingPermission: "Residential - Approved (LDA/BP/2024/901)",
  };

  const cleanParcel: Partial<LandParcelProperties> = {
    ulpin: "UP09K2452M",
    khasraNo: "518",
    landUse: "Residential",
    buildingPermission: "Residential - Approved",
  };

  it("correctly flags an inter-departmental mismatch between Agricultural zoning and Residential building permission", () => {
    const conflictMessage = detectConflicts(mismatchedParcel);

    expect(conflictMessage).not.toBeNull();
    expect(conflictMessage).toContain("Conflict Detected");
    expect(conflictMessage).toContain("Residential");
    expect(conflictMessage).toContain("Agricultural");
  });

  it("returns a structured, Zod-validated ConflictResult object with critical severity", () => {
    const result = detectConflictResult(mismatchedParcel);

    expect(result.hasConflict).toBe(true);
    expect(result.severity).toBe("critical");
    expect(result.conflictType).toBe("zoning_vs_building_permission");
    expect(result.message).toContain("Conflict Detected");
    expect(result.detectedAt).toBeDefined();
  });

  it("returns null / hasConflict: false when zoning and building permission match", () => {
    const conflictMessage = detectConflicts(cleanParcel);
    expect(conflictMessage).toBeNull();

    const result = detectConflictResult(cleanParcel);
    expect(result.hasConflict).toBe(false);
    expect(result.message).toBeNull();
    expect(result.severity).toBe("none");
  });

  it("flags Agricultural parcels with Commercial or Industrial building permits", () => {
    const commercialMismatch: Partial<LandParcelProperties> = {
      ulpin: "UP99COMM44",
      landUse: "Agricultural",
      buildingPermission: "Commercial - Mall Approval",
    };

    const result = detectConflictResult(commercialMismatch);
    expect(result.hasConflict).toBe(true);
    expect(result.severity).toBe("critical");
    expect(result.message).toContain("Commercial");
  });

  it("handles null or undefined parcels safely without throwing", () => {
    expect(detectConflicts(null)).toBeNull();
    expect(detectConflicts(undefined)).toBeNull();
    expect(detectConflictResult(null).hasConflict).toBe(false);
  });
});
