console.log("=== Testing Cadastral Time Machine (2015 - 2025) Satellite Interpolation ===");

function calculateEpochOpacities(year) {
  let opacity1 = 0;
  let opacity2 = 0;
  let opacity3 = 0;

  if (year <= 2020) {
    const progress = (year - 2015) / 5;
    opacity1 = 1 - progress;
    opacity2 = progress;
    opacity3 = 0;
  } else {
    const progress = (year - 2020) / 5;
    opacity1 = 0;
    opacity2 = 1 - progress;
    opacity3 = progress;
  }

  const progressRatio = (year - 2015) / 10;
  const ndvi = +(0.84 - progressRatio * 0.68).toFixed(2);
  const impervious = +(2.8 + progressRatio * 76.4).toFixed(1);

  return { year, opacity1, opacity2, opacity3, ndvi, impervious };
}

// 1. Verify boundary conditions (2015, 2020, 2025)
const y2015 = calculateEpochOpacities(2015);
console.log("2015 (Pristine):", y2015);
if (y2015.opacity1 !== 1 || y2015.opacity2 !== 0 || y2015.opacity3 !== 0) {
  console.error("FAIL: 2015 should have 100% Epoch 1 opacity");
  process.exit(1);
}
if (y2015.ndvi < 0.8) {
  console.error("FAIL: 2015 NDVI should be high");
  process.exit(1);
}
console.log("  ✓ 2015 baseline verified: 100% pristine farmland opacity, high NDVI (0.84)");

const y2020 = calculateEpochOpacities(2020);
console.log("2020 (Transition):", y2020);
if (y2020.opacity1 !== 0 || y2020.opacity2 !== 1 || y2020.opacity3 !== 0) {
  console.error("FAIL: 2020 should have 100% Epoch 2 opacity");
  process.exit(1);
}
console.log("  ✓ 2020 transition verified: 100% grading & excavation opacity");

const y2025 = calculateEpochOpacities(2025);
console.log("2025 (Built-up):", y2025);
if (y2025.opacity1 !== 0 || y2025.opacity2 !== 0 || y2025.opacity3 !== 1) {
  console.error("FAIL: 2025 should have 100% Epoch 3 opacity");
  process.exit(1);
}
if (y2025.impervious < 70) {
  console.error("FAIL: 2025 Impervious surface should be high");
  process.exit(1);
}
console.log("  ✓ 2025 modern verified: 100% constructed masonry footprint opacity, 79.2% impervious");

// 2. Verify all intermediate years (cross-fade continuum)
console.log("\nTesting smooth cross-fade across all 11 years (2015 - 2025):");
for (let yr = 2015; yr <= 2025; yr++) {
  const data = calculateEpochOpacities(yr);
  const totalOpacity = +(data.opacity1 + data.opacity2 + data.opacity3).toFixed(4);
  if (Math.abs(totalOpacity - 1) > 0.001) {
    console.error(`FAIL at year ${yr}: Total opacity is ${totalOpacity}, expected 1.0`);
    process.exit(1);
  }
  console.log(`  Year ${yr} -> Opacities: [E1: ${data.opacity1.toFixed(2)}, E2: ${data.opacity2.toFixed(2)}, E3: ${data.opacity3.toFixed(2)}] | NDVI: ${data.ndvi} | Impervious: ${data.impervious}%`);
}

console.log("\n✅ ALL TIME MACHINE SLIDER TESTS PASSED PERFECTLY!");
