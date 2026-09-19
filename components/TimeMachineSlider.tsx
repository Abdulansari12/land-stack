"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  History,
  Play,
  Pause,
  RotateCcw,
  Satellite,
  Layers,
  Leaf,
  Building2,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { LandParcelProperties } from "@/data/parcels";
import { useLanguage } from "@/context/LanguageContext";

interface TimeMachineSliderProps {
  parcel: LandParcelProperties;
}

export default function TimeMachineSlider({ parcel }: TimeMachineSliderProps) {
  const { t } = useLanguage();
  const [year, setYear] = useState<number>(2025);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play timelapse loop: advances 1 year every 900ms
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setYear((prev) => (prev >= 2025 ? 2015 : prev + 1));
      }, 950);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Compute smooth continuous cross-fade opacities for 3 satellite epochs
  // Epoch 1 (2015 - 2020): Virgin farmland
  // Epoch 2 (2020 - 2023): Grading & excavation
  // Epoch 3 (2023 - 2025): Constructed footprint
  let opacity1 = 0;
  let opacity2 = 0;
  let opacity3 = 0;

  if (year <= 2020) {
    const progress = (year - 2015) / 5; // 0 to 1
    opacity1 = 1 - progress;
    opacity2 = progress;
    opacity3 = 0;
  } else {
    const progress = (year - 2020) / 5; // 0 to 1
    opacity1 = 0;
    opacity2 = 1 - progress;
    opacity3 = progress;
  }

  // Simulated scientific telemetry metrics
  const progressRatio = (year - 2015) / 10;
  const ndvi = (0.84 - progressRatio * 0.68).toFixed(2);
  const imperviousPercent = (2.8 + progressRatio * 76.4).toFixed(1);

  const getStageDescription = () => {
    if (year <= 2017) {
      return {
        stage: "Pristine Farmland",
        desc: "Virgin agricultural soil with dense crop canopy and natural irrigation drainage canals.",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    }
    if (year <= 2021) {
      return {
        stage: "Ground Excavation & Access Road",
        desc: "Site clearing, access track paving, and preliminary perimeter plinth boundary masonry.",
        color: "text-amber-600 dark:text-amber-400",
      };
    }
    return {
      stage: "Constructed Masonry Footprint",
      desc: "Permanent multi-story building, asphalt courtyard, and rooftop infrastructure.",
      color: "text-blue-600 dark:text-blue-400",
    };
  };

  const currentStage = getStageDescription();

  return (
    <div
      data-testid="time-machine-container"
      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3.5"
    >
      {/* Header with Title & Live Year Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t("timeMachineTitle") || "Cadastral Time Machine (2015 – 2025)"}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                AI SAR
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {t("timeMachineSubtitle") || "Multi-Temporal Satellite Land-Use Change Timelapse"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-xs">
            {year}
          </span>
        </div>
      </div>

      {/* Satellite Imagery Viewport with Cross-Fade Layers */}
      <div className="relative h-56 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner select-none group">
        {/* SATELLITE LAYER 1: 2015 Pristine Farmland */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: opacity1 }}
        >
          <svg
            role="img"
            aria-label="Satellite imagery layer for 2015 showing pristine green agricultural farmland"
            className="w-full h-full object-cover"
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
          >
            <title>2015 Pristine Farmland Satellite Imagery</title>
            {/* Base lush soil */}
            <rect width="400" height="240" fill="#1b4332" />
            {/* Cropland parcels */}
            <polygon points="10,15 190,25 180,130 15,120" fill="#2d6a4f" stroke="#40916c" strokeWidth="1.5" />
            <polygon points="200,25 390,30 380,135 190,130" fill="#40916c" stroke="#52b788" strokeWidth="1.5" />
            <polygon points="25,135 185,145 175,230 15,225" fill="#52b788" opacity="0.85" stroke="#74c69d" strokeWidth="1.5" />
            <polygon points="195,145 385,150 375,230 185,230" fill="#2d6a4f" opacity="0.9" stroke="#40916c" strokeWidth="1.5" />
            {/* Water canal */}
            <path d="M 0 130 Q 200 138 400 132" stroke="#0284c7" strokeWidth="4" fill="none" opacity="0.6" />
            {/* Tree groves */}
            <circle cx="90" cy="70" r="14" fill="#14532d" opacity="0.9" />
            <circle cx="110" cy="80" r="10" fill="#166534" opacity="0.8" />
            <circle cx="280" cy="85" r="16" fill="#14532d" opacity="0.9" />
            <circle cx="300" cy="75" r="12" fill="#166534" opacity="0.8" />
            <circle cx="100" cy="180" r="12" fill="#14532d" opacity="0.7" />
            {/* Cadastral Target Parcel Overlay */}
            <polygon
              points="195,25 385,30 375,135 185,130"
              fill="rgba(56, 189, 248, 0.08)"
              stroke="#38bdf8"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* SATELLITE LAYER 2: 2020 Development & Grading */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: opacity2 }}
        >
          <svg
            role="img"
            aria-label="Satellite imagery layer for 2020 showing land development, grading, and foundation trenches"
            className="w-full h-full object-cover"
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
          >
            <title>2020 Land Development & Grading Satellite Imagery</title>
            {/* Base earth */}
            <rect width="400" height="240" fill="#2d281e" />
            {/* Neighboring plots still green */}
            <polygon points="10,15 190,25 180,130 15,120" fill="#2d6a4f" stroke="#40916c" strokeWidth="1.5" />
            <polygon points="25,135 185,145 175,230 15,225" fill="#3f6212" opacity="0.85" stroke="#65a30d" strokeWidth="1.5" />
            {/* Graded brown plot */}
            <polygon points="195,25 385,30 375,135 185,130" fill="#78350f" stroke="#92400e" strokeWidth="1.5" />
            {/* Asphalt access track */}
            <path d="M 0 130 L 400 130" stroke="#475569" strokeWidth="7" fill="none" opacity="0.9" />
            <path d="M 280 130 L 280 90" stroke="#475569" strokeWidth="5" fill="none" opacity="0.9" />
            {/* Concrete boundary foundation trenches */}
            <rect x="215" y="45" width="130" height="70" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeDasharray="6 3" />
            {/* Sand and gravel piles */}
            <circle cx="240" cy="65" r="9" fill="#fcd34d" opacity="0.8" />
            <circle cx="320" cy="100" r="11" fill="#cbd5e1" opacity="0.8" />
            {/* Machinery dots */}
            <rect x="290" y="70" width="12" height="7" fill="#f59e0b" />
            {/* Cadastral Target Boundary */}
            <polygon
              points="195,25 385,30 375,135 185,130"
              fill="none"
              stroke="#fbbf24"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* SATELLITE LAYER 3: 2025 Modern Constructed Footprint */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: opacity3 }}
        >
          <svg
            role="img"
            aria-label="Satellite imagery layer for 2026 showing modern constructed building footprint and paved access"
            className="w-full h-full object-cover"
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
          >
            <title>2026 Modern Constructed Building Satellite Imagery</title>
            {/* Base urbanized terrain */}
            <rect width="400" height="240" fill="#0f172a" />
            {/* Neighboring semi-developed parcels */}
            <polygon points="10,15 190,25 180,130 15,120" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <polygon points="25,135 185,145 175,230 15,225" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Paved plot with multi-story footprint */}
            <polygon points="195,25 385,30 375,135 185,130" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            {/* Main Roadway with striping */}
            <path d="M 0 130 L 400 130" stroke="#1e293b" strokeWidth="10" fill="none" />
            <path d="M 0 130 L 400 130" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 6" fill="none" opacity="0.7" />
            {/* Constructed Concrete Building */}
            <rect x="220" y="45" width="125" height="65" fill="#94a3b8" stroke="#f8fafc" strokeWidth="2" />
            {/* Building rooftop features: HVAC & solar panels */}
            <rect x="230" y="55" width="45" height="45" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
            <rect x="285" y="55" width="50" height="22" fill="#64748b" />
            <circle cx="310" cy="95" r="5" fill="#475569" />
            {/* Paved Parking Lot with vehicles */}
            <rect x="200" y="115" width="80" height="15" fill="#475569" />
            <rect x="210" y="117" width="8" height="11" fill="#ef4444" rx="1" />
            <rect x="225" y="117" width="8" height="11" fill="#f8fafc" rx="1" />
            <rect x="240" y="117" width="8" height="11" fill="#3b82f6" rx="1" />
            {/* Target Cadastral Outline (Amber or Red depending on dispute) */}
            <polygon
              points="195,25 385,30 375,135 185,130"
              fill={parcel.clearOrDisputed === "Disputed" ? "rgba(239, 68, 68, 0.15)" : "none"}
              stroke={parcel.clearOrDisputed === "Disputed" ? "#ef4444" : "#22c55e"}
              strokeDasharray="4 4"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Top-Left Telemetry HUD */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] font-mono text-slate-300">
          <Satellite className="h-3 w-3 text-indigo-400" />
          <span>ISRO Cartosat-3 / Sentinel-2 • 0.5m GSD</span>
        </div>

        {/* Top-Right Resolution & Coords */}
        <div className="absolute top-2.5 right-2.5 z-10 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700/60 text-[9px] font-mono text-slate-400">
          26.845° N, 80.941° E
        </div>

        {/* Center Target Parcel Label Pill */}
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-bold text-white shadow-lg flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Khasra #{parcel.khasraNo}</span>
        </div>

        {/* Bottom Floating Telemetry Bar */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Leaf className="h-3 w-3" />
            <span>NDVI: <strong>{ndvi}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400">
            <Building2 className="h-3 w-3" />
            <span>Impervious: <strong>{imperviousPercent}%</strong></span>
          </div>

          <div className="text-slate-400 hidden sm:block">
            {year <= 2017 ? "Agriculture" : year <= 2021 ? "Developing" : "Commercial/Urban"}
          </div>
        </div>
      </div>

      {/* Stage Narrative Description */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs flex items-start gap-2">
        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className={`font-bold ${currentStage.color} block`}>
            {year}: {currentStage.stage}
          </span>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {currentStage.desc}
          </p>
        </div>
      </div>

      {/* Interactive Time Machine Range Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-400">
          <span>2015</span>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {year}
          </span>
          <span>2025</span>
        </div>

        <input
          type="range"
          min="2015"
          max="2025"
          step="1"
          value={year}
          onChange={(e) => {
            setYear(parseInt(e.target.value, 10));
            setIsPlaying(false);
          }}
          className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          aria-label="Historical satellite imagery year selector"
          aria-valuemin={2015}
          aria-valuemax={2025}
          aria-valuenow={year}
          aria-valuetext={`Year ${year}`}
        />

        {/* Year Tick Marks */}
        <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-zinc-500 px-0.5">
          <span>&apos;15</span>
          <span>&apos;17</span>
          <span>&apos;19</span>
          <span>&apos;21</span>
          <span>&apos;23</span>
          <span>&apos;25</span>
        </div>
      </div>

      {/* Playback Controls & Epoch Presets */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Play / Pause Timelapse Button */}
        <button
          type="button"
          data-testid="timelapse-play-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={
            isPlaying
              ? t("pauseTimelapse") || "Pause timelapse playback"
              : t("playTimelapse") || "Play multi-temporal satellite timelapse"
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
            isPlaying
              ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>{t("pauseTimelapse") || "Pause"}</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{t("playTimelapse") || "Play Timelapse"}</span>
            </>
          )}
        </button>

        {/* Quick Jump Epoch Buttons */}
        <div className="flex items-center gap-1 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => {
              setYear(2015);
              setIsPlaying(false);
            }}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              year === 2015
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
            }`}
          >
            2015
          </button>
          <button
            type="button"
            onClick={() => {
              setYear(2020);
              setIsPlaying(false);
            }}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              year === 2020
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
            }`}
          >
            2020
          </button>
          <button
            type="button"
            onClick={() => {
              setYear(2025);
              setIsPlaying(false);
            }}
            className={`px-2 py-1 rounded-lg transition cursor-pointer ${
              year === 2025
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
            }`}
          >
            2025
          </button>
        </div>
      </div>
    </div>
  );
}
