"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Globe2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Layers,
  MapPin,
  Building2,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart2,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import {
  pilotStatesData,
  nationalRolloutMetrics,
  PilotState,
  PilotStatus,
} from "@/data/nationalRollout";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Badge } from "@/components/ui";

// Dynamically import Leaflet Map to avoid SSR issues
const NationalIndiaMap = dynamic(() => import("@/components/NationalIndiaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
        Loading National India Cadastral Map...
      </p>
      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
        Synthesizing 36 State & UT GIS boundaries and pilot nodes
      </p>
    </div>
  ),
});

export default function NationalRolloutPage() {
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [selectedState, setSelectedState] = useState<PilotState | null>(() => {
    // Default to Tamil Nadu on initial load
    return pilotStatesData.find((s) => s.id === "tamil-nadu") || null;
  });

  const [statusFilter, setStatusFilter] = useState<"all" | PilotStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered states based on tab and search text
  const filteredStates = useMemo(() => {
    return pilotStatesData.filter((st) => {
      const matchesStatus =
        statusFilter === "all" ? true : st.status === statusFilter;
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.nameHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.registrySystem.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* ========================================================================= */}
      {/* TOP HEADER NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Back to GIS Map & Brand Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition shadow-xs cursor-pointer"
              title="Return to Interactive Cadastral Map"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Cadastral Map</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-zinc-800">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Globe2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  National Phased Rollout
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                  India Cadastral Federation & Onboarding Matrix
                </p>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
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

            {/* Dark / Light Mode Toggle */}
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

      {/* ========================================================================= */}
      {/* EXECUTIVE KPI SUMMARY CARDS */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1: Live Pilots */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200">
                  {nationalRolloutMetrics.livePilotsCount}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                  Phase 1 Live
                </span>
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Live Pilots (TN, CH, UP)
              </div>
            </div>
          </div>

          {/* KPI 2: Technical Pilots Onboarding */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-200">
                  {nationalRolloutMetrics.inProgressCount}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                  Q4 2026
                </span>
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Phase 2 In-Progress (KA, MH, TS, GJ)
              </div>
            </div>
          </div>

          {/* KPI 3: Scheduled Expansion */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-700 dark:bg-zinc-700 text-white flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {nationalRolloutMetrics.scheduledExpansionCount}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                  2027 Wave
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                Upcoming States & UTs
              </div>
            </div>
          </div>

          {/* KPI 4: National Target */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-200">
                  {nationalRolloutMetrics.pilotPercentage}%
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
                  Federated
                </span>
              </div>
              <div className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                National Readiness by 2027
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All States & UTs (36)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("live")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "live"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Live Pilots (3)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in-progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "in-progress"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>Phase 2 (4)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("not-launched")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === "not-launched"
                  ? "bg-slate-800 dark:bg-zinc-700 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Upcoming Wave (29)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state, UT, or registry..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MAIN SPLIT VIEW: MAP & SELECTED STATE DETAILS */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-3 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive India Map */}
        <div className="lg:col-span-7 xl:col-span-8 h-[540px] sm:h-[620px] lg:h-[calc(100vh-250px)] min-h-[500px] flex flex-col">
          <NationalIndiaMap
            states={filteredStates}
            selectedState={selectedState}
            onSelectState={(state) => {
              setSelectedState(state);
            }}
            isDarkMode={isDark}
            className="flex-1"
          />
        </div>

        {/* Right Column: Selected State Dossier & Rollout Details */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {selectedState ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col justify-between h-full animate-in fade-in duration-200">
              <div className="space-y-4">
                {/* State Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {selectedState.code}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">
                        {selectedState.type === "state" ? "State" : "Union Territory"} • Capital: {selectedState.capital}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <span>{selectedState.name}</span>
                      <span className="text-sm font-normal text-slate-400">
                        ({selectedState.nameHi})
                      </span>
                    </h2>
                  </div>

                  {/* Status Badge */}
                  {selectedState.status === "live" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Pilot</span>
                    </span>
                  ) : selectedState.status === "in-progress" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Phase 2 (Q4 2026)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                      <span>Pilot Not Yet Launched</span>
                    </span>
                  )}
                </div>

                {/* State Overview & Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Pilot Scope & Architecture
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                    {selectedState.description}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {/* Registry System */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <span className="text-slate-400 block font-medium">State Land Record System</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedState.registrySystem}
                      </span>
                    </div>
                  </div>

                  {/* Survey Method */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 flex items-start gap-3">
                    <Compass className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <span className="text-slate-400 block font-medium">Cadastral Survey Methodology</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedState.surveyMethod}
                      </span>
                    </div>
                  </div>

                  {/* Target Timeline */}
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <span className="text-slate-400 block font-medium">Phased Go-Live Schedule</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedState.targetTimeline}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                        Status: {selectedState.integrationReadiness}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Pilot Data Metric */}
                {selectedState.status === "live" && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                        Live Normalized Parcels
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Normalized via Land Stack schema adapter
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-mono font-bold">
                      {selectedState.parcelsCount} Parcels
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-slate-100 dark:border-zinc-800">
                {selectedState.status === "live" && selectedState.deepLinkUrl ? (
                  <Link
                    href={selectedState.deepLinkUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Explore {selectedState.name} Cadastral Map</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700 cursor-not-allowed"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Pilot Not Yet Launched for {selectedState.name}</span>
                    </button>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center">
                      State API endpoints scheduled for onboarding under National Land Stack guidelines.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col items-center justify-center text-center h-full">
              <Compass className="h-10 w-10 text-slate-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select a State or Union Territory
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs">
                Click on any state marker on the India map or choose a pilot state below to inspect its rollout status and cadastral records.
              </p>

              {/* Quick-Select Live Pilots */}
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {pilotStatesData
                  .filter((s) => s.status === "live")
                  .map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedState(st)}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 transition cursor-pointer"
                    >
                      {st.name} (Live)
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
