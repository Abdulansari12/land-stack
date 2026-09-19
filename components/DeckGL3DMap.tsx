"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import {
  LandParcelFeatureCollection,
  LandParcelProperties,
} from "@/data/parcels";
import {
  RotateCcw,
  Compass,
  Box,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export interface DeckGL3DMapProps {
  center?: [number, number]; // [latitude, longitude]
  parcels?: LandParcelFeatureCollection;
  onParcelSelect?: (properties: LandParcelProperties) => void;
  selectedUlpin?: string | null;
  highlightedUlpins?: string[] | null;
  className?: string;
  isDarkMode?: boolean;
}

/**
 * Calculates 3D extrusion height in meters based on market / property tax valuation
 */
export function getParcelElevation(feature: any): number {
  const p = feature?.properties;
  if (!p) return 50;

  // Primary: Market value in INR (ranging from ~40L to ~2Cr)
  if (typeof p.marketValueInINR === "number" && p.marketValueInINR > 0) {
    // ₹40 Lakhs -> ~76m, ₹1 Crore -> ~190m, ₹1.85 Crore -> ~350m
    return Math.max(40, Math.min(480, (p.marketValueInINR / 100000) * 1.9));
  }

  // Guideline value fallback (e.g. Tamil Nadu)
  if (typeof p.guideline_val_inr === "number" && p.guideline_val_inr > 0) {
    return Math.max(40, Math.min(480, (p.guideline_val_inr / 100000) * 2.2));
  }

  // Area fallback
  if (typeof p.areaInHectares === "number" && p.areaInHectares > 0) {
    return Math.max(40, p.areaInHectares * 70);
  }
  if (typeof p.extent_hectares === "number" && p.extent_hectares > 0) {
    return Math.max(40, p.extent_hectares * 70);
  }

  return 60;
}

/**
 * Calculates polygon fill color [R, G, B, A] based on rorStatus and AI highlights
 */
export function getParcelColor(
  feature: any,
  selectedUlpin?: string | null,
  highlightedUlpins?: string[] | null
): [number, number, number, number] {
  const p = feature?.properties;
  const ulpin = p?.ulpin;
  const isSelected = Boolean(selectedUlpin && ulpin === selectedUlpin);
  const hasHighlight = Boolean(highlightedUlpins && highlightedUlpins.length > 0);
  const isHighlighted = Boolean(hasHighlight && highlightedUlpins?.includes(ulpin));
  const isGhosted = Boolean(hasHighlight && !isHighlighted && !isSelected);

  if (isSelected) {
    // Glowing electric blue for user-selected parcel
    return [59, 130, 246, 255];
  }

  if (isHighlighted) {
    // Vibrant electric purple for AI matched parcels
    return [168, 85, 247, 240];
  }

  if (isGhosted) {
    // Dimmed ghosted grey for non-matching parcels
    return [100, 116, 139, 45];
  }

  const rorStatus = (p?.rorStatus || p?.dispute_status || "").toLowerCase();

  if (rorStatus.includes("dispute")) {
    // Red-500 for disputed titles
    return [239, 68, 68, 225];
  }

  if (
    rorStatus.includes("verif") ||
    rorStatus.includes("signed") ||
    rorStatus.includes("clean") ||
    rorStatus.includes("clear")
  ) {
    // Emerald-500 for clear / verified titles
    return [34, 197, 94, 215];
  }

  // Amber-500 for pending mutations or under scrutiny
  return [245, 158, 11, 220];
}

export default function DeckGL3DMap({
  center = [26.843, 80.946],
  parcels,
  onParcelSelect,
  selectedUlpin,
  highlightedUlpins,
  className = "h-full w-full min-h-[500px]",
  isDarkMode,
}: DeckGL3DMapProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const effectiveDark = isDarkMode !== undefined ? isDarkMode : isDark;

  // Controlled ViewState for DeckGL with 3D tilt and bearing
  const [viewState, setViewState] = useState({
    longitude: center[1],
    latitude: center[0],
    zoom: 15.6,
    pitch: 55, // 55° initial isometric tilt
    bearing: 25, // 25° initial rotation
    maxPitch: 85,
    minZoom: 11,
    maxZoom: 20,
  });

  // Re-center if geographic center prop changes (e.g., state switch)
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude: center[0],
      longitude: center[1],
      zoom: 15.6,
    }));
  }, [center]);

  // Camera preset handlers
  const handleResetCamera = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: 55,
      bearing: 25,
      zoom: 15.6,
    }));
  }, []);

  const handleTopDown = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: 0,
      bearing: 0,
    }));
  }, []);

  const handleIsometric = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: 45,
      bearing: 45,
    }));
  }, []);

  const handleRotateStep = useCallback((degrees: number) => {
    setViewState((prev) => ({
      ...prev,
      bearing: (prev.bearing + degrees + 360) % 360,
    }));
  }, []);

  // DeckGL Layer definitions
  const layers = useMemo(() => {
    // 1. TileLayer base map that seamlessly rotates and tilts in 3D (Clean OpenStreetMap, 0 API Key)
    const tileLayer = new TileLayer({
      id: `deckgl-3d-basemap-tiles-${effectiveDark ? "dark" : "light"}`,
      data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props: any) => {
        const { boundingBox } = props.tile;
        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
          tintColor: effectiveDark ? [70, 75, 90, 255] : [255, 255, 255, 255],
        });
      },
    });

    // 2. 3D Extruded Cadastral GeoJsonLayer
    const geoJsonLayer = new GeoJsonLayer({
      id: "deckgl-3d-cadastral-parcels",
      data: parcels as any,
      pickable: true,
      extruded: true,
      wireframe: true,
      filled: true,
      getElevation: (f: any) => getParcelElevation(f),
      getFillColor: (f: any) => getParcelColor(f, selectedUlpin, highlightedUlpins),
      getLineColor: (f: any) => {
        const p = f?.properties;
        const ulpin = p?.ulpin;
        if (selectedUlpin && ulpin === selectedUlpin) {
          return [255, 255, 255, 255];
        }
        if (highlightedUlpins && highlightedUlpins.includes(ulpin)) {
          return [216, 180, 254, 255]; // Purple outline for AI matched parcels
        }
        return [255, 255, 255, 120];
      },
      getLineWidth: 2,
      lineWidthUnits: "pixels",
      autoHighlight: true,
      highlightColor: [99, 102, 241, 150],
      onClick: (info: any) => {
        if (info?.object?.properties && onParcelSelect) {
          onParcelSelect(info.object.properties);
        }
      },
      updateTriggers: {
        getFillColor: [selectedUlpin, highlightedUlpins],
        getLineColor: [selectedUlpin, highlightedUlpins],
        getElevation: [parcels],
      },
    });

    return [tileLayer, geoJsonLayer];
  }, [parcels, selectedUlpin, highlightedUlpins, onParcelSelect]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-slate-950 rounded-2xl ${className}`}
      data-testid="deckgl-3d-container"
    >
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: nextState }: any) =>
          setViewState(nextState)
        }
        controller={{
          dragRotate: true,
          touchRotate: true,
          scrollZoom: true,
          doubleClickZoom: true,
        }}
        layers={layers}
        getTooltip={({ object }: any) => {
          if (!object || !object.properties) return null;
          const p = object.properties;
          const heightMeters = Math.round(getParcelElevation(object));
          const valFormatted = p.marketValueInINR
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(p.marketValueInINR)
            : p.guideline_val_inr
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(p.guideline_val_inr)
            : "N/A";

          const status = p.rorStatus || p.dispute_status || "Verified";
          const isDisputed = status.toLowerCase().includes("dispute");

          return {
            html: `
              <div style="background-color: #090d16; color: #f8fafc; padding: 10px 14px; border-radius: 12px; font-family: ui-sans-serif, system-ui, sans-serif; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6); border: 1px solid #334155; font-size: 12px; line-height: 1.4; min-width: 210px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 700; color: #818cf8; font-family: monospace; font-size: 11px;">${
                    p.ulpin || "PARCEL"
                  }</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 9999px; background-color: ${
                    isDisputed ? "#7f1d1d" : "#064e3b"
                  }; color: ${isDisputed ? "#fca5a5" : "#6ee7b7"};">
                    ${status}
                  </span>
                </div>
                <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 2px;">
                  ${p.khasraNo || p.survey_subdivision || p.patta_no || "Khasra"}
                </div>
                <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px;">
                  ${p.ownerName || p.pattadar_name || "Owner"}
                </div>
                <div style="padding-top: 6px; border-top: 1px solid #1e293b; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; font-size: 11px;">
                  <span style="color: #64748b;">Land Value:</span>
                  <strong style="color: #38bdf8; text-align: right; font-family: monospace;">${valFormatted}</strong>
                  <span style="color: #64748b;">3D Height:</span>
                  <strong style="color: #a78bfa; text-align: right; font-family: monospace;">${heightMeters}m</strong>
                  <span style="color: #64748b;">Land Use:</span>
                  <span style="color: #e2e8f0; text-align: right;">${
                    p.landUse || p.classification || "General"
                  }</span>
                </div>
              </div>
            `,
          };
        }}
      />

      {/* Floating 3D Control HUD (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Tilt & Rotate Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
          <Box className="h-4 w-4 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              3D Extrusion Mode
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {Math.round(viewState.pitch)}° Tilt
              </span>
            </span>
            <span className="text-[10px] text-slate-400">
              {t("tiltRotateHint") ||
                "Hold Right-Click / Ctrl + Drag to Tilt & Rotate"}
            </span>
          </div>
        </div>

        {/* Quick Camera Action Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium text-[11px] cursor-pointer"
            title="Reset to default 3D isometric view (55° tilt)"
            aria-label="Reset to default 3D isometric view"
          >
            <RotateCcw className="h-3 w-3 text-indigo-400" />
            <span>{t("resetCamera") || "Reset"}</span>
          </button>

          <div className="h-3.5 w-[1px] bg-slate-700" />

          <button
            type="button"
            onClick={handleIsometric}
            className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-[11px] font-medium cursor-pointer"
            title="45° Isometric View"
            aria-label="45 degree isometric view"
          >
            45°
          </button>

          <button
            type="button"
            onClick={handleTopDown}
            className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-[11px] font-medium cursor-pointer"
            title="0° Top-Down View"
            aria-label="Top down view"
          >
            Top-Down
          </button>

          <div className="h-3.5 w-[1px] bg-slate-700" />

          <button
            type="button"
            onClick={() => handleRotateStep(-45)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Rotate Left 45°"
            aria-label="Rotate Left 45 degrees"
          >
            <Compass className="h-3.5 w-3.5 text-amber-400 -rotate-45" />
          </button>

          <button
            type="button"
            onClick={() => handleRotateStep(45)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Rotate Right 45°"
            aria-label="Rotate Right 45 degrees"
          >
            <Compass className="h-3.5 w-3.5 text-amber-400 rotate-45" />
          </button>
        </div>
      </div>

      {/* Floating 3D Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-[11px] pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-emerald-500 shadow-xs shadow-emerald-500/50" />
          <span className="text-slate-300">{t("clearVerified")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-red-500 shadow-xs shadow-red-500/50" />
          <span className="text-slate-300">{t("disputed")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-amber-500 shadow-xs shadow-amber-500/50" />
          <span className="text-slate-300">{t("inReview")}</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700" />
        <div className="flex items-center gap-1 text-slate-400">
          <Box className="h-3 w-3 text-indigo-400" />
          <span>{t("extruded3DHint") || "Height = Land Value"}</span>
        </div>
      </div>
    </div>
  );
}
