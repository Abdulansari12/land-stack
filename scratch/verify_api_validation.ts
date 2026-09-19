let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${msg}`);
  } else {
    console.error(`  [FAIL] ${msg}`);
    process.exitCode = 1;
  }
}

async function testApi() {
  console.log("\n=== Testing API Runtime Validation ===");

  // 1. GET /api/parcels (valid)
  const res1 = await fetch("http://localhost:3000/api/parcels");
  assert(res1.status === 200, "GET /api/parcels returns HTTP 200");
  const data1 = await res1.json();
  assert(data1.type === "FeatureCollection" && Array.isArray(data1.features), "GET /api/parcels returns valid FeatureCollection");

  // 2. GET /api/parcels?state=invalid$%# (invalid query param)
  const res2 = await fetch("http://localhost:3000/api/parcels?state=invalid$%#");
  assert(res2.status === 400, "GET /api/parcels?state=invalid$%# returns HTTP 400 Bad Request");
  const data2 = await res2.json();
  assert(data2.error === "Bad Request" && Boolean(data2.details), "GET /api/parcels query validation returns Zod error details");

  // 3. GET /api/parcels/UP26A8941B (valid)
  const res3 = await fetch("http://localhost:3000/api/parcels/UP26A8941B");
  assert(res3.status === 200, "GET /api/parcels/UP26A8941B returns HTTP 200");
  const data3 = await res3.json();
  assert(data3.properties?.ulpin === "UP26A8941B", "GET /api/parcels/UP26A8941B returns matched parcel");

  // 4. GET /api/parcels/NONEXISTENT (404)
  const res4 = await fetch("http://localhost:3000/api/parcels/NONEXISTENT");
  assert(res4.status === 404, "GET /api/parcels/NONEXISTENT returns HTTP 404");

  // 5. POST /api/parcels with malformed data (should fail with 400)
  const malformedParcel = {
    type: "Feature",
    id: "MALFORMED-1",
    geometry: {
      type: "Polygon",
      coordinates: [[[80.9, 26.8], [80.91, 26.8], [80.91, 26.81], [80.9, 26.8]]],
    },
    properties: {
      ulpin: "", // INVALID: empty
      khasraNo: "123",
      ownerName: "Tester",
      areaInHectares: -2.5, // INVALID: negative
    },
  };
  const res5 = await fetch("http://localhost:3000/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(malformedParcel),
  });
  assert(res5.status === 400, "POST /api/parcels with malformed parcel returns HTTP 400");
  const data5 = await res5.json();
  assert(data5.error === "Validation Error" && Boolean(data5.details), "POST /api/parcels returns structured Zod error details");
  console.log("     Zod validation error reported:", data5.details);

  // 6. POST /api/parcels with valid parcel (should succeed with 200)
  const validParcel = {
    type: "Feature",
    id: "VALID-TEST-1",
    geometry: {
      type: "Polygon",
      coordinates: [[[80.9, 26.8], [80.91, 26.8], [80.91, 26.81], [80.9, 26.8]]],
    },
    properties: {
      ulpin: "UPTESTVALID01",
      khasraNo: "505/1",
      ownerName: "Rakesh Kumar",
      landUse: "Residential",
      rorStatus: "Verified",
      clearOrDisputed: "Clear",
      encumbrances: "Nil",
      taxStatus: "Paid",
      utilityLines: ["Water"],
      areaInHectares: 0.75,
    },
  };
  const res6 = await fetch("http://localhost:3000/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validParcel),
  });
  assert(res6.status === 200, "POST /api/parcels with valid parcel returns HTTP 200");
  const data6 = await res6.json();
  assert(data6.success === true && data6.ulpin === "UPTESTVALID01", "POST /api/parcels returns success with validated ULPIN");

  // 7. POST /api/nl-query with empty / invalid body (should fail with 400)
  const res7 = await fetch("http://localhost:3000/api/nl-query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(res7.status === 400, "POST /api/nl-query with empty body returns HTTP 400");
  const data7 = await res7.json();
  assert(data7.error === "Validation Error" && Boolean(data7.details), "POST /api/nl-query returns structured Zod error");
  console.log("     Zod validation error reported:", data7.details);

  // 8. POST /api/nl-query with valid query (should succeed with 200)
  const res8 = await fetch("http://localhost:3000/api/nl-query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "show all disputed parcels" }),
  });
  assert(res8.status === 200, "POST /api/nl-query with valid query returns HTTP 200");
  const data8 = await res8.json();
  assert(Array.isArray(data8.matchingParcelUlpins) && data8.matchingParcelUlpins.length > 0, "POST /api/nl-query returns matching parcel ULPINs");

  console.log(`\nAPI Validation Results: ${passed}/${total} assertions passed!`);
  if (passed !== total) process.exit(1);
}

testApi().catch((err) => {
  console.error("API test error:", err);
  process.exit(1);
});
