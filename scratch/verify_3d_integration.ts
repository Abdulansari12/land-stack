import { getParcelElevation, getParcelColor } from "../components/DeckGL3DMap";
import { dummyLandParcels, rawParcelsTamilNadu, rawParcelsChandigarh } from "../data/parcels";
import { normalizeParcelFeatureCollection } from "../lib/schemaAdapter";

console.log("=== Testing 3D Extrusion Elevation and Color Logic ===");

const allNormalized = [
  ...normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh").features,
  ...normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu").features,
  ...normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh").features,
];

console.log(`Total parcels evaluated: ${allNormalized.length}`);

let maxHeight = 0;
let minHeight = Infinity;
let disputedCount = 0;
let verifiedCount = 0;
let pendingCount = 0;

for (const feature of allNormalized) {
  const p = feature.properties;
  const height = getParcelElevation(feature);
  const color = getParcelColor(feature, null);

  if (height > maxHeight) maxHeight = height;
  if (height < minHeight) minHeight = height;

  if (color[0] === 239) {
    disputedCount++;
  } else if (color[0] === 34) {
    verifiedCount++;
  } else {
    pendingCount++;
  }

  console.log(
    `[${p.ulpin}] ${p.ownerName.padEnd(28)} | Val: ₹${(p.marketValueInINR || 0).toLocaleString(
      "en-IN"
    )} | Height: ${Math.round(height)}m | Color: [${color.join(",")}]`
  );
}

console.log("\nSummary Metrics:");
console.log(`- Min Extrusion Height: ${Math.round(minHeight)}m`);
console.log(`- Max Extrusion Height: ${Math.round(maxHeight)}m`);
console.log(`- Disputed (Red): ${disputedCount}`);
console.log(`- Verified (Green): ${verifiedCount}`);
console.log(`- Pending (Amber): ${pendingCount}`);

// Test Selected parcel color
const sampleFeature = allNormalized[0];
const selectedColor = getParcelColor(sampleFeature, sampleFeature.properties.ulpin);
console.log(`- Selected Parcel Color: [${selectedColor.join(",")}] (Electric Blue)`);

if (minHeight < 35 || maxHeight > 500) {
  console.error("FAIL: Extrusion height out of expected bounds!");
  process.exit(1);
}

if (disputedCount === 0 || verifiedCount === 0) {
  console.error("FAIL: Missing disputed or verified colors!");
  process.exit(1);
}

if (selectedColor[0] !== 59 || selectedColor[1] !== 130 || selectedColor[2] !== 246) {
  console.error("FAIL: Selected color not electric blue!");
  process.exit(1);
}

console.log("\n✅ ALL 3D EXTRUSION & COLOR VERIFICATIONS PASSED!");
