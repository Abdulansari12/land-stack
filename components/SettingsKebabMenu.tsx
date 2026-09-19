"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  RotateCcw,
  Sparkles,
  Network,
  Command,
  User,
  Shield,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  X,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Keyboard,
  Tv,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import type { StateDataSource } from "@/lib/schemaAdapter";
import { useAppStore, UserRole } from "@/lib/store";

export interface SettingsKebabMenuProps {
  onResetDemo?: () => void;
  onOpenTour?: () => void;
  onOpenEcosystem?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  currentDataSource?: StateDataSource;
  onDataSourceChange?: (source: StateDataSource) => void;
}

export default function SettingsKebabMenu({
  onResetDemo,
  onOpenTour,
  onOpenEcosystem,
  onOpenCommandPalette,
  onOpenShortcuts,
  isPresentationMode,
  onTogglePresentationMode,
  currentRole,
  onRoleChange,
  currentDataSource,
  onDataSourceChange,
}: SettingsKebabMenuProps) {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const storeRole = useAppStore((s) => s.userRole);
  const storeSetRole = useAppStore((s) => s.setUserRole);
  const storeDataSource = useAppStore((s) => s.currentDataSource);
  const storeSetDataSource = useAppStore((s) => s.setCurrentDataSource);
  const storeIsPresentationMode = useAppStore((s) => s.isPresentationMode);
  const storeTogglePresentationMode = useAppStore((s) => s.togglePresentationMode);
  const storeResetDemoState = useAppStore((s) => s.resetDemoState);

  const activeRole = currentRole ?? storeRole;
  const handleRoleChange = onRoleChange ?? storeSetRole;
  const activeDataSource = currentDataSource ?? storeDataSource;
  const handleDataSourceChange = onDataSourceChange ?? storeSetDataSource;
  const activeIsPresentationMode = isPresentationMode ?? storeIsPresentationMode;
  const handleTogglePresentationMode = onTogglePresentationMode ?? storeTogglePresentationMode;
  const handleResetDemo = onResetDemo ?? storeResetDemoState;

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

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleTriggerReset = () => {
    setIsOpen(false);
    handleResetDemo();
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Kebab / Settings Menu Button */}
      <button
        type="button"
        data-testid="demo-settings-kebab-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-center ${
          isOpen
            ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20"
            : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
        }`}
        title={language === "hi" ? "डेमो सेटिंग्स व रीसेट मेनू" : "Presentation & Demo Settings"}
        aria-label="Demo Settings"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div
          data-testid="demo-settings-dropdown"
          className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl shadow-2xl z-[180] p-3 text-xs space-y-3 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800 px-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight block">
                  {language === "hi" ? "डेमो व सत्र नियंत्रण" : "Demo & Session Controls"}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                  Judge Presentation Mode
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

          {/* ========================================================================= */}
          {/* PRIMARY HERO ACTION: RESET DEMO */}
          {/* ========================================================================= */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-50/90 via-amber-50/50 to-indigo-50/60 dark:from-rose-950/40 dark:via-zinc-900 dark:to-indigo-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                <span>Presentation Restart</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                0s Reload
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              {language === "hi"
                ? "सभी अनुमतियां (DPDP consent), सक्रिय AI फिल्टर, सूचनाएं व चयनित पार्सल प्रारंभिक स्थिति में रीसेट करें।"
                : "Instantly wipes consent approvals, active NL filters, notifications & drawer state for the next judge panel without page reload."}
            </p>

            <button
              type="button"
              data-testid="reset-demo-btn"
              onClick={handleTriggerReset}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer group"
            >
              <RotateCcw className="h-3.5 w-3.5 group-hover:-rotate-90 transition-transform duration-300" />
              <span>{language === "hi" ? "डेमो पूरी तरह रीसेट करें" : "Reset Demo Baseline"}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* QUICK SHORTCUTS */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 block">
              Quick Shortcuts
            </span>

            {/* Guided Tour */}
            {onOpenTour && (
              <button
                type="button"
                data-testid="menu-start-tour-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenTour();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs">
                      {language === "hi" ? "60-सेकंड गाइडेड टूर" : "60-Second Guided Tour"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Step-by-step hackathon walkthrough
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  Start
                </span>
              </button>
            )}

            {/* Ecosystem View */}
            {onOpenEcosystem && (
              <button
                type="button"
                data-testid="menu-open-ecosystem-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenEcosystem();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Network className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs">
                      {language === "hi" ? "संस्थागत इकोसिस्टम" : "Institutional Ecosystem"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      6-Department live data sync diagram
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                  View
                </span>
              </button>
            )}

            {/* Command Palette */}
            {onOpenCommandPalette && (
              <button
                type="button"
                data-testid="menu-open-cmd-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Command className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs">
                      {language === "hi" ? "कमांड पैलेट" : "Command Palette"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Quick jump to parcels & actions
                    </span>
                  </div>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Keyboard Shortcuts */}
            {onOpenShortcuts && (
              <button
                type="button"
                data-testid="menu-open-shortcuts-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenShortcuts();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Keyboard className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs">
                      {language === "hi" ? "कीबोर्ड शॉर्टकट" : "Keyboard Shortcuts"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Power-user cheat sheet
                    </span>
                  </div>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  ?
                </kbd>
              </button>
            )}

            {/* Presentation Mode Toggle */}
            {onTogglePresentationMode && (
              <button
                type="button"
                data-testid="menu-toggle-presentation-btn"
                onClick={() => {
                  setIsOpen(false);
                  handleTogglePresentationMode();
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-left ${
                  activeIsPresentationMode
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80"
                    : "hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                    activeIsPresentationMode
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                  }`}>
                    <Tv className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block text-xs">
                      {language === "hi" ? "प्रस्तुति मोड (प्रोजेक्टर)" : "Presentation Mode (Projector)"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      {activeIsPresentationMode ? "Active • 3s idle cursor auto-hide" : "Maximize map & scale fonts"}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  activeIsPresentationMode
                    ? "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                }`}>
                  {activeIsPresentationMode ? "ON" : "Alt+P"}
                </span>
              </button>
            )}
          </div>

            {/* ========================================================================= */}
            {/* QUICK TOGGLE PILLS (ROLE & STATE) */}
            {/* ========================================================================= */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              {/* Role switch */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  Active Persona:
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("citizen")}
                    className={`px-2 py-0.5 rounded transition ${
                      activeRole === "citizen"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                        : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("officer")}
                    className={`px-2 py-0.5 rounded transition ${
                      activeRole === "officer"
                        ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs font-bold"
                        : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("bank")}
                    className={`px-2 py-0.5 rounded transition ${
                      activeRole === "bank"
                        ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                        : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    Bank
                  </button>
                </div>
              </div>

              {/* State registry switch */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  Cadastre State:
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-semibold">
                  {(["Tamil Nadu", "Chandigarh", "Unified View"] as StateDataSource[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleDataSourceChange(st)}
                      className={`px-2 py-0.5 rounded transition ${
                        activeDataSource === st
                          ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                          : "text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      {st === "Tamil Nadu" ? "TN" : st === "Chandigarh" ? "CH" : "All"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between px-1 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
            <span>Land Stack DPI v2.4</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Ready for Pitch</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
