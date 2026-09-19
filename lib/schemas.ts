import { z } from "zod";

/**
 * ============================================================================
 * Land Stack - Canonical Domain Schemas (Zod Runtime Validation & Types)
 * ============================================================================
 */

/**
 * Historical Chain of Title Entry (Deed registration, mutation, court order, etc.)
 */
export const ChainOfTitleEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  transactionType: z.string().min(1, "Transaction type is required"),
  documentRef: z.string().min(1, "Document reference is required"),
});

export type ChainOfTitleEntry = z.infer<typeof ChainOfTitleEntrySchema>;
export type TitleRecord = ChainOfTitleEntry;

/**
 * Conflict Detection Result Schema
 * Used when detecting contradictions between zoning/land-use and municipal building permissions.
 */
export const ConflictResultSchema = z.object({
  hasConflict: z.boolean(),
  message: z.string().nullable(),
  conflictType: z.string().optional(),
  severity: z.enum(["none", "warning", "critical"]).default("none"),
  detectedAt: z.string().optional(),
});

export type ConflictResult = z.infer<typeof ConflictResultSchema>;

/**
 * Canonical Land Parcel Properties Schema
 * Normalized across all state cadastre sources (UP, TN, Chandigarh, etc.)
 */
export const LandParcelPropertiesSchema = z.object({
  ulpin: z.string().min(1, "ULPIN identifier cannot be empty"),
  khasraNo: z.string().min(1, "Khasra or Survey number is required"),
  ownerName: z.string().min(1, "Owner / Pattadar name is required"),
  landUse: z
    .enum([
      "Agricultural",
      "Residential",
      "Commercial",
      "Industrial",
      "Institutional",
      "Mixed Use",
    ])
    .or(z.string()),
  rorStatus: z
    .enum([
      "Verified",
      "Pending Mutation",
      "Disputed",
      "Digitally Signed",
      "Under Review",
    ])
    .or(z.string()),
  clearOrDisputed: z.enum(["Clear", "Disputed", "Under Scrutiny"]).default("Clear"),
  encumbrances: z.string().default("Nil"),
  taxStatus: z
    .enum(["Paid", "Pending", "Overdue", "Exempted"])
    .or(z.string())
    .default("Paid"),
  utilityLines: z.array(z.string()).default([]),
  areaInHectares: z.number().nonnegative("Area must be non-negative"),
  marketValueInINR: z.number().nonnegative("Valuation must be non-negative").optional(),
  sourceState: z.string().optional(),
  rawSourceData: z.record(z.string(), z.unknown()).optional(),
  buildingPermission: z.string().optional(),
  chainOfTitle: z.array(ChainOfTitleEntrySchema).optional(),
  ownerConsentRequired: z.boolean().optional(),
});

export type LandParcelProperties = z.infer<typeof LandParcelPropertiesSchema>;
export type ParcelProperties = LandParcelProperties;

/**
 * GeoJSON 2D Polygon Geometry Schema
 */
export const ParcelGeometrySchema = z.object({
  type: z.literal("Polygon").or(z.string()),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
});

export type ParcelGeometry = z.infer<typeof ParcelGeometrySchema>;

/**
 * Canonical GeoJSON Feature Schema for a Single Parcel
 */
export const LandParcelFeatureSchema = z.object({
  type: z.literal("Feature").default("Feature"),
  id: z.string().min(1, "Feature ID is required"),
  geometry: ParcelGeometrySchema,
  properties: LandParcelPropertiesSchema,
});

export type LandParcelFeature = z.infer<typeof LandParcelFeatureSchema>;
export type Parcel = LandParcelFeature;

/**
 * Canonical GeoJSON FeatureCollection Schema
 */
export const LandParcelFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection").default("FeatureCollection"),
  features: z.array(LandParcelFeatureSchema),
});

export type LandParcelFeatureCollection = z.infer<
  typeof LandParcelFeatureCollectionSchema
>;

/**
 * ============================================================================
 * State-Specific Raw Schemas (Before Normalization)
 * ============================================================================
 */

/**
 * Tamil Nadu e-Services (Patta / Chitta system) Raw Properties
 */
export const RawTamilNaduPropertiesSchema = z.object({
  patta_no: z.string(),
  pattadar_name: z.string(),
  survey_subdivision: z.string(),
  classification: z.string(),
  ec_status: z.string(),
  dispute_status: z.string(),
  extent_hectares: z.number(),
  guideline_val_inr: z.number(),
  tax_paid_status: z.string(),
  utility_feeders: z.array(z.string()),
  buildingPermission: z.string().optional(),
  chainOfTitle: z.array(ChainOfTitleEntrySchema).optional(),
  ownerConsentRequired: z.boolean().optional(),
});

export type RawTamilNaduProperties = z.infer<typeof RawTamilNaduPropertiesSchema>;

export const RawTamilNaduFeatureSchema = z.object({
  type: z.literal("Feature").default("Feature"),
  id: z.string(),
  geometry: ParcelGeometrySchema,
  properties: RawTamilNaduPropertiesSchema,
});

export type RawTamilNaduFeature = z.infer<typeof RawTamilNaduFeatureSchema>;

export const RawTamilNaduFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection").default("FeatureCollection"),
  features: z.array(RawTamilNaduFeatureSchema),
});

export type RawTamilNaduFeatureCollection = z.infer<
  typeof RawTamilNaduFeatureCollectionSchema
>;

/**
 * Chandigarh UT Estate Office & e-Sampark Raw Properties
 */
export const RawChandigarhPropertiesSchema = z.object({
  propertyId: z.string(),
  ownerFullName: z.string(),
  sectorPlotNo: z.string(),
  useType: z.string(),
  disputeFlag: z.boolean(),
  titleStatus: z.string(),
  encumbranceSummary: z.string(),
  plotAreaHa: z.number(),
  collectorRateValuation: z.number(),
  propertyTaxDues: z.string(),
  utilityInfrastructure: z.array(z.string()),
  chainOfTitle: z.array(ChainOfTitleEntrySchema).optional(),
  ownerConsentRequired: z.boolean().optional(),
});

export type RawChandigarhProperties = z.infer<typeof RawChandigarhPropertiesSchema>;

export const RawChandigarhFeatureSchema = z.object({
  type: z.literal("Feature").default("Feature"),
  id: z.string(),
  geometry: ParcelGeometrySchema,
  properties: RawChandigarhPropertiesSchema,
});

export type RawChandigarhFeature = z.infer<typeof RawChandigarhFeatureSchema>;

export const RawChandigarhFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection").default("FeatureCollection"),
  features: z.array(RawChandigarhFeatureSchema),
});

export type RawChandigarhFeatureCollection = z.infer<
  typeof RawChandigarhFeatureCollectionSchema
>;

/**
 * ============================================================================
 * API Request & Query Validation Schemas
 * ============================================================================
 */

export const NLQueryRequestSchema = z.object({
  query: z.string().min(1, "Query string is required and cannot be empty"),
  parcels: z.array(z.unknown()).optional(),
  aiMode: z.enum(["rule-based", "llm"]).optional(),
});

export type NLQueryRequest = z.infer<typeof NLQueryRequestSchema>;

export const UlpinParamSchema = z
  .string()
  .min(1, "ULPIN identifier cannot be empty")
  .max(128, "ULPIN identifier is too long")
  .regex(/^[a-zA-Z0-9_\-\.\/]+$/, "ULPIN contains invalid characters");

/**
 * ============================================================================
 * Runtime Validation Helper Functions
 * ============================================================================
 */

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("; ");
}

/**
 * Validates that an unknown object is a valid LandParcelFeature.
 * Throws a formatted Error if validation fails.
 */
export function validateParcel(data: unknown): LandParcelFeature {
  const result = LandParcelFeatureSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`[ZodValidation] Invalid Parcel Feature: ${formatZodError(result.error)}`);
  }
  return result.data;
}

/**
 * Safely validates an unknown object as a LandParcelFeature without throwing.
 */
export function safeValidateParcel(data: unknown) {
  return LandParcelFeatureSchema.safeParse(data);
}

/**
 * Validates that an unknown object is a valid LandParcelFeatureCollection.
 * Throws a formatted Error if validation fails.
 */
export function validateFeatureCollection(
  data: unknown
): LandParcelFeatureCollection {
  const result = LandParcelFeatureCollectionSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `[ZodValidation] Invalid Parcel FeatureCollection: ${formatZodError(result.error)}`
    );
  }
  return result.data;
}

/**
 * Safely validates an unknown object as a LandParcelFeatureCollection.
 */
export function safeValidateFeatureCollection(data: unknown) {
  return LandParcelFeatureCollectionSchema.safeParse(data);
}

/**
 * Validates a conflict detection result.
 */
export function validateConflictResult(data: unknown): ConflictResult {
  const result = ConflictResultSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`[ZodValidation] Invalid Conflict Result: ${formatZodError(result.error)}`);
  }
  return result.data;
}
