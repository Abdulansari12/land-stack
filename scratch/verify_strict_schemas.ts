import {
  LandParcelFeatureSchema,
  LandParcelFeatureCollectionSchema,
  LandParcelPropertiesSchema,
  ChainOfTitleEntrySchema,
  ConflictResultSchema,
  validateParcel,
  safeValidateParcel,
  validateConflictResult,
  formatZodError,
} from "../lib/schemas";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
} from "../data/parcels";
import { normalizeParcelFeatureCollection, normalizeParcel } from "../lib/schemaAdapter";
import { detectConflictResult, detectConflicts } from "../lib/conflicts";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("\n=== 1. Validating Canonical Schemas with Real Parcels ===");

  const upCollection = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
  const tnCollection = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
  const chCollection = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");

  const upValidation = LandParcelFeatureCollectionSchema.safeParse(upCollection);
  assert(upValidation.success, "Uttar Pradesh collection validates against LandParcelFeatureCollectionSchema");

  const tnValidation = LandParcelFeatureCollectionSchema.safeParse(tnCollection);
  assert(tnValidation.success, "Tamil Nadu collection validates against LandParcelFeatureCollectionSchema");

  const chValidation = LandParcelFeatureCollectionSchema.safeParse(chCollection);
  assert(chValidation.success, "Chandigarh collection validates against LandParcelFeatureCollectionSchema");

  // Verify all 11 parcels individual features
  const allFeatures = [...upCollection.features, ...tnCollection.features, ...chCollection.features];
  assert(allFeatures.length >= 11, `Expected at least 11 total features, found ${allFeatures.length}`);

  let allIndividualPassed = true;
  for (const f of allFeatures) {
    const res = safeValidateParcel(f);
    if (!res.success) {
      console.error(`Parcel ${f.id} failed validation:`, formatZodError(res.error));
      allIndividualPassed = false;
    }
  }
  assert(allIndividualPassed, "All 11 parcels individually pass safeValidateParcel");

  console.log("\n=== 2. Validating ChainOfTitleEntry Schema ===");
  const validEntry = {
    date: "14-Aug-2023",
    ownerName: "Rameshwar Dayal Sharma",
    transactionType: "Mutation",
    documentRef: "REV-MUT-2023-8819",
  };
  const titleValidation = ChainOfTitleEntrySchema.safeParse(validEntry);
  assert(titleValidation.success, "Valid ChainOfTitleEntry passes validation");

  const invalidEntry = {
    date: "",
    ownerName: "John",
    // missing transactionType and documentRef
  };
  const invalidTitleValidation = ChainOfTitleEntrySchema.safeParse(invalidEntry);
  assert(!invalidTitleValidation.success, "Invalid ChainOfTitleEntry fails validation as expected");

  console.log("\n=== 3. Validating Conflict Detection & ConflictResult Schema ===");
  const conflictParcel = allFeatures.find((f) => f.properties.ulpin === "UP26A8941B");
  assert(Boolean(conflictParcel), "Found conflict test parcel UP26A8941B");

  if (conflictParcel) {
    const conflictResult = detectConflictResult(conflictParcel.properties);
    assert(conflictResult.hasConflict === true, "UP26A8941B detected as having conflict");
    assert(conflictResult.severity === "critical", "UP26A8941B conflict severity is critical");
    assert(conflictResult.conflictType === "zoning_vs_building_permission", "Conflict type identified correctly");

    const validatedResult = validateConflictResult(conflictResult);
    assert(validatedResult.hasConflict === true, "ConflictResult validated against ConflictResultSchema");

    const conflictMsg = detectConflicts(conflictParcel.properties);
    assert(typeof conflictMsg === "string" && conflictMsg.includes("Conflict Detected"), "detectConflicts returns formatted message string");
  }

  const cleanParcel = allFeatures.find((f) => f.properties.ulpin === "UP09K2452M");
  if (cleanParcel) {
    const cleanResult = detectConflictResult(cleanParcel.properties);
    assert(cleanResult.hasConflict === false, "UP09K2452M detected as having NO conflict");
    assert(cleanResult.message === null, "Clean parcel message is null");
  }

  console.log("\n=== 4. Validating Rejection of Malformed Data ===");
  // Negative area
  const negativeAreaParcel = {
    ulpin: "UPTEST1234",
    khasraNo: "123",
    ownerName: "Tester",
    landUse: "Agricultural",
    rorStatus: "Verified",
    clearOrDisputed: "Clear",
    encumbrances: "Nil",
    taxStatus: "Paid",
    utilityLines: [],
    areaInHectares: -5.5, // INVALID: negative
  };
  const negAreaValidation = LandParcelPropertiesSchema.safeParse(negativeAreaParcel);
  assert(!negAreaValidation.success, "Negative area is rejected by LandParcelPropertiesSchema");

  // Empty ULPIN
  const emptyUlpinParcel = {
    ...negativeAreaParcel,
    areaInHectares: 1.0,
    ulpin: "", // INVALID: empty
  };
  const emptyUlpinValidation = LandParcelPropertiesSchema.safeParse(emptyUlpinParcel);
  assert(!emptyUlpinValidation.success, "Empty ULPIN is rejected by LandParcelPropertiesSchema");

  // Malformed feature (missing geometry)
  const malformedFeature = {
    type: "Feature",
    id: "TEST-01",
    properties: {
      ...negativeAreaParcel,
      areaInHectares: 1.0,
    },
    // missing geometry
  };
  const malformedFeatValidation = LandParcelFeatureSchema.safeParse(malformedFeature);
  assert(!malformedFeatValidation.success, "Feature without geometry is rejected by LandParcelFeatureSchema");

  console.log(`\nResults: ${passedCount}/${totalCount} assertions passed!`);
  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
