import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Database,
  ChevronDown,
  Sparkles,
  User,
  Shield,
  BarChart3,
  Terminal,
  Network,
  Globe,
  Landmark,
  Sun,
  Moon,
  HelpCircle,
  Tv,
  PlusCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import type { StateDataSource } from "@/lib/schemaAdapter";
import type { LandParcelFeature, LandParcelFeatureCollection } from "@/data/parcels";
import ParcelSearchBar from "@/components/ParcelSearchBar";
import NotificationBell from "@/components/NotificationBell";
import SettingsKebabMenu from "@/components/SettingsKebabMenu";
import { Button } from "@/components/ui";
import { useAppStore, UserRole } from "@/lib/store";

export interface HeaderProps {
  role?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  dataSource?: StateDataSource;
  onDataSourceChange?: (source: StateDataSource) => void;
  activeParcels: LandParcelFeatureCollection;
  onSelectParcel: (parcel: LandParcelFeature) => void;
  onOpenCommandPalette: () => void;
  onOpenTour: () => void;
  onOpenEcosystem: () => void;
  onOpenShortcuts: () => void;
  onOpenBankVerification?: () => void;
  onSelectParcelByUlpin: (ulpin: string) => void;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
  onResetDemo?: () => void;
}

export default function Header({
  role,
  onRoleChange,
  dataSource,
  onDataSourceChange,
  activeParcels,
  onSelectParcel,
  onOpenCommandPalette,
  onOpenTour,
  onOpenEcosystem,
  onOpenShortcuts,
  onOpenBankVerification,
  onSelectParcelByUlpin,
  isPresentationMode,
  onTogglePresentationMode,
  onResetDemo,
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const storeRole = useAppStore((s) => s.userRole);
  const storeSetRole = useAppStore((s) => s.setUserRole);
  const storeDataSource = useAppStore((s) => s.currentDataSource);
  const storeSetDataSource = useAppStore((s) => s.setCurrentDataSource);
  const storeIsPresentationMode = useAppStore((s) => s.isPresentationMode);
  const storeTogglePresentationMode = useAppStore((s) => s.togglePresentationMode);
  const storeResetDemoState = useAppStore((s) => s.resetDemoState);
  const storeOpenBankModal = useAppStore((s) => s.openBankModal);

  const currentRole = role ?? storeRole;
  const handleRoleChange = onRoleChange ?? storeSetRole;
  const currentDataSource = dataSource ?? storeDataSource;
  const handleDataSourceChange = onDataSourceChange ?? storeSetDataSource;
  const currentIsPresentationMode = isPresentationMode ?? storeIsPresentationMode;
  const handleTogglePresentationMode = onTogglePresentationMode ?? storeTogglePresentationMode;
  const handleResetDemo = onResetDemo ?? storeResetDemoState;
  const handleOpenBankModal = onOpenBankVerification ?? storeOpenBankModal;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
      <div
        className={`mx-auto h-16 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ${
          currentIsPresentationMode ? "w-full px-4 sm:px-6" : "max-w-7xl px-4 sm:px-6 lg:px-8"
        }`}
      >
        {/* Brand Logo & Name */}
        <Link
          href="/welcome"
          title="Open Land Stack Welcome Landing Page"
          className="flex items-center gap-3 shrink-0 hover:opacity-90 transition group cursor-pointer"
        >
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="hidden md:block">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {t("brandTitle")}
            </span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {t("landRecords")}
            </span>
          </div>
        </Link>

        {/* Cross-State Data Source Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center">
            <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 absolute left-2.5 pointer-events-none" />
            <select
              id="data-source-select"
              value={currentDataSource}
              onChange={(e) => handleDataSourceChange(e.target.value as StateDataSource)}
              className="pl-8 pr-7 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none shadow-xs"
              aria-label="Data Source"
            >
              <option value="Tamil Nadu">{t("dataSourcePrefix")} {t("dataSourceTN")}</option>
              <option value="Chandigarh">{t("dataSourcePrefix")} {t("dataSourceCH")}</option>
              <option value="Unified View">{t("dataSourcePrefix")} {t("dataSourceUnified")}</option>
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Functional Parcel Search Bar */}
        <div data-tour="search-bar" className="flex items-center md:flex-1 md:max-w-sm lg:max-w-md mx-1 sm:mx-2">
          <ParcelSearchBar
            role={currentRole}
            parcels={activeParcels}
            onSelectParcel={onSelectParcel}
            onOpenCommandPalette={onOpenCommandPalette}
          />
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 'Take a Tour' Button for Hackathon Judges */}
          <Button
            variant="gradient"
            size="sm"
            data-testid="take-tour-btn"
            onClick={onOpenTour}
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />}
            title="Take a 60-Second Guided Tour"
          >
            {t("takeTour") || "Take a Tour"}
          </Button>

          {/* Language Toggle Button (EN/HI) */}
          <div
            data-testid="language-toggle-group"
            className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0"
          >
            <button
              type="button"
              data-testid="lang-btn-en"
              onClick={() => setLanguage("en")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
              }`}
              title="Switch to English (EN)"
              aria-label="English"
            >
              EN
            </button>
            <span className="text-slate-300 dark:text-zinc-600 text-xs select-none">/</span>
            <button
              type="button"
              data-testid="lang-btn-hi"
              onClick={() => setLanguage("hi")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
              }`}
              title="Switch to Hindi (हिन्दी)"
              aria-label="Hindi"
            >
              HI
            </button>
          </div>

          {/* Citizen / Officer Role Toggle */}
          <div
            data-tour="role-toggle"
            className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700"
          >
            <button
              type="button"
              onClick={() => handleRoleChange("citizen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentRole === "citizen"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>{t("roleCitizen")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("officer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentRole === "officer"
                  ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{t("roleOfficer")}</span>
            </button>

            <button
              type="button"
              data-testid="role-bank-btn"
              onClick={() => handleRoleChange("bank")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentRole === "bank"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>Bank</span>
            </button>
          </div>

          {/* Bank Verification Modal Trigger Button */}
          <button
            type="button"
            data-testid="bank-verification-header-btn"
            onClick={handleOpenBankModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Launch Interstate Bank Verification & Collateral Report"
          >
            <Landmark className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden xl:inline">Bank Verification</span>
          </button>

          {/* Officer Dashboard Link */}
          {currentRole === "officer" && (
            <Link
              href="/dashboard"
              data-testid="officer-dashboard-nav-link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-xs font-semibold transition-all shadow-xs"
              title="Open Officer Executive Dashboard"
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{t("officerDashboard")}</span>
            </Link>
          )}

          {/* Officer-Only Onboard New State Admin Wizard Link */}
          {currentRole === "officer" && (
            <Link
              href="/admin/onboard-state"
              data-testid="onboard-state-nav-link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 text-xs font-semibold transition-all shadow-xs"
              title="Onboard New State Schema Adapter (Admin)"
            >
              <PlusCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden xl:inline">Onboard State</span>
            </Link>
          )}

          {/* API Explorer Link Button - Hidden in Presentation Mode */}
          {!currentIsPresentationMode && (
            <Link
              href="/api-explorer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-800 text-xs font-semibold transition-all shadow-xs"
              title="Open Cadastral REST API Explorer"
            >
              <Terminal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">{t("apiExplorer")}</span>
            </Link>
          )}

          {/* National Phased Rollout View Link Button - Hidden in Presentation Mode */}
          {!currentIsPresentationMode && (
            <Link
              href="/national-view"
              data-testid="national-view-nav-link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-800 text-xs font-semibold transition-all shadow-xs"
              title="Inspect India-Wide National Phased Rollout Map"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">National View</span>
            </Link>
          )}

          {/* Institutional Ecosystem View Trigger Button */}
          <Button
            variant="secondary"
            size="sm"
            data-testid="ecosystem-view-header-btn"
            onClick={onOpenEcosystem}
            leftIcon={<Network className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
            title="Inspect 6-Department Institutional Interoperability Architecture"
          >
            <span className="hidden md:inline">{t("ecosystemView") || "Ecosystem"}</span>
          </Button>

          {/* Real-Time Government Activity Notification Bell */}
          <NotificationBell onSelectParcelByUlpin={onSelectParcelByUlpin} />

          {/* Dark / Light Mode Toggle Button */}
          <Button
            variant="secondary"
            size="icon"
            data-testid="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? t("lightMode") || "Switch to Light Mode" : t("darkMode") || "Switch to Dark Mode"}
            aria-label={t("toggleTheme") || "Toggle theme"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 animate-in spin-in-90 duration-200" />
            )}
          </Button>

          {/* Keyboard Shortcuts Help Button ('?') */}
          <Button
            variant="secondary"
            size="icon"
            data-testid="keyboard-shortcuts-header-btn"
            onClick={onOpenShortcuts}
            title={t("keyboardShortcuts") || "Keyboard Shortcuts (?)"}
            aria-label={t("keyboardShortcuts") || "Keyboard Shortcuts"}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Presentation Mode Toggle Button */}
          <button
            type="button"
            data-testid="presentation-mode-header-btn"
            onClick={handleTogglePresentationMode}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center font-bold text-xs ${
              currentIsPresentationMode
                ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/25 ring-2 ring-amber-400/40"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-zinc-600"
            }`}
            title={
              currentIsPresentationMode
                ? "Exit Presentation Mode (Alt+P / Esc)"
                : "Enter Presentation Mode (Alt+P - Projector & Kiosk View)"
            }
            aria-label={t("presentationMode") || "Presentation Mode"}
          >
            <Tv className="h-4 w-4" />
          </button>

          {/* Presentation Controls / Demo Settings Kebab Menu */}
          <SettingsKebabMenu
            onResetDemo={handleResetDemo}
            onOpenTour={onOpenTour}
            onOpenEcosystem={onOpenEcosystem}
            onOpenCommandPalette={onOpenCommandPalette}
            onOpenShortcuts={onOpenShortcuts}
            isPresentationMode={currentIsPresentationMode}
            onTogglePresentationMode={handleTogglePresentationMode}
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
            currentDataSource={currentDataSource}
            onDataSourceChange={handleDataSourceChange}
          />
        </div>
      </div>
    </header>
  );
}
