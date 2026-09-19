"use client";

import React, { useEffect, useRef } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  Search,
  MapPin,
  User,
  Shield,
  ShieldCheck,
  Database,
  Terminal,
  Sparkles,
  BarChart3,
  Box,
  Layers,
  Check,
  ChevronRight,
  ArrowRight,
  CornerDownLeft,
  Globe,
  Moon,
  Sun,
  Network,
  RotateCcw,
  Keyboard,
  Tv,
  Landmark,
} from "lucide-react";
import { LandParcelFeature } from "@/data/parcels";
import { StateDataSource } from "@/lib/schemaAdapter";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAppStore, UserRole } from "@/lib/store";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: LandParcelFeature[];
  onSelectParcel: (parcel: LandParcelFeature) => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  currentDataSource?: StateDataSource;
  onDataSourceChange?: (source: StateDataSource) => void;
  onStartTour: () => void;
  viewMode?: "2D" | "3D";
  onToggleViewMode?: (mode: "2D" | "3D") => void;
  onResetDemo?: () => void;
  onOpenShortcuts?: () => void;
  onTogglePresentationMode?: () => void;
  onOpenBankVerification?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  parcels,
  onSelectParcel,
  currentRole: propRole,
  onRoleChange: propRoleChange,
  currentDataSource: propDataSource,
  onDataSourceChange: propDataSourceChange,
  onStartTour,
  viewMode = "2D",
  onToggleViewMode,
  onResetDemo: propResetDemo,
  onOpenShortcuts,
  onTogglePresentationMode: propTogglePresentationMode,
  onOpenBankVerification: propOpenBankVerification,
}: CommandPaletteProps) {
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const storeRole = useAppStore((s) => s.userRole);
  const storeSetRole = useAppStore((s) => s.setUserRole);
  const storeDataSource = useAppStore((s) => s.currentDataSource);
  const storeSetDataSource = useAppStore((s) => s.setCurrentDataSource);
  const storeResetDemo = useAppStore((s) => s.resetDemoState);
  const storeTogglePresentationMode = useAppStore((s) => s.togglePresentationMode);
  const storeOpenBankModal = useAppStore((s) => s.openBankModal);

  const currentRole = propRole ?? storeRole;
  const onRoleChange = propRoleChange ?? storeSetRole;
  const currentDataSource = propDataSource ?? storeDataSource;
  const onDataSourceChange = propDataSourceChange ?? storeSetDataSource;
  const onResetDemo = propResetDemo ?? storeResetDemo;
  const onTogglePresentationMode = propTogglePresentationMode ?? storeTogglePresentationMode;
  const onOpenBankVerification = propOpenBankVerification ?? storeOpenBankModal;

  const containerRef = useRef<HTMLDivElement>(null);

  // Trap focus and listen to Escape key to close
  useFocusTrap({
    isOpen,
    containerRef,
    onClose,
    autoFocus: false, // Command.Input has autoFocus
  });

  if (!isOpen) return null;

  const handleSelectParcel = (parcel: LandParcelFeature) => {
    onSelectParcel(parcel);
    onClose();
  };

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    onClose();
  };

  const handleDataSourceSelect = (source: StateDataSource) => {
    onDataSourceChange(source);
    onClose();
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleTour = () => {
    onClose();
    onStartTour();
  };

  const handleViewToggle = () => {
    if (onToggleViewMode) {
      onToggleViewMode(viewMode === "2D" ? "3D" : "2D");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      data-testid="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Global Cadastral Command Palette"
    >
      {/* Click outside backdrop to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-150"
      >
        <Command
          label="Global Cadastral Command Palette"
          loop
          className="w-full flex flex-col"
        >
          {/* Top Search Input */}
          <div className="flex items-center px-4 border-b border-slate-200 dark:border-zinc-800">
            <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
            <Command.Input
              autoFocus
              placeholder={
                t("cmdPalettePlaceholder") ||
                "Type a command or search parcels by name, ULPIN, Khasra..."
              }
              className="w-full h-14 bg-transparent text-sm sm:text-base text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none font-medium"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close command palette"
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <Command.List className="max-h-[380px] sm:max-h-[420px] overflow-y-auto p-2 scroll-smooth">
            <Command.Empty className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
              {t("cmdNoResults") || "No matching parcels or commands found."}
            </Command.Empty>

            {/* Land Parcels Group */}
            {parcels.length > 0 && (
              <Command.Group
                heading={
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 px-2 py-1.5 block">
                    {t("cmdGroupParcels") || "Land Parcels"} ({parcels.length})
                  </span>
                }
              >
                {parcels.map((parcel) => {
                  const p = parcel.properties;
                  const isDisputed = (p.rorStatus || "").toLowerCase().includes("dispute");
                  const isVerified =
                    (p.rorStatus || "").toLowerCase().includes("verif") ||
                    (p.rorStatus || "").toLowerCase().includes("signed");

                  return (
                    <Command.Item
                      key={p.ulpin}
                      value={`${p.ulpin} ${p.ownerName} ${p.khasraNo} ${p.landUse} parcel`}
                      onSelect={() => handleSelectParcel(parcel)}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 group-data-[selected=true]:bg-indigo-100 dark:group-data-[selected=true]:bg-indigo-900/60 flex items-center justify-center shrink-0 text-slate-500 dark:text-zinc-400 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400 truncate">
                              {p.ownerName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 shrink-0">
                              {p.ulpin}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {p.khasraNo} • {p.landUse} • {p.areaInHectares || 1} Ha
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isDisputed
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60"
                              : isVerified
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/60"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60"
                          }`}
                        >
                          {p.rorStatus}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Switch User Role Group */}
            <Command.Group
              heading={
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 px-2 py-1.5 block mt-2">
                  {t("cmdGroupRoles") || "Switch User Role"}
                </span>
              }
            >
              <Command.Item
                value="switch role citizen view public"
                onSelect={() => handleRoleSelect("citizen")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                      {t("cmdSwitchToCitizen") || "Switch to Citizen View"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Public RoR transparency & owner portal
                    </span>
                  </div>
                </div>
                {currentRole === "citizen" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </Command.Item>

              <Command.Item
                value="switch role officer workspace enforcement"
                onSelect={() => handleRoleSelect("officer")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-amber-50 dark:data-[selected=true]:bg-amber-950/60 data-[selected=true]:text-amber-600 dark:data-[selected=true]:text-amber-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-amber-600 dark:group-data-[selected=true]:text-amber-400">
                      {t("cmdSwitchToOfficer") || "Switch to Officer View"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Enforcement flags, AI radar scan & DPDP locks
                    </span>
                  </div>
                </div>
                {currentRole === "officer" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </Command.Item>

              <Command.Item
                value="switch role bank financial collateral underwriter verification cersai"
                onSelect={() => handleRoleSelect("bank")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-950/60 data-[selected=true]:text-emerald-600 dark:data-[selected=true]:text-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Landmark className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-emerald-600 dark:group-data-[selected=true]:text-emerald-400">
                      Switch to Bank / Underwriter View
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Interstate collateral verification & CERSAI lien registration
                    </span>
                  </div>
                </div>
                {currentRole === "bank" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </Command.Item>
            </Command.Group>

            {/* Switch Data Source State Group */}
            <Command.Group
              heading={
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 px-2 py-1.5 block mt-2">
                  {t("cmdGroupDataSource") || "Switch Data Source State"}
                </span>
              }
            >
              <Command.Item
                value="state tamil nadu patta chitta"
                onSelect={() => handleDataSourceSelect("Tamil Nadu")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    <Database className="h-3.5 w-3.5" />
                  </div>
                  <span>Tamil Nadu e-Services (Patta / Chitta)</span>
                </div>
                {currentDataSource === "Tamil Nadu" && (
                  <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </Command.Item>

              <Command.Item
                value="state chandigarh kadambari ut"
                onSelect={() => handleDataSourceSelect("Chandigarh")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    <Database className="h-3.5 w-3.5" />
                  </div>
                  <span>Chandigarh (Kadambari UT Portal)</span>
                </div>
                {currentDataSource === "Chandigarh" && (
                  <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </Command.Item>

              <Command.Item
                value="state unified view multi-state all records"
                onSelect={() => handleDataSourceSelect("Unified View")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    <Database className="h-3.5 w-3.5" />
                  </div>
                  <span>Unified View (Cross-State Combined)</span>
                </div>
                {currentDataSource === "Unified View" && (
                  <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </Command.Item>
            </Command.Group>

            {/* Navigation & Tools Group */}
            <Command.Group
              heading={
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500 px-2 py-1.5 block mt-2">
                  {t("cmdGroupNav") || "Navigation & Actions"}
                </span>
              }
            >
              <Command.Item
                value="open api explorer swagger postman developer rest"
                onSelect={() => handleNavigate("/api-explorer")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Terminal className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                      {t("cmdOpenApiExplorer") || "Open Cadastral REST API Explorer"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Test live endpoints & ULPIN queries
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="national view phased rollout india map states ut pilot"
                onSelect={() => handleNavigate("/national-view")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-950/60 data-[selected=true]:text-emerald-600 dark:data-[selected=true]:text-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-emerald-600 dark:group-data-[selected=true]:text-emerald-400">
                      National Phased Rollout Map
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Inspect all 36 States & UTs onboarding status
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="onboard new state admin wizard schema adapter scale national rollout karnataka maharashtra gujarat officer"
                onSelect={() => handleNavigate("/admin/onboard-state")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-950/60 data-[selected=true]:text-purple-600 dark:data-[selected=true]:text-purple-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-purple-600 dark:group-data-[selected=true]:text-purple-400">
                      Onboard New State Admin Wizard
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Visual schema mapping engine to scale across all 28 states &amp; 8 UTs
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="open bank verification interstate collateral request cersai borrower multi state loan tamil nadu chandigarh"
                onSelect={() => {
                  onClose();
                  onOpenBankVerification();
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Landmark className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                      Open Interstate Bank Verification Portal
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Cross-state collateral search & consolidated dossier (TN & Chandigarh)
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="start take tour guided walkthrough judge demo"
                onSelect={handleTour}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-950/60 data-[selected=true]:text-purple-600 dark:data-[selected=true]:text-purple-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-purple-600 dark:group-data-[selected=true]:text-purple-400">
                      {t("cmdStartTour") || "Launch 60-Second Guided Tour"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      5-step spotlight tour for hackathon evaluation
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="toggle 2d 3d extrusion view height buildings webgl deckgl"
                onSelect={handleViewToggle}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    {viewMode === "2D" ? (
                      <Box className="h-3.5 w-3.5 text-indigo-500" />
                    ) : (
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                      {viewMode === "2D" ? "Switch to 3D Extruded View" : "Switch to 2D Cadastral View"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {viewMode === "2D" ? "Deck.gl WebGL 3D buildings" : "Leaflet flat 2D map"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {viewMode === "2D" ? "3D" : "2D"}
                </span>
              </Command.Item>

              <Command.Item
                value="open officer executive analytics dashboard recharts"
                onSelect={() => handleNavigate("/dashboard")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-amber-50 dark:data-[selected=true]:bg-amber-950/60 data-[selected=true]:text-amber-600 dark:data-[selected=true]:text-amber-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-amber-600 dark:group-data-[selected=true]:text-amber-400">
                      {t("cmdOpenDashboard") || "Open Officer Executive Dashboard"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Disputed titles, mutations & land use charts
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="open welcome landing page hero home about land stack dpi national"
                onSelect={() => handleNavigate("/welcome")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                      Open Welcome Landing Page (/welcome)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      National Land Stack hero overview with animated India map
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="public title verification verify qr code digilocker ror official legal check"
                onSelect={() => handleNavigate("/verify/UP26A8941B")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-emerald-50 dark:data-[selected=true]:bg-emerald-950/60 data-[selected=true]:text-emerald-600 dark:data-[selected=true]:text-emerald-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-emerald-600 dark:group-data-[selected=true]:text-emerald-400">
                      Public Title Verification (QR Verifier)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      DigiLocker-style instant online title certificate verification
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="ecosystem interoperability architecture 6 departments revenue registration banks courts utilities municipal planning"
                onSelect={() => handleNavigate("/welcome#ecosystem")}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-purple-50 dark:data-[selected=true]:bg-purple-950/60 data-[selected=true]:text-purple-600 dark:data-[selected=true]:text-purple-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Network className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-purple-600 dark:group-data-[selected=true]:text-purple-400">
                      Institutional Interoperability Ecosystem View
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Live animated sync across Revenue, Registration, Banks, Courts & Utilities
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-data-[selected=true]:translate-x-0.5 transition-transform" />
              </Command.Item>

              <Command.Item
                value="toggle switch dark light mode theme night day cartodb"
                onSelect={() => {
                  toggleTheme();
                  onClose();
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                    {isDark ? (
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Moon className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400">
                      {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {isDark ? "CartoDB Positron Light & crisp UI" : "CartoDB Dark Matter & midnight UI"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {isDark ? "Light" : "Dark"}
                </span>
              </Command.Item>

              <Command.Item
                value="keyboard shortcuts hotkeys key bindings help question cheatsheet power user cheat"
                onSelect={() => {
                  onClose();
                  onOpenShortcuts?.();
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-slate-700 dark:text-zinc-300 data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/60 data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Keyboard className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-indigo-600 dark:data-[selected=true]:text-indigo-400">
                      Show Keyboard Shortcuts & Hotkeys
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Power-user cheat sheet (?, /, Alt+T, Alt+V, Alt+D, Alt+R)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  ?
                </span>
              </Command.Item>

              <Command.Item
                value="presentation mode projector kiosk big screen scale fonts auto hide cursor maximize map"
                onSelect={() => {
                  onClose();
                  onTogglePresentationMode?.();
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-amber-700 dark:text-amber-300 data-[selected=true]:bg-amber-50 dark:data-[selected=true]:bg-amber-950/60 data-[selected=true]:text-amber-600 dark:data-[selected=true]:text-amber-400"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Tv className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 group-data-[selected=true]:text-amber-600 dark:group-data-[selected=true]:text-amber-400">
                      Toggle Presentation Mode (Projector & Big Screen)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Maximize map, scale fonts & auto-hide cursor after 3s of inactivity
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  Alt+P
                </span>
              </Command.Item>

              <Command.Item
                value="reset demo state factory baseline clean session restart presentation judge wipe cache"
                onSelect={() => {
                  if (onResetDemo) {
                    onResetDemo();
                  } else {
                    window.dispatchEvent(new CustomEvent("landstack:reset-demo"));
                  }
                  onClose();
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors text-rose-700 dark:text-rose-400 data-[selected=true]:bg-rose-50 dark:data-[selected=true]:bg-rose-950/60 data-[selected=true]:text-rose-600 dark:data-[selected=true]:text-rose-300"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-rose-900 dark:text-rose-200 group-data-[selected=true]:text-rose-600 dark:data-[selected=true]:text-rose-300">
                      Reset Demo State (Factory Baseline)
                    </span>
                    <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                      Wipe active filters, consent, drawer & reset to clean citizen view
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  0s Reload
                </span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Bottom Footer Bar with Keyboard Hints */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 shadow-2xs font-semibold">
                  ↑
                </kbd>
                <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 shadow-2xs font-semibold">
                  ↓
                </kbd>
                <span className="ml-1">{t("cmdHintNavigate") || "navigate"}</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 shadow-2xs font-semibold flex items-center">
                  <CornerDownLeft className="h-2.5 w-2.5 mr-0.5" /> Enter
                </kbd>
                <span className="ml-1">{t("cmdHintSelect") || "select"}</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 shadow-2xs font-semibold">
                  ESC
                </kbd>
                <span className="ml-1">{t("cmdHintClose") || "close"}</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>Press</span>
              <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold">
                ⌘K
              </kbd>
              <span>anytime</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
