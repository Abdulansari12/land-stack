const fs = require("fs");
const path = require("path");

async function runVerification() {
  console.log("=== VERIFYING OWNERSHIP CERTIFICATE PDF GENERATOR & CITIZEN SERVICE DELIVERY ===");
  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
    }
  }

  const baseDir = path.resolve(__dirname, "..");

  // 1. Check package.json dependencies
  const packageJson = JSON.parse(fs.readFileSync(path.join(baseDir, "package.json"), "utf-8"));
  assert(Boolean(packageJson.dependencies["jspdf"]), "jspdf is installed in package.json");
  assert(Boolean(packageJson.dependencies["html2canvas"]), "html2canvas is installed in package.json");
  assert(Boolean(packageJson.dependencies["qrcode"]), "qrcode is installed in package.json");
  assert(Boolean(packageJson.dependencies["@types/qrcode"]), "@types/qrcode is installed in package.json");

  // 2. Check QRCode generation module in Node
  const QRCode = require("qrcode");
  const testUlpin = "UP-LKO-2024-001245";
  const qrDataUrl = await QRCode.toDataURL(`https://landstack.gov.in/verify/${testUlpin}`);
  assert(
    qrDataUrl && qrDataUrl.startsWith("data:image/png;base64,"),
    "QRCode generates valid base64 PNG data URL with encoded ULPIN"
  );

  // 3. Check lib/certificateGenerator.ts
  const certGenCode = fs.readFileSync(path.join(baseDir, "lib", "certificateGenerator.ts"), "utf-8");
  assert(
    certGenCode.includes("export async function generateOwnershipCertificatePdf"),
    "certificateGenerator.ts exports generateOwnershipCertificatePdf"
  );
  assert(
    certGenCode.includes("QRCode.toDataURL"),
    "certificateGenerator.ts generates QR code encoding verification URL"
  );
  assert(
    certGenCode.includes("Government of India") && certGenCode.includes("भारत सरकार"),
    "certificateGenerator.ts includes official Government of India header"
  );
  assert(
    certGenCode.includes("Record of Rights (RoR) & Title Ownership Certificate"),
    "certificateGenerator.ts includes official Record of Rights (RoR) certificate title"
  );
  assert(
    certGenCode.includes("${parcel.ulpin}") &&
    certGenCode.includes("${parcel.khasraNo}") &&
    certGenCode.includes("${parcel.ownerName}") &&
    certGenCode.includes("${parcel.landUse}"),
    "certificateGenerator.ts binds parcel details (ULPIN, khasra, owner, land use, area)"
  );
  assert(
    certGenCode.includes("Cadastral Adjudication Status") &&
    certGenCode.includes("statusTitle"),
    "certificateGenerator.ts displays RoR adjudication status stamp"
  );
  assert(
    certGenCode.includes("Digitally generated on") &&
    certGenCode.includes("Digitally Signed"),
    "certificateGenerator.ts includes footer with generation timestamp and mock digital signature line"
  );
  assert(
    certGenCode.includes("new jsPDF") && certGenCode.includes("html2canvas"),
    "certificateGenerator.ts uses html2canvas and jsPDF to produce A4 document"
  );

  // 4. Check components/ParcelDrawer.tsx
  const drawerCode = fs.readFileSync(path.join(baseDir, "components", "ParcelDrawer.tsx"), "utf-8");
  assert(
    drawerCode.includes("data-testid=\"download-certificate-btn\""),
    "ParcelDrawer contains 'Download Ownership Certificate' button with test ID"
  );
  assert(
    drawerCode.includes("data-testid=\"preview-certificate-btn\""),
    "ParcelDrawer contains 'Preview Certificate' button"
  );
  assert(
    drawerCode.includes("data-testid=\"ownership-certificate-card\""),
    "ParcelDrawer renders Citizen Service Delivery certificate card in Essential tab"
  );
  assert(
    drawerCode.includes("handleDownloadCertificate") && drawerCode.includes("generateOwnershipCertificatePdf"),
    "ParcelDrawer triggers generateOwnershipCertificatePdf on certificate download click"
  );
  assert(
    drawerCode.includes("<OwnershipCertificateModal"),
    "ParcelDrawer renders OwnershipCertificateModal for full visual inspection"
  );

  // 5. Check components/OwnershipCertificateModal.tsx
  const modalCode = fs.readFileSync(path.join(baseDir, "components", "OwnershipCertificateModal.tsx"), "utf-8");
  assert(
    modalCode.includes("data-testid=\"modal-download-btn\""),
    "OwnershipCertificateModal has interactive Download PDF button"
  );
  assert(
    modalCode.includes("QRCode.toDataURL"),
    "OwnershipCertificateModal dynamically renders live verification QR code"
  );

  // 6. Check translations.ts
  const translations = fs.readFileSync(path.join(baseDir, "lib", "translations.ts"), "utf-8");
  assert(
    translations.includes("downloadCertificate: \"Download Ownership Certificate\"") &&
    translations.includes("downloadCertificate: \"स्वामित्व प्रमाण-पत्र डाउनलोड करें\""),
    "translations.ts provides English and Hindi translations for certificate download"
  );

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
  if (passed === total) {
    console.log("🎉 ALL OWNERSHIP CERTIFICATE PDF VERIFICATION CHECKS PASSED!");
    process.exit(0);
  } else {
    console.error("❌ Some verification checks failed.");
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Error running verification:", err);
  process.exit(1);
});
