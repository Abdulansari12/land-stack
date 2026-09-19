"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Search,
  X,
  RotateCcw,
  Zap,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  Flame,
  Info,
} from "lucide-react";
import type {
  LandParcelFeature,
  LandParcelFeatureCollection,
} from "@/data/parcels";
import {
  parseNLQuery,
  executeNLQuery,
  type NLQueryResult,
} from "@/lib/nlQuery";
import { useLanguage } from "@/context/LanguageContext";
import { sanitizeNLQuery } from "@/lib/sanitize";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export interface AskLandStackProps {
  parcels: LandParcelFeatureCollection;
  onFilterChange: (result: NLQueryResult | null) => void;
  activeResult: NLQueryResult | null;
  className?: string;
}

const SAMPLE_QUERIES = [
  {
    id: "disputed",
    labelEn: "🔴 Disputed Parcels",
    labelHi: "🔴 विवादित भूमि",
    query: "show all disputed parcels",
    badge: "Dispute",
  },
  {
    id: "tax",
    labelEn: "⚠️ Pending Tax",
    labelHi: "⚠️ बकाया कर / टैक्स",
    query: "parcels with pending tax",
    badge: "Revenue",
  },
  {
    id: "agricultural",
    labelEn: "🌾 Agricultural Land",
    labelHi: "🌾 कृषि भूमि",
    query: "agricultural land in this area",
    badge: "Zoning",
  },
  {
    id: "residential",
    labelEn: "🏠 Residential Plots",
    labelHi: "🏠 आवासीय भूखंड",
    query: "residential plots",
    badge: "Zoning",
  },
  {
    id: "encroachment",
    labelEn: "🛰️ Satellite Encroachments",
    labelHi: "🛰️ उपग्रह अतिक्रमण अलर्ट",
    query: "satellite encroachment alerts",
    badge: "AI Alert",
  },
  {
    id: "verified",
    labelEn: "✅ Clear Titles",
    labelHi: "✅ सत्यापित भू-अभिलेख",
    query: "verified clear title records",
    badge: "Verified",
  },
];

export default function AskLandStack({
  parcels,
  onFilterChange,
  activeResult,
  className = "",
}: AskLandStackProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState<"rule-based" | "llm">("rule-based");
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when activeResult changes externally (e.g. from reset)
  useEffect(() => {
    if (!activeResult) {
      setQuery("");
      setQueryError(null);
    }
  }, [activeResult]);

  const handleExecute = async (queryString: string) => {
    // Sanitize input to neutralize any HTML tags or script injection payloads
    const cleanQ = sanitizeNLQuery(queryString);
    if (!cleanQ) {
      onFilterChange(null);
      setQueryError(null);
      return;
    }

    setIsLoading(true);
    setQueryError(null);
    try {
      const result = await executeNLQuery(cleanQ, parcels, aiMode);
      onFilterChange(result);
    } catch (err: any) {
      console.error("[AskLandStack] Execution error:", err);
      setQueryError(err?.message || "Failed to execute natural language query. Using local fallback.");
      // Fallback
      const fallback = parseNLQuery(cleanQ, parcels);
      onFilterChange(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecute(query);
  };

  const handleChipClick = (sampleQuery: string) => {
    setQuery(sampleQuery);
    handleExecute(sampleQuery);
  };

  const handleClear = () => {
    setQuery("");
    onFilterChange(null);
    inputRef.current?.focus();
  };

  return (
    <div
      data-testid="ask-land-stack-container"
      className={`w-full rounded-2xl border transition-all duration-300 shadow-sm ${
        activeResult
          ? "border-indigo-400 dark:border-indigo-500/60 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-zinc-900/60"
          : "border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md"
      } ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP BAR: Label, Input, Mode Toggle, and Submit Button */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Section Brand / Label */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Ask Land Stack</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    AI NLP
                  </span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                {language === "hi"
                  ? "प्राकृतिक भाषा में भू-खंड खोजें (जैसे: 'show all disputed parcels')"
                  : "Type plain-language queries to filter and highlight matching cadastral parcels"}
              </p>
            </div>
          </div>

          {/* AI Mode Selector Toggle: Rule-Based vs Real AI (LLM) */}
          <div className="flex items-center self-start sm:self-auto bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold">
            <button
              type="button"
              data-testid="nl-mode-rule"
              onClick={() => setAiMode("rule-based")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                aiMode === "rule-based"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title="Fast deterministic rule-based keyword matcher (0ms latency)"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Rule-Based NLP</span>
            </button>

            <button
              type="button"
              data-testid="nl-mode-llm"
              onClick={() => setAiMode("llm")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                aiMode === "llm"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title="Connect to Real AI LLM (Gemini / OpenAI) with simulated neural fallback"
            >
              <Cpu className="h-3 w-3 text-pink-300" />
              <span>Real AI Mode</span>
            </button>
          </div>
        </div>

        {/* Input Query Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-indigo-500 dark:text-indigo-400 pointer-events-none" />
            
            <input
              ref={inputRef}
              type="text"
              aria-label="Ask Land Stack plain-language query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === "hi"
                  ? "लैंड स्टैक से पूछें: 'show all disputed parcels', 'pending tax', 'agricultural land'..."
                  : "Ask Land Stack: e.g. 'show all disputed parcels', 'parcels with pending tax', 'agricultural land in this area'..."
              }
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-xs"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear query"
                className="absolute right-12 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition cursor-pointer"
                title="Clear query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Enter Hint Badge */}
            <span className="absolute right-3 hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-400 dark:text-zinc-400 pointer-events-none">
              ↵ Enter
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            aria-label="Submit plain-language query"
            data-testid="ask-land-stack-submit-btn"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <LoadingState
                variant="inline"
                size="sm"
                label="Analyzing..."
                className="text-white justify-center"
              />
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Ask AI</span>
              </>
            )}
          </button>
        </form>

        {/* Error Notice if query failed */}
        {queryError && (
          <div className="w-full">
            <ErrorState
              variant="banner"
              size="sm"
              title="Query Notice"
              message={queryError}
              onRetry={() => handleExecute(query)}
              retryLabel="Retry Query"
              onDismiss={() => setQueryError(null)}
            />
          </div>
        )}

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
            <span>Try:</span>
          </span>
          {SAMPLE_QUERIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleChipClick(item.query)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-zinc-800/80 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-zinc-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>{language === "hi" ? item.labelHi : item.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PARSED INTENT RESULTS BANNER: Rendered when an NL query is active */}
      {/* ========================================================================= */}
      {activeResult && (
        <div
          data-testid="nl-query-intent-banner"
          className="border-t border-indigo-200/80 dark:border-indigo-900/60 bg-white/80 dark:bg-zinc-900/80 px-3 sm:px-4 py-2.5 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sparkles / Status Indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>

            {/* Parsed Intent Summary Text: e.g. 'Showing: 3 parcels matching "disputed"' */}
            <span className="font-bold text-slate-900 dark:text-white">
              {activeResult.filterSummary}
            </span>

            {/* Category / Rule Pill */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <span className="font-mono">Intent:</span>
              <span>{activeResult.intentDescription}</span>
            </span>

            {/* Match count badge */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {activeResult.totalMatches} of {activeResult.totalParcels} on Map
            </span>

            {/* Simulated LLM / Real AI Notice Badge */}
            {activeResult.aiMode === "llm" && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Cpu className="h-2.5 w-2.5" />
                <span>{activeResult.isSimulatedLLM ? "LLM Fallback (Simulated)" : "Live Cloud LLM"}</span>
              </span>
            )}
          </div>

          {/* Reset / View All Parcels Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              data-testid="nl-reset-filter-btn"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
              title="Reset AI filter and show all parcels"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset / View All</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
