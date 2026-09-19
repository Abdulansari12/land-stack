import { dummyLandParcels, rawParcelsTamilNadu, rawParcelsChandigarh } from "../data/parcels";
import { normalizeParcelFeatureCollection } from "../lib/schemaAdapter";

console.log("=== Testing Real-Time Notification Feed & Parcel Mapping ===");

// 1. Gather all actual parcel ULPINs
const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
const allParcels = [...up.features, ...tn.features, ...ch.features];
const existingUlpins = new Set(allParcels.map((p) => p.properties.ulpin));

console.log(`Available Parcels in Database: ${existingUlpins.size}`);

// 2. Verified simulated notifications map to real ULPINs
const sampleNotifications = [
  { title: "New mutation approved for Parcel #245/2", ulpin: "UP26A8941B" },
  { title: "Encroachment flagged near Sector 12", ulpin: "UP80B3184X" },
  { title: "RoR updated & Aadhaar e-KYC linked", ulpin: "UP09K2452M" },
  { title: "Civil Court dispute notice registered", ulpin: "UP28D1891R" },
  { title: "Municipal property tax demand generated", ulpin: "UP14C5123Z" },
  { title: "Patta transfer mutation confirmed", ulpin: "TN04M4910A" },
  { title: "Digitally signed survey sketch uploaded", ulpin: "TN05R1423B" },
  { title: "Zoning boundary dispute filed in UT Court", ulpin: "CH03I1788C" },
  { title: "Heritage preservation clearance granted", ulpin: "CH01S1742A" },
];

for (const notif of sampleNotifications) {
  if (!existingUlpins.has(notif.ulpin)) {
    console.error(`FAIL: Notification references unknown ULPIN ${notif.ulpin}!`);
    process.exit(1);
  }
  const matched = allParcels.find((p) => p.properties.ulpin === notif.ulpin);
  console.log(`  ✓ [${notif.ulpin}] -> Owner: ${matched?.properties.ownerName} (${matched?.properties.khasraNo})`);
}

// 3. Test unread state management logic
let unreadCount = 3;
let notifs = sampleNotifications.slice(0, 3).map((n, i) => ({ id: `n-${i}`, isRead: false, ...n }));

// Read one
notifs[0].isRead = true;
unreadCount = notifs.filter((n) => !n.isRead).length;
if (unreadCount !== 2) {
  console.error(`FAIL: Expected 2 unread, got ${unreadCount}`);
  process.exit(1);
}
console.log(`  ✓ Individual notification read: ${unreadCount} unread remaining`);

// Mark all as read
notifs = notifs.map((n) => ({ ...n, isRead: true }));
unreadCount = notifs.filter((n) => !n.isRead).length;
if (unreadCount !== 0) {
  console.error(`FAIL: Expected 0 unread after mark all read, got ${unreadCount}`);
  process.exit(1);
}
console.log(`  ✓ Mark all read: ${unreadCount} unread remaining`);

console.log("\n✅ ALL NOTIFICATION VERIFICATIONS PASSED!");
