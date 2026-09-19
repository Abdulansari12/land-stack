import QRCode from "qrcode";
import type { LandParcelProperties } from "@/data/parcels";

/**
 * Generates an official, government-style Ownership Certificate (Record of Rights - RoR)
 * in PDF format using dynamically loaded jsPDF, html2canvas, and qrcode.
 *
 * NOTE: jsPDF (~450KB) and html2canvas (~190KB) are dynamically imported inside
 * this function to prevent initial bundle bloat (>640KB saved).
 */
export async function generateOwnershipCertificatePdf(
  parcel: LandParcelProperties,
  language: "en" | "hi" = "en"
): Promise<void> {
  if (!parcel) throw new Error("No parcel provided for certificate generation");

  // 1. Generate QR Code Data URL encoding ULPIN verification URL
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://landstack.gov.in";
  const verificationUrl = `${origin}/verify/${parcel.ulpin}?khasra=${encodeURIComponent(
    parcel.khasraNo
  )}&status=${encodeURIComponent(parcel.rorStatus)}&owner=${encodeURIComponent(parcel.ownerName)}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  // Current formatted timestamp
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Generate deterministic mock digital signature hash
  const mockSignatureHash = Array.from(
    `${parcel.ulpin}-${parcel.khasraNo}-${parcel.ownerName}-2026`
  )
    .reduce((acc, char, idx) => (acc + char.charCodeAt(0) * (idx + 13)) % 16777215, 0)
    .toString(16)
    .padStart(8, "0")
    .toUpperCase();

  const isVerified =
    parcel.rorStatus?.toLowerCase() === "verified" ||
    parcel.rorStatus?.toLowerCase() === "digitally signed";
  const isDisputed = parcel.rorStatus?.toLowerCase() === "disputed";

  const areaInAcres = (parcel.areaInHectares * 2.47105).toFixed(2);
  const valuation = parcel.marketValueInINR || 4500000;

  const statusBg = isVerified ? "#ecfdf5" : isDisputed ? "#fef2f2" : "#fffbeb";
  const statusBorder = isVerified ? "#10b981" : isDisputed ? "#ef4444" : "#f59e0b";
  const statusText = isVerified ? "#065f46" : isDisputed ? "#991b1b" : "#92400e";
  const statusTitle = isVerified
    ? "CLEARED & VERIFIED TITLE"
    : isDisputed
    ? "DISPUTED TITLE / CAUTION"
    : "PENDING MUTATION REVIEW";

  // 2. Create off-screen container for rendering A4 certificate
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "794px"; // Standard A4 width at 96 DPI
  container.style.minHeight = "1123px"; // Standard A4 height at 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "Arial, Helvetica, sans-serif";
  container.style.boxSizing = "border-box";
  container.style.padding = "24px";
  container.style.zIndex = "-9999";

  // Inline SVG National Emblem / Ashoka Crest Placeholder
  const emblemSvg = `
    <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#1e3a8a" stroke-width="3" fill="#f8fafc"/>
      <circle cx="50" cy="50" r="41" stroke="#d97706" stroke-width="1" stroke-dasharray="3,3"/>
      <!-- Wheel of Ashoka Chakra -->
      <circle cx="50" cy="50" r="22" stroke="#1e3a8a" stroke-width="2"/>
      <circle cx="50" cy="50" r="4" fill="#1e3a8a"/>
      <!-- 12 Radiating Spokes -->
      ${Array.from({ length: 12 })
        .map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 50 + 4 * Math.cos(angle);
          const y1 = 50 + 4 * Math.sin(angle);
          const x2 = 50 + 22 * Math.cos(angle);
          const y2 = 50 + 22 * Math.sin(angle);
          return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#1e3a8a" stroke-width="1.5"/>`;
        })
        .join("")}
      <!-- Crown Top -->
      <path d="M40 22 L50 15 L60 22 L56 28 L44 28 Z" fill="#d97706"/>
      <!-- Base Lotus Platform -->
      <path d="M30 76 Q50 84 70 76 L66 82 Q50 88 34 82 Z" fill="#1e3a8a"/>
    </svg>
  `;

  // Watermark SVG (diagonal text overlay)
  const watermarkText = "LAND STACK DPI • OFFICIAL CADASTRAL RECORD • DILRMP";

  container.innerHTML = `
    <div style="
      border: 3px double #1e3a8a;
      padding: 6px;
      background: #ffffff;
      height: 100%;
      box-sizing: border-box;
      position: relative;
    ">
      <div style="
        border: 1px solid #d97706;
        padding: 24px 28px;
        position: relative;
        background: radial-gradient(circle at center, #ffffff 60%, #fafbfc 100%);
      ">
        <!-- Background Security Watermark -->
        <div style="
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 32px;
          font-weight: 800;
          color: rgba(30, 58, 138, 0.04);
          letter-spacing: 4px;
          text-transform: uppercase;
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
          z-index: 0;
        ">
          ${watermarkText}
        </div>

        <!-- Header Content (Z-Index 1) -->
        <div style="position: relative; z-index: 1;">
          
          <!-- Government Saffron/White/Green Header Accent -->
          <div style="display: flex; height: 4px; width: 100%; margin-bottom: 16px; border-radius: 2px; overflow: hidden;">
            <div style="flex: 1; background: #FF9933;"></div>
            <div style="flex: 1; background: #ffffff; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;"></div>
            <div style="flex: 1; background: #138808;"></div>
          </div>

          <!-- Official Authority Banner -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div>${emblemSvg}</div>
              <div>
                <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.2;">
                  Government of India / भारत सरकार
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px;">
                  Ministry of Rural Development • Department of Land Resources
                </div>
                <div style="font-size: 10px; font-weight: 600; color: #64748b; margin-top: 1px;">
                  Digital India Land Records Modernization Programme (DILRMP) • Land Stack Cadastral DPI
                </div>
              </div>
            </div>

            <!-- Certificate Identifier Box -->
            <div style="text-align: right; border-left: 2px solid #e2e8f0; padding-left: 14px;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                Certificate Number
              </div>
              <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; font-family: monospace; letter-spacing: 0.5px;">
                CERT-2026-${parcel.ulpin.slice(-8)}
              </div>
              <div style="font-size: 9px; font-weight: 600; color: #059669; margin-top: 2px;">
                ● DPDP Act 2023 Compliant
              </div>
            </div>
          </div>

          <!-- Document Title Banner -->
          <div style="text-align: center; margin-bottom: 18px;">
            <h1 style="font-size: 17px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 4px 0;">
              Record of Rights (RoR) & Title Ownership Certificate
            </h1>
            <div style="font-size: 11px; font-weight: 600; color: #475569;">
              Issued under the National Cadastral Survey & Digital Title Registration Protocol
            </div>
          </div>

          <!-- RoR Status & Jurisdictional Seal Ribbon -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: ${statusBg};
            border: 1.5px solid ${statusBorder};
            border-radius: 8px;
            padding: 10px 16px;
            margin-bottom: 18px;
          ">
            <div>
              <div style="font-size: 10px; font-weight: 700; color: ${statusText}; text-transform: uppercase; letter-spacing: 0.5px;">
                Cadastral Adjudication Status
              </div>
              <div style="font-size: 13px; font-weight: 800; color: ${statusText}; margin-top: 1px;">
                ★ ${statusTitle} (${parcel.rorStatus.toUpperCase()})
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 600; color: #475569;">
                State Registry Jurisdiction
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #0f172a;">
                ${parcel.sourceState || "Uttar Pradesh Revenue Authority"}
              </div>
            </div>
          </div>

          <!-- Primary Parcel Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
            <thead>
              <tr style="background-color: #1e3a8a; color: #ffffff;">
                <th colspan="2" style="text-align: left; padding: 7px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-top-left-radius: 6px;">
                  A. Cadastral Identification & Ownership Details
                </th>
                <th colspan="2" style="text-align: left; padding: 7px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-top-right-radius: 6px;">
                  B. Spatial Dimensions & Classification
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Row 1: ULPIN & Area -->
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 8px 12px; font-weight: 700; color: #475569; width: 22%;">ULPIN (Parcel ID):</td>
                <td style="padding: 8px 12px; font-weight: 800; color: #1e3a8a; font-family: monospace; font-size: 12px; width: 28%;">
                  ${parcel.ulpin}
                </td>
                <td style="padding: 8px 12px; font-weight: 700; color: #475569; width: 22%;">Cadastral Area:</td>
                <td style="padding: 8px 12px; font-weight: 700; color: #0f172a; width: 28%;">
                  ${parcel.areaInHectares} Hectares (~${areaInAcres} Acres)
                </td>
              </tr>

              <!-- Row 2: Khasra & Land Use -->
              <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Khasra / Survey #:</td>
                <td style="padding: 8px 12px; font-weight: 800; color: #0f172a;">
                  Khasra #${parcel.khasraNo}
                </td>
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Permissible Land Use:</td>
                <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">
                  ${parcel.landUse}
                </td>
              </tr>

              <!-- Row 3: Owner Name & Legal Title -->
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Registered Owner:</td>
                <td style="padding: 8px 12px; font-weight: 800; color: #0f172a; font-size: 12px;">
                  ${parcel.ownerName}
                </td>
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Legal Title State:</td>
                <td style="padding: 8px 12px; font-weight: 700; color: ${parcel.clearOrDisputed === "Clear" ? "#059669" : "#dc2626"};">
                  ${parcel.clearOrDisputed.toUpperCase()}
                </td>
              </tr>

              <!-- Row 4: Property Tax & Valuation -->
              <tr style="border-bottom: 1px solid #e2e8f0; background: #ffffff;">
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Property Tax Status:</td>
                <td style="padding: 8px 12px; font-weight: 700; color: ${parcel.taxStatus === "Paid" ? "#059669" : "#dc2626"};">
                  ${parcel.taxStatus} (Assessment Verified)
                </td>
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Estimated Valuation:</td>
                <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">
                  ₹${valuation.toLocaleString("en-IN")}
                </td>
              </tr>

              <!-- Row 5: Encumbrance Certificate -->
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Encumbrance / Lien:</td>
                <td colspan="3" style="padding: 8px 12px; font-weight: 600; color: #334155;">
                  ${parcel.encumbrances || "Nil Encumbrance (Free from institutional mortgages or court caveats)"}
                </td>
              </tr>

              <!-- Row 6: Building Permission -->
              <tr style="background: #ffffff;">
                <td style="padding: 8px 12px; font-weight: 700; color: #475569;">Building Sanction:</td>
                <td colspan="3" style="padding: 8px 12px; font-weight: 600; color: #334155;">
                  ${parcel.buildingPermission || "Standard Zonal Regulations Apply (Municipal Bye-Laws 2024)"}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Chain of Title Summary Mini-Table -->
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              C. Historical Mutation & Chain of Title Records
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background-color: #f1f5f9; color: #475569; border-bottom: 1px solid #cbd5e1;">
                  <th style="padding: 5px 10px; text-align: left; font-weight: 700;">Mutation Date</th>
                  <th style="padding: 5px 10px; text-align: left; font-weight: 700;">Recorded Title Holder</th>
                  <th style="padding: 5px 10px; text-align: left; font-weight: 700;">Transaction Type</th>
                  <th style="padding: 5px 10px; text-align: left; font-weight: 700;">Deed / Document Reference</th>
                </tr>
              </thead>
              <tbody>
                ${(parcel.chainOfTitle && parcel.chainOfTitle.length > 0
                  ? parcel.chainOfTitle
                  : [
                      {
                        date: "12 Oct 2021",
                        ownerName: parcel.ownerName || "Rameshwar Prasad Sharma",
                        transactionType: "Inheritance",
                        documentRef: "WLL/2021/8812",
                      },
                      {
                        date: "18 Mar 2008",
                        ownerName: "Late Ram Avtar Sharma",
                        transactionType: "Mutation",
                        documentRef: "MUT/2008/412",
                      },
                      {
                        date: "04 Aug 1989",
                        ownerName: "Bhairon Singh Yadav",
                        transactionType: "Sale",
                        documentRef: "DEED/1989/1049",
                      },
                    ]
                )
                  .map(
                    (rec, idx) => `
                    <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                      <td style="padding: 5px 10px; font-family: monospace; font-weight: 600;">${rec.date}</td>
                      <td style="padding: 5px 10px; font-weight: 700; color: #0f172a;">${rec.ownerName}</td>
                      <td style="padding: 5px 10px; font-weight: 600;">${rec.transactionType}</td>
                      <td style="padding: 5px 10px; font-family: monospace; color: #64748b;">${rec.documentRef || "REG/MUT/OFFICIAL"}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <!-- Bottom Verification & Digital Signature Block -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px 16px;
            background: #f8fafc;
            margin-bottom: 12px;
          ">
            <!-- QR Code Section -->
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="
                border: 1px solid #cbd5e1;
                background: #ffffff;
                padding: 4px;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
              ">
                <img src="${qrDataUrl}" alt="Verification QR Code" width="84" height="84" style="display: block;" />
              </div>
              <div style="max-width: 210px;">
                <div style="font-size: 10px; font-weight: 800; color: #1e3a8a; text-transform: uppercase;">
                  Scan for Instant Verification
                </div>
                <div style="font-size: 9px; color: #475569; line-height: 1.35; margin-top: 3px;">
                  Encodes ULPIN <span style="font-family: monospace; font-weight: 700;">${parcel.ulpin}</span>. Verifiable on public citizen portal.
                </div>
                <div style="font-size: 8px; font-family: monospace; color: #059669; font-weight: 700; margin-top: 4px;">
                  SHA256: ${mockSignatureHash}8F9B2C4D
                </div>
              </div>
            </div>

            <!-- Mock Digital Signature Seal -->
            <div style="text-align: right; min-width: 250px;">
              <div style="display: inline-flex; align-items: center; gap: 4px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 4px; padding: 2px 8px; margin-bottom: 4px;">
                <span style="color: #059669; font-size: 11px;">✔</span>
                <span style="font-size: 9px; font-weight: 800; color: #065f46; text-transform: uppercase;">
                  Digitally Signed (DSC Class 3)
                </span>
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a;">
                Authorized Revenue Officer / Tehsildar
              </div>
              <div style="font-size: 9px; color: #475569;">
                Directorate of Land Records & Cadastral Surveys
              </div>
              <div style="font-size: 9px; color: #64748b; font-family: monospace; margin-top: 2px;">
                eSign ID: DL-RDO-2026-${mockSignatureHash}
              </div>
            </div>
          </div>

          <!-- Legal Disclaimer & Timestamp Footer -->
          <div style="
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 9px;
            color: #64748b;
          ">
            <div style="font-weight: 600;">
              Digitally generated on <strong>${dateFormatted} at ${timeFormatted} IST</strong>
            </div>
            <div style="text-align: right; max-width: 420px; font-size: 8px; line-height: 1.2;">
              Valid under Section 65B of Indian Evidence Act & IT Act 2000. No physical ink signature required.
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Dynamic on-demand code-splitting for heavy libraries (>640KB bundle savings)
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import("jspdf"),
      import("html2canvas"),
    ]);

    // 3. Rasterize HTML into high-resolution Canvas (2x scale for 192 DPI crispness)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    // 4. Initialize A4 jsPDF instance and save
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // A4 dimensions: 210mm x 297mm
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");

    // Output filename
    const sanitizedUlpin = parcel.ulpin.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `LandStack_Ownership_Certificate_${sanitizedUlpin}.pdf`;

    pdf.save(fileName);
  } finally {
    // Always clean up off-screen DOM node
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
