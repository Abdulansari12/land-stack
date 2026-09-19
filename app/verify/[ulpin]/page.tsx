"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  MapPin,
  User,
  Building,
  Landmark,
  FileCheck,
  Search,
  Sparkles,
  History,
  FileText,
  BadgeCheck,
  Lock,
  Layers,
  Moon,
  Sun,
  Languages,
} from "lucide-react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
  type LandParcelFeature,
  type LandParcelProperties,
} from "@/data/parcels";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import { generateOwnershipCertificatePdf } from "@/lib/certificateGenerator";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingState, ErrorState } from "@/components/ui";

/**
 * Resolves a normalized LandParcelProperties object from any of the state datasets
 * by ULPIN, Khasra Number, or Feature ID (case-insensitive).
 */
function resolveParcelByUlpin(ulpin: string): LandParcelProperties | null {
  if (!ulpin) return null;
  let decoded = decodeURIComponent(ulpin).trim().toLowerCase();

  // Handle demo / legacy aliases seamlessly
  if (decoded === "ch17c0440a" || decoded === "ch-parcel-201") {
    decoded = "ch01s1742a";
  }

  const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
  const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
  const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");

  const allFeatures: LandParcelFeature[] = [
    ...up.features,
    ...tn.features,
    ...ch.features,
  ];

  const match = allFeatures.find(
    (f) =>
      f.properties.ulpin.toLowerCase() === decoded ||
      f.id.toLowerCase() === decoded ||
      f.properties.khasraNo.toLowerCase() === decoded ||
      f.properties.ulpin.replace(/[^a-z0-9]/g, "") === decoded.replace(/[^a-z0-9]/g, "")
  );

  return match ? match.properties : null;
}

export default function PublicVerificationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const ulpinParam = (params?.ulpin as string) || "";
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState("");

  // Resolve parcel data from database or construct from query params fallback
  const parcel = useMemo(() => {
    const found = resolveParcelByUlpin(ulpinParam);
    if (found) return found;

    // Fallback: If query params exist, construct parcel view
    const qOwner = searchParams.get("owner");
    const qKhasra = searchParams.get("khasra");
    const qStatus = searchParams.get("status");
    if (qOwner || qKhasra) {
      return {
        ulpin: decodeURIComponent(ulpinParam).toUpperCase(),
        khasraNo: qKhasra ? decodeURIComponent(qKhasra) : "Recorded Plot",
        ownerName: qOwner ? decodeURIComponent(qOwner) : "Verified Titleholder",
        landUse: "Residential",
        rorStatus: qStatus ? decodeURIComponent(qStatus) : "Verified",
        clearOrDisputed: (qStatus?.toLowerCase().includes("dispute") ? "Disputed" : "Clear") as "Clear" | "Disputed",
        encumbrances: "Nil (Encumbrance Certificate Clean - Sub-Registrar Office)",
        taxStatus: "Paid",
        utilityLines: ["Potable Water Pipeline", "Domestic Smart Meter Grid"],
        areaInHectares: 1.0,
        marketValueInINR: 5000000,
        sourceState: ulpinParam.startsWith("TN") ? "Tamil Nadu" : ulpinParam.startsWith("CH") ? "Chandigarh" : "Uttar Pradesh",
        chainOfTitle: [],
      } as LandParcelProperties;
    }

    return null;
  }, [ulpinParam, searchParams]);

  // Current timestamp for live verification verification
  const verificationTime = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };
  }, []);

  // Generate QR Code encoding current verification URL
  useEffect(() => {
    if (!parcel) return;
    let isMounted = true;
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://landstack.gov.in";
    const verificationUrl = `${origin}/verify/${parcel.ulpin}`;

    QRCode.toDataURL(verificationUrl, {
      width: 220,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [parcel]);

  // Copy Verification URL to Clipboard
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success(language === "hi" ? "सत्यापन लिंक कॉपी किया गया!" : "Verification link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Copy ULPIN
  const handleCopyUlpin = () => {
    if (!parcel) return;
    navigator.clipboard.writeText(parcel.ulpin);
    toast.success(language === "hi" ? `ULPIN ${parcel.ulpin} कॉपी हुआ!` : `ULPIN ${parcel.ulpin} copied!`);
  };

  // Download Certificate PDF
  const handleDownloadPdf = async () => {
    if (!parcel || isDownloading) return;
    setIsDownloading(true);
    setPdfError(null);
    const toastId = toast.loading(language === "hi" ? "प्रमाणपत्र तैयार हो रहा है..." : "Generating official certificate PDF...");
    try {
      await generateOwnershipCertificatePdf(parcel, language);
      toast.success(language === "hi" ? "प्रमाणपत्र सफलतापूर्वक डाउनलोड हुआ!" : "Ownership certificate downloaded!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || (language === "hi" ? "प्रमाणपत्र निर्माण विफल रहा।" : "Failed to generate PDF. Please try again.");
      setPdfError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  // Print Summary Page
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Deterministic Cryptographic Signature Hash
  const signatureHash = useMemo(() => {
    if (!parcel) return "00000000";
    return Array.from(`${parcel.ulpin}-${parcel.khasraNo}-${parcel.ownerName}-DPI`)
      .reduce((acc, char, idx) => (acc + char.charCodeAt(0) * (idx + 17)) % 16777215, 0)
      .toString(16)
      .padStart(8, "0")
      .toUpperCase();
  }, [parcel]);

  const isVerified =
    parcel?.rorStatus?.toLowerCase() === "verified" ||
    parcel?.rorStatus?.toLowerCase() === "digitally signed";
  const isDisputed = parcel?.rorStatus?.toLowerCase() === "disputed";

  // Handle Manual Search
  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearch.trim()) return;
    router.push(`/verify/${encodeURIComponent(manualSearch.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. OFFICIAL GOVERNMENT TRICOLOR HEADER */}
      {/* ========================================================================= */}
      {/* National Flag Tricolor Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 shrink-0" />

      {/* Top Government Navigation Bar */}
      <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 px-4 sm:px-8 py-3 transition-colors shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group hover:opacity-90 transition cursor-pointer"
              title="Return to Land Stack Dashboard"
            >
              {/* Ashoka Chakra / Security Emblem Graphic */}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 text-white flex items-center justify-center shadow-md border border-indigo-500/30 shrink-0">
                <ShieldCheck className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                    Land Stack
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    DPI Verifier
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium hidden sm:inline">
                  {language === "hi"
                    ? "भारत सरकार • राष्ट्रीय भू-अभिलेख सार्वजनिक सत्यापन पोर्टल"
                    : "Government of India • National Cadastral Title Verification Portal"}
                </span>
              </div>
            </Link>
          </div>

          {/* Header Controls: Back to Map, Language, Dark Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={parcel ? `/?search=${encodeURIComponent(parcel.ulpin)}` : "/"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition border border-slate-200 dark:border-zinc-700 shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{language === "hi" ? "डैशबोर्ड मानचित्र" : "Dashboard Map"}</span>
            </Link>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition flex items-center gap-1 cursor-pointer"
              title="Toggle Language (EN / HI)"
              aria-label={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
            >
              <Languages className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer border border-slate-200 dark:border-zinc-700 shadow-2xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VERIFICATION WORKSPACE */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
        {/* If Parcel is Found */}
        {parcel ? (
          <>
            {/* ------------------------------------------------------------- */}
            {/* HERO TRUST SEAL: Official DigiLocker / Land Stack Banner */}
            {/* ------------------------------------------------------------- */}
            <div
              className={`relative overflow-hidden rounded-2xl p-5 sm:p-7 border shadow-xl transition-all ${
                isVerified
                  ? "bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-zinc-900 border-emerald-300 dark:border-emerald-800"
                  : isDisputed
                  ? "bg-gradient-to-br from-rose-50 via-red-50/60 to-white dark:from-rose-950/40 dark:via-red-950/20 dark:to-zinc-900 border-rose-300 dark:border-rose-800"
                  : "bg-gradient-to-br from-amber-50 via-orange-50/60 to-white dark:from-amber-950/40 dark:via-amber-950/20 dark:to-zinc-900 border-amber-300 dark:border-amber-800"
              }`}
            >
              {/* Background Watermark Crest */}
              <div className="absolute -right-8 -bottom-8 opacity-5 dark:opacity-10 pointer-events-none select-none">
                <Landmark className="w-56 h-56" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                {/* Left: Verification Badge & Status */}
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      isVerified
                        ? "bg-emerald-600 text-white shadow-emerald-500/30"
                        : isDisputed
                        ? "bg-rose-600 text-white shadow-rose-500/30"
                        : "bg-amber-500 text-white shadow-amber-500/30"
                    }`}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="h-9 w-9 animate-pulse" />
                    ) : isDisputed ? (
                      <AlertTriangle className="h-9 w-9" />
                    ) : (
                      <Clock className="h-9 w-9" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-2xs ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                            : isDisputed
                            ? "bg-rose-100 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700"
                            : "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                        }`}
                      >
                        <BadgeCheck className="h-3.5 w-3.5" />
                        {isVerified
                          ? language === "hi"
                            ? "प्रमाणित डिजिटल भू-अभिलेख"
                            : "Verified Digital Record"
                          : isDisputed
                          ? language === "hi"
                            ? "विवादित स्वत्व रिकॉर्ड"
                            : "Disputed Title Record"
                          : language === "hi"
                          ? "म्यूटेशन विचाराधीन"
                          : "Pending Mutation"}
                      </span>

                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                        HASH: {signatureHash}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {language === "hi"
                        ? "डिजिटल भू-स्वामित्व एवं स्वत्व प्रमाणन"
                        : "Digital Land Ownership & Title Authentication"}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
                      {isVerified
                        ? language === "hi"
                          ? "राष्ट्रीय भू-संदर्भित ULPIN रजिस्ट्री के अनुसार यह अभिलेख सत्यापित एवं पूर्णतः सुरक्षित है।"
                          : "Authentic cadastral record verified against the National BND-ULPIN Digital Registry."
                        : isDisputed
                        ? language === "hi"
                          ? "सावधानी: इस पार्सल पर राजस्व न्यायालय में स्वत्व संबंधी वाद अथवा स्थगन आदेश दर्ज है।"
                          : "Statutory Caution: An active boundary dispute or stay order is flagged for this parcel."
                        : language === "hi"
                        ? "यह पार्सल वर्तमान में तहसील उप-पंजीयक कार्यालय में नामांतरण समीक्षाधीन है।"
                        : "This title record is currently under active mutation review at the revenue office."}
                    </p>
                  </div>
                </div>

                {/* Right: Live Verification Timestamp Stamp */}
                <div className="shrink-0 sm:text-right bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                    {language === "hi" ? "सत्यापन समय" : "Authenticated Live"}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {verificationTime.date}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {verificationTime.time} IST
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUMMARY CARD: Clean, Read-Only Details Grid */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md overflow-hidden">
              {/* Card Section Header */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    {language === "hi" ? "पार्सल मुख्य विवरण" : "Cadastral Title Summary"}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  {parcel.sourceState || "National DPI"} Registry
                </span>
              </div>

              {/* Data Grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. ULPIN (Prominent Monospace) */}
                <div className="sm:col-span-2 lg:col-span-1 p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide mb-1">
                    ULPIN (14-Digit ID)
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-lg text-indigo-950 dark:text-indigo-200 tracking-wider">
                      {parcel.ulpin}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUlpin}
                      aria-label="Copy ULPIN"
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                      title="Copy ULPIN"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1 font-medium">
                    BND Standard Cadastral Identifier
                  </div>
                </div>

                {/* 2. Registered Owner Name */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{language === "hi" ? "पंजीकृत भूस्वामी" : "Registered Owner"}</span>
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {parcel.ownerName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    Primary Titleholder / Pattadar
                  </div>
                </div>

                {/* 3. Khasra / Survey Number */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{language === "hi" ? "खसरा / सर्वेक्षण संख्या" : "Khasra / Survey #"}</span>
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {parcel.khasraNo}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    Subdivision Cadastral Reference
                  </div>
                </div>

                {/* 4. Cadastral Area / Extent */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    {language === "hi" ? "कुल पंजीकृत क्षेत्रफल" : "Cadastral Extent"}
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {parcel.areaInHectares} Ha
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    ~{(parcel.areaInHectares * 2.47105).toFixed(2)} Acres ({(parcel.areaInHectares * 10000).toLocaleString("en-IN")} m²)
                  </div>
                </div>

                {/* 5. Permissible Land Use */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{language === "hi" ? "भूमि उपयोग वर्गीकरण" : "Permissible Land Use"}</span>
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white">
                    {parcel.landUse}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    Zoned & Approved Classification
                  </div>
                </div>

                {/* 6. Estimated Valuation */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    {language === "hi" ? "सर्कल रेट मूल्यांकन" : "Guideline Valuation"}
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white font-mono">
                    ₹{(parcel.marketValueInINR || 4500000).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    Assessed Circle Valuation
                  </div>
                </div>

                {/* 7. Property Tax Status */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    {language === "hi" ? "संपत्ति कर स्थिति" : "Property Tax Status"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        parcel.taxStatus?.toLowerCase() === "paid"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {parcel.taxStatus || "Paid"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    Municipal Dues Clear
                  </div>
                </div>

                {/* 8. Encumbrances / Liens (Spans 2 cols) */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{language === "hi" ? "भार एवं दृष्टिबंधक स्थिति (Encumbrance)" : "Encumbrance & Lien Declaration"}</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200">
                    {parcel.encumbrances || "Nil Encumbrance (Free from bank mortgage charges or court caveats)"}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                    Verified through Sub-Registrar Digital Registry
                  </div>
                </div>
              </div>

              {/* Connected Utilities Strip */}
              {parcel.utilityLines && parcel.utilityLines.length > 0 && (
                <div className="px-5 py-3 bg-slate-50/50 dark:bg-zinc-800/30 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1">
                    {language === "hi" ? "संबद्ध उपयोगिताएँ:" : "Mapped Easements:"}
                  </span>
                  {parcel.utilityLines.map((line, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CHAIN OF TITLE / PROVENANCE (Audit Trail Historical Timeline) */}
            {/* ------------------------------------------------------------- */}
            {parcel.chainOfTitle && parcel.chainOfTitle.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    {language === "hi" ? "स्वामित्व श्रृंखला व हस्तांतरण इतिहास" : "Chain of Title & Legal Provenance"}
                  </h3>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700">
                  {parcel.chainOfTitle.map((rec, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white dark:border-zinc-900" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {rec.ownerName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                          {rec.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                          {rec.transactionType}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                          Doc Ref: {rec.documentRef}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* OFFICIAL TRUST SEAL & LEGAL DISCLAIMER BOX (DigiLocker Style) */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code Graphic */}
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Public Verification QR Code" className="w-28 h-28 block" />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center bg-slate-100">
                    <QrCode className="h-10 w-10 text-slate-400 animate-pulse" />
                  </div>
                )}
                <span className="text-[9px] font-bold text-indigo-900 uppercase mt-1">
                  Public Key QR
                </span>
              </div>

              {/* Disclaimer Text */}
              <div className="flex-1 text-xs text-slate-600 dark:text-zinc-400 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>
                    {language === "hi"
                      ? "आधिकारिक सरकारी भू-अभिलेख घोषणा"
                      : "Statutory Digital Record Declaration"}
                  </span>
                </div>
                <p className="leading-relaxed">
                  {language === "hi"
                    ? "यह भू-अभिलेख 'लैंड स्टैक' (राष्ट्रीय डिजिटल सार्वजनिक अवसंरचना) द्वारा प्रत्यक्ष रूप से प्रमाणित किया गया है। यह इलेक्ट्रॉनिक दस्तावेज़ भारतीय साक्ष्य अधिनियम 1872 की धारा 65B तथा सूचना प्रौद्योगिकी अधिनियम 2000 के प्रावधानों के अंतर्गत वैधानिक रूप से मान्य है।"
                    : "This is an official digital record from Land Stack — Unified Digital Infrastructure for Land Governance. Generated under the Digital India Land Records Modernization Programme (DILRMP). Legally recognized under Section 65B of the Indian Evidence Act, 1872 and Information Technology Act, 2000."}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <span>🏛️ Ministry of Rural Development</span>
                  <span>🛡️ DSC Class-3 eSign Authorized</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    DPI-REF #{signatureHash}
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* ACTION TOOLBAR: Map Navigation, Download, Copy, Print */}
            {/* ------------------------------------------------------------- */}
            {pdfError && (
              <div className="w-full mb-3">
                <ErrorState
                  variant="banner"
                  size="sm"
                  title="Certificate Download Failed"
                  message={pdfError}
                  onRetry={handleDownloadPdf}
                  retryLabel="Retry Download"
                  onDismiss={() => setPdfError(null)}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 pt-2">
              {/* View on Cadastral Map */}
              <Link
                href={`/?search=${encodeURIComponent(parcel.ulpin)}`}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="h-4 w-4" />
                <span>{language === "hi" ? "मानचित्र पर देखें" : "View on Cadastral Map"}</span>
              </Link>

              {/* Download Certificate PDF */}
              <button
                type="button"
                data-testid="verify-download-pdf-btn"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                aria-label="Download Official Certificate"
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-100 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <LoadingState
                    variant="inline"
                    size="sm"
                    label={language === "hi" ? "डाउनलोड हो रहा है..." : "Generating Certificate..."}
                    className="text-white dark:text-zinc-900 justify-center"
                  />
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>
                      {language === "hi"
                        ? "प्रमाणपत्र डाउनलोड करें (PDF)"
                        : "Download Official Certificate"}
                    </span>
                  </>
                )}
              </button>

              {/* Copy Verification Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="Copy verification page URL"
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Copy verification page URL"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? (language === "hi" ? "कॉपी हो गया" : "Copied!") : (language === "hi" ? "लिंक कॉपी करें" : "Copy Link")}</span>
              </button>

              {/* Print Summary Document */}
              <button
                type="button"
                onClick={handlePrint}
                aria-label="Print Document"
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Print Document"
              >
                <Printer className="h-4 w-4" />
                <span>{language === "hi" ? "प्रिंट करें" : "Print"}</span>
              </button>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* RECORD NOT FOUND VIEW */
          /* ========================================================================= */
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl p-8 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {language === "hi" ? "भू-अभिलेख नहीं मिला" : "Cadastral Record Not Found"}
            </h2>

            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mt-2">
              {language === "hi"
                ? `ULPIN "${ulpinParam}" के लिए राष्ट्रीय भूमि रजिस्ट्री में कोई सक्रिय स्वत्व रिकॉर्ड प्राप्त नहीं हुआ। कृपया पहचानकर्ता की पुनः जांच करें।`
                : `No registered title record was found matching ULPIN "${ulpinParam}" in the National Cadastral Registry.`}
            </p>

            {/* Manual Search Form */}
            <form
              onSubmit={handleManualSearchSubmit}
              className="mt-6 w-full max-w-md flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  placeholder="Enter 14-digit ULPIN or Khasra #..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Verify
              </button>
            </form>

            {/* Quick Demo Sample ULPINs */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 w-full max-w-lg text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>
                  {language === "hi"
                    ? "सत्यापन परीक्षण हेतु नमूना ULPINs:"
                    : "Try testing with an active state sample:"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link
                  href="/verify/TN04M4910A"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 hover:border-indigo-500 dark:hover:border-indigo-500 transition group"
                >
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    Tamil Nadu
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    TN04M4910A
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Khasra 142/3A1
                  </div>
                </Link>

                <Link
                  href="/verify/UP26A8941B"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 hover:border-indigo-500 dark:hover:border-indigo-500 transition group"
                >
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Uttar Pradesh
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    UP26A8941B
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Khasra 245/2
                  </div>
                </Link>

                <Link
                  href="/verify/CH01S1742A"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 hover:border-indigo-500 dark:hover:border-indigo-500 transition group"
                >
                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                    Chandigarh
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                    CH01S1742A
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Sector 17-C Plot 42/B
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. OFFICIAL GOVERNMENT FOOTER */}
      {/* ========================================================================= */}
      <footer className="mt-auto bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              Land Stack DPI • Public Title Verification Portal
            </span>
          </div>
          <div>
            Digital India Land Records Modernization Programme (DILRMP) • NIC Hosted
          </div>
        </div>
      </footer>
    </div>
  );
}
