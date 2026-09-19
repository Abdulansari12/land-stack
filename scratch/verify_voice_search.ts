import { dummyLandParcels, rawParcelsTamilNadu, rawParcelsChandigarh } from "../data/parcels";
import { normalizeParcelFeatureCollection } from "../lib/schemaAdapter";
import { parseVoiceQuery } from "../lib/voiceParser";

console.log("=== Testing Cadastral Voice Search & Speech Query Matching ===");

const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
const allParcels = {
  type: "FeatureCollection" as const,
  features: [...up.features, ...tn.features, ...ch.features],
};

console.log(`Loaded ${allParcels.features.length} parcels across registries.`);

const testQueries = [
  {
    query: "show me parcel 245",
    expectedKhasraSubstring: "245",
    expectedOwner: "Rameshwar Prasad Sharma",
  },
  {
    query: "who owns khasra 88",
    expectedKhasraSubstring: "88",
    expectedOwner: "Chaudhary Mahendra Pal Yadav & Bros",
  },
  {
    query: "find khasra 102",
    expectedKhasraSubstring: "102",
    expectedOwner: "Sunita Devi Verma",
  },
  {
    query: "who owns parcel 512",
    expectedKhasraSubstring: "512",
    expectedOwner: "Dr. Vikramaditya Rathore",
  },
  {
    query: "show me Vikramaditya",
    expectedOwner: "Dr. Vikramaditya Rathore",
  },
  {
    query: "who is Sunita Devi",
    expectedOwner: "Sunita Devi Verma",
  },
  {
    query: "find Rameshwar",
    expectedOwner: "Rameshwar Prasad Sharma",
  },
  {
    query: "UP26A8941B",
    expectedUlpin: "UP26A8941B",
  },
  {
    query: "UP 26 A 8941 B",
    expectedUlpin: "UP26A8941B",
  },
  {
    query: "TN04M4910A",
    expectedUlpin: "TN04M4910A",
  },
  {
    query: "CH03I1788C",
    expectedUlpin: "CH03I1788C",
  },
  {
    query: "पार्सल 245 दिखाओ",
    expectedKhasraSubstring: "245",
  },
  {
    query: "खसरा 88",
    expectedKhasraSubstring: "88",
  },
];

let passCount = 0;
for (const tc of testQueries) {
  const result = parseVoiceQuery(tc.query, allParcels);
  if (!result.parcel) {
    console.error(`❌ FAILED: Query "${tc.query}" returned null parcel!`);
    continue;
  }

  const p = result.parcel.properties;
  let matches = true;

  if (tc.expectedKhasraSubstring && !p.khasraNo.toLowerCase().includes(tc.expectedKhasraSubstring.toLowerCase())) {
    matches = false;
  }
  if (tc.expectedOwner && !p.ownerName.toLowerCase().includes(tc.expectedOwner.toLowerCase())) {
    matches = false;
  }
  if (tc.expectedUlpin && p.ulpin.toLowerCase() !== tc.expectedUlpin.toLowerCase()) {
    matches = false;
  }

  if (matches) {
    console.log(`  ✓ "${tc.query}" -> Matched Khasra #${p.khasraNo} | ${p.ownerName} | ${p.ulpin} [MatchedBy: ${result.matchedBy}]`);
    passCount++;
  } else {
    console.error(`❌ MISMATCH for "${tc.query}": Got Khasra #${p.khasraNo}, Owner: ${p.ownerName}`);
  }
}

console.log(`\nResults: ${passCount} / ${testQueries.length} passed.`);
if (passCount === testQueries.length) {
  console.log("✅ ALL VOICE SEARCH PARSER TESTS PASSED PERFECTLY!");
} else {
  console.error("Some tests failed!");
  process.exit(1);
}
