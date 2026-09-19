// Mock browser globals for Leaflet in Node.js test environment
(global as any).window = {
  requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
  devicePixelRatio: 1,
};
(global as any).document = {
  createElement: () => ({ getContext: () => ({}) }),
  documentElement: { style: {} },
};
(global as any).navigator = { userAgent: "node" };

import { dummyLandParcels, rawParcelsTamilNadu, rawParcelsChandigarh } from "../data/parcels";
import { normalizeParcelFeatureCollection } from "../lib/schemaAdapter";
import { generateHeatPoints, getCentroid } from "../components/HeatmapLayer";

console.log("=== Testing Leaflet Heatmap Data & Weight Algorithms ===");

// 1. Test Centroid calculation
const sampleCoords: [number, number][] = [
  [80.9412, 26.8451],
  [80.9438, 26.8455],
  [80.9434, 26.8431],
  [80.9408, 26.8427],
  [80.9412, 26.8451],
];
const centroid = getCentroid(sampleCoords);
console.log(`Centroid calculated: [${centroid[0].toFixed(4)}, ${centroid[1].toFixed(4)}]`);
if (Math.abs(centroid[0] - 26.844) > 0.01 || Math.abs(centroid[1] - 80.942) > 0.01) {
  console.error("FAIL: Centroid out of expected range!");
  process.exit(1);
}

// 2. Test Dispute Density Mode
const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
const disputePoints = generateHeatPoints(up, "disputes");
console.log(`Dispute Density Mode: Generated ${disputePoints.length} heat points across ${up.features.length} parcels`);

const maxDisputeWeight = Math.max(...disputePoints.map((p) => p[2]));
const minDisputeWeight = Math.min(...disputePoints.map((p) => p[2]));

console.log(`- Dispute Max Weight: ${maxDisputeWeight.toFixed(2)} (Expected: 1.00)`);
console.log(`- Dispute Min Weight: ${minDisputeWeight.toFixed(2)} (Expected: ~0.11 - 0.15)`);

if (maxDisputeWeight !== 1.0) {
  console.error("FAIL: Disputed parcel did not reach 1.0 max intensity!");
  process.exit(1);
}

// 3. Test Transaction Activity Mode
const transPoints = generateHeatPoints(up, "transactions");
console.log(`\nTransaction Activity Mode: Generated ${transPoints.length} heat points`);

const maxTransWeight = Math.max(...transPoints.map((p) => p[2]));
console.log(`- Transaction Max Weight: ${maxTransWeight.toFixed(2)} (Expected: 0.95 for 3+ chain records)`);

if (maxTransWeight < 0.9) {
  console.error("FAIL: High-turnover parcel did not reach expected weight!");
  process.exit(1);
}

// 4. Test Cross-State Collections
const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
const tnPoints = generateHeatPoints(tn, "disputes");
const chPoints = generateHeatPoints(ch, "disputes");
console.log(`- Tamil Nadu Heat Points: ${tnPoints.length}`);
console.log(`- Chandigarh Heat Points: ${chPoints.length}`);

console.log("\n✅ ALL HEATMAP POINT & ALGORITHM TESTS PASSED!");
