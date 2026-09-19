"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Building2,
  Scale,
  Coins,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  Globe,
  FileText,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sun,
  Moon,
  Zap,
  BookOpen,
  Users,
  Landmark,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Badge } from "@/components/ui";

// ============================================================================
// SIMULATION PRESETS & STATE BENCHMARKS
// ============================================================================
interface StateEconomicProfile {
  name: string;
  code: string;
  parcelsEstMillions: number;
  annualLitigationCostCr: number;
  pilotStatus: "Live Pilot (Phase 1)" | "Phase 2 (Immediate)" | "Phase 3 (Rollout)";
}

const TOP_STATES_DATA: StateEconomicProfile[] = [
  {
    name: "Uttar Pradesh",
    code: "UP",
    parcelsEstMillions: 32.5,
    annualLitigationCostCr: 4850,
    pilotStatus: "Live Pilot (Phase 1)",
  },
  {
    name: "Maharashtra",
    code: "MH",
    parcelsEstMillions: 28.4,
    annualLitigationCostCr: 4200,
    pilotStatus: "Phase 2 (Immediate)",
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    parcelsEstMillions: 19.8,
    annualLitigationCostCr: 3100,
    pilotStatus: "Live Pilot (Phase 1)",
  },
  {
    name: "Karnataka",
    code: "KA",
    parcelsEstMillions: 16.5,
    annualLitigationCostCr: 2600,
    pilotStatus: "Phase 2 (Immediate)",
  },
  {
    name: "Gujarat",
    code: "GJ",
    parcelsEstMillions: 15.2,
    annualLitigationCostCr: 2350,
    pilotStatus: "Phase 2 (Immediate)",
  },
  {
    name: "Rajasthan",
    code: "RJ",
    parcelsEstMillions: 17.0,
    annualLitigationCostCr: 2450,
    pilotStatus: "Phase 3 (Rollout)",
  },
  {
    name: "West Bengal",
    code: "WB",
    parcelsEstMillions: 18.2,
    annualLitigationCostCr: 2750,
    pilotStatus: "Phase 3 (Rollout)",
  },
  {
    name: "Chandigarh",
    code: "CH",
    parcelsEstMillions: 0.15,
    annualLitigationCostCr: 85,
    pilotStatus: "Live Pilot (Phase 1)",
  },
];

export default function NationalImpactDashboard() {
  const { language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // Scaling Simulator: Number of States & UTs Onboarded (2 to 36)
  const [simulatedStates, setSimulatedStates] = useState<number>(36);

  // Dynamic calculations based on state count ratio (N / 36)
  const simulationMetrics = useMemo(() => {
    const fraction = simulatedStates / 36;

    // National Baselines at 100% Pan-India scale (36 States & UTs):
    // Total estimated parcels in India: 20.4 Crore (204M)
    const parcelsCrores = Number((fraction * 20.4).toFixed(1));
    const parcelsFormatted = `${parcelsCrores} Cr`;

    // Annual Litigation Cost Saved: ₹28,500 Crore / year at 100%
    const litigationSavingsCr = Math.round(fraction * 28500);
    const litigationFormatted = `₹${litigationSavingsCr.toLocaleString("en-IN")} Cr`;

    // Civil Disputes Prevented: ~22.5 Lakh court cases
    const disputesLakhs = Number((fraction * 22.5).toFixed(1));

    // Collateral Credit Velocity Unlocked: ₹2,40,000 Crore (2.4 Lakh Crore)
    const creditUnlockedCr = Math.round(fraction * 240000);

    // Mutation turnaround: 45 days down to 14 days (-68%)
    const currentDays = Math.round(45 - fraction * 31);
    const mutationPercentSaved = Math.min(68, Math.round(fraction * 68));

    return {
      parcelsCrores,
      parcelsFormatted,
      litigationSavingsCr,
      litigationFormatted,
      disputesLakhs,
      creditUnlockedCr,
      currentDays,
      mutationPercentSaved,
      fraction,
    };
  }, [simulatedStates]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* ===================================================================== */}
      {/* TOP STICKY HEADER */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === "hi" ? "मानचित्र पर वापस जाएं" : "Back to Map"}</span>
            </Link>

            <div className="h-4 w-[1px] bg-slate-200 dark:border-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {language === "hi"
                    ? "राष्ट्रीय आर्थिक प्रभाव व डीपीआई डैशबोर्ड"
                    : "National Economic Impact & DPI Case"}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {language === "hi"
                    ? "20+ करोड़ भू-खंडों के लिए राष्ट्रीय सिमुलेशन व न्यायिक बचत"
                    : "Projected Pan-India Dividends Across 36 States & UTs"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* National Rollout View Link */}
            <Link
              href="/national-view"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>{language === "hi" ? "राष्ट्रीय रोलआउट मैप" : "National Rollout Map"}</span>
            </Link>

            {/* Language Switcher (EN/HI) */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${
                  language === "en"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                EN
              </button>
              <span className="text-slate-300 dark:text-zinc-600 text-xs">/</span>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${
                  language === "hi"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                HI
              </button>
            </div>

            {/* Dark / Light Toggle */}
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? "Light Mode" : "Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* HERO BANNER: ECONOMIC REFRAMING */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-indigo-950">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {language === "hi"
                  ? "राष्ट्रीय आर्थिक मूल्यांकन • डिजिटल पब्लिक इंफ्रास्ट्रक्चर (DPI)"
                  : "National Economic Valuation • Digital Public Infrastructure (DPI)"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {language === "hi"
                ? "स्थानीय प्रोटोटाइप से राष्ट्रीय आर्थिक परिवर्तन की यात्रा"
                : "From Local Pilot to National Economic Catalyst"}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              {language === "hi"
                ? "भारत की अदालतों में लंबित 66% सिविल मामले भूमि विवाद से संबंधित हैं, जो प्रतिवर्ष लगभग ₹58,000 करोड़ की पूंजी अवरुद्ध करते हैं। लैंड स्टैक का 14-अंकीय भू-आधार (ULPIN) व इंटरऑपरेबल एडेप्टर आर्किटेक्चर संपूर्ण भारत के 20+ करोड़ भूखंडों में ₹28,500 करोड़ की वार्षिक बचत का मार्ग प्रशस्त करता है।"
                : "Land disputes account for ~66% of all civil court cases in India, locking up ~1.3% of national GDP annually. Land Stack's unified 14-digit Bhu-Aadhaar cadastre and zero-rebuild adapter architecture unlocks ₹28,500+ Crore in annual litigation savings and accelerates rural credit across all 36 States & UTs."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <div className="text-2xl font-black text-amber-300 font-mono">66%</div>
              <div className="text-[11px] text-indigo-200 font-medium">Civil Cases Land-Related</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <div className="text-2xl font-black text-emerald-300 font-mono">1.3%</div>
              <div className="text-[11px] text-indigo-200 font-medium">India GDP Locked in Disputes</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <div className="text-2xl font-black text-cyan-300 font-mono">20 Yrs</div>
              <div className="text-[11px] text-indigo-200 font-medium">Avg. Court Resolution Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4 CORE NATIONAL IMPACT HERO KPIS */}
      {/* ===================================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-5 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STAT 1: States Onboarded */}
          <div
            data-testid="stat-states-onboarded"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {language === "hi" ? "एकीकृत राज्य व केंद्रशासित प्रदेश" : "States Onboarded"}
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                2 of 36
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>TN &amp; Chandigarh Live (UP Indexed)</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              34 States &amp; UTs scheduled in Phase 2 &amp; Phase 3 waves
            </div>
          </div>

          {/* STAT 2: Total Parcels India Estimate */}
          <div
            data-testid="stat-total-parcels"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {language === "hi" ? "कुल भारतीय भूखंड (अनुमानित)" : "Total Parcels (India est.)"}
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-purple-700 dark:text-purple-400 font-mono tracking-tight">
                20+ Crore
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-300 font-semibold mt-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>200+ Million Cadastres Nationwide</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              Encompasses rural SVAMITVA, DILRMP &amp; urban municipal wards
            </div>
          </div>

          {/* STAT 3: Projected Mutation Time Reduction */}
          <div
            data-testid="stat-mutation-reduction"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {language === "hi" ? "दाखिल-खारिज समय में कमी" : "Mutation Time Reduction"}
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                68%
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-300 font-semibold mt-1">
                <span>Accelerated from 45 days to ~14 days</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              Zero-bribery webhook automation upon deed registration
            </div>
          </div>

          {/* STAT 4: Estimated Annual Litigation Cost Saved */}
          <div
            data-testid="stat-litigation-saved"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {language === "hi" ? "वार्षिक मुक़दमेबाज़ी बचत" : "Annual Litigation Cost Saved"}
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Scale className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                ₹28,500 Cr
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-300 font-semibold mt-1">
                <span>Direct judicial &amp; citizen expense relief</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              Cited loosely from CPR &amp; DAKSH judicial studies on land cases
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* INTERACTIVE NATIONAL SCALING SIMULATOR */}
      {/* ===================================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === "hi"
                    ? "इंटरएक्टिव राष्ट्रीय स्केलिंग सिम्युलेटर"
                    : "Interactive National Scaling Simulator"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {language === "hi"
                  ? "स्लाइडर को हिलाकर देखें कि लैंड स्टैक का विस्तार 2 पायलट राज्यों से 36 राज्यों व केंद्रशासित प्रदेशों तक पहुंचने पर भारत की अर्थव्यवस्था पर क्या प्रभाव पड़ता है।"
                  : "Slide the scale from 2 pilot jurisdictions up to full 36 States & UTs to observe simulated economic dividends in real-time."}
              </p>
            </div>

            {/* Quick-Jump Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="preset-pilots-btn"
                onClick={() => setSimulatedStates(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  simulatedStates === 2
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                }`}
              >
                Current Pilot (2 States)
              </button>
              <button
                type="button"
                data-testid="preset-phase2-btn"
                onClick={() => setSimulatedStates(8)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  simulatedStates === 8
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                }`}
              >
                Phase 2 (8 States)
              </button>
              <button
                type="button"
                data-testid="preset-phase3-btn"
                onClick={() => setSimulatedStates(20)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  simulatedStates === 20
                    ? "bg-indigo-600 text-white shadow-white"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                }`}
              >
                Major States (20)
              </button>
              <button
                type="button"
                data-testid="preset-panindia-btn"
                onClick={() => setSimulatedStates(36)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  simulatedStates === 36
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                }`}
              >
                Pan-India (All 36)
              </button>
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                <span>Simulated Federation Jurisdiction Coverage:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  {simulatedStates} / 36 States &amp; UTs
                </span>
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {Math.round((simulatedStates / 36) * 100)}% India Coverage
              </span>
            </div>

            <input
              type="range"
              min={2}
              max={36}
              step={1}
              value={simulatedStates}
              data-testid="scaling-slider"
              onChange={(e) => setSimulatedStates(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>2 States (Tamil Nadu + Chandigarh)</span>
              <span>18 States (50% National Rollout)</span>
              <span>36 States &amp; UTs (Complete Pan-India)</span>
            </div>
          </div>

          {/* Live Recalculated Output Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60">
              <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                Active Cadastres
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {simulationMetrics.parcelsFormatted}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Digitized Bhu-Aadhaar records
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                Annual Litigation Relief
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {simulationMetrics.litigationFormatted}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Saved in legal &amp; court fees
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60">
              <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                Litigation Avoided
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                {simulationMetrics.disputesLakhs} Lakh
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Frivolous boundary cases prevented
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                Bank Credit Unlocked
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                ₹{(simulationMetrics.creditUnlockedCr / 1000).toFixed(0)}k Cr
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Faster collateral loan sanctions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4 PILLARS OF NATIONAL ECONOMIC IMPACT */}
      {/* ===================================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>
              {language === "hi"
                ? "राष्ट्रीय आर्थिक प्रभाव के 4 मुख्य स्तंभ"
                : "The 4 Pillars of National Land Governance Impact"}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            How architectural standardization translates directly into macro-economic stability and citizen empowerment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PILLAR 1: Judicial & Litigation Case */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Judicial Relief &amp; De-clogging India's Courts
                </h4>
                <p className="text-[11px] text-slate-500">66% of All Civil Litigation</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              India&rsquo;s subordinate and district courts are inundated with over 4.4 Crore pending cases. Land disputes require an average of <strong>20 years</strong> to resolve, imposing direct litigation costs of over ₹50,000 annually per family (*DAKSH Judicial Study*). Land Stack&rsquo;s cryptographic ULPIN, SHA-256 chain of custody, and real-time satellite encroachment alerts eliminate boundary ambiguity and fraudulent double-pledging before court filing.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
              <strong>Macro Dividend:</strong> ₹28,500 Crore annual savings in judicial expenditures &amp; locked litigant capital.
            </div>
          </div>

          {/* PILLAR 2: Credit Velocity & Banking */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Credit Velocity &amp; CERSAI Hypothecation
                </h4>
                <p className="text-[11px] text-slate-500">Slashing Mortgage Latency from 21 Days to &lt; 24h</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Banks and housing finance companies spend billions on manual title deed searches (*NOC search reports*) across scattered tehsils. Land Stack provides an instant <strong>Interstate Bank Collateral Portal</strong> with automated CERSAI lien registration. Multi-state asset holders (e.g. Tamil Nadu + Chandigarh) are consolidated into a verified single borrower dossier within seconds.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
              <strong>Macro Dividend:</strong> ₹2.4 Lakh Crore in accelerated rural agricultural &amp; MSME loan disbursements.
            </div>
          </div>

          {/* PILLAR 3: Citizen Ease of Living */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Citizen Ease of Living &amp; Zero-Bribery Mutation
                </h4>
                <p className="text-[11px] text-slate-500">68% Reduction in Mutation Timelines</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Post-registration land mutation historically forced citizens into multiple physical visits to revenue offices and tehsildar courts. Land Stack triggers automated mutation webhooks as soon as a deed is registered at the Sub-Registrar Office, publishing real-time notification alerts directly to the citizen via SMS and WhatsApp.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
              <strong>Macro Dividend:</strong> Mutation compressed from 45 days down to 14 days without human intermediaries.
            </div>
          </div>

          {/* PILLAR 4: Municipal & Environmental Protection */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  4. Municipal Geo-Referencing &amp; Ecocadastre
                </h4>
                <p className="text-[11px] text-slate-500">Water Body &amp; Forest Boundary Enforcement</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Unplanned urban sprawls and illegal encroachments on lakebeds (*poramboke* / commons) routinely cause catastrophic monsoon flooding in major Indian metros. By overlaying multi-temporal satellite imagery on canonical RFC 7946 cadastre polygons, Land Stack alerts municipal authorities the moment illegal construction begins.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
              <strong>Macro Dividend:</strong> Protection of critical wetland ecosystems &amp; municipal property tax geo-tagging.
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* STATE-BY-STATE PROJECTED DIVIDENDS TABLE */}
      {/* ===================================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              State-Wise Projected Dividends Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Estimated cadastre volume and annual dispute expenditure relief across sample key states.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-800 font-bold">
                  <th className="py-3 px-4">State / Union Territory</th>
                  <th className="py-3 px-4">Rollout Phase</th>
                  <th className="py-3 px-4">Estimated Parcels</th>
                  <th className="py-3 px-4">Annual Litigation Burden</th>
                  <th className="py-3 px-4">Projected Annual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {TOP_STATES_DATA.map((st) => (
                  <tr key={st.code} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {st.code}
                      </span>
                      <span>{st.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          st.pilotStatus.includes("Phase 1")
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : st.pilotStatus.includes("Phase 2")
                            ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                        }`}
                      >
                        {st.pilotStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {st.parcelsEstMillions} Million
                    </td>
                    <td className="py-3 px-4 font-mono text-red-600 dark:text-red-400">
                      ₹{st.annualLitigationCostCr.toLocaleString("en-IN")} Cr/yr
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Math.round(st.annualLitigationCostCr * 0.48).toLocaleString("en-IN")} Cr/yr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PUBLIC & ACADEMIC CITATIONS SECTION */}
      {/* ===================================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-slate-100 dark:bg-zinc-900/60 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Data Sources &amp; Credible Academic Citations
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Publicly documented studies and governmental benchmark reports establishing India&rsquo;s land dispute costs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                Centre for Policy Research (CPR)
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Land Rights Initiative: Access to Justice
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Found that 66% of all civil litigation in Indian courts originates from property and boundary disputes, tying up family savings across multiple generations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                DAKSH Judicial &amp; World Bank Reports
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Economic Impact of Land Disputes
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Estimates land disputes consume 1.3% of India&rsquo;s national GDP annually in direct lawyer fees, lost working days, and stalled infrastructure investments (~₹58,000 Cr).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                NITI Aayog &amp; MoRD (DoLR)
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                DILRMP &amp; Bhu-Aadhaar Guidelines
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Recommends automated mutation integration to compress land record mutation timelines from 45 days down to under 14 days through Digital Public Infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* BOTTOM ACTION CTA STRIP */}
      {/* ===================================================================== */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Land Stack DPI Economic Architecture • National Cadastral Federation Model
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
            >
              Interactive Map
            </Link>

            <Link
              href="/admin/onboard-state"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition"
            >
              Onboard New State (+34 Pipeline)
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
