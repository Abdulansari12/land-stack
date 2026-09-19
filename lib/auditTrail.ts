import { LandParcelProperties } from "@/data/parcels";

export interface AuditBlock {
  blockHeight: number;
  blockHash: string;
  prevHash: string;
  timestamp: string;
  actionType: string;
  actionCategory: "genesis" | "transfer" | "mutation" | "encumbrance" | "tax" | "verification";
  actor: string;
  authority: string;
  documentRef: string;
  details: string;
  nonce: number;
  merkleRoot: string;
}

/**
 * Deterministic pseudo SHA-256 hash generator returning 64-char hex string with '0x' prefix
 */
export function mockSha256(input: string): string {
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

  const p = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return `0x${p(h1)}${p(h2)}${p(h3)}${p(h4)}${p(h5)}${p(h6)}${p(h7)}${p(h8)}`;
}

/**
 * Computes block hash based on prevHash and block payload
 */
export function computeBlockHash(
  prevHash: string,
  actionType: string,
  timestamp: string,
  documentRef: string,
  actor: string,
  nonce: number
): string {
  return mockSha256(`${prevHash}:${actionType}:${timestamp}:${documentRef}:${actor}:${nonce}`);
}

/**
 * Generates an immutable hash-chained audit trail for a cadastral parcel
 */
export function generateParcelAuditTrail(parcel: LandParcelProperties): AuditBlock[] {
  const blocks: AuditBlock[] = [];
  const GENESIS_PREV_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // 1. GENESIS BLOCK: Initial Cadastral Demarcation & Survey Allotment
  const genesisNonce = 10420;
  const genesisMerkle = mockSha256(`MERKLE_ROOT_GENESIS_${parcel.ulpin}`);
  const genesisTimestamp = "15 Aug 1975, 10:00 IST";
  const genesisAction = "Cadastral Demarcation & Genesis Allotment";
  const genesisDocRef = `SURVEY/ALLOT/${parcel.ulpin.slice(0, 6)}/1975`;
  const genesisActor = "State Cadastre & Survey Settlement Directorate";
  const genesisAuthority = "Revenue Department, Land Demarcation Wing";
  const genesisDetails = `Initial spatial boundary polygon charted and registered under ULPIN ${parcel.ulpin}, Khasra #${parcel.khasraNo}. Extent: ${parcel.areaInHectares} Hectares.`;

  const genesisHash = computeBlockHash(
    GENESIS_PREV_HASH,
    genesisAction,
    genesisTimestamp,
    genesisDocRef,
    genesisActor,
    genesisNonce
  );

  blocks.push({
    blockHeight: 0,
    blockHash: genesisHash,
    prevHash: GENESIS_PREV_HASH,
    timestamp: genesisTimestamp,
    actionType: genesisAction,
    actionCategory: "genesis",
    actor: genesisActor,
    authority: genesisAuthority,
    documentRef: genesisDocRef,
    details: genesisDetails,
    nonce: genesisNonce,
    merkleRoot: genesisMerkle,
  });

  // 2. HISTORIC CHAIN OF TITLE BLOCKS (Oldest to Newest)
  let currentPrevHash = genesisHash;
  let currentHeight = 1;

  if (parcel.chainOfTitle && parcel.chainOfTitle.length > 0) {
    // Reverse so oldest transaction comes first after genesis
    const chronologicalRecords = [...parcel.chainOfTitle].reverse();

    chronologicalRecords.forEach((record, idx) => {
      const nonce = 21000 + idx * 3421;
      const merkle = mockSha256(`MERKLE_${parcel.ulpin}_BLOCK_${currentHeight}`);
      const actionType = `${record.transactionType} Deed Execution`;
      const actionCategory =
        record.transactionType.toLowerCase().includes("mutation")
          ? ("mutation" as const)
          : ("transfer" as const);
      const docRef = record.documentRef;
      const actor = record.ownerName;
      const authority =
        record.transactionType.toLowerCase().includes("mutation")
          ? "Tehsildar Sadar Revenue Adjudication Court"
          : "Sub-Registrar Office, Stamps & Registration";
      const details = `Registered transfer of title in favor of ${record.ownerName} via ${record.transactionType}. Digital stamp duty receipt and witness biometric hashes verified.`;

      const blockHash = computeBlockHash(
        currentPrevHash,
        actionType,
        record.date,
        docRef,
        actor,
        nonce
      );

      blocks.push({
        blockHeight: currentHeight,
        blockHash,
        prevHash: currentPrevHash,
        timestamp: record.date,
        actionType,
        actionCategory,
        actor,
        authority,
        documentRef: docRef,
        details,
        nonce,
        merkleRoot: merkle,
      });

      currentPrevHash = blockHash;
      currentHeight++;
    });
  }

  // 3. ENCUMBRANCE OR LITIGATION BLOCK (If active)
  if (
    parcel.clearOrDisputed === "Disputed" ||
    parcel.rorStatus?.toLowerCase().includes("dispute") ||
    (parcel.encumbrances && !parcel.encumbrances.toLowerCase().includes("none") && !parcel.encumbrances.toLowerCase().includes("free"))
  ) {
    const encNonce = 43190;
    const encMerkle = mockSha256(`MERKLE_ENCUMBRANCE_${parcel.ulpin}`);
    const encTimestamp = "24 Feb 2024, 11:30 IST";
    const encAction = "Encumbrance Flagged & Caveat Attached";
    const encDocRef = "COURT/INJ/2024/412";
    const encActor = "Civil Court Registrar (OS-412/2024)";
    const encAuthority = "District & Sessions Court, Revenue Appellate Division";
    const encDetails = parcel.encumbrances || "Judicial stay order and title dispute caveat appended to digital land register.";

    const encHash = computeBlockHash(
      currentPrevHash,
      encAction,
      encTimestamp,
      encDocRef,
      encActor,
      encNonce
    );

    blocks.push({
      blockHeight: currentHeight,
      blockHash: encHash,
      prevHash: currentPrevHash,
      timestamp: encTimestamp,
      actionType: encAction,
      actionCategory: "encumbrance",
      actor: encActor,
      authority: encAuthority,
      documentRef: encDocRef,
      details: encDetails,
      nonce: encNonce,
      merkleRoot: encMerkle,
    });

    currentPrevHash = encHash;
    currentHeight++;
  }

  // 4. PROPERTY TAX MUNICIPAL ASSESSMENT BLOCK
  const taxNonce = 55100;
  const taxMerkle = mockSha256(`MERKLE_TAX_${parcel.ulpin}`);
  const taxTimestamp = "02 Jan 2024, 09:15 IST";
  const taxAction = `Municipal Tax Assessment (${parcel.taxStatus})`;
  const taxDocRef = `TAX/MUNI/2024/${parcel.ulpin.slice(0, 5)}`;
  const taxActor = "Municipal Assessment Officer";
  const taxAuthority = "Municipal Corporation Revenue & Property Tax Dept";
  const taxDetails = `Annual municipal GIS valuation computed for landUse '${parcel.landUse}'. Status: ${parcel.taxStatus}. Water & infrastructure cess logged.`;

  const taxHash = computeBlockHash(
    currentPrevHash,
    taxAction,
    taxTimestamp,
    taxDocRef,
    taxActor,
    taxNonce
  );

  blocks.push({
    blockHeight: currentHeight,
    blockHash: taxHash,
    prevHash: currentPrevHash,
    timestamp: taxTimestamp,
    actionType: taxAction,
    actionCategory: "tax",
    actor: taxActor,
    authority: taxAuthority,
    documentRef: taxDocRef,
    details: taxDetails,
    nonce: taxNonce,
    merkleRoot: taxMerkle,
  });

  currentPrevHash = taxHash;
  currentHeight++;

  // 5. LATEST BLOCK: Digital RoR Verification & e-Sign Anchor
  const latestNonce = 77890;
  const latestMerkle = mockSha256(`MERKLE_LATEST_${parcel.ulpin}`);
  const latestTimestamp = "14 Mar 2024, 16:45 IST";
  const latestAction = "Digital RoR e-Sign & Aadhaar e-KYC Verification";
  const latestDocRef = `ROR/ESIGN/${parcel.ulpin}`;
  const latestActor = parcel.ownerName;
  const latestAuthority = "e-Dharti Land Governance Platform (DILRMP)";
  const latestDetails = `Record of Rights title deed authenticated with Aadhaar e-KYC token and cryptographic timestamp. RoR Status: ${parcel.rorStatus}.`;

  const latestHash = computeBlockHash(
    currentPrevHash,
    latestAction,
    latestTimestamp,
    latestDocRef,
    latestActor,
    latestNonce
  );

  blocks.push({
    blockHeight: currentHeight,
    blockHash: latestHash,
    prevHash: currentPrevHash,
    timestamp: latestTimestamp,
    actionType: latestAction,
    actionCategory: "verification",
    actor: latestActor,
    authority: latestAuthority,
    documentRef: latestDocRef,
    details: latestDetails,
    nonce: latestNonce,
    merkleRoot: latestMerkle,
  });

  return blocks;
}

/**
 * Validates the cryptographic integrity of the hash chain
 */
export function verifyChainIntegrity(blocks: AuditBlock[]): {
  isValid: boolean;
  brokenBlockIndex?: number;
  message: string;
} {
  if (!blocks || blocks.length === 0) {
    return { isValid: false, message: "Empty chain" };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check Genesis block
    if (i === 0) {
      if (block.prevHash !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        return {
          isValid: false,
          brokenBlockIndex: 0,
          message: "Genesis block has corrupted previous hash reference!",
        };
      }
    } else {
      // Check link to previous block
      const prevBlock = blocks[i - 1];
      if (block.prevHash !== prevBlock.blockHash) {
        return {
          isValid: false,
          brokenBlockIndex: i,
          message: `Block #${block.blockHeight} previous hash mismatch! Expected: ${prevBlock.blockHash.slice(0, 10)}... Received: ${block.prevHash.slice(0, 10)}...`,
        };
      }
    }

    // Verify hash computation
    const expectedHash = computeBlockHash(
      block.prevHash,
      block.actionType,
      block.timestamp,
      block.documentRef,
      block.actor,
      block.nonce
    );

    if (block.blockHash !== expectedHash) {
      return {
        isValid: false,
        brokenBlockIndex: i,
        message: `Block #${block.blockHeight} payload hash invalid! Data tampering detected.`,
      };
    }
  }

  return {
    isValid: true,
    message: `All ${blocks.length} blocks in the audit trail have valid cryptographic hashes with zero tampering.`,
  };
}
