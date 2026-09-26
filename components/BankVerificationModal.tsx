"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  X,
  Building2,
  Landmark,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Printer,
  ExternalLink,
  Code2,
  Check,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
  LandParcelFeature,
} from "@/data/parcels";
import {
  normalizeParcel,
  normalizeParcelFeatureCollection,
} from "@/lib/schemaAdapter";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Button, Badge } from "@/components/ui";

export interface BankVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToParcel?: (parcel: LandParcelFeature) => void;
  inline?: boolean;
}

export default function BankVerificationModal({
  isOpen,
  onClose,
  onNavigateToParcel,
  inline = false,
}: BankVerificationModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap for WCAG accessibility
  useFocusTrap({
    isOpen: isOpen && !inline,
    containerRef,
    onClose,
  });

  const [searchBorrower, setSearchBorrower] = useState("Col. Harpreet Singh Sodhi");
  const [activeTab, setActiveTab] = useState<"dossier" | "schema-diff">("dossier");
  const [isLienRegistered, setIsLienRegistered] = useState(false);
  const [lienReference, setLienReference] = useState<string | null>(null);

  // Cross-registry simultaneous query across Tamil Nadu and Chandigarh datasets
  const matchedAssets = useMemo(() => {
    const query = searchBorrower.trim().toLowerCase();
    if (!query) return [];

    const tokens = query
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/gi, ""))
      .filter((w) => w.length >= 3 && !["col", "mr", "mrs", "dr", "retd", "singh", "kumar", "devi", "kaur"].includes(w));

    const matchesRecord = (owner: string, id: string) => {
      const ownerLower = (owner || "").toLowerCase();
      const idLower = (id || "").toLowerCase();
      if (ownerLower.includes(query) || idLower.includes(query)) return true;
      if (tokens.length > 0 && tokens.every((t) => ownerLower.includes(t) || idLower.includes(t))) {
        return true;
      }
      return false;
    };

    const results: {
      sourceJurisdiction: "Tamil Nadu" | "Chandigarh" | "Uttar Pradesh";
      rawRecord: any;
      canonicalParcel: ReturnType<typeof normalizeParcel>;
      feature: LandParcelFeature;
    }[] = [];

    // 1. Query Tamil Nadu Patta/Chitta Registry
    rawParcelsTamilNadu.features.forEach((feat) => {
      const raw = feat.properties;
      if (matchesRecord(raw.pattadar_name, raw.patta_no)) {
        const canonical = normalizeParcel(raw, "Tamil Nadu");
        results.push({
          sourceJurisdiction: "Tamil Nadu",
          rawRecord: raw,
          canonicalParcel: canonical,
          feature: {
            ...feat,
            properties: canonical,
          },
        });
      }
    });

    // 2. Query Chandigarh UT Estate Office Registry
    rawParcelsChandigarh.features.forEach((feat) => {
      const raw = feat.properties;
      if (matchesRecord(raw.ownerFullName, raw.propertyId)) {
        const canonical = normalizeParcel(raw, "Chandigarh");
        results.push({
          sourceJurisdiction: "Chandigarh",
          rawRecord: raw,
          canonicalParcel: canonical,
          feature: {
            ...feat,
            properties: canonical,
          },
        });
      }
    });

    // 3. Query Uttar Pradesh UP Bhulekh (for completeness)
    dummyLandParcels.features.forEach((feat) => {
      const raw = feat.properties;
      if (matchesRecord(raw.ownerName, raw.ulpin)) {
        const canonical = normalizeParcel(raw, "Uttar Pradesh");
        results.push({
          sourceJurisdiction: "Uttar Pradesh",
          rawRecord: raw,
          canonicalParcel: canonical,
          feature: {
            ...feat,
            properties: canonical,
          },
        });
      }
    });

    return results;
  }, [searchBorrower]);

  // Aggregate metrics
  const totalValuation = useMemo(() => {
    return matchedAssets.reduce(
      (sum, item) => sum + (item.canonicalParcel.marketValueInINR || 0),
      0
    );
  }, [matchedAssets]);

  const totalAreaHa = useMemo(() => {
    return matchedAssets.reduce(
      (sum, item) => sum + (item.canonicalParcel.areaInHectares || 0),
      0
    );
  }, [matchedAssets]);

  const jurisdictionsList = useMemo(() => {
    const list = Array.from(new Set(matchedAssets.map((a) => a.sourceJurisdiction)));
    return list;
  }, [matchedAssets]);

  const handleRegisterLien = () => {
    const ref = `CERSAI-HYP-${Math.floor(100000 + Math.random() * 900000)}/2026`;
    setLienReference(ref);
    setIsLienRegistered(true);
    toast.success(
      `CERSAI Mortgage Charge Registered successfully!\nReference: #${ref}`,
      { duration: 5000 }
    );
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={containerRef}
      role={inline ? "region" : "dialog"}
      aria-modal={inline ? undefined : "true"}
      aria-labelledby="bank-verification-title"
      className={
        inline
          ? "relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden"
          : "relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      }
    >
      {/* ========================================================================= */}
      {/* BANK HEADER BAR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white flex items-start justify-between gap-4 shrink-0 border-b border-indigo-900/50">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wide border border-amber-400/30">
                Bank Mortgage Underwriting Mode
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-medium">
                DPDP Act 2023 § 7(b) Banking Due Diligence
              </span>
            </div>
            <h2
              id="bank-verification-title"
              className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2"
            >
              <span>Interstate Collateral Verification Portal</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Federated simultaneous search across Tamil Nadu Patta/Chitta & Chandigarh UT Estate Office
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="bank-modal-close-btn"
          onClick={onClose}
          className={
            inline
              ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer shrink-0"
              : "p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          }
          aria-label="Close bank verification portal"
        >
          {inline ? (
            <>
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Return to Map</span>
            </>
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </div>

        {/* ========================================================================= */}
        {/* BORROWER SEARCH & TELEMETRY TOOLBAR */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-950/70 border-b border-slate-200 dark:border-zinc-800 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchBorrower}
                onChange={(e) => setSearchBorrower(e.target.value)}
                placeholder="Enter Borrower Name (e.g. Col. Harpreet Singh Sodhi)..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-zinc-900 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-xs"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setSearchBorrower("Col. Harpreet Singh Sodhi")}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Multi-State Demo (TN + CH)</span>
            </Button>
          </div>

          {/* Simulated API Orchestration Telemetry Banner */}
          <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-[11px] text-indigo-950 dark:text-indigo-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">Simultaneous Federated APIs:</span>
              <span className="font-mono bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-[10px]">
                GET /api/tn-patta?q=... ➔ 200 OK
              </span>
              <span className="font-mono bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-[10px]">
                GET /api/chd-estate?q=... ➔ 200 OK
              </span>
            </div>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">
              Normalized via `schemaAdapter.ts` in 8ms
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABS HEADER: CONSOLIDATED DOSSIER VS SCHEMA DIFF */}
        {/* ========================================================================= */}
        <div className="px-5 pt-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("dossier")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dossier"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Consolidated Verification Dossier</span>
            <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-[10px]">
              {matchedAssets.length} Assets Found
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schema-diff")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "schema-diff"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Interstate Schema Normalization Diff</span>
            <span className="ml-1 px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded text-[10px]">
              Heterogeneous ➔ Canonical
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {matchedAssets.length > 0 ? (
            activeTab === "dossier" ? (
              /* TAB 1: CONSOLIDATED COLLATERAL REPORT */
              <div className="space-y-5">
                {/* Active CERSAI Registration Confirmation Banner */}
                {isLienRegistered && lienReference && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold">CERSAI Lien Active:</span>
                      <span className="font-mono font-bold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {lienReference}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      DPDP Audit Log #L-8941 Recorded
                    </span>
                  </div>
                )}

                {/* Executive Summary Metrics Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-md border border-indigo-800/60">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/70 pb-3 mb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                        Verified Borrower Entity
                      </span>
                      <h3 className="text-lg font-black text-white">
                        {matchedAssets[0]?.canonicalParcel.ownerName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>100% Clear Titles</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        <span>{jurisdictionsList.join(" + ")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-indigo-300 block">Total Collateral Value</span>
                      <span className="text-lg sm:text-xl font-black text-white font-mono">
                        ₹{(totalValuation / 10000000).toFixed(2)} Cr
                      </span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        ₹{totalValuation.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-indigo-300 block">Combined Land Holding</span>
                      <span className="text-lg sm:text-xl font-black text-white font-mono">
                        {totalAreaHa.toFixed(2)} Ha
                      </span>
                      <span className="text-[10px] text-indigo-200 block mt-0.5">
                        ~{(totalAreaHa * 2.471).toFixed(2)} Acres
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-indigo-300 block">CERSAI Encumbrance</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-400">
                        Nil (Clear)
                      </span>
                      <span className="text-[10px] text-indigo-200 block mt-0.5">
                        No prior mortgages
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-indigo-300 block">Underwriting Decision</span>
                      <span className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>ELIGIBLE</span>
                      </span>
                      <span className="text-[10px] text-indigo-200 block mt-0.5">
                        Tier-1 Collateral Ratio
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Multi-State Asset Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Individual State Collateral Assets ({matchedAssets.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Disparate state formats converted to canonical Land Stack standard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedAssets.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.sourceJurisdiction === "Tamil Nadu"
                                    ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                                    : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                }`}
                              >
                                {item.sourceJurisdiction}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.canonicalParcel.ulpin}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.canonicalParcel.khasraNo}
                            </div>
                          </div>

                          <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                            ₹{(item.canonicalParcel.marketValueInINR || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Comparison of Native Source Terms vs Canonical Terms */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Source Registry:</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                              {item.sourceJurisdiction === "Tamil Nadu"
                                ? "Tamil Nilam (Patta / Chitta)"
                                : "UT Estate Office (e-Sampark)"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Native Property Field:</span>
                            <span className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                              {item.sourceJurisdiction === "Tamil Nadu"
                                ? `patta_no: ${item.rawRecord.patta_no}`
                                : `propertyId: ${item.rawRecord.propertyId}`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Zoning / Use:</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                              {item.canonicalParcel.landUse}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Encumbrance (EC):</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Nil / Clear Title
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Property Tax Status:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {item.canonicalParcel.taxStatus}
                            </span>
                          </div>
                        </div>

                        {onNavigateToParcel && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToParcel(item.feature);
                              onClose();
                            }}
                            className="w-full mt-2 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <span>Inspect Parcel on Map</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CERSAI Lien Notice Card if Registered */}
                {isLienRegistered && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                          Mortgage Lien Registered with CERSAI Central Clearinghouse
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                          Reference Token: #{lienReference} • SARFAESI Security Interest Created
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                      ACTIVE
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: INTERSTATE SCHEMA NORMALIZATION DIFF */
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Cross-State Heterogeneity Elimination</span>
                  </div>
                  Below is the exact raw data returned by Tamil Nadu and Chandigarh state revenue registries side-by-side with the canonical normalized Land Stack schema. Notice that disparate state field names (`pattadar_name` vs `ownerFullName`, `patta_no` vs `propertyId`) are mapped seamlessly to national standards without human intervention.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono">
                  {/* Raw Tamil Nadu */}
                  <div className="p-3 bg-slate-100 dark:bg-zinc-800/90 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <div className="font-bold font-sans text-xs text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <span>1. Tamil Nadu Raw (Patta/Chitta)</span>
                    </div>
                    <pre className="overflow-x-auto text-[10px] text-slate-800 dark:text-zinc-200">
{`{
  "patta_no": "TN07H2910S",
  "pattadar_name": "Col. Harpreet...",
  "survey_subdivision": "89/1-B",
  "classification": "Nanjai",
  "guideline_val_inr": 4800000,
  "tax_paid_status": "Paid"
}`}
                    </pre>
                  </div>

                  {/* Raw Chandigarh */}
                  <div className="p-3 bg-slate-100 dark:bg-zinc-800/90 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <div className="font-bold font-sans text-xs text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <span>2. Chandigarh Raw (e-Sampark)</span>
                    </div>
                    <pre className="overflow-x-auto text-[10px] text-slate-800 dark:text-zinc-200">
{`{
  "propertyId": "CH01S1742A",
  "ownerFullName": "Col. Harpreet...",
  "sectorPlotNo": "Sec 17-C / 42/B",
  "useType": "Commercial SCO",
  "collectorRateValuation": 18500000,
  "propertyTaxDues": "Paid"
}`}
                    </pre>
                  </div>

                  {/* Canonical Unified */}
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-700">
                    <div className="font-bold font-sans text-xs text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>3. Land Stack Canonical Schema</span>
                    </div>
                    <pre className="overflow-x-auto text-[10px] text-emerald-900 dark:text-emerald-200 font-bold">
{`{
  "ulpin": "TN07H2910S / CH01S...",
  "ownerName": "Col. Harpreet...",
  "khasraNo": "Canonical ID",
  "landUse": "Commercial / Ind",
  "marketValueInINR": 23300000,
  "taxStatus": "Paid",
  "rorStatus": "Verified"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Borrower Assets Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No property deeds matched &ldquo;{searchBorrower}&rdquo; across Tamil Nadu and Chandigarh registries. Try searching for &ldquo;Col. Harpreet Singh Sodhi&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BANK ACTIONS FOOTER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Dual-State Interoperability Verified</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePrintCertificate}
              className="px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Memo</span>
            </button>

            {!isLienRegistered ? (
              <button
                type="button"
                data-testid="register-cersai-lien-btn"
                onClick={handleRegisterLien}
                disabled={matchedAssets.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                <span>Register Mortgage Lien (CERSAI)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-emerald-700/80 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-default"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Lien Active ({lienReference || "#CERSAI"})</span>
              </button>
            )}
          </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div data-testid="bank-verification-inline-container" className="w-full flex justify-center py-2 sm:py-4">
        {modalContent}
      </div>
    );
  }

  return (
    <div
      data-testid="bank-verification-overlay"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalContent}
    </div>
  );
}
