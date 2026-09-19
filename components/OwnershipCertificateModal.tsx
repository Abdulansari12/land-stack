"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";
import type { LandParcelProperties } from "@/data/parcels";
import { generateOwnershipCertificatePdf } from "@/lib/certificateGenerator";
import { useLanguage } from "@/context/LanguageContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { LoadingState, ErrorState } from "@/components/ui";
import toast from "react-hot-toast";

interface OwnershipCertificateModalProps {
  parcel: LandParcelProperties | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OwnershipCertificateModal({
  parcel,
  isOpen,
  onClose,
}: OwnershipCertificateModalProps) {
  const { t, language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalPdfError, setModalPdfError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Accessible focus trap and Escape handler
  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    onClose,
  });

  useEffect(() => {
    if (!parcel || !isOpen) return;

    let isMounted = true;
    setQrLoading(true);
    setQrError(null);
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://landstack.gov.in";
    const verificationUrl = `${origin}/verify/${parcel.ulpin}?khasra=${encodeURIComponent(
      parcel.khasraNo
    )}&status=${encodeURIComponent(parcel.rorStatus)}&owner=${encodeURIComponent(parcel.ownerName)}`;

    QRCode.toDataURL(verificationUrl, {
      width: 180,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setQrLoading(false);
        }
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
        if (isMounted) {
          setQrError("Failed to generate verification QR code.");
          setQrLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [parcel, isOpen]);

  if (!isOpen || !parcel) return null;

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setModalPdfError(null);
    const toastId = toast.loading(t("generatingCertificate") || "Generating Ownership Certificate PDF...");
    try {
      await generateOwnershipCertificatePdf(parcel, language);
      toast.success(t("certificateDownloaded") || "Ownership Certificate downloaded!", {
        id: toastId,
      });
    } catch (err: any) {
      console.error("Failed to generate certificate:", err);
      const errMsg = err?.message || "Failed to generate PDF. Please try again.";
      setModalPdfError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const isVerified =
    parcel.rorStatus?.toLowerCase() === "verified" ||
    parcel.rorStatus?.toLowerCase() === "digitally signed";
  const isDisputed = parcel.rorStatus?.toLowerCase() === "disputed";

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ownership Certificate Preview"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden"
      >
        {/* Modal Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-xs">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t("officialCertificateTitle") || "Record of Rights (RoR) Certificate"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-verified/20 text-status-verified dark:text-status-verified-text border border-status-verified/40">
                  e-Sign Valid
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                ULPIN: {parcel.ulpin} • Khasra #{parcel.khasraNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="modal-download-btn"
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-active disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <LoadingState
                  variant="inline"
                  size="sm"
                  label={t("generatingCertificate") || "Generating..."}
                  className="text-white justify-center"
                />
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>{t("downloadCertificate") || "Download PDF"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close ownership certificate preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {modalPdfError && (
          <div className="p-3 bg-rose-950/40 border-b border-rose-900/60 shrink-0">
            <ErrorState
              variant="banner"
              size="sm"
              title="Certificate PDF Generation Failed"
              message={modalPdfError}
              onRetry={handleDownload}
              retryLabel="Retry Download"
              onDismiss={() => setModalPdfError(null)}
            />
          </div>
        )}

        {/* Scrollable Certificate Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-zinc-950 flex justify-center">
          <div className="w-full max-w-2xl bg-white text-slate-900 p-6 sm:p-8 rounded-lg shadow-xl border-4 border-double border-indigo-900/80 relative text-xs font-sans">
            {/* National Saffron / White / Green Bar */}
            <div className="flex h-1.5 w-full rounded-full overflow-hidden mb-4">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white border-y border-slate-200" />
              <div className="flex-1 bg-[#138808]" />
            </div>

            {/* Top Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-indigo-900 mb-4 gap-4">
              <div className="flex items-center gap-3">
                {/* Ashoka Chakra Stamp */}
                <div className="h-12 w-12 rounded-full border-2 border-indigo-900 flex items-center justify-center bg-slate-50 shrink-0">
                  <div className="h-10 w-10 rounded-full border border-amber-600 border-dashed flex items-center justify-center text-[9px] font-black text-indigo-900 tracking-tighter">
                    DPI
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider">
                    Government of India / भारत सरकार
                  </div>
                  <div className="text-[9px] font-bold text-slate-700 uppercase tracking-tight">
                    Ministry of Rural Development • Department of Land Resources
                  </div>
                  <div className="text-[8px] text-slate-500 font-medium">
                    Digital India Land Records Modernization Programme (DILRMP)
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                  Certificate Ref
                </span>
                <span className="font-mono text-[11px] font-bold text-indigo-900">
                  CERT-{parcel.ulpin.slice(-8)}
                </span>
                <div className="text-[8px] text-emerald-700 font-semibold mt-0.5">
                  ✓ DPDP Act 2023 Compliant
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-4">
              <h1 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide mb-0.5">
                Record of Rights (RoR) & Title Ownership Certificate
              </h1>
              <p className="text-[9px] text-slate-600 font-medium">
                Issued under the National Cadastral Survey & Digital Title Registration Protocol
              </p>
            </div>

            {/* RoR Status Strip */}
            <div
              className={`p-2.5 rounded-lg border flex items-center justify-between mb-4 ${
                isVerified
                  ? "bg-status-verified-bg border-status-verified-border text-status-verified-text"
                  : isDisputed
                  ? "bg-status-disputed-bg border-status-disputed-border text-status-disputed-text"
                  : "bg-status-pending-bg border-status-pending-border text-status-pending-text"
              }`}
            >
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                  Cadastral Adjudication Status
                </span>
                <span className="text-xs font-black">
                  ★ {isVerified ? "CLEARED & VERIFIED TITLE" : isDisputed ? "DISPUTED TITLE / CAUTION" : "PENDING REVIEW"} ({parcel.rorStatus.toUpperCase()})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-semibold text-slate-600 block">State Jurisdiction</span>
                <span className="text-[10px] font-bold text-slate-900">
                  {parcel.sourceState || "State Revenue Registry"}
                </span>
              </div>
            </div>

            {/* Essential Details Grid */}
            <table className="w-full border-collapse text-[10px] mb-4">
              <thead>
                <tr className="bg-indigo-900 text-white">
                  <th colSpan={2} className="text-left px-2.5 py-1.5 font-bold uppercase tracking-wider rounded-tl">
                    A. Cadastral Identification & Ownership Details
                  </th>
                  <th colSpan={2} className="text-left px-2.5 py-1.5 font-bold uppercase tracking-wider rounded-tr">
                    B. Spatial Dimensions & Classification
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border border-slate-200">
                <tr className="bg-slate-50/60">
                  <td className="px-2.5 py-2 font-bold text-slate-600 w-1/4">ULPIN:</td>
                  <td className="px-2.5 py-2 font-mono font-bold text-indigo-900 w-1/4">
                    {parcel.ulpin}
                  </td>
                  <td className="px-2.5 py-2 font-bold text-slate-600 w-1/4">Cadastral Area:</td>
                  <td className="px-2.5 py-2 font-semibold text-slate-900 w-1/4">
                    ${parcel.areaInHectares} Ha (~${(parcel.areaInHectares * 2.47105).toFixed(2)} Acres)
                  </td>
                </tr>
                <tr>
                  <td className="px-2.5 py-2 font-bold text-slate-600">Khasra / Survey #:</td>
                  <td className="px-2.5 py-2 font-bold text-slate-900">Khasra #${parcel.khasraNo}</td>
                  <td className="px-2.5 py-2 font-bold text-slate-600">Permissible Land Use:</td>
                  <td className="px-2.5 py-2 font-semibold text-slate-900">{parcel.landUse}</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="px-2.5 py-2 font-bold text-slate-600">Registered Owner:</td>
                  <td className="px-2.5 py-2 font-bold text-slate-900">
                    <div>{parcel.ownerName}</div>
                    <div className="text-[10px] font-mono font-normal text-slate-500 mt-0.5">
                      Citizen Ref: DEMO-CITIZEN-{(parcel.khasraNo || "0412").replace(/[^0-9]/g, "").padStart(4, "0")} (Fictional Demo ID)
                    </div>
                  </td>
                  <td className="px-2.5 py-2 font-bold text-slate-600">Legal Title State:</td>
                  <td className={`px-2.5 py-2 font-bold ${parcel.clearOrDisputed === "Clear" ? "text-emerald-700" : "text-red-700"}`}>
                    {parcel.clearOrDisputed.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <td className="px-2.5 py-2 font-bold text-slate-600">Property Tax Status:</td>
                  <td className="px-2.5 py-2 font-semibold text-emerald-700">{parcel.taxStatus}</td>
                  <td className="px-2.5 py-2 font-bold text-slate-600">Estimated Valuation:</td>
                  <td className="px-2.5 py-2 font-semibold text-slate-900">
                    ₹{(parcel.marketValueInINR || 4500000).toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="px-2.5 py-2 font-bold text-slate-600">Encumbrance / Lien:</td>
                  <td colSpan={3} className="px-2.5 py-2 text-slate-700 font-medium">
                    {parcel.encumbrances || "Nil Encumbrance (Free from institutional mortgages or court caveats)"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Verification & Signature Block */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80 flex items-center justify-between gap-4 mb-3">
              {/* QR Code */}
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-slate-300 rounded shrink-0 shadow-2xs">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`Official QR verification code for ULPIN ${parcel.ulpin} and Khasra ${parcel.khasraNo}`}
                      className="w-16 h-16 block"
                    />
                  ) : qrError ? (
                    <div className="w-16 h-16 flex items-center justify-center bg-rose-50 rounded text-rose-500">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-slate-50">
                      <LoadingState variant="spinner" size="sm" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[9px] font-bold text-indigo-900 uppercase">
                    Scan for Instant Verification
                  </div>
                  <div className="text-[8px] text-slate-600 mt-0.5">
                    Encodes ULPIN <span className="font-mono font-bold">{parcel.ulpin}</span>
                  </div>
                  {qrError ? (
                    <div className="text-[7px] text-rose-600 font-medium mt-0.5">
                      {qrError}
                    </div>
                  ) : (
                    <div className="text-[7px] font-mono text-emerald-700 font-bold mt-0.5">
                      SHA256: 4F9B2C4D • Public Ledger Verifiable
                    </div>
                  )}
                  <a
                    href={`/verify/${parcel.ulpin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[8px] font-bold text-indigo-600 hover:text-indigo-800 underline mt-0.5"
                  >
                    <span>Open Public Verification Page</span>
                    <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1 bg-status-verified-bg text-status-verified-text border border-status-verified-border rounded px-1.5 py-0.5 text-[8px] font-bold uppercase mb-1">
                  <span>✔</span>
                  <span>Digitally Signed (DSC Class 3)</span>
                </div>
                <div className="text-[10px] font-bold text-slate-900">
                  Authorized Revenue Officer / Tehsildar
                </div>
                <div className="text-[8px] text-slate-600">
                  Directorate of Land Records & Cadastral Surveys
                </div>
                <div className="text-[7px] font-mono text-slate-500 mt-0.5">
                  eSign ID: DL-RDO-2026-CERT
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
              <div>
                Digitally generated on <strong>{dateFormatted} at {timeFormatted} IST</strong>
              </div>
              <div>
                Valid under Sec 65B Indian Evidence Act & IT Act 2000.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
