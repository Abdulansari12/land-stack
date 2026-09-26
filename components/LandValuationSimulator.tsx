"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Building2,
  Train,
  Milestone,
  Briefcase,
  Droplets,
  ShieldCheck,
  Calculator,
  Calendar,
  Sparkles,
  ArrowRight,
  Download,
  IndianRupee,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { LandParcelProperties, dummyLandParcels } from "@/data/parcels";
import { useLanguage } from "@/context/LanguageContext";
import { Badge, Button, Card } from "@/components/ui";

export interface LandValuationSimulatorProps {
  parcel?: LandParcelProperties | null;
  onNavigateToParcel?: (ulpin: string) => void;
  inline?: boolean;
}

export interface InfraCatalyst {
  id: string;
  name: string;
  category: "transport" | "commercial" | "utilities" | "governance";
  icon: React.ComponentType<{ className?: string }>;
  boostPercent: number;
  timelineYear: number;
  description: string;
  active: boolean;
}

export default function LandValuationSimulator({
  parcel,
  onNavigateToParcel,
  inline = false,
}: LandValuationSimulatorProps) {
  const { t } = useLanguage();

  // Selected base values
  const [baseValueInLakhs, setBaseValueInLakhs] = useState<number>(
    parcel?.marketValueInINR ? Math.round(parcel.marketValueInINR / 100000) : 125
  );
  const [selectedYear, setSelectedYear] = useState<number>(2031); // 5-year outlook by default
  const [landCategory, setLandCategory] = useState<"residential" | "commercial" | "agricultural">(
    "residential"
  );

  // Infrastructure catalysts toggles
  const [catalysts, setCatalysts] = useState<InfraCatalyst[]>([
    {
      id: "metro",
      name: "Metro Phase 4 Station (within 800m)",
      category: "transport",
      icon: Train,
      boostPercent: 22,
      timelineYear: 2028,
      description: "Direct rapid transit connectivity reducing commute to CBD by 45 minutes.",
      active: true,
    },
    {
      id: "expressway",
      name: "6-Lane Expressway Interchange",
      category: "transport",
      icon: Milestone,
      boostPercent: 28,
      timelineYear: 2029,
      description: "Access-controlled bypass corridor under PM Gati Shakti National Master Plan.",
      active: true,
    },
    {
      id: "it-park",
      name: "IT SEZ / Tech Innovation Hub",
      category: "commercial",
      icon: Briefcase,
      boostPercent: 35,
      timelineYear: 2031,
      description: "High-density employment center generating 25,000+ tech and services jobs.",
      active: true,
    },
    {
      id: "smart-utilities",
      name: "Smart Civic Utilities (24x7 Water & Fiber)",
      category: "utilities",
      icon: Droplets,
      boostPercent: 14,
      timelineYear: 2027,
      description: "Underground stormwater drainage, piped natural gas, and gigabit fiber ring.",
      active: true,
    },
    {
      id: "clear-title",
      name: "Land Stack Blockchain Clean Title",
      category: "governance",
      icon: ShieldCheck,
      boostPercent: 18,
      timelineYear: 2026,
      description: "Eliminates legal dispute discount; guarantees 100% bank mortgageability.",
      active: true,
    },
  ]);

  const toggleCatalyst = (id: string) => {
    setCatalysts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  // Base inflation rate per year
  const organicAnnualInflation = 0.065; // 6.5% base economic growth

  // Calculation projection
  const projection = useMemo(() => {
    const yearsDiff = Math.max(0, selectedYear - 2026);
    let cumulativeMultiplier = Math.pow(1 + organicAnnualInflation, yearsDiff);

    // Apply active catalysts that materialize on or before the selected year
    let infraMultiplier = 1.0;
    catalysts.forEach((c) => {
      if (c.active && c.timelineYear <= selectedYear) {
        infraMultiplier += c.boostPercent / 100;
      }
    });

    const projectedLakhs = baseValueInLakhs * cumulativeMultiplier * infraMultiplier;
    const totalGrowthPercent = ((projectedLakhs - baseValueInLakhs) / baseValueInLakhs) * 100;
    const cagr = yearsDiff > 0 ? (Math.pow(projectedLakhs / baseValueInLakhs, 1 / yearsDiff) - 1) * 100 : 0;

    // Bank Lending Collateral Limit (75% LTV)
    const bankLtvLakhs = projectedLakhs * 0.75;

    // Projected Annual Municipal Tax (approx 0.12% of market value)
    const annualTaxINR = (projectedLakhs * 100000) * 0.0012;

    return {
      yearsDiff,
      projectedLakhs,
      projectedCrores: (projectedLakhs / 100).toFixed(2),
      totalGrowthPercent: totalGrowthPercent.toFixed(1),
      cagr: cagr.toFixed(1),
      bankLtvCrores: (bankLtvLakhs / 100).toFixed(2),
      annualTaxINR: Math.round(annualTaxINR),
    };
  }, [baseValueInLakhs, selectedYear, catalysts]);

  const formatINR = (valInLakhs: number) => {
    if (valInLakhs >= 100) {
      return `₹${(valInLakhs / 100).toFixed(2)} Cr`;
    }
    return `₹${valInLakhs.toFixed(1)} Lakh`;
  };

  const handleExportAppraisal = () => {
    toast.success(`Valuation Appraisal Report for ${selectedYear} exported!`);
  };

  return (
    <div
      data-testid="land-valuation-simulator-container"
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-900/60 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-400 shadow-inner">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-400/30">
                PM GATI SHAKTI INFRASTRUCTURE ENGINE
              </span>
              <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-white/10">
                Predictive AI • 10-Year Horizon
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>AI Land Valuation & Future Growth Simulator</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate the economic multiplier of upcoming expressways, metro corridors, SEZs, and clear title DPI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportAppraisal}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export Appraisal Report
          </Button>
        </div>
      </div>

      {/* Main Grid: Controls vs Projected Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Controls & Infrastructure Triggers */}
        <div className="lg:col-span-5 space-y-5">
          {/* Baseline Valuation Setting */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                1. Baseline Market Value (2026)
              </span>
              <span className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {formatINR(baseValueInLakhs)}
              </span>
            </div>

            <input
              type="range"
              min={25}
              max={500}
              step={5}
              value={baseValueInLakhs}
              onChange={(e) => setBaseValueInLakhs(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>₹25 Lakh</span>
              <span>₹2.5 Cr</span>
              <span>₹5.0 Cr</span>
            </div>

            {parcel && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Target Parcel:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                  {parcel.khasraNo ? `Khasra #${parcel.khasraNo}` : parcel.ulpin}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Timeline Horizon Slider */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>2. Projection Horizon</span>
              </span>
              <Badge variant="info" size="md">
                Year {selectedYear} (+{selectedYear - 2026} Yrs)
              </Badge>
            </div>

            <input
              type="range"
              min={2026}
              max={2036}
              step={1}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            {/* Timeline Tick Labels */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
              <span className={selectedYear === 2026 ? "font-bold text-indigo-600" : ""}>2026 (Now)</span>
              <span className={selectedYear === 2028 ? "font-bold text-indigo-600" : ""}>2028 (Metro)</span>
              <span className={selectedYear === 2031 ? "font-bold text-indigo-600" : ""}>2031 (SEZ)</span>
              <span className={selectedYear === 2036 ? "font-bold text-indigo-600" : ""}>2036 (+10Y)</span>
            </div>
          </div>

          {/* Upcoming Infrastructure Catalysts Toggles */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
              3. Infrastructure Catalysts (PM Gati Shakti)
            </span>

            <div className="space-y-2.5">
              {catalysts.map((cat) => {
                const Icon = cat.icon;
                const isApplicable = cat.timelineYear <= selectedYear;

                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCatalyst(cat.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      cat.active
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800/80 shadow-2xs"
                        : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        cat.active
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-200 dark:bg-zinc-700 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                          +{cat.boostPercent}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                        {cat.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Target: {cat.timelineYear}
                        </span>
                        {!isApplicable && cat.active && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                            (Materializes in {cat.timelineYear})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Projected Economic Impact Dashboard */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Hero Card: Future Valuation */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-800/60 shadow-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
                Projected Valuation in {selectedYear}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>+{projection.totalGrowthPercent}% Total Surge</span>
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white">
                {formatINR(projection.projectedLakhs)}
              </span>
              <span className="text-sm text-slate-300 font-mono">
                ({projection.cagr}% CAGR)
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed mb-6">
              Driven by compound organic urban expansion (+6.5%/yr) plus active infrastructure catalysts under PM Gati Shakti and seamless title liquidity from Land Stack DPI.
            </p>

            {/* 3 Key Pillar Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-indigo-800/80">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                <span className="text-[10px] text-indigo-200 font-medium block">
                  Bank Collateral Unlocked
                </span>
                <span className="text-lg font-bold text-amber-300 font-mono">
                  ₹{projection.bankLtvCrores} Cr
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  At standard 75% LTV
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                <span className="text-[10px] text-indigo-200 font-medium block">
                  Projected Municipal Tax
                </span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  ₹{projection.annualTaxINR.toLocaleString()}/yr
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  Civic revenue collection
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                <span className="text-[10px] text-indigo-200 font-medium block">
                  Clear Title Premium
                </span>
                <span className="text-lg font-bold text-emerald-300 font-mono">
                  +18% Equity
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  Zero dispute risk
                </span>
              </div>
            </div>
          </div>

          {/* Visual Growth Step-Up Stack Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Value Addition Breakdown ({selectedYear})</span>
              <span className="text-xs font-mono text-slate-500">Base: {formatINR(baseValueInLakhs)}</span>
            </h3>

            {/* Stepped progress visual */}
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 dark:bg-zinc-800 shadow-inner">
              <div
                className="bg-indigo-600 h-full flex items-center justify-center text-[10px] text-white font-mono font-bold"
                style={{ width: `${Math.min(100, (baseValueInLakhs / projection.projectedLakhs) * 100)}%` }}
                title="Baseline Property Value"
              >
                Base
              </div>
              <div
                className="bg-cyan-500 h-full flex items-center justify-center text-[10px] text-white font-mono font-bold"
                style={{ width: "25%" }}
                title="Organic Economic Appreciation"
              >
                Organic
              </div>
              <div
                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-mono font-bold"
                style={{ width: "35%" }}
                title="PM Gati Shakti Infrastructure Boost"
              >
                Infra
              </div>
              <div
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-mono font-bold"
                style={{ width: "15%" }}
                title="DPI Clear Title Liquidity Premium"
              >
                DPI
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                <span className="text-slate-600 dark:text-zinc-400">Baseline Plot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="text-slate-600 dark:text-zinc-400">GDP Growth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-zinc-400">Transport & SEZ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-zinc-400">Title Clarity</span>
              </div>
            </div>
          </div>

          {/* Institutional Persona Value Takeaways */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                For Citizens / Owners
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Wealth Maximization
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Know the exact time to develop or monetize land as transit infrastructure completes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                For Banks / Lenders
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Underwriting Safety
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Stress-test mortgage collateral values against future macro-economic scenarios.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                For Revenue Officers
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Value Capture Financing
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Levy infrastructure betterment charges to fund high-speed public rail & highways.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
