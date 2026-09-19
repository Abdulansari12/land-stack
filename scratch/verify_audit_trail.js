// Verification script for Audit Trail blockchain ledger logic
function mockSha256(input) {
  let h1 = 0xdeadbeef ^ 0x12345678;
  let h2 = 0x41c64e6d ^ 0x87654321;
  let h3 = 0x9e3779b9 ^ 0xabcdef01;
  let h4 = 0x3b9aca07 ^ 0x13579bdf;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  let h5 = Math.imul(h1 ^ 0xa5a5a5a5, 2654435761);
  let h6 = Math.imul(h2 ^ 0x5a5a5a5a, 1597334677);
  let h7 = Math.imul(h3 ^ 0x3c3c3c3c, 2246822519);
  let h8 = Math.imul(h4 ^ 0xc3c3c3c3, 3266489917);

  const p = (n) => (n >>> 0).toString(16).padStart(8, "0");
  return `0x${p(h1)}${p(h2)}${p(h3)}${p(h4)}${p(h5)}${p(h6)}${p(h7)}${p(h8)}`;
}

function computeBlockHash(prevHash, actionType, timestamp, documentRef, actor, nonce) {
  return mockSha256(`${prevHash}:${actionType}:${timestamp}:${documentRef}:${actor}:${nonce}`);
}

console.log("=== Testing Cadastral Hash-Chained Blockchain Ledger ===");

// 1. Test hash determinism & format
const testHash = mockSha256("test_cadastral_block_payload");
console.log("Generated SHA-256 Mock Hash:", testHash);
if (!testHash.startsWith("0x") || testHash.length !== 66) {
  console.error("FAIL: Hash format incorrect. Expected 0x + 64 hex chars.");
  process.exit(1);
}
console.log("  ✓ Hash format validated (0x + 64 hex characters)");

// 2. Build mock 4-block chain
const blocks = [];
let prev = "0x0000000000000000000000000000000000000000000000000000000000000000";

const actions = [
  { action: "Cadastral Demarcation & Genesis Allotment", date: "15 Aug 1975", ref: "SURVEY/1975/01", actor: "Directorate of Land Records" },
  { action: "Sale Deed Title Transfer", date: "04 Aug 1989", ref: "DEED/1989/1049", actor: "Bhairon Singh Yadav" },
  { action: "Inheritance Mutation", date: "12 Oct 2021", ref: "MUT/2021/8812", actor: "Rameshwar Prasad Sharma" },
  { action: "Digital RoR e-Sign & Aadhaar e-KYC Verification", date: "14 Mar 2024", ref: "ROR/2024/ESIGN", actor: "Rameshwar Prasad Sharma" },
];

actions.forEach((act, idx) => {
  const nonce = 10000 + idx * 3000;
  const hash = computeBlockHash(prev, act.action, act.date, act.ref, act.actor, nonce);
  blocks.push({
    height: idx,
    hash,
    prevHash: prev,
    action: act.action,
    date: act.date,
    ref: act.ref,
    actor: act.actor,
    nonce,
  });
  prev = hash;
});

console.log(`\nConstructed Blockchain Ledger with ${blocks.length} Blocks:`);
blocks.forEach(b => {
  console.log(`  Block #${b.height}: [${b.hash.slice(0, 14)}...] ↳ Prev: [${b.prevHash.slice(0, 14)}...] (${b.action})`);
});

// 3. Verify hash chain integrity
function verify(blks) {
  for (let i = 0; i < blks.length; i++) {
    const b = blks[i];
    if (i === 0) {
      if (b.prevHash !== "0x0000000000000000000000000000000000000000000000000000000000000000") return false;
    } else {
      if (b.prevHash !== blks[i - 1].hash) return false;
    }
    const expected = computeBlockHash(b.prevHash, b.action, b.date, b.ref, b.actor, b.nonce);
    if (b.hash !== expected) return false;
  }
  return true;
}

const isValidInitial = verify(blocks);
console.log("\nInitial Chain Verification:", isValidInitial ? "VALID (All blocks intact)" : "INVALID");
if (!isValidInitial) {
  console.error("FAIL: Initial chain verification failed!");
  process.exit(1);
}

// 4. Simulate tampering with Block #1
const tamperedBlocks = JSON.parse(JSON.stringify(blocks));
tamperedBlocks[1].actor = "Malicious Actor Attempting Fraud";
const isTamperedDetected = !verify(tamperedBlocks);
console.log("Simulated Tampering Test (Actor modified in Block #1):", isTamperedDetected ? "DETECTED SUCCESSFULLY (Tamper Proof!)" : "FAILED TO DETECT");
if (!isTamperedDetected) {
  console.error("FAIL: Tampering was not detected!");
  process.exit(1);
}

console.log("\n✅ ALL AUDIT TRAIL BLOCKCHAIN EXPLORER TESTS PASSED PERFECTLY!");
