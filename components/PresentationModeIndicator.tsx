import React from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface PresentationModeIndicatorProps {
  onExit: () => void;
}

export default function PresentationModeIndicator({
  onExit,
}: PresentationModeIndicatorProps) {
  const { t } = useLanguage();

  return (
    <div
      data-testid="presentation-mode-indicator"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-slate-900/90 dark:bg-slate-950/90 text-white rounded-full shadow-2xl backdrop-blur border border-white/20 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span>{t("presentationMode") || "Presentation Mode"}</span>
      </div>
      <span className="text-slate-400">|</span>
      <span className="text-slate-300 hidden sm:inline">
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-mono">
          Esc
        </kbd>{" "}
        or{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-mono">
          Alt+P
        </kbd>{" "}
        to exit
      </span>
      <button
        type="button"
        onClick={onExit}
        className="p-1 rounded-full hover:bg-white/20 transition-colors text-slate-300 hover:text-white cursor-pointer"
        title="Exit Presentation Mode"
        aria-label="Exit Presentation Mode"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
