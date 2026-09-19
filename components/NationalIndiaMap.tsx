"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { RotateCcw, Sparkles, Navigation, Layers } from "lucide-react";
import {
  PilotState,
  indiaBoundaryGeoJSON,
} from "@/data/nationalRollout";

export interface NationalIndiaMapProps {
  states: PilotState[];
  selectedState: PilotState | null;
  onSelectState: (state: PilotState) => void;
  isDarkMode?: boolean;
  className?: string;
}

/**
 * Controller to handle programmatic camera fly-to animations
 */
function MapCameraHandler({
  selectedState,
  resetTrigger,
}: {
  selectedState: PilotState | null;
  resetTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedState) {
      map.flyToBounds(selectedState.bounds, {
        padding: [60, 60],
        maxZoom: 8,
        duration: 1.4,
      });
    }
  }, [selectedState, map]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo([22.5, 79.0], 4.5, {
        duration: 1.2,
      });
    }
  }, [resetTrigger, map]);

  return null;
}

/**
 * Helper to build custom HTML markers with glowing radar rings and status tags
 */
function createStateDivIcon(state: PilotState, isSelected: boolean): L.DivIcon {
  let markerHtml = "";

  if (state.status === "live") {
    markerHtml = `
      <div class="relative flex items-center justify-center group cursor-pointer">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
        <span class="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg transition-all transform ${
          isSelected
            ? "bg-emerald-600 text-white ring-4 ring-emerald-300 dark:ring-emerald-700 scale-125 z-30"
            : "bg-emerald-500 text-white group-hover:scale-110 group-hover:bg-emerald-600 z-20"
        }">
          <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>${state.code}</span>
          <span class="bg-emerald-700/60 px-1 py-0.2 text-[9px] rounded font-mono">${state.parcelsCount}</span>
        </span>
      </div>
    `;
  } else if (state.status === "in-progress") {
    markerHtml = `
      <div class="relative flex items-center justify-center group cursor-pointer">
        <span class="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md transition-all transform ${
          isSelected
            ? "bg-amber-600 text-white ring-3 ring-amber-300 dark:ring-amber-700 scale-120 z-30"
            : "bg-amber-500 text-white group-hover:scale-105 group-hover:bg-amber-600 z-10"
        }">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>${state.code}</span>
          <span class="text-[9px] opacity-80">P2</span>
        </span>
      </div>
    `;
  } else {
    markerHtml = `
      <div class="relative flex items-center justify-center group cursor-pointer">
        <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-xs transition-all ${
          isSelected
            ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900 ring-2 ring-indigo-400 scale-115 z-30"
            : "bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 z-0"
        }">
          ${state.code}
        </span>
      </div>
    `;
  }

  return L.divIcon({
    className: "custom-state-marker-wrapper",
    html: markerHtml,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });
}

export default function NationalIndiaMap({
  states,
  selectedState,
  onSelectState,
  isDarkMode = false,
  className = "",
}: NationalIndiaMapProps) {
  const [resetTrigger, setResetTrigger] = React.useState(0);

  const tileLayerUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md ${className}`}>
      <MapContainer
        center={[22.5, 79.0]}
        zoom={4.5}
        minZoom={4}
        maxZoom={10}
        maxBounds={[
          [4.0, 65.0],
          [39.0, 100.0],
        ]}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer url={tileLayerUrl} attribution={tileAttribution} />

        {/* Simplified India Outer Boundary Layer */}
        <GeoJSON
          data={indiaBoundaryGeoJSON}
          style={{
            color: "#6366f1", // Indigo accent border
            weight: 2.2,
            opacity: 0.85,
            fillColor: "#818cf8",
            fillOpacity: isDarkMode ? 0.08 : 0.05,
            dashArray: "4 2",
          }}
        />

        <MapCameraHandler selectedState={selectedState} resetTrigger={resetTrigger} />

        {/* Interactive State Markers */}
        {states.map((st) => {
          const isSelected = selectedState?.id === st.id;
          const icon = createStateDivIcon(st, isSelected);

          return (
            <Marker
              key={st.id}
              position={st.center}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectState(st);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                <div className="px-1 py-0.5 text-xs text-slate-900 font-sans">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{st.name}</span>
                    {st.status === "live" && (
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px]">
                        LIVE ({st.parcelsCount})
                      </span>
                    )}
                    {st.status === "in-progress" && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded text-[9px]">
                        Phase 2
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {st.status === "live"
                      ? "Click to zoom & explore live parcels"
                      : `${st.registrySystem} • ${st.targetTimeline}`}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Top-Right Map Controls: Reset to National View */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setResetTrigger((prev) => prev + 1);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold shadow-md border border-slate-200 dark:border-zinc-700 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Reset to Full India National View"
          aria-label="Reset to Full India View"
        >
          <RotateCcw className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Full India View</span>
        </button>
      </div>

      {/* Bottom-Left Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-lg text-xs space-y-2 pointer-events-auto">
        <div className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
          <Layers className="h-3.5 w-3.5 text-indigo-500" />
          <span>Phased Rollout Legend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            Phase 1: Live Pilots (3)
          </span>
          <span className="text-[10px] text-slate-400">TN, CH, UP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0"></span>
          <span className="font-medium text-amber-700 dark:text-amber-400">
            Phase 2: In-Progress (4)
          </span>
          <span className="text-[10px] text-slate-400">KA, MH, TS, GJ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-zinc-600 shrink-0"></span>
          <span className="text-slate-600 dark:text-zinc-400">
            Phase 3: Not Yet Launched (29)
          </span>
        </div>
      </div>
    </div>
  );
}
