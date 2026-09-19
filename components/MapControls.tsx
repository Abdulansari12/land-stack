import React from "react";
import { Layers, Box, Flame, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface MapControlsProps {
  viewMode: "2D" | "3D";
  onViewModeChange: (mode: "2D" | "3D") => void;
  isHeatmapActive: boolean;
  onToggleHeatmap: () => void;
  heatmapMode: "disputes" | "transactions";
  onHeatmapModeChange: (mode: "disputes" | "transactions") => void;
}

export default function MapControls({
  viewMode,
  onViewModeChange,
  isHeatmapActive,
  onToggleHeatmap,
  heatmapMode,
  onHeatmapModeChange,
}: MapControlsProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Top-Right Floating Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Heatmap Mode Selector Dropdown (Shown when Heatmap is Active in 2D mode) */}
        {isHeatmapActive && viewMode === "2D" && (
          <div className="flex items-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1 rounded-xl border border-amber-300 dark:border-amber-700 shadow-md animate-in fade-in slide-in-from-right-2 duration-150">
            <select
              data-testid="heatmap-mode-select"
              value={heatmapMode}
              onChange={(e) =>
                onHeatmapModeChange(e.target.value as "disputes" | "transactions")
              }
              className="pl-2 pr-6 py-1 text-xs font-bold bg-transparent text-amber-800 dark:text-amber-300 focus:outline-none cursor-pointer appearance-none"
              aria-label="Heatmap Mode"
            >
              <option
                value="disputes"
                className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              >
                🔴 {t("heatmapModeDisputes") || "Dispute Density"}
              </option>
              <option
                value="transactions"
                className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              >
                🟢 {t("heatmapModeTransactions") || "Transaction Activity"}
              </option>
            </select>
            <ChevronDown className="h-3 w-3 text-amber-600 dark:text-amber-400 -ml-4 mr-1 pointer-events-none" />
          </div>
        )}

        {/* Heatmap Toggle Button */}
        <button
          type="button"
          data-testid="toggle-heatmap-btn"
          onClick={onToggleHeatmap}
          aria-label="Toggle Regional Heatmap Layer"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md ${
            isHeatmapActive && viewMode === "2D"
              ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-bold ring-2 ring-amber-400/40"
              : "bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/90 dark:border-zinc-700/90"
          }`}
          title="Toggle Regional Heatmap Layer (leaflet.heat)"
        >
          <Flame
            className={`h-3.5 w-3.5 ${
              isHeatmapActive && viewMode === "2D"
                ? "text-yellow-200 animate-pulse"
                : "text-amber-500"
            }`}
          />
          <span>{t("heatmapToggle") || "Heatmap"}</span>
        </button>

        {/* 2D / 3D View Toggle Floating Pill */}
        <div className="flex items-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/90 dark:border-zinc-700/90 shadow-md">
          <button
            type="button"
            data-testid="toggle-view-2d"
            onClick={() => onViewModeChange("2D")}
            aria-label="Switch to 2D Flat Cadastral Map"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "2D"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Switch to 2D Flat Cadastral Map"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t("view2D") || "2D Flat"}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-view-3d"
            onClick={() => onViewModeChange("3D")}
            aria-label="Switch to 3D Extruded Parcels"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "3D"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            title="Switch to 3D Extruded Parcels (deck.gl WebGL)"
          >
            <Box className="h-3.5 w-3.5" />
            <span>{t("view3D") || "3D Extrusion"}</span>
          </button>
        </div>
      </div>

      {/* Floating Heatmap Scale Legend (Bottom-Left) */}
      {isHeatmapActive && viewMode === "2D" && (
        <div
          data-testid="heatmap-legend"
          className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700 text-white shadow-2xl text-xs flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-auto min-w-[220px]"
        >
          <div className="flex items-center justify-between font-bold text-[11px] text-slate-200">
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              {heatmapMode === "disputes"
                ? t("heatmapModeDisputes")
                : t("heatmapModeTransactions")}
            </span>
            <span className="text-[10px] font-mono text-amber-300">
              {heatmapMode === "disputes" ? "LEGAL RISK" : "ACTIVITY"}
            </span>
          </div>

          <div
            className={`h-2.5 w-full rounded-full ${
              heatmapMode === "disputes"
                ? "bg-gradient-to-r from-blue-500 via-amber-400 to-red-600"
                : "bg-gradient-to-r from-cyan-400 via-emerald-400 to-fuchsia-600"
            }`}
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>
              {heatmapMode === "disputes"
                ? t("heatmapLowRisk") || "Low Risk (0.1)"
                : t("heatmapLowActivity") || "Low Turnover"}
            </span>
            <span>
              {heatmapMode === "disputes"
                ? t("heatmapHighDispute") || "High Dispute (1.0)"
                : t("heatmapHighActivity") || "Active Turnover"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
