"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Grid,
  ChevronDown,
  Landmark,
  Globe,
  TrendingUp,
  Terminal,
  Network,
  BarChart3,
  PlusCircle,
  Radar,
  Home,
  X,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { UserRole } from "@/lib/store";

export interface PortalsDropdownProps {
  currentRole: UserRole;
  onOpenBankModal?: () => void;
  onOpenEcosystem?: () => void;
}

export default function PortalsDropdown({
  currentRole,
  onOpenBankModal,
  onOpenEcosystem,
}: PortalsDropdownProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block shrink-0">
      {/* Portals Trigger Button */}
      <button
        type="button"
        data-testid="portals-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
          isOpen
            ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20"
            : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
        }`}
        title={language === "hi" ? "इकोसिस्टम पोर्टल्स व टूल्स" : "Explore Land Stack Portals & Tools"}
        aria-label="Explore Portals"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Grid className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">
          {language === "hi" ? "पोर्टल्स" : "Portals"}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          data-testid="portals-dropdown-menu"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl shadow-2xl z-[190] p-3 text-xs space-y-2 animate-in fade-in-50 zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 px-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Grid className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight block">
                  {language === "hi" ? "लैंड स्टैक इकोसिस्टम पोर्टल्स" : "Ecosystem Portals & Modules"}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                  Interoperable Land Governance DPI
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded-lg transition"
              aria-label="Close menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Access Grid */}
          <div className="space-y-1">
            {/* 1. Interstate Bank Verification */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenBankModal) onOpenBankModal();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Landmark className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {language === "hi" ? "अंतर-राज्यीय बैंक सत्यापन" : "Interstate Bank Verification"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Unified collateral check across TN & CH
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                Modal
              </span>
            </button>

            {/* 2. National Rollout View */}
            <Link
              href="/national-view"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {language === "hi" ? "अखिल भारतीय राष्ट्रीय दृश्य" : "National Phased Rollout"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    28 States + 8 UTs onboarding timeline & map
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </Link>

            {/* 3. National Economic Impact Dashboard */}
            <Link
              href="/impact"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {language === "hi" ? "राष्ट्रीय आर्थिक प्रभाव डैशबोर्ड" : "National Economic Impact"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    20+ Cr parcels, ₹28,500 Cr saved
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </Link>

            {/* 4. AI Land Valuation Simulator */}
            <Link
              href="/valuation-simulator"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {language === "hi" ? "AI भूमि मूल्यांकन सिम्युलेटर" : "AI Land Valuation Simulator"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    10-Year growth projection & tax yield ML
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </Link>

            {/* 5. Cadastral REST API Explorer */}
            <Link
              href="/api-explorer"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {language === "hi" ? "कैडस्ट्रल एपीआई एक्सप्लोरर" : "Cadastral REST API Explorer"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Interactive OpenAPI test harness
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </Link>

            {/* 6. Institutional Ecosystem Sync */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenEcosystem) onOpenEcosystem();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Network className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {language === "hi" ? "संस्थागत इकोसिस्टम दृश्य" : "Institutional Ecosystem Sync"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    6-Department live synchronization diagram
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                Diagram
              </span>
            </button>

            {/* 7. Drone LiDAR Survey Flight */}
            <Link
              href="/drone-survey"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Radar className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {language === "hi" ? "ड्रोन LiDAR सर्वेक्षण" : "Drone LiDAR 3D Survey"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Interactive 3D photogrammetry flight
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
            </Link>

            {/* 8. Officer-Only Portals */}
            {currentRole === "officer" && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/80 dark:hover:bg-amber-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {language === "hi" ? "अधिकारी कार्यकारी डैशबोर्ड" : "Officer Executive Dashboard"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        Dispute triage, mutation approvals & metrics
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                    Admin
                  </span>
                </Link>

                <Link
                  href="/admin/onboard-state"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <PlusCircle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {language === "hi" ? "नया राज्य एडेप्टर जोड़ें" : "Onboard New State Adapter"}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        3-Step schema normalization wizard
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                    Admin
                  </span>
                </Link>
              </>
            )}

            {/* 9. Welcome Landing Page */}
            <Link
              href="/welcome"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                  <Home className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {language === "hi" ? "लैंड स्टैक स्वागत पृष्ठ" : "Welcome Landing & Architecture"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Platform pitch & feature matrix
                  </span>
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
