"use client";

import React from "react";
import { Layers, Compass } from "lucide-react";

export interface MapLoadingSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function MapLoadingSkeleton({
  className = "",
  style,
}: MapLoadingSkeletonProps) {
  return (
    <div
      data-testid="map-loading-skeleton"
      role="status"
      aria-label="Loading GIS Cadastral Map"
      style={style}
      className={`relative flex-1 min-h-[420px] sm:min-h-[500px] md:min-h-[580px] w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-900/90 overflow-hidden select-none flex flex-col justify-between p-4 shadow-sm animate-pulse ${className}`}
    >
      {/* Background Animated GIS Coordinate Grid */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid-skeleton-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-400 dark:text-zinc-600"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-skeleton-pattern)" />
        </svg>
      </div>

      {/* Simulated Ghost Cadastral Parcel Boundaries */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-25 pointer-events-none">
        <svg
          viewBox="0 0 600 400"
          className="w-3/4 max-w-[500px] h-auto object-contain"
        >
          <polygon
            points="100,80 280,60 270,190 80,180"
            className="fill-slate-300 dark:fill-zinc-800 stroke-slate-400 dark:stroke-zinc-700"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <polygon
            points="290,60 480,75 470,200 280,190"
            className="fill-indigo-200/50 dark:fill-indigo-950/40 stroke-indigo-400 dark:stroke-indigo-600"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <polygon
            points="80,190 270,200 250,330 70,310"
            className="fill-emerald-200/40 dark:fill-emerald-950/30 stroke-emerald-400 dark:stroke-emerald-600"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <polygon
            points="280,200 470,210 460,340 260,330"
            className="fill-slate-300 dark:fill-zinc-800 stroke-slate-400 dark:stroke-zinc-700"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        </svg>
      </div>

      {/* Top Floating Controls Skeletons */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        {/* Top-Left Telemetry Pill Placeholder */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-xs">
          <Compass className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 animate-spin" />
          <div className="h-3 w-28 bg-slate-200 dark:bg-zinc-700 rounded-md" />
        </div>

        {/* Top-Right Map Controls Placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-white/80 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs" />
          <div className="h-8 w-32 bg-white/80 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs" />
        </div>
      </div>

      {/* Center Radar Loading Pulse */}
      <div className="relative z-10 self-center flex flex-col items-center justify-center p-6 text-center max-w-sm">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute h-14 w-14 rounded-full border border-indigo-400/40 dark:border-indigo-600/40 animate-ping" />
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Layers className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Loading Cadastral Spatial Engine...
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Rendering dynamic Leaflet tiles & boundary vectors
        </p>

        <div className="w-36 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-2/3 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* Bottom Floating Legend Skeleton */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="w-36 p-3 rounded-xl bg-white/85 dark:bg-zinc-800/85 border border-slate-200 dark:border-zinc-700 shadow-sm space-y-2">
          <div className="h-2.5 w-16 bg-slate-300 dark:bg-zinc-600 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-700 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-700 rounded" />
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
          EPSG:3857 • WGS84
        </div>
      </div>
    </div>
  );
}
