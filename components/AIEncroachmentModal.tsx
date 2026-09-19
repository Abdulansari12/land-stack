"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Scan,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Satellite,
  Calendar,
  Sparkles,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import type { LandParcelProperties } from "@/data/parcels";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import toast from "react-hot-toast";

interface AIEncroachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: LandParcelProperties | null;
}

export default function AIEncroachmentModal({
  isOpen,
  onClose,
  parcel,
}: AIEncroachmentModalProps) {
  const [loading, setLoading] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [noticeGenerated, setNoticeGenerated] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key listener for accessible modal dialog
  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    onClose,
  });

  const runScan = () => {
    setLoading(true);
    setScanError(null);
    setNoticeGenerated(false);
    const timer = setTimeout(() => {
      setLoading(false);
      toast.error("Satellite Anomaly Detected: 94% confidence", {
        id: "scan-result",
        icon: "🚨",
        duration: 4000,
        style: {
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid #ef4444",
          borderRadius: "12px",
        },
      });
    }, 1800);
    return () => clearTimeout(timer);
  };

  // Trigger AI scan simulation each time the modal opens
  useEffect(() => {
    if (isOpen) {
      const cleanup = runScan();
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen || !parcel) return null;

  const handleGenerateNotice = () => {
    setNoticeGenerated(true);
    const refNo = `ENC-${parcel.khasraNo.replace(/[^a-zA-Z0-9]/g, "")}-2026`;
    toast.success(
      (t) => (
        <div className="flex flex-col gap-1 pr-1">
          <div className="flex items-center justify-between gap-4 font-semibold text-slate-100">
            <span>Official Notice Dispatched</span>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-slate-300">
            Notice #{refNo} • Khasra #{parcel.khasraNo}
          </div>
          <div className="text-[11px] text-green-400">
            Summons & inspection order sent to {parcel.ownerName}.
          </div>
        </div>
      ),
      {
        id: `notice-${refNo}`,
        duration: 6000,
        icon: "📜",
        style: {
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid #22c55e",
          borderRadius: "12px",
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-encroachment-title"
        className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Satellite className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="ai-encroachment-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
                >
                  <span>AI Satellite Encroachment Detection</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    Officer View
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Khasra #{parcel.khasraNo} • ULPIN: {parcel.ulpin} • Owner: {parcel.ownerName}
              </p>
            </div>
          </div>

          {/* 'X' Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close encroachment detection modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            /* 2-Second Simulated AI Scan Loading State */
            <div className="min-h-[380px] flex flex-col items-center justify-center text-center p-8">
              {/* Radar Scanner Animation */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute h-28 w-28 rounded-full border border-indigo-400/40 animate-ping" />
                <div className="absolute h-20 w-20 rounded-full border-2 border-indigo-500/60 animate-pulse" />
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Scan className="h-7 w-7 animate-spin" />
                </div>
              </div>

              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Analyzing satellite imagery...
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                Aligning multi-temporal Sentinel-2 and high-resolution Cartosat-3 spectral bands for cadastral footprint #{parcel.khasraNo}...
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Segmentation CNN Model: ResNet-UNet-v4</span>
              </div>
            </div>
          ) : (
            /* Split-Screen Satellite Comparison */
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Top Warning Banner */}
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-red-900 dark:text-red-200">
                    Cadastral Anomaly Identified:
                  </span>{" "}
                  <span className="text-red-800 dark:text-red-300">
                    New unauthorized permanent masonry footprint detected beyond permitted agricultural setback boundary lines.
                  </span>
                </div>
              </div>

              {/* Split-Screen: Past Image vs Current Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 1. Past Image */}
                <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 text-white shadow-sm">
                  {/* Header Badge */}
                  <div className="px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Past Image (Baseline)</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      15 Jan 2024 • 0.5m GSD
                    </span>
                  </div>

                  {/* Satellite Visual Simulation */}
                  <div className="relative h-64 w-full bg-emerald-950 flex items-center justify-center overflow-hidden select-none">
                    {/* Simulated Aerial Agricultural Landscape */}
                    <svg
                      role="img"
                      aria-label="Simulated baseline multi-temporal satellite imagery from 15 January 2024 showing agricultural parcel with permitted setbacks and no unauthorized structures"
                      className="w-full h-full object-cover"
                      viewBox="0 0 400 300"
                    >
                      <title>Baseline Multi-temporal Satellite Imagery (15 Jan 2024)</title>
                      <rect width="400" height="300" fill="#1b4332" />
                      {/* Crop fields / plots */}
                      <polygon points="10,20 180,30 170,160 20,150" fill="#2d6a4f" stroke="#40916c" strokeWidth="1.5" />
                      <polygon points="190,30 380,40 370,170 180,160" fill="#40916c" stroke="#52b788" strokeWidth="1.5" />
                      <polygon points="30,170 190,180 180,290 20,280" fill="#52b788" opacity="0.8" stroke="#74c69d" strokeWidth="1.5" />
                      <polygon points="200,180 390,190 380,290 190,280" fill="#2d6a4f" opacity="0.9" stroke="#40916c" strokeWidth="1.5" />
                      {/* Access Track */}
                      <path d="M 0 165 Q 200 175 400 168" stroke="#d8f3dc" strokeWidth="4" fill="none" opacity="0.4" />
                      {/* Boundary boundary overlay */}
                      <polygon points="190,30 380,40 370,170 180,160" fill="none" stroke="#60a5fa" strokeDasharray="4 4" strokeWidth="2" />
                    </svg>

                    {/* Cadastral Label */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
                      Clear Agricultural Field
                    </div>

                    <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded">
                      Coords: 26.8451° N, 80.9412° E
                    </div>
                  </div>
                </div>

                {/* 2. Current Image */}
                <div className="flex flex-col rounded-xl overflow-hidden border border-red-300 dark:border-red-900 bg-slate-900 text-white shadow-md relative">
                  {/* Header Badge */}
                  <div className="px-3.5 py-2.5 bg-red-950/80 border-b border-red-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-red-200">
                      <Satellite className="h-3.5 w-3.5 text-red-400" />
                      <span>Current Image (Recent Pass)</span>
                    </div>
                    <span className="text-[11px] font-mono text-red-300 bg-red-900/50 px-2 py-0.5 rounded">
                      04 Sep 2026 • Real-time
                    </span>
                  </div>

                  {/* Satellite Visual Simulation with Encroachment */}
                  <div className="relative h-64 w-full bg-emerald-950 flex items-center justify-center overflow-hidden select-none">
                    <svg
                      role="img"
                      aria-label="Simulated current real-time satellite imagery pass from September 2026 showing newly detected unauthorized concrete masonry structure encroaching beyond agricultural setback lines"
                      className="w-full h-full object-cover"
                      viewBox="0 0 400 300"
                    >
                      <title>Current Satellite Imagery with Encroachment (04 Sep 2026)</title>
                      <rect width="400" height="300" fill="#1b4332" />
                      {/* Fields */}
                      <polygon points="10,20 180,30 170,160 20,150" fill="#2d6a4f" stroke="#40916c" strokeWidth="1.5" />
                      <polygon points="190,30 380,40 370,170 180,160" fill="#40916c" stroke="#52b788" strokeWidth="1.5" />
                      <polygon points="30,170 190,180 180,290 20,280" fill="#52b788" opacity="0.8" stroke="#74c69d" strokeWidth="1.5" />
                      <polygon points="200,180 390,190 380,290 190,280" fill="#2d6a4f" opacity="0.9" stroke="#40916c" strokeWidth="1.5" />
                      {/* Access Track */}
                      <path d="M 0 165 Q 200 175 400 168" stroke="#d8f3dc" strokeWidth="4" fill="none" opacity="0.4" />
                      {/* Unapproved Structure */}
                      <rect x="235" y="65" width="85" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                      <rect x="250" y="75" width="40" height="35" fill="#cbd5e1" />
                      {/* Machinery dots */}
                      <circle cx="335" cy="85" r="4" fill="#f59e0b" />
                      <circle cx="342" cy="98" r="3" fill="#f59e0b" />
                    </svg>

                    {/* RED BOUNDING BOX with AI Detection Tag */}
                    <div className="absolute top-[48px] left-[215px] w-[135px] h-[105px] border-2 border-status-disputed bg-status-disputed/20 rounded-md shadow-lg shadow-status-disputed/30 flex flex-col justify-between p-1 animate-pulse">
                      {/* Crosshair markers */}
                      <div className="w-full flex justify-between text-status-disputed text-[9px] font-mono leading-none">
                        <span>┌</span>
                        <span>┐</span>
                      </div>
                      <div className="w-full flex justify-between text-status-disputed text-[9px] font-mono leading-none">
                        <span>└</span>
                        <span>┘</span>
                      </div>
                    </div>

                    {/* AI Bounding Box Floating Label */}
                    <div className="absolute top-[22px] right-3 bg-status-disputed text-white font-bold px-2.5 py-1 rounded-md text-[11px] shadow-lg border border-status-disputed-border flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-white animate-bounce" />
                      <span>Unauthorized Construction Detected: 94% confidence</span>
                    </div>

                    <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded">
                      Spectral Variance: +48.2% NDVI Drop
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary Table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800">
                  <div className="text-slate-500 dark:text-zinc-400">Estimated Encroached Area</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    ~510 sq. meters
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800">
                  <div className="text-slate-500 dark:text-zinc-400">Permitted Land Use</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {parcel.landUse}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800">
                  <div className="text-slate-500 dark:text-zinc-400">AI Confidence Score</div>
                  <div className="text-base font-bold text-status-disputed dark:text-status-disputed-text mt-0.5">
                    94.3% (Critical Alert)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!loading && (
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left">
              Generated under Uttar Pradesh Revenue Code § 67 Encroachment Adjudication.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={runScan}
                disabled={loading}
                aria-label="Re-scan satellite imagery"
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Re-scan</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cancel and close dialog"
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel / Dismiss
              </button>

              <button
                type="button"
                onClick={handleGenerateNotice}
                disabled={noticeGenerated}
                aria-label={noticeGenerated ? "Notice Dispatched" : "Generate Official Notice"}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  noticeGenerated
                    ? "bg-status-verified hover:bg-status-verified-hover"
                    : "bg-status-disputed hover:bg-status-disputed-hover active:bg-status-disputed"
                }`}
              >
                {noticeGenerated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Notice Dispatched</span>
                  </>
                ) : (
                  <>
                    <FileWarning className="h-4 w-4" />
                    <span>Generate Official Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
