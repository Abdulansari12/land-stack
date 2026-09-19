"use client";

import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  X,
  FileText,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Droplets,
  Building,
  Scale,
  Calendar,
  ExternalLink,
  MousePointerClick,
  ChevronDown,
  Code,
  History,
  Lock,
  Download,
  Eye,
  FileCheck,
  Loader2,
  Clock,
} from "lucide-react";
import type { LandParcelProperties, TitleRecord } from "@/data/parcels";
import { detectConflicts } from "@/lib/conflicts";
import { useLanguage } from "@/context/LanguageContext";
import AuditTrailTab from "@/components/AuditTrailTab";
import TimeMachineSlider from "@/components/TimeMachineSlider";
import { generateOwnershipCertificatePdf } from "@/lib/certificateGenerator";
import toast from "react-hot-toast";

// Code-split heavy certificate preview modal (loads only on demand)
const OwnershipCertificateModal = dynamic(
  () => import("@/components/OwnershipCertificateModal"),
  { ssr: false }
);

import { useAppStore } from "@/lib/store";
import { LoadingState, ErrorState } from "@/components/ui";

interface ParcelDrawerProps {
  parcel?: LandParcelProperties | null;
  isOpen?: boolean;
  onClose?: () => void;
  role?: "citizen" | "officer";
  onFlagEncroachment?: () => void;
  approvedConsentUlpins?: string[];
  onApproveConsent?: (ulpin: string) => void;
}

type TabType = "essential" | "spatial" | "usecase" | "audit";

function ParcelDrawerBase({
  parcel: propParcel,
  isOpen: propIsOpen,
  onClose: propOnClose,
  role: propRole,
  onFlagEncroachment,
  approvedConsentUlpins: propApprovedConsentUlpins,
  onApproveConsent: propOnApproveConsent,
}: ParcelDrawerProps) {
  const { t } = useLanguage();

  const storeParcel = useAppStore((s) => s.selectedParcel);
  const storeIsOpen = useAppStore((s) => s.isDrawerOpen);
  const storeCloseDrawer = useAppStore((s) => s.closeDrawer);
  const storeRole = useAppStore((s) => s.userRole);
  const storeApprovedUlpins = useAppStore((s) => s.approvedConsentUlpins);
  const storeApproveConsent = useAppStore((s) => s.approveConsent);

  const parcel = propParcel !== undefined ? propParcel : storeParcel;
  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const onClose = propOnClose ?? storeCloseDrawer;
  const role = propRole ?? storeRole ?? "citizen";
  const approvedConsentUlpins = propApprovedConsentUlpins ?? storeApprovedUlpins ?? [];
  const onApproveConsent = propOnApproveConsent ?? storeApproveConsent;

  const [activeTab, setActiveTab] = useState<TabType>("essential");
  const [copied, setCopied] = useState(false);
  const [isRawJsonExpanded, setIsRawJsonExpanded] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [localApprovedUlpins, setLocalApprovedUlpins] = useState<string[]>([]);
  const [isRequestingConsent, setIsRequestingConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [mutationStatus, setMutationStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [mutationRef, setMutationRef] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const drawerRef = useRef<HTMLElement>(null);
  const emptyDrawerRef = useRef<HTMLElement>(null);

  // Accessible focus trap for the parcel drawer
  useFocusTrap({
    isOpen: isOpen && !parcel,
    containerRef: emptyDrawerRef,
    onClose,
  });

  useFocusTrap({
    isOpen: isOpen && Boolean(parcel),
    containerRef: drawerRef,
    onClose,
  });

  // Listen to global Reset Demo event to restore initial tab and reset local consent state
  useEffect(() => {
    function handleDemoReset() {
      setLocalApprovedUlpins([]);
      setActiveTab("essential");
      setIsRawJsonExpanded(false);
      setIsCertificateModalOpen(false);
      setIsDownloadingPdf(false);
      setPdfError(null);
      setIsRequestingConsent(false);
      setConsentError(null);
      setMutationStatus("idle");
      setMutationRef(null);
      setMutationError(null);
    }
    window.addEventListener("landstack:reset-demo", handleDemoReset);
    return () => window.removeEventListener("landstack:reset-demo", handleDemoReset);
  }, []);

  if (!parcel) {
    if (!isOpen) return null;
    return (
      <>
        <div
          className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300 opacity-100 pointer-events-auto"
          onClick={onClose}
        />
        <aside
          ref={emptyDrawerRef}
          data-testid="parcel-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t("parcelDetails") || "Parcel Details Drawer"}
          className="fixed bottom-0 md:bottom-auto md:top-0 left-0 md:left-auto right-0 h-[70vh] md:h-full w-full md:w-[400px] max-w-full bg-white dark:bg-zinc-900 shadow-2xl z-50 rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out transform translate-y-0 md:translate-x-0"
        >
          {/* Mobile Bottom Sheet Handle Pill */}
          <div className="w-full pt-3 pb-1 flex justify-center md:hidden shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
          </div>

          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-900/90 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t("parcelDetails")}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close parcel details drawer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <MousePointerClick className="h-8 w-8 animate-bounce" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">
              {t("noParcelSelected")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-[240px]">
              {t("clickParcelPrompt")}
            </p>
          </div>
        </aside>
      </>
    );
  }

  const handleCopyUlpin = () => {
    if (parcel.ulpin) {
      navigator.clipboard.writeText(parcel.ulpin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Memoize cross-department landUse vs buildingPermission contradiction check
  const conflictMessage = useMemo(() => {
    return parcel ? detectConflicts(parcel) : null;
  }, [parcel]);

  // Citizen Privacy & DPDP Act: Check if owner consent is required and approved for Officer
  const isConsentApproved =
    Boolean(parcel.ulpin) &&
    (approvedConsentUlpins.includes(parcel.ulpin) || localApprovedUlpins.includes(parcel.ulpin));

  const isLocked =
    role?.toLowerCase() === "officer" &&
    Boolean(parcel.ownerConsentRequired) &&
    !isConsentApproved;

  const handleRequestAccess = () => {
    if (!parcel.ulpin || isRequestingConsent) return;
    setIsRequestingConsent(true);
    setConsentError(null);
    setTimeout(() => {
      try {
        setIsRequestingConsent(false);
        setLocalApprovedUlpins((prev) =>
          prev.includes(parcel.ulpin) ? prev : [...prev, parcel.ulpin]
        );
        if (onApproveConsent) {
          onApproveConsent(parcel.ulpin);
        }
        toast.success(t("accessApproved"), {
          duration: 4000,
          icon: "🔓",
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #10b981",
            borderRadius: "12px",
          },
        });
      } catch (err: any) {
        setIsRequestingConsent(false);
        setConsentError(err?.message || "Failed to establish DPDP Act consent handshake.");
      }
    }, 1200);
  };

  const handleDownloadCertificate = async () => {
    if (!parcel || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setPdfError(null);
    const toastId = toast.loading(t("generatingCertificate") || "Generating Official Ownership Certificate PDF...");
    try {
      await generateOwnershipCertificatePdf(parcel);
      toast.success(t("certificateDownloaded") || "Ownership Certificate downloaded!", {
        id: toastId,
      });
    } catch (err: any) {
      console.error("Failed to generate certificate:", err);
      const errMsg = err?.message || "Failed to generate PDF. Please try again.";
      setPdfError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleInitiateMutation = () => {
    if (!parcel || isLocked || mutationStatus === "submitting") return;
    setMutationStatus("submitting");
    setMutationError(null);

    setTimeout(() => {
      try {
        const docketNum = `MUT-2026-${parcel.khasraNo.replace(/[^a-zA-Z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
        setMutationRef(docketNum);
        setMutationStatus("success");

        toast.success(
          (toastInstance) => (
            <div className="flex flex-col gap-1 pr-1">
              <div className="flex items-center justify-between gap-4 font-semibold text-slate-100">
                <span>{t("mutationInitiated")}</span>
                <button
                  onClick={() => toast.dismiss(toastInstance.id)}
                  className="text-slate-400 hover:text-slate-200 text-xs px-1"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-slate-300">
                Docket #{docketNum} • Khasra #{parcel.khasraNo}
              </div>
              <div className="text-[11px] text-blue-400">
                {t("mutationHearingNote")}
              </div>
            </div>
          ),
          {
            id: `mutation-${parcel.ulpin}`,
            duration: 5000,
            icon: "📋",
            style: {
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #3b82f6",
              borderRadius: "12px",
            },
          }
        );
      } catch (err: any) {
        setMutationStatus("error");
        setMutationError("Failed to register mutation application on State Land Records Portal.");
      }
    }, 1000);
  };

  // Memoize status booleans
  const isDisputed = useMemo(() => {
    return (
      parcel.clearOrDisputed?.toLowerCase() === "disputed" ||
      parcel.rorStatus?.toLowerCase() === "disputed"
    );
  }, [parcel.clearOrDisputed, parcel.rorStatus]);

  const isClear = useMemo(() => {
    return (
      parcel.clearOrDisputed?.toLowerCase() === "clear" ||
      parcel.rorStatus?.toLowerCase() === "verified" ||
      parcel.rorStatus?.toLowerCase() === "digitally signed"
    );
  }, [parcel.clearOrDisputed, parcel.rorStatus]);

  // Memoize area and valuation conversions
  const areaInAcres = useMemo(() => {
    return (parcel.areaInHectares * 2.47105).toFixed(2);
  }, [parcel.areaInHectares]);

  const areaInSqMeters = useMemo(() => {
    return (parcel.areaInHectares * 10000).toLocaleString("en-IN");
  }, [parcel.areaInHectares]);

  const formattedValuation = useMemo(() => {
    return parcel.marketValueInINR
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(parcel.marketValueInINR)
      : "₹45,00,000 (Est.)";
  }, [parcel.marketValueInINR]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 400px Wide Right-Side Drawer (>=768px md:) / 70% Height Bottom Sheet (<768px) */}
      <aside
        ref={drawerRef}
        data-testid="parcel-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${t("parcelDetails") || "Parcel Details Drawer"}: Khasra ${parcel.khasraNo}`}
        className={`fixed bottom-0 md:bottom-auto md:top-0 left-0 md:left-auto right-0 h-[70vh] md:h-full w-full md:w-[400px] max-w-full bg-white dark:bg-zinc-900 shadow-2xl z-50 rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen
            ? "translate-y-0 md:translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
        }`}
      >
        {/* Mobile Bottom Sheet Handle Pill */}
        <div className="w-full pt-3 pb-1 flex justify-center md:hidden shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
        </div>

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-900/90 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary dark:text-brand-primary-light bg-brand-primary-light dark:bg-brand-primary-dark/60 px-2 py-0.5 rounded">
                {t("parcelDetails")}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  isClear
                    ? "bg-status-verified-bg text-status-verified-text border-status-verified-border"
                    : isDisputed
                    ? "bg-status-disputed-bg text-status-disputed-text border-status-disputed-border"
                    : "bg-status-pending-bg text-status-pending-text border-status-pending-border"
                }`}
              >
                {isClear ? (
                  <CheckCircle2 className="h-3 w-3 text-status-verified" />
                ) : isDisputed ? (
                  <AlertTriangle className="h-3 w-3 text-status-disputed" />
                ) : (
                  <Scale className="h-3 w-3 text-status-pending" />
                )}
                <span>{parcel.clearOrDisputed}</span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {t("khasra")} {parcel.khasraNo}
            </h2>

            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono">
              <span>{t("ulpin")}: {parcel.ulpin}</span>
              <button
                onClick={handleCopyUlpin}
                className="hover:text-brand-primary p-0.5 rounded transition"
                title={t("copyUlpin") || "Copy ULPIN to clipboard"}
                aria-label={t("copyUlpin") || "Copy ULPIN to clipboard"}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-status-verified" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* 'X' Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition"
            aria-label="Close parcel details drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prominent Red/Amber Warning Banner: Conflict Detected (Above Tabs, visible on all tabs) */}
        {conflictMessage && (
          <div
            role="alert"
            data-testid="conflict-warning-banner"
            className="p-3.5 px-4 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/70 dark:to-amber-950/70 border-b-2 border-red-500/90 dark:border-red-500 flex items-start gap-3 shadow-xs animate-in fade-in duration-200 shrink-0"
          >
            <div className="p-1 rounded-md bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-red-900 dark:text-amber-200 leading-snug">
                {conflictMessage}
              </div>
              <div className="text-[10px] font-medium text-red-700/80 dark:text-amber-300/80 mt-0.5">
                Cross-Department Contradiction: Land Use ({parcel.landUse}) vs Building Approval ({parcel.buildingPermission})
              </div>
            </div>
          </div>
        )}

        {/* 4 Tabs Navigation */}
        <div
          data-tour="drawer-tabs"
          role="tablist"
          aria-label="Parcel Details Sections"
          className="flex border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-5 bg-white dark:bg-zinc-900 shrink-0 overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "essential"}
            id="tab-essential"
            aria-controls="panel-essential"
            tabIndex={activeTab === "essential" ? 0 : -1}
            onClick={() => setActiveTab("essential")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer mr-4 ${
              activeTab === "essential"
                ? "border-brand-primary text-brand-primary dark:border-brand-primary-light dark:text-brand-primary-light"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t("tabEssential")}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "spatial"}
            id="tab-spatial"
            aria-controls="panel-spatial"
            tabIndex={activeTab === "spatial" ? 0 : -1}
            onClick={() => setActiveTab("spatial")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer mr-4 ${
              activeTab === "spatial"
                ? "border-brand-primary text-brand-primary dark:border-brand-primary-light dark:text-brand-primary-light"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t("tabSpatial")}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "usecase"}
            id="tab-usecase"
            aria-controls="panel-usecase"
            tabIndex={activeTab === "usecase" ? 0 : -1}
            onClick={() => setActiveTab("usecase")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer mr-4 whitespace-nowrap ${
              activeTab === "usecase"
                ? "border-brand-primary text-brand-primary dark:border-brand-primary-light dark:text-brand-primary-light"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{t("tabUsecase")}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "audit"}
            id="tab-audit"
            aria-controls="panel-audit"
            tabIndex={activeTab === "audit" ? 0 : -1}
            data-testid="tab-audit-trail"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "audit"
                ? "border-brand-primary text-brand-primary dark:border-brand-primary-light dark:text-brand-primary-light"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t("tabAuditTrail") || "Audit Trail"}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Essential (RoR) */}
          {activeTab === "essential" && (
            <div
              role="tabpanel"
              id="panel-essential"
              aria-labelledby="tab-essential"
              className="space-y-4 animate-in fade-in-50 duration-200"
            >
              {isLocked ? (
                <div
                  data-testid="owner-consent-locked-state"
                  className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-4 my-2 shadow-xs"
                >
                  <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                    <Lock className="h-7 w-7" />
                  </div>

                  <div className="space-y-1.5 max-w-[280px]">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {t("ownerConsentRestricted")}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {t("ownerConsentRequiredText")}
                    </p>
                  </div>

                  {consentError && (
                    <div className="w-full">
                      <ErrorState
                        variant="banner"
                        size="sm"
                        title="Consent Request Failed"
                        message={consentError}
                        onRetry={handleRequestAccess}
                        retryLabel="Retry"
                        onDismiss={() => setConsentError(null)}
                      />
                    </div>
                  )}

                  <div className="w-full pt-2">
                    <button
                      type="button"
                      data-testid="request-consent-access-btn"
                      disabled={isRequestingConsent}
                      onClick={handleRequestAccess}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-active disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRequestingConsent ? (
                        <LoadingState
                          variant="inline"
                          size="sm"
                          label={t("sendingConsentRequest")}
                          className="text-white justify-center"
                        />
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>{t("requestAccess")}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                    <span>{t("dpdpCompliant")}</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Citizen Service Delivery: Official Ownership Certificate Card */}
                  <div
                    data-testid="ownership-certificate-card"
                    className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-blue-950/30 border-2 border-indigo-200/90 dark:border-indigo-800/70 shadow-xs relative overflow-hidden"
                  >
                    {/* Background subtle watermark icon */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 dark:opacity-10 pointer-events-none">
                      <FileCheck className="w-24 h-24 text-indigo-900 dark:text-indigo-400" />
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-brand-primary text-white flex items-center justify-center shadow-xs shrink-0">
                          <FileCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                            Citizen Service Delivery
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                            Ownership Certificate (RoR)
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-status-verified-bg text-status-verified-text border border-status-verified-border shrink-0 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-status-verified animate-pulse" />
                        QR-Verified
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed">
                      Download authenticated Government RoR certificate with encrypted ULPIN QR code, cadastral adjudication, and legal digital signature.
                    </p>

                    {pdfError && (
                      <div className="mb-3">
                        <ErrorState
                          variant="banner"
                          size="sm"
                          title="Certificate Generation Error"
                          message={pdfError}
                          onRetry={handleDownloadCertificate}
                          retryLabel="Retry Download"
                          onDismiss={() => setPdfError(null)}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Primary Download Button */}
                      <button
                        type="button"
                        data-testid="download-certificate-btn"
                        onClick={handleDownloadCertificate}
                        disabled={isDownloadingPdf}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-active disabled:opacity-60 text-white text-xs font-bold transition-all shadow-sm shadow-brand-primary/20 dark:shadow-none cursor-pointer disabled:cursor-not-allowed"
                        title="Download official PDF ownership certificate"
                      >
                        {isDownloadingPdf ? (
                          <LoadingState
                            variant="inline"
                            size="sm"
                            label={t("generatingCertificate") || "Generating PDF..."}
                            className="text-white justify-center"
                          />
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>{t("downloadCertificate") || "Download Certificate"}</span>
                          </>
                        )}
                      </button>

                      {/* Secondary Preview Button */}
                      <button
                        type="button"
                        data-testid="preview-certificate-btn"
                        onClick={() => setIsCertificateModalOpen(true)}
                        className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-700 transition cursor-pointer shrink-0"
                        title="Preview certificate before downloading"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                        <span className="hidden sm:inline">{t("previewCertificate") || "Preview"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Owner Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        {t("registeredOwner")}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                        {t("fictionalIdBadge") || "Fictional Demo ID"}
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {parcel.ownerName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{t("aadhaarVerified")}</span>
                    </div>
                    {/* Fictional Citizen Identifier (DPDP-safe format) */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        {t("citizenIdLabel") || "Citizen Ref (Demo):"}
                      </span>
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200">
                        DEMO-CITIZEN-{(parcel.khasraNo || "0412").replace(/[^0-9]/g, "").padStart(4, "0")}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-tight">
                      {t("dpdpPrivacyNotice")}
                    </p>
                  </div>

              {/* Chain of Title: Ownership History Timeline (Git commit history style) */}
              {(() => {
                const chainRecords =
                  parcel.chainOfTitle && parcel.chainOfTitle.length > 0
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
                      ];

                return (
                  <div
                    data-testid="chain-of-title-timeline"
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t("chainOfTitle")}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                        {chainRecords.length} {t("recordsCount")}
                      </span>
                    </div>

                    {/* Vertical Timeline UI (dots connected by line) */}
                    <div className="relative pl-4 space-y-3.5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700">
                      {chainRecords.map((record, index) => {
                        const tx = (record.transactionType || "").toLowerCase();
                        const isSale = tx.includes("sale");
                        const isInheritance = tx.includes("inheritance");
                        const isMutation = tx.includes("mutation");

                        const dotColor = isSale
                          ? "bg-blue-500 ring-blue-100 dark:ring-blue-950"
                          : isInheritance
                          ? "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950"
                          : isMutation
                          ? "bg-amber-500 ring-amber-100 dark:ring-amber-950"
                          : "bg-indigo-500 ring-indigo-100 dark:ring-indigo-950";

                        const badgeStyle = isSale
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                          : isInheritance
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : isMutation
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900";

                        return (
                          <div key={index} className="relative group">
                            {/* Dot on the vertical timeline track */}
                            <div
                              className={`absolute -left-[15px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900 shrink-0 shadow-xs ${dotColor}`}
                            />

                            {/* Record details */}
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                                  {record.date}
                                </span>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${badgeStyle}`}
                                >
                                  {record.transactionType}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                                {record.ownerName}
                              </div>

                              {record.documentRef && (
                                <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                                  Ref: {record.documentRef}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Title / Legal Status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                  {t("titleStatus")}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                    {t("cadastralAdjudication")}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                      isClear
                        ? "bg-status-verified-bg text-status-verified-text border-status-verified-border"
                        : isDisputed
                        ? "bg-status-disputed-bg text-status-disputed-text border-status-disputed-border"
                        : "bg-status-pending-bg text-status-pending-text border-status-pending-border"
                    }`}
                  >
                    {isClear ? (
                      <CheckCircle2 className="h-3 w-3 text-status-verified" />
                    ) : isDisputed ? (
                      <AlertTriangle className="h-3 w-3 text-status-disputed" />
                    ) : (
                      <Scale className="h-3 w-3 text-status-pending" />
                    )}
                    <span>{parcel.clearOrDisputed.toUpperCase()}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-zinc-700 text-xs">
                  <span className="text-slate-500 dark:text-zinc-400">{t("rorRegistryState")}</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {parcel.rorStatus}
                  </span>
                </div>
              </div>

              {/* Encumbrances */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t("encumbranceCertificate")}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                      parcel.encumbrances.toLowerCase().startsWith("nil") ||
                      parcel.encumbrances.toLowerCase().startsWith("none")
                        ? "bg-status-verified-bg text-status-verified-text border-status-verified-border"
                        : "bg-status-pending-bg text-status-pending-text border-status-pending-border"
                    }`}
                  >
                    {parcel.encumbrances.toLowerCase().startsWith("nil") ||
                    parcel.encumbrances.toLowerCase().startsWith("none") ? (
                      <CheckCircle2 className="h-2.5 w-2.5 text-status-verified" />
                    ) : (
                      <AlertTriangle className="h-2.5 w-2.5 text-status-pending" />
                    )}
                    <span>
                      {parcel.encumbrances.toLowerCase().startsWith("nil") ||
                      parcel.encumbrances.toLowerCase().startsWith("none")
                        ? t("encumbranceFree")
                        : t("encumbranceLien")}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {parcel.encumbrances}
                </p>
              </div>

              {/* Land Classification */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                    {t("zoningLandUse")}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {parcel.landUse}
                  </span>
                </div>
                <Building className="h-5 w-5 text-slate-400" />
              </div>

              {/* Municipal Building Permission Record */}
              {parcel.buildingPermission && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  conflictMessage
                    ? "bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60"
                    : "bg-slate-50 dark:bg-zinc-800/60 border-slate-100 dark:border-zinc-800"
                }`}>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                      {t("buildingPermission")}
                    </span>
                    <span className={`text-sm font-bold ${
                      conflictMessage ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-zinc-100"
                    }`}>
                      {parcel.buildingPermission}
                    </span>
                  </div>
                  <FileText className={`h-5 w-5 ${conflictMessage ? "text-red-500" : "text-slate-400"}`} />
                </div>
              )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: Base Spatial */}
          {activeTab === "spatial" && (
            <div
              role="tabpanel"
              id="panel-spatial"
              aria-labelledby="tab-spatial"
              className="space-y-4 animate-in fade-in-50 duration-200"
            >
              {/* Cadastral Time Machine Satellite Land-Use Evolution (2015 - 2025) */}
              <TimeMachineSlider parcel={parcel} />

              {/* ULPIN Spatial Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  {t("ulpinFull")}
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {parcel.ulpin}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUlpin}
                    aria-label={t("copyUlpin") || "Copy ULPIN to clipboard"}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span>{t("copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{t("copy")}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2">
                  {t("bndStandardNote")}
                </p>
              </div>

              {/* Khasra Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                  {t("khasraPlot")}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  #{parcel.khasraNo}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Tehsil: Lucknow Sadar • District: Lucknow (UP)
                </div>
              </div>

              {/* Parcel Area Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                  {t("registeredExtent")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <div className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                      {parcel.areaInHectares}
                    </div>
                    <div className="text-[11px] text-slate-500">{t("hectares")}</div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <div className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                      {areaInAcres}
                    </div>
                    <div className="text-[11px] text-slate-500">{t("acres")}</div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
                  Approx. <strong>{areaInSqMeters} m²</strong> {t("cadastralFootprint")}.
                </div>
              </div>

              {/* Estimated Valuation */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                  {t("circleRateValuation")}
                </span>
                <div className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mt-0.5">
                  {formattedValuation}
                </div>
              </div>

              {/* Collapsible: View Raw Source Format (Cross-State Schema Adapter) */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 overflow-hidden transition-all shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsRawJsonExpanded(!isRawJsonExpanded)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-expanded={isRawJsonExpanded}
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {isRawJsonExpanded ? t("hideRawSource") : t("viewRawSource")}
                    </span>
                    {parcel.sourceState && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {parcel.sourceState}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[11px] font-medium hidden sm:inline">
                      {isRawJsonExpanded ? "Hide" : "Inspect"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isRawJsonExpanded ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                      }`}
                    />
                  </div>
                </button>

                {isRawJsonExpanded && (
                  <div className="p-3.5 pt-0 border-t border-slate-200/80 dark:border-zinc-700/80 space-y-2.5">
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2.5 flex items-center justify-between">
                      <span>{t("rawPayloadLabel")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const payload = parcel.rawSourceData || {
                            ulpin: parcel.ulpin,
                            khasraNo: parcel.khasraNo,
                            ownerName: parcel.ownerName,
                            landUse: parcel.landUse,
                            rorStatus: parcel.rorStatus,
                            taxStatus: parcel.taxStatus,
                          };
                          navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                          setJsonCopied(true);
                          setTimeout(() => setJsonCopied(false), 2000);
                        }}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {jsonCopied ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span>{t("copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{t("copyJson")}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-56 select-text shadow-inner">
                      <code>
                        {JSON.stringify(
                          parcel.rawSourceData || {
                            ulpin: parcel.ulpin,
                            khasraNo: parcel.khasraNo,
                            ownerName: parcel.ownerName,
                            landUse: parcel.landUse,
                            rorStatus: parcel.rorStatus,
                            taxStatus: parcel.taxStatus,
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>

                    <div className="text-[10px] text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700/80">
                      <strong className="text-slate-800 dark:text-zinc-200">Interoperability Transform:</strong> State-specific fields were dynamically mapped into canonical <code className="text-indigo-600 dark:text-indigo-400">ULPIN</code>, <code className="text-indigo-600 dark:text-indigo-400">khasraNo</code>, and <code className="text-indigo-600 dark:text-indigo-400">rorStatus</code> via <code className="text-indigo-600 dark:text-indigo-400 font-medium">schemaAdapter.ts</code>.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Use-Case */}
          {activeTab === "usecase" && (
            <div
              role="tabpanel"
              id="panel-usecase"
              aria-labelledby="tab-usecase"
              className="space-y-4 animate-in fade-in-50 duration-200"
            >
              {/* Property Tax Status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                  {t("propertyTaxAssessment")}
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-3 w-3 rounded-full ${
                        parcel.taxStatus === "Paid"
                          ? "bg-status-verified"
                          : parcel.taxStatus === "Pending"
                          ? "bg-status-pending"
                          : parcel.taxStatus === "Exempted"
                          ? "bg-status-info"
                          : "bg-status-disputed"
                      }`}
                    />
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {parcel.taxStatus}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                      parcel.taxStatus === "Paid"
                        ? "bg-status-verified-bg text-status-verified-text border-status-verified-border"
                        : parcel.taxStatus === "Pending"
                        ? "bg-status-pending-bg text-status-pending-text border-status-pending-border"
                        : parcel.taxStatus === "Exempted"
                        ? "bg-status-info-bg text-status-info-text border-status-info-border"
                        : "bg-status-disputed-bg text-status-disputed-text border-status-disputed-border"
                    }`}
                  >
                    {parcel.taxStatus === "Paid" ? (
                      <CheckCircle2 className="h-3 w-3 text-status-verified" />
                    ) : parcel.taxStatus === "Pending" ? (
                      <Clock className="h-3 w-3 text-status-pending" />
                    ) : (
                      <Scale className="h-3 w-3 text-status-info" />
                    )}
                    <span>FY 2025-26</span>
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>{t("lastAssessmentReceipt")}</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    TXN-{parcel.khasraNo.replace(/[^a-zA-Z0-9]/g, "")}-2025
                  </span>
                </div>
              </div>

              {/* Utility Lines */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                  {t("connectedUtilities")}
                </span>
                {parcel.utilityLines && parcel.utilityLines.length > 0 ? (
                  <div className="space-y-2">
                    {parcel.utilityLines.map((utility, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <span className="text-slate-700 dark:text-zinc-300 font-medium">
                          {utility}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                    {t("noUtilityMapped")}
                  </p>
                )}
              </div>

              {/* Citizen / Officer Action Box */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                <div className="font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                  {t("publicUtilityOverlay")}
                </div>
                <p>
                  {t("overlayDescription")}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Audit Trail (Blockchain Ledger) */}
          {activeTab === "audit" && (
            <div
              role="tabpanel"
              id="panel-audit"
              aria-labelledby="tab-audit"
              className="space-y-4 animate-in fade-in-50 duration-200"
            >
              <AuditTrailTab parcel={parcel} />
            </div>
          )}
        </div>

        {/* Drawer Footer Actions - Only shown when in Officer role */}
        {role?.toLowerCase() === "officer" && (
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 space-y-3">
            {mutationError && (
              <ErrorState
                variant="banner"
                size="sm"
                title="Mutation Filing Error"
                message={mutationError}
                onRetry={handleInitiateMutation}
                retryLabel="Retry"
                onDismiss={() => setMutationError(null)}
              />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                data-testid="initiate-mutation-btn"
                onClick={handleInitiateMutation}
                disabled={isLocked || mutationStatus === "submitting"}
                title={isLocked ? "Owner consent required before initiating title mutation" : undefined}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold shadow-sm transition-colors text-center flex items-center justify-center gap-1.5 ${
                  isLocked
                    ? "bg-slate-300 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 cursor-not-allowed"
                    : mutationStatus === "success"
                    ? "bg-status-verified hover:bg-status-verified-hover text-white cursor-pointer"
                    : "bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-active text-white cursor-pointer"
                }`}
              >
                {mutationStatus === "submitting" ? (
                  <LoadingState
                    variant="inline"
                    size="sm"
                    label="Filing Mutation..."
                    className="text-white justify-center"
                  />
                ) : mutationStatus === "success" ? (
                  <span className="truncate">✔ Filed: {mutationRef}</span>
                ) : (
                  <span>{t("initiateMutation")}</span>
                )}
              </button>
              <button
                type="button"
                data-tour="ai-encroachment"
                onClick={() => {
                  if (onFlagEncroachment) {
                    toast.loading("Initiating satellite scan...", {
                      id: "encroachment-scan",
                      duration: 1800,
                    });
                    onFlagEncroachment();
                  } else {
                    toast.error(
                      `Encroachment flagged for Khasra #${parcel.khasraNo}`,
                      { duration: 4000 }
                    );
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer text-center"
              >
                {t("flagEncroachment")}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Ownership Certificate Preview Modal (Dynamically Imported) */}
      <OwnershipCertificateModal
        parcel={parcel}
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />
    </>
  );
}

export const ParcelDrawer = memo(ParcelDrawerBase);
export default ParcelDrawer;
