"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Satellite,
  Mic,
  Cpu,
  Database,
  BarChart3,
  MapPin,
  Sparkles,
  ExternalLink,
  Flame,
  Clock,
  Terminal,
  ChevronRight,
  Globe,
  Radio,
  Moon,
  Sun,
  TrendingUp,
  Network,
  Landmark,
  Upload,
} from "lucide-react";
import { APP_NAME } from "@/config";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import ImpactStatsCounter from "@/components/ImpactStatsCounter";
import EcosystemDiagram from "@/components/EcosystemDiagram";
import { Skiper31 } from "@/components/ui/skiper-ui/skiper31";

export default function WelcomePage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // Allow pressing Enter anywhere on the welcome page to launch the dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500 selection:text-white font-sans transition-colors duration-200">
      {/* ========================================================================= */}
      {/* ANIMATED BACKGROUND: India Map Silhouette + Cadastral Parcel Mesh Grid */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Ambient radial gradient spots (adapted for light & dark palettes) */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-cyan-500/10 dark:bg-cyan-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[160px]" />

        {/* Animated Perspective Parcel Grid Mesh */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="parcel-grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                className="text-indigo-400/25 dark:text-indigo-400/40"
                strokeWidth="0.8"
                strokeDasharray="4 4"
              />
              <circle cx="0" cy="0" r="1.5" className="fill-indigo-500/40 dark:fill-indigo-400/80" />
            </pattern>
            {/* Linear gradient for scanning radar line */}
            <linearGradient id="scan-beam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(56, 189, 248, 0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#parcel-grid-pattern)" />

          {/* Animated Cadastral Polygons drifting across the grid */}
          <g className="animate-pulse" style={{ animationDuration: "6s" }}>
            <polygon
              points="140,80 290,100 260,230 110,210"
              className="fill-indigo-500/5 dark:fill-indigo-500/10 stroke-indigo-500/30 dark:stroke-indigo-400/45"
              strokeWidth="1.5"
            />
            <polygon
              points="310,110 490,130 460,260 280,240"
              className="fill-cyan-500/5 dark:fill-cyan-500/10 stroke-cyan-500/30 dark:stroke-cyan-400/45"
              strokeWidth="1.5"
            />
            <polygon
              points="750,180 940,200 900,340 710,320"
              className="fill-emerald-500/5 dark:fill-emerald-500/10 stroke-emerald-500/30 dark:stroke-emerald-400/45"
              strokeWidth="1.5"
            />
            <polygon
              points="960,220 1180,250 1130,400 910,370"
              className="fill-rose-500/5 dark:fill-rose-500/10 stroke-rose-500/30 dark:stroke-rose-400/45"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Animated Radar Scanning Line (Sweeps vertically) */}
        <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-[scan_8s_ease-in-out_infinite] pointer-events-none" />

        {/* Stylized Vector Silhouette of India with State Anchors */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[650px] xl:w-[750px] h-[700px] opacity-25 dark:opacity-40 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 600 700"
            className="w-full h-full object-contain"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* India Boundary Path Approximation */}
            <path
              d="M 230 40 L 290 60 L 340 100 L 330 140 L 370 170 L 410 160 L 470 200 L 520 220 L 550 260 L 490 280 L 430 260 L 390 280 L 360 320 L 380 370 L 360 420 L 330 460 L 310 520 L 290 590 L 270 650 L 250 610 L 230 540 L 210 470 L 170 410 L 150 350 L 130 290 L 150 240 L 170 200 L 160 150 L 190 100 Z"
              className="stroke-indigo-500/30 dark:stroke-indigo-400/40 fill-indigo-500/5 dark:fill-indigo-950/25"
              strokeWidth="2"
              strokeDasharray="8 6"
            />

            {/* Glowing Interconnecting Data Beams between states */}
            {/* Chandigarh (top) to UP (center) */}
            <line
              x1="255"
              y1="135"
              x2="330"
              y2="245"
              className="stroke-cyan-500/50 dark:stroke-cyan-400/60"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* UP (center) to Tamil Nadu (south) */}
            <line
              x1="330"
              y1="245"
              x2="305"
              y2="540"
              className="stroke-emerald-500/50 dark:stroke-emerald-400/60"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* State Anchor Node 1: Chandigarh UT */}
            <g className="cursor-pointer">
              <circle cx="255" cy="135" r="8" className="fill-cyan-500/20 stroke-cyan-500" strokeWidth="2" />
              <circle cx="255" cy="135" r="3" className="fill-cyan-600 dark:fill-cyan-400 animate-ping" />
              <circle cx="255" cy="135" r="3" className="fill-cyan-600 dark:fill-cyan-400" />
              <text x="270" y="140" className="fill-slate-700 dark:fill-slate-300 font-sans text-[11px] font-bold">
                Chandigarh UT (e-Sampark)
              </text>
            </g>

            {/* State Anchor Node 2: Uttar Pradesh */}
            <g className="cursor-pointer">
              <circle cx="330" cy="245" r="8" className="fill-indigo-500/20 stroke-indigo-500" strokeWidth="2" />
              <circle cx="330" cy="245" r="3" className="fill-indigo-600 dark:fill-indigo-400 animate-ping" />
              <circle cx="330" cy="245" r="3" className="fill-indigo-600 dark:fill-indigo-400" />
              <text x="345" y="250" className="fill-slate-700 dark:fill-slate-300 font-sans text-[11px] font-bold">
                Uttar Pradesh (Sadar / e-Khasra)
              </text>
            </g>

            {/* State Anchor Node 3: Tamil Nadu */}
            <g className="cursor-pointer">
              <circle cx="305" cy="540" r="8" className="fill-emerald-500/20 stroke-emerald-500" strokeWidth="2" />
              <circle cx="305" cy="540" r="3" className="fill-emerald-600 dark:fill-emerald-400 animate-ping" />
              <circle cx="305" cy="540" r="3" className="fill-emerald-600 dark:fill-emerald-400" />
              <text x="320" y="545" className="fill-slate-700 dark:fill-slate-300 font-sans text-[11px] font-bold">
                Tamil Nadu (Patta / Chitta)
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP BRAND HEADER */}
      {/* ========================================================================= */}
      <header className="relative z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors shadow-2xs">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                {APP_NAME}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                DPI 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Digital India Land Records Modernization Programme (DILRMP)
            </p>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle (EN / HI) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                language === "en"
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                language === "hi"
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            data-testid="welcome-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* Quick link to Institutional Ecosystem */}
          <a
            href="#ecosystem"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <Network className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Ecosystem</span>
          </a>

          {/* Quick link to API Explorer */}
          <Link
            href="/api-explorer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <Terminal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>API Explorer</span>
          </Link>

          {/* Quick link to Officer Dashboard */}
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <BarChart3 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Analytics</span>
          </Link>

          {/* Direct Launch CTA */}
          <Link
            href="/"
            data-testid="welcome-launch-btn-nav"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition cursor-pointer"
          >
            <span>Launch</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-10 lg:py-16 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold text-indigo-700 dark:text-indigo-300 backdrop-blur-md shadow-2xs animate-in fade-in slide-in-from-top-3 duration-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 animate-spin" />
            <span>Unified Digital Public Infrastructure (DPI) for Land Governance</span>
          </div>

          {/* Main Title & Hero Name */}
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              {APP_NAME}
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 dark:from-indigo-300 dark:via-cyan-200 dark:to-emerald-300 bg-clip-text text-transparent">
              {t("welcomeTagline") || "Unified Digital Infrastructure for Land Governance"}
            </p>
          </div>

          {/* Subtitle Paragraph */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {t("welcomeSubtitle") ||
              "National Cadastral Digital Public Infrastructure (DPI) integrating fragmented state land registries into ISO/BND standards, real-time 3D WebGL GIS, satellite encroachment AI, and tamper-proof blockchain audit trails."}
          </p>

          {/* Primary Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 animate-in fade-in slide-in-from-bottom-5 duration-800">
            <Link
              href="/"
              data-testid="welcome-launch-btn"
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all cursor-pointer group"
            >
              <span>{t("launchDashboard") || "Launch Dashboard"}</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/api-explorer"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Interactive API Explorer</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <BarChart3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Officer Analytics</span>
            </Link>

            <Link
              href="/national-view"
              data-testid="welcome-national-view-btn"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>National Rollout Map</span>
            </Link>

            <Link
              href="/impact"
              data-testid="welcome-national-impact-btn"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>National Economic Case</span>
            </Link>

            <Link
              href="/bank-verification"
              data-testid="welcome-bank-verification-btn"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Bank Verification</span>
            </Link>

            <Link
              href="/admin/onboard-state"
              data-testid="welcome-onboard-state-btn"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Onboard State</span>
            </Link>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-500 flex items-center gap-2 font-mono pt-1">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Enter ↵</kbd> or click to open dashboard immediately</span>
          </div>

          {/* Animated 4-Stat Impact Counters Section */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80">
            <ImpactStatsCounter variant="hero-cards" />
          </div>

          {/* Pre-loaded Technical Architecture Specs Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/70 backdrop-blur-sm shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Pre-loaded Parcels</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">11 Plots</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">UP • TN • Chandigarh</span>
            </div>

            <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/70 backdrop-blur-sm shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Schema Adapter</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300 font-mono">14-Digit</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5 font-medium">BND / ULPIN Standard</span>
            </div>

            <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/70 backdrop-blur-sm shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Audit Ledger</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-300 font-mono">SHA-256</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 block mt-0.5 font-medium">PoA Block Explorer</span>
            </div>

            <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/70 backdrop-blur-sm shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">GIS Engine</span>
              <span className="text-lg font-bold text-cyan-600 dark:text-cyan-300 font-mono">2D / 3D</span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 block mt-0.5 font-medium">Leaflet & deck.gl</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCROLL-DRIVEN PARALLAX TYPOGRAPHY & TECH STACK REVEAL (Skiper UI) */}
        {/* ========================================================================= */}
        <section className="mt-14 sm:mt-20">
          <Skiper31
            headlineText="LAND STACK DPI"
            subheadingText="Interoperable with India's National Digital Stack"
          />
        </section>

        {/* ========================================================================= */}
        {/* CORE CAPABILITY CARDS (Bento Grid) */}
        {/* ========================================================================= */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Multi-State Interoperability */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-2xs hover:shadow-md transition-all group">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Cross-State Registry Normalization</span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">Step 6.1</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dynamically maps disparate state cadastres (Tamil Nadu Patta/Chitta, Chandigarh e-Sampark, UP e-Khasra) into a unified canonical schema.
            </p>
          </div>

          {/* Card 2: 3D WebGL & Regional Heatmap */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/50 shadow-2xs hover:shadow-md transition-all group">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>3D Extrusion & Heatmap Analytics</span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">deck.gl + Leaflet</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extrudes property tax values in 3D perspective and renders dual-mode regional heatmaps for Dispute Density and Mutation Velocity.
            </p>
          </div>

          {/* Card 3: Satellite AI & Time Machine */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all group">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
              <Satellite className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>AI Encroachment & 10-Year Time Machine</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">2015 – 2025</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Multi-temporal satellite change detection (Sentinel-2) with an interactive 10-year cross-fade slider tracking NDVI and impervious surface.
            </p>
          </div>

          {/* Card 4: Tamper-Proof Audit Trail */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 shadow-2xs hover:shadow-md transition-all group">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Blockchain Cryptographic Audit Trail</span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">PoA Ledger</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Hash-chained block explorer visual where each deed, mutation, and caveat is linked via SHA-256 hashes with real-time tamper detection.
            </p>
          </div>

          {/* Card 5: Web Speech API for Low Literacy */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/50 shadow-2xs hover:shadow-md transition-all group">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>Rural Citizen Voice Search</span>
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">Web Speech API</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enables rural or low-literacy citizens to speak queries like &quot;show me parcel 245&quot; or &quot;who owns khasra 88&quot; in Hindi or English.
            </p>
          </div>

          {/* Card 6: DPDP Act Privacy & Consent */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 shadow-2xs hover:shadow-md transition-all group">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3.5 group-hover:scale-105 transition-transform shadow-2xs">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
              <span>DPDP Act 2023 Consent Protocol</span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">Section 6 Compliant</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cryptographic consent token handshake restricting citizen PII until the landowner explicitly grants access to inspecting officers.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE ECOSYSTEM & INSTITUTIONAL INTEROPERABILITY ARCHITECTURE */}
        {/* ========================================================================= */}
        <section id="ecosystem" className="mt-16 sm:mt-24 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Network className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>National Institutional Interoperability</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              How Land Stack Connects India&apos;s Institutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Live animated bilateral synchronization between the Land Stack DPI core and 6 key institutional nodes. Click any department to inspect active API gateways, latency, and data protocols.
            </p>
          </div>

          <EcosystemDiagram />
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-500 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{APP_NAME}</span>
          <span>•</span>
          <span>Digital India Land Governance Platform</span>
          <span>•</span>
          <span className="text-slate-500 dark:text-slate-400">Open DPI Architecture</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
            Map Explorer
          </Link>
          <Link href="/api-explorer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
            API Docs
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">
            Officer Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
