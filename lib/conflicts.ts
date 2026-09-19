import {
  type LandParcelProperties,
  type ConflictResult,
  ConflictResultSchema,
} from "@/lib/schemas";

/**
 * ============================================================================
 * INTER-DEPARTMENTAL CONFLICT DETECTION ENGINE
 * ============================================================================
 * 
 * In traditional land administration, government departments operate in deep silos:
 * - Revenue Department (Tehsil / Collectorate): Governs agricultural titles,
 *   khasra land use classification, and land ceilings (e.g. UP Zamindari Abolition Act).
 * - Municipal Town Planning Authorities (LDA, CMDA, GMADA, DDA): Issue building
 *   permits, master plan zoning, and floor area ratios (FAR).
 * - Registration Department (Sub-Registrar): Registers deeds and conveyances without
 *   mandatory cross-verification of current zoning permissions.
 * 
 * THE CORE PROBLEM (ZONING VS. PERMISSION CONTRADICTION):
 * Unscrupulous real estate promoters frequently obtain residential or commercial
 * building approvals from urban local bodies on agricultural or green-belt parcels
 * without legally converting agricultural land under Section 143/80 (UP Revenue Code)
 * or state Land Conversion rules. When innocent citizens purchase these plots, they
 * face sudden demolition drives, sealed properties, or disputed titles.
 * 
 * THE DPI SOLUTION:
 * This function performs real-time cross-departmental reconciliation between the
 * Revenue Department's `landUse` classification and the Town Planning Authority's
 * `buildingPermission` status.
 * 
 * If a parcel is officially zoned 'Agricultural' but has been issued a 'Residential'
 * or 'Commercial' building permission, the engine instantly flags a critical
 * inter-departmental conflict, returns a structured, Zod-validated `ConflictResult`,
 * and surfaces an urgent alert on the citizen/officer dashboard before transactions execute.
 * 
 * @param parcel - The parcel properties object containing landUse and buildingPermission attributes
 * @returns Validated ConflictResult object conforming to ConflictResultSchema
 */
export function detectConflictResult(
  parcel: Partial<LandParcelProperties> | null | undefined
): ConflictResult {
  if (!parcel) {
    return {
      hasConflict: false,
      message: null,
      severity: "none",
    };
  }

  const landUse = (parcel.landUse || "").toLowerCase().trim();
  const buildingPermission = (parcel.buildingPermission || "").toLowerCase().trim();

  // Check if parcel is zoned Agricultural while building permission is approved for Residential use
  if (
    landUse.includes("agricultural") &&
    buildingPermission.includes("residential")
  ) {
    const rawResult: ConflictResult = {
      hasConflict: true,
      message:
        "Conflict Detected: Building permission issued for Residential use, but parcel is zoned Agricultural.",
      conflictType: "zoning_vs_building_permission",
      severity: "critical",
      detectedAt: new Date().toISOString(),
    };
    return ConflictResultSchema.parse(rawResult);
  }

  // Handle other possible zoning conflicts (e.g. Agricultural with Commercial/Industrial permission)
  if (
    landUse.includes("agricultural") &&
    (buildingPermission.includes("commercial") || buildingPermission.includes("industrial"))
  ) {
    const rawResult: ConflictResult = {
      hasConflict: true,
      message: `Conflict Detected: Building permission issued for ${parcel.buildingPermission} use, but parcel is zoned Agricultural.`,
      conflictType: "zoning_vs_building_permission",
      severity: "critical",
      detectedAt: new Date().toISOString(),
    };
    return ConflictResultSchema.parse(rawResult);
  }

  return {
    hasConflict: false,
    message: null,
    severity: "none",
  };
}

/**
 * High-level helper returning a human-readable conflict warning string if an
 * inter-departmental discrepancy is detected, or `null` if the parcel is clear.
 * 
 * Internally delegates to `detectConflictResult(parcel)` to leverage strict Zod
 * runtime validation and structured error reporting.
 * 
 * @param parcel - Land parcel properties object to evaluate
 * @returns Human-readable conflict warning message (e.g. "Conflict Detected: ..."), or null
 */
export function detectConflicts(
  parcel: Partial<LandParcelProperties> | null | undefined
): string | null {
  const result = detectConflictResult(parcel);
  return result.message;
}

