"use client";

import React, { useRef } from "react";
import { X, Network, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import EcosystemDiagram from "@/components/EcosystemDiagram";
import { useLanguage } from "@/context/LanguageContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface EcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EcosystemModal({ isOpen, onClose }: EcosystemModalProps) {
  const { language } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      data-testid="ecosystem-modal-overlay"
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ecosystem-modal-title"
        tabIndex={-1}
        data-testid="ecosystem-modal-card"
        className="relative w-full max-w-5xl bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 focus:outline-none"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ecosystem-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {language === "hi"
                    ? "राष्ट्रीय भू-प्रशासन डिजिटल इकोसिस्टम"
                    : "National Land Stack Interoperability Ecosystem"}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  DPI Architecture
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "hi"
                  ? "6 विभागों के बीच वास्तविक समय में समन्वय — राजस्व, निबंधन, बैंक, न्यायालय व नगर पालिका"
                  : "Live bidirectional synchronization across Revenue, Registration, Banks, Courts & Utilities"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/welcome#ecosystem"
              onClick={onClose}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-800 shadow-2xs"
            >
              <span>Landing Page View</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              type="button"
              data-testid="close-ecosystem-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close ecosystem modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content containing the Diagram */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <EcosystemDiagram />
        </div>
      </div>
    </div>
  );
}
