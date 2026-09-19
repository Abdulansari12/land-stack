"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  ArrowLeft,
  Play,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Code,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingState, ErrorState } from "@/components/ui";

interface ApiResponseState {
  loading: boolean;
  status: number | null;
  statusText: string;
  timeMs: number | null;
  data: any | null;
  rawText: string;
  error: string | null;
}

export default function ApiExplorerPage() {
  const { language, setLanguage, t } = useLanguage();
  // Endpoint 1: /api/parcels
  const [parcelsStateParam, setParcelsStateParam] = useState<string>("all");
  const [parcelsResponse, setParcelsResponse] = useState<ApiResponseState>({
    loading: false,
    status: null,
    statusText: "",
    timeMs: null,
    data: null,
    rawText: "",
    error: null,
  });
  const [parcelsCopied, setParcelsCopied] = useState(false);

  // Endpoint 2: /api/parcels/[ulpin]
  const [singleUlpinInput, setSingleUlpinInput] = useState<string>("UP092837418293");
  const [singleResponse, setSingleResponse] = useState<ApiResponseState>({
    loading: false,
    status: null,
    statusText: "",
    timeMs: null,
    data: null,
    rawText: "",
    error: null,
  });
  const [singleCopied, setSingleCopied] = useState(false);

  // Execute /api/parcels
  const handleFetchParcels = async () => {
    setParcelsResponse((prev) => ({ ...prev, loading: true, error: null }));
    const startTime = performance.now();
    try {
      const url =
        parcelsStateParam === "all"
          ? "/api/parcels"
          : `/api/parcels?state=${encodeURIComponent(parcelsStateParam)}`;
      const res = await fetch(url);
      const elapsed = Math.round(performance.now() - startTime);
      const json = await res.json();
      const rawText = JSON.stringify(json, null, 2);

      setParcelsResponse({
        loading: false,
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        timeMs: elapsed,
        data: json,
        rawText,
        error: !res.ok ? (json.error || `HTTP ${res.status}: ${res.statusText || "Request failed"}`) : null,
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setParcelsResponse({
        loading: false,
        status: 500,
        statusText: "Network Error",
        timeMs: elapsed,
        data: null,
        rawText: "",
        error: err?.message || "Failed to fetch /api/parcels",
      });
    }
  };

  // Execute /api/parcels/[ulpin]
  const handleFetchSingleParcel = async (targetUlpin?: string) => {
    const ulpinToFetch = (targetUlpin !== undefined ? targetUlpin : singleUlpinInput).trim();
    if (!ulpinToFetch) return;

    if (targetUlpin) {
      setSingleUlpinInput(targetUlpin);
    }

    setSingleResponse((prev) => ({ ...prev, loading: true, error: null }));
    const startTime = performance.now();
    try {
      const res = await fetch(`/api/parcels/${encodeURIComponent(ulpinToFetch)}`);
      const elapsed = Math.round(performance.now() - startTime);
      const json = await res.json();
      const rawText = JSON.stringify(json, null, 2);

      setSingleResponse({
        loading: false,
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        timeMs: elapsed,
        data: json,
        rawText,
        error: !res.ok ? (json.error || `HTTP ${res.status}: ${res.statusText || "Parcel lookup failed"}`) : null,
      });
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setSingleResponse({
        loading: false,
        status: 500,
        statusText: "Network Error",
        timeMs: elapsed,
        data: null,
        rawText: "",
        error: err?.message || "Failed to fetch single parcel",
      });
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting parser for JSON code block
  const renderHighlightedJson = (rawJson: string) => {
    if (!rawJson) return null;
    const escaped = rawJson
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const colored = escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-sky-300 dark:text-sky-400"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-indigo-300 dark:text-indigo-400 font-semibold"; // key
          } else {
            cls = "text-emerald-300 dark:text-emerald-400"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-amber-300 dark:text-amber-400 font-bold"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-rose-300 dark:text-rose-400 italic"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return (
      <pre
        className="font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto p-4 max-h-[460px] scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: colored }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("backToMap")}</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                Cadastral API Explorer
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/80">
                v1.0 (GeoJSON)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              Base URL: <code className="text-indigo-400">/api/parcels</code>
            </span>

            {/* Language Toggle Button (EN/HI) */}
            <div
              data-testid="language-toggle-group-api-explorer"
              className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 shrink-0"
            >
              <button
                type="button"
                data-testid="lang-btn-en"
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-slate-900 text-indigo-400 font-extrabold shadow-xs border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 font-medium"
                }`}
                title="Switch to English (EN)"
                aria-label="English"
              >
                <span>EN</span>
              </button>
              <span className="text-slate-600 text-xs select-none">/</span>
              <button
                type="button"
                data-testid="lang-btn-hi"
                onClick={() => setLanguage("hi")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  language === "hi"
                    ? "bg-slate-900 text-indigo-400 font-extrabold shadow-xs border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 font-medium"
                }`}
                title="Switch to Hindi (हिन्दी)"
                aria-label="Hindi"
              >
                <span>HI</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Hero Card */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Open Cadastral Data Interface</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Land Records & Cadastral REST API
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Programmatic REST endpoints delivering normalized land parcel records, spatial polygon geometries, 
              ownership chains, and encumbrance statuses conforming to the national <strong>ULPIN</strong> standard 
              and <strong>GeoJSON (RFC 7946)</strong>.
            </p>
          </div>
        </div>

        {/* Endpoints Stack */}
        <div className="space-y-8">
          {/* ========================================================================= */}
          {/* ENDPOINT 1: GET /api/parcels */}
          {/* ========================================================================= */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg overflow-hidden">
            {/* Endpoint Header Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GET
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-white">
                  /api/parcels
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* State Filter Selector */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 font-mono">state:</span>
                  <select
                    value={parcelsStateParam}
                    onChange={(e) => setParcelsStateParam(e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-800 text-white">All States (Unified)</option>
                    <option value="Tamil Nadu" className="bg-slate-800 text-white">Tamil Nadu</option>
                    <option value="Chandigarh" className="bg-slate-800 text-white">Chandigarh</option>
                    <option value="Uttar Pradesh" className="bg-slate-800 text-white">Uttar Pradesh</option>
                  </select>
                </div>

                {/* 'Try it' Button */}
                <button
                  type="button"
                  data-testid="try-it-parcels-btn"
                  disabled={parcelsResponse.loading}
                  onClick={handleFetchParcels}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  {parcelsResponse.loading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Try it</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Endpoint Body & Documentation */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Returns the full cadastral GeoJSON <code className="text-indigo-400">FeatureCollection</code> reading 
                from <code className="text-slate-400">data/parcels.ts</code>. Features are canonicalized through the 
                cross-state schema adapter with 14-digit ULPIN identifiers, boundary coordinates, and ownership attributes.
              </div>

              {/* Response Display Box / Loading / Error */}
              {parcelsResponse.loading && (
                <div className="mt-4">
                  <LoadingState
                    variant="card"
                    size="md"
                    label="Executing GET /api/parcels..."
                    description="Querying cadastral FeatureCollection from national schema adapter."
                  />
                </div>
              )}

              {parcelsResponse.error && !parcelsResponse.loading && (
                <div className="mt-4">
                  <ErrorState
                    variant="card"
                    size="md"
                    title={`API Request Failed (${parcelsResponse.status || 500})`}
                    message={parcelsResponse.error}
                    onRetry={handleFetchParcels}
                    retryLabel="Retry Request"
                  />
                </div>
              )}

              {parcelsResponse.status !== null && !parcelsResponse.loading && !parcelsResponse.error && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                  {/* Response Meta Header */}
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono uppercase text-[11px] tracking-wider">
                        Response
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          parcelsResponse.status === 200
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {parcelsResponse.status} {parcelsResponse.statusText}
                      </span>
                      {parcelsResponse.timeMs !== null && (
                        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {parcelsResponse.timeMs} ms
                        </span>
                      )}
                      {parcelsResponse.data?.features && (
                        <span className="text-slate-400 font-mono text-[11px]">
                          {parcelsResponse.data.features.length} parcels returned
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(parcelsResponse.rawText, setParcelsCopied)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      {parcelsCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Highlighted Code Block */}
                  {renderHighlightedJson(parcelsResponse.rawText)}
                </div>
              )}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* ENDPOINT 2: GET /api/parcels/[ulpin] */}
          {/* ========================================================================= */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg overflow-hidden">
            {/* Endpoint Header Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GET
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-white">
                  /api/parcels/<span className="text-indigo-400">[ulpin]</span>
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* ULPIN Input */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 font-mono">ulpin:</span>
                  <input
                    type="text"
                    value={singleUlpinInput}
                    onChange={(e) => setSingleUlpinInput(e.target.value)}
                    placeholder="e.g. UP26A8941B"
                    className="bg-transparent text-white font-mono font-medium focus:outline-none w-44"
                  />
                </div>

                {/* 'Try it' Button */}
                <button
                  type="button"
                  data-testid="try-it-single-btn"
                  disabled={singleResponse.loading}
                  onClick={() => handleFetchSingleParcel()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  {singleResponse.loading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Try it</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Endpoint Body & Documentation */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Returns a single GeoJSON <code className="text-indigo-400">Feature</code> matching the requested 
                Unique Land Parcel Identification Number (ULPIN), Survey subdivision, or state registration number.
              </div>

              {/* Sample ULPIN Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Sample ULPINs:</span>
                {[
                  { label: "UP Lucknow (Clear)", ulpin: "UP26A8941B" },
                  { label: "UP Lucknow (Consent Req)", ulpin: "UP09K2452M" },
                  { label: "Tamil Nadu (Patta)", ulpin: "TN04M4910A" },
                  { label: "Chandigarh (Plot)", ulpin: "CH02B2201B" },
                  { label: "Test 404 (Invalid)", ulpin: "INVALID-ULPIN-999" },
                ].map((chip) => (
                  <button
                    key={chip.ulpin}
                    type="button"
                    onClick={() => handleFetchSingleParcel(chip.ulpin)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Response Display Box / Loading / Error */}
              {singleResponse.loading && (
                <div className="mt-4">
                  <LoadingState
                    variant="card"
                    size="md"
                    label={`Querying ULPIN ${singleUlpinInput}...`}
                    description="Resolving parcel boundary coordinates, chain of title, and legal encumbrance status."
                  />
                </div>
              )}

              {singleResponse.error && !singleResponse.loading && (
                <div className="mt-4">
                  <ErrorState
                    variant="card"
                    size="md"
                    title={`ULPIN Lookup Failed (${singleResponse.status || 500})`}
                    message={singleResponse.error}
                    onRetry={() => handleFetchSingleParcel()}
                    retryLabel="Retry Lookup"
                  />
                </div>
              )}

              {singleResponse.status !== null && !singleResponse.loading && !singleResponse.error && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                  {/* Response Meta Header */}
                  <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono uppercase text-[11px] tracking-wider">
                        Response
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          singleResponse.status === 200
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {singleResponse.status} {singleResponse.statusText}
                      </span>
                      {singleResponse.timeMs !== null && (
                        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {singleResponse.timeMs} ms
                        </span>
                      )}
                      {singleResponse.data?.properties && (
                        <span className="text-slate-400 font-mono text-[11px]">
                          Owner: {singleResponse.data.properties.ownerName}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(singleResponse.rawText, setSingleCopied)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      {singleCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Highlighted Code Block */}
                  {renderHighlightedJson(singleResponse.rawText)}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-mono">
        CivicPortal Cadastral Engine • GeoJSON RFC 7946 • DPDP Act 2023 Compliant
      </footer>
    </div>
  );
}
