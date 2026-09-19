const { dummyLandParcels } = require('../data/parcels');

// Simple standalone test of the voice query matching algorithm logic
function runTest() {
  console.log("=== Testing Cadastral Voice Query Parser ===");

  const testCases = [
    { query: "show me parcel 245", expectedKhasra: "245/2" },
    { query: "who owns khasra 88", expectedKhasra: "88/3" },
    { query: "find khasra 102", expectedKhasra: "102/1-Ka" },
    { query: "details of parcel 318", expectedKhasra: "318/4-Min" },
    { query: "who owns parcel 512", expectedKhasra: "512/3" },
    { query: "find Rameshwar", expectedOwner: "Rameshwar Prasad Sharma" },
    { query: "who is Sunita Devi", expectedOwner: "Sunita Devi Verma" },
    { query: "Vikramaditya", expectedOwner: "Dr. Vikramaditya Rathore" },
    { query: "UP26A8941B", expectedUlpin: "UP26A8941B" },
    { query: "UP 26 A 8941 B", expectedUlpin: "UP26A8941B" },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const clean = tc.query.trim().toLowerCase();
    let matched = null;

    // 1. ULPIN
    const compact = clean.replace(/[^a-z0-9]/g, "");
    for (const f of dummyLandParcels.features) {
      const u = f.properties.ulpin.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (compact.includes(u) || (compact.length >= 6 && u.includes(compact))) {
        matched = f;
        break;
      }
    }

    // 2. Khasra numbers
    if (!matched) {
      const digits = clean.match(/\b\d+(\/\d+)?(-[a-z]+)?\b/g) || [];
      for (const d of digits) {
        for (const f of dummyLandParcels.features) {
          const k = f.properties.khasraNo.toLowerCase();
          if (k.includes(d)) {
            matched = f;
            break;
          }
        }
        if (matched) break;
      }
    }

    // 3. Owner names
    if (!matched) {
      const stopWords = new Set(["show", "me", "the", "parcel", "parcels", "khasra", "who", "owns", "of", "find", "is"]);
      const words = clean.split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !stopWords.has(w));
      for (const f of dummyLandParcels.features) {
        const o = f.properties.ownerName.toLowerCase();
        for (const w of words) {
          if (o.includes(w)) {
            matched = f;
            break;
          }
        }
        if (matched) break;
      }
    }

    if (!matched) {
      console.error(`FAILED: "${tc.query}" did not match any parcel`);
    } else {
      const p = matched.properties;
      let ok = true;
      if (tc.expectedKhasra && !p.khasraNo.includes(tc.expectedKhasra)) ok = false;
      if (tc.expectedOwner && !p.ownerName.includes(tc.expectedOwner)) ok = false;
      if (tc.expectedUlpin && p.ulpin !== tc.expectedUlpin) ok = false;

      if (ok) {
        console.log(`PASS: "${tc.query}" -> Matched Khasra #${p.khasraNo} | Owner: ${p.ownerName} | ULPIN: ${p.ulpin}`);
        passed++;
      } else {
        console.error(`MISMATCH: "${tc.query}" matched unexpected parcel #${p.khasraNo} (${p.ownerName})`);
      }
    }
  }

  console.log(`\nResults: ${passed} / ${testCases.length} tests passed.`);
  if (passed === testCases.length) {
    console.log("ALL TESTS PASSED SUCCESSFULLY!");
  } else {
    process.exit(1);
  }
}

runTest();
