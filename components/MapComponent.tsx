"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { PathOptions, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Layers } from "lucide-react";
import { dummyLandParcels, LandParcelFeatureCollection, LandParcelProperties } from "@/data/parcels";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/config";
import HeatmapLayer, { HeatmapMode } from "@/components/HeatmapLayer";
import { useTheme } from "@/context/ThemeContext";
import { escapeHtml } from "@/lib/sanitize";

export interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  parcels?: LandParcelFeatureCollection;
  onParcelSelect?: (properties: LandParcelProperties) => void;
  onSelectParcel?: (properties: LandParcelProperties) => void;
  targetCoordinates?: [number, number][] | null;
  selectedUlpin?: string | null;
  highlightedUlpins?: string[] | null;
  isHeatmapVisible?: boolean;
  heatmapMode?: HeatmapMode;
  isDarkMode?: boolean;
  children?: React.ReactNode;
}

/**
 * Controller component inside MapContainer to fly/zoom to target parcel bounds
 */
function MapFlyToHandler({ targetCoordinates }: { targetCoordinates?: [number, number][] | null }) {
  const map = useMap();

  useEffect(() => {
    if (targetCoordinates && targetCoordinates.length > 0) {
      // GeoJSON coordinates are [lon, lat]; Leaflet expects [lat, lon]
      const leafletCoords: [number, number][] = targetCoordinates.map(([lon, lat]) => [lat, lon]);
      map.flyToBounds(leafletCoords, {
        padding: [60, 60],
        maxZoom: 17,
        duration: 1.4,
      });
    }
  }, [targetCoordinates, map]);

  return null;
}

/**
 * Controller component to auto-fit bounds when an AI NL Query filter highlights multiple parcels
 */
function MapBoundsFitHandler({
  highlightedUlpins,
  parcels,
}: {
  highlightedUlpins?: string[] | null;
  parcels?: LandParcelFeatureCollection;
}) {
  const map = useMap();

  useEffect(() => {
    if (highlightedUlpins && highlightedUlpins.length > 0 && parcels?.features) {
      const matchingFeatures = parcels.features.filter((f) =>
        highlightedUlpins.includes(f.properties.ulpin)
      );
      const allPoints: [number, number][] = [];
      matchingFeatures.forEach((f) => {
        const coords = f.geometry?.coordinates?.[0];
        if (coords) {
          coords.forEach(([lon, lat]) => allPoints.push([lat, lon]));
        }
      });

      if (allPoints.length > 0) {
        map.flyToBounds(allPoints, {
          padding: [50, 50],
          maxZoom: 16,
          duration: 1.3,
        });
      }
    }
  }, [highlightedUlpins, parcels, map]);

  return null;
}

/**
 * Dynamic polygon styling:
 * - When selected (drawer open): thicker border (weight 4), glowing blue outline (#2563eb), slightly increased opacity (0.78)
 * - When highlighted by NL Query: glowing violet/purple outline (#a855f7), weight 4.5, higher opacity
 * - When ghosted (other parcels while NL filter is active): dimmed opacity (0.2)
 * - Base style: Green for "Verified", Red for "Disputed", Amber for pending / review
 */
function getParcelStyle(
  feature: any,
  selectedUlpin?: string | null,
  highlightedUlpins?: string[] | null,
  isHeatmapVisible?: boolean,
  isDark?: boolean
): PathOptions {
  const ulpin = feature?.properties?.ulpin;
  const isSelected = Boolean(selectedUlpin && ulpin === selectedUlpin);
  const hasHighlightFilter = Boolean(highlightedUlpins && highlightedUlpins.length > 0);
  const isHighlighted = Boolean(hasHighlightFilter && highlightedUlpins?.includes(ulpin));
  const isGhosted = Boolean(hasHighlightFilter && !isHighlighted && !isSelected);

  const rorStatus = feature?.properties?.rorStatus?.toLowerCase() || "";

  let baseFillColor = "#f59e0b"; // amber-500
  let baseColor = isDark ? "#d97706" : "#b45309"; // amber-600 vs amber-700

  if (rorStatus === "verified" || rorStatus === "digitally signed") {
    baseFillColor = isDark ? "#10b981" : "#22c55e"; // emerald-500 vs green-500
    baseColor = isDark ? "#34d399" : "#15803d";
  } else if (rorStatus === "disputed") {
    baseFillColor = "#ef4444"; // red-500
    baseColor = isDark ? "#f87171" : "#b91c1c";
  }

  // Highlighted style for the selected parcel (drawer open)
  if (isSelected) {
    return {
      fillColor: baseFillColor,
      color: isDark ? "#38bdf8" : "#2563eb", // Glowing electric cyan/blue outline
      weight: 4,
      opacity: 1,
      fillOpacity: isHeatmapVisible ? 0.45 : isDark ? 0.72 : 0.78,
    };
  }

  // Highlighted style for parcels matching 'Ask Land Stack' Natural Language query
  if (isHighlighted) {
    return {
      fillColor: baseFillColor,
      color: isDark ? "#c084fc" : "#7c3aed", // Glowing electric violet / purple outline
      weight: 4.5,
      opacity: 1,
      fillOpacity: isDark ? 0.78 : 0.82,
    };
  }

  // Ghosted style for non-matching parcels when an NL filter is active
  if (isGhosted) {
    return {
      fillColor: isDark ? "#475569" : "#94a3b8",
      color: isDark ? "#334155" : "#cbd5e1",
      weight: 1,
      opacity: 0.25,
      fillOpacity: 0.08,
    };
  }

  return {
    fillColor: baseFillColor,
    color: baseColor,
    weight: isHeatmapVisible ? 1.5 : 2,
    opacity: isHeatmapVisible ? 0.7 : 1,
    fillOpacity: isHeatmapVisible ? 0.18 : isDark ? 0.45 : 0.5,
  };
}

export default function MapComponent({
  center = MAP_DEFAULT_CENTER,
  zoom = MAP_DEFAULT_ZOOM,
  className = "h-full w-full min-h-[500px]",
  style,
  parcels = dummyLandParcels,
  onParcelSelect,
  onSelectParcel,
  targetCoordinates,
  selectedUlpin,
  highlightedUlpins,
  isHeatmapVisible = false,
  heatmapMode = "disputes",
  isDarkMode,
  children,
}: MapComponentProps) {
  const { isDark: themeIsDark } = useTheme();
  const effectiveDark = isDarkMode !== undefined ? isDarkMode : themeIsDark;
  const [isParcelsLoading, setIsParcelsLoading] = useState(true);

  useEffect(() => {
    // 1-second simulated loading state before rendering GeoJSON
    const timer = setTimeout(() => {
      setIsParcelsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fix Leaflet's default marker icon paths in Next.js / Turbopack bundler
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const onEachFeature = (feature: any, layer: Layer) => {
    const props: LandParcelProperties = feature.properties;
    if (!props) return;

    const { ulpin, khasraNo, ownerName, landUse, rorStatus, clearOrDisputed, taxStatus, areaInHectares } = props;

    const isVerified =
      rorStatus?.toLowerCase() === "verified" || rorStatus?.toLowerCase() === "digitally signed";
    const isDisputed = rorStatus?.toLowerCase() === "disputed";

    const badgeStyle = isVerified
      ? effectiveDark
        ? "background: #064e3b; color: #6ee7b7; border: 1px solid #059669;"
        : "background: #dcfce7; color: #15803d; border: 1px solid #86efac;"
      : isDisputed
      ? effectiveDark
        ? "background: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626;"
        : "background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;"
      : effectiveDark
      ? "background: #78350f; color: #fde68a; border: 1px solid #d97706;"
      : "background: #fef3c7; color: #b45309; border: 1px solid #fde68a;";

    const safeUlpin = escapeHtml(ulpin || "");
    const safeKhasra = escapeHtml(khasraNo || "");
    const safeRorStatus = escapeHtml(rorStatus || "");
    const safeLandUse = escapeHtml(landUse || "");
    const safeOwner = escapeHtml(ownerName || "");
    const safeClearDisputed = escapeHtml(clearOrDisputed || "");
    const safeTax = escapeHtml(taxStatus || "");
    const safeCitizenRef = `DEMO-CITIZEN-${(khasraNo || "0412").replace(/[^0-9]/g, "").padStart(4, "0")}`;

    const popupHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; min-width: 220px; line-height: 1.4; color: ${effectiveDark ? "#f1f5f9" : "#0f172a"};">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${effectiveDark ? "#94a3b8" : "#64748b"}; margin-bottom: 2px;">
          ULPIN: ${safeUlpin}
        </div>
        <div style="font-size: 15px; font-weight: 700; color: ${effectiveDark ? "#f8fafc" : "#0f172a"}; margin-bottom: 6px;">
          Khasra #${safeKhasra}
        </div>
        <div style="display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap;">
          <span style="font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 9999px; ${badgeStyle}">
            ${safeRorStatus}
          </span>
          <span style="font-size: 11px; font-weight: 500; padding: 2px 7px; border-radius: 9999px; background: ${effectiveDark ? "#27272a" : "#f1f5f9"}; color: ${effectiveDark ? "#e4e4e7" : "#475569"};">
            ${safeLandUse}
          </span>
        </div>
        <div style="border-top: 1px solid ${effectiveDark ? "#3f3f46" : "#e2e8f0"}; padding-top: 6px; display: grid; grid-gap: 4px; color: ${effectiveDark ? "#d4d4d8" : "#334155"};">
          <div><strong style="color: ${effectiveDark ? "#a1a1aa" : "#475569"};">Owner:</strong> ${safeOwner}</div>
          <div style="font-size: 10px; font-family: monospace; color: ${effectiveDark ? "#a1a1aa" : "#64748b"};"><strong>Citizen Ref:</strong> ${safeCitizenRef} <span style="font-size: 9px; opacity: 0.8;">(Fictional ID)</span></div>
          <div><strong style="color: ${effectiveDark ? "#a1a1aa" : "#475569"};">Title:</strong> <span style="font-weight: 600; color: ${clearOrDisputed === "Clear" ? (effectiveDark ? "#4ade80" : "#15803d") : (effectiveDark ? "#f87171" : "#b91c1c")}">${safeClearDisputed}</span></div>
          <div><strong style="color: ${effectiveDark ? "#a1a1aa" : "#475569"};">Tax Status:</strong> <span style="font-weight: 600; color: ${taxStatus === "Paid" ? (effectiveDark ? "#4ade80" : "#15803d") : (effectiveDark ? "#f87171" : "#b91c1c")}">${safeTax}</span></div>
          ${areaInHectares ? `<div><strong style="color: ${effectiveDark ? "#a1a1aa" : "#475569"};">Area:</strong> ${areaInHectares} Ha</div>` : ""}
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: ${effectiveDark ? "#818cf8" : "#6366f1"}; font-weight: 600; text-align: right;">
          Click to inspect full details &rarr;
        </div>
      </div>
    `;

    layer.bindPopup(popupHtml);

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: 0.85,
          weight: 3,
        });
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle(getParcelStyle(feature, selectedUlpin, highlightedUlpins, isHeatmapVisible, effectiveDark));
      },
      click: () => {
        // Pass parcel properties to parent component
        if (onParcelSelect) {
          onParcelSelect(props);
        }
        if (onSelectParcel) {
          onSelectParcel(props);
        }
      },
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm ${className}`} style={style}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: "100%", width: "100%", minHeight: "500px" }}
      >
        <TileLayer
          key={effectiveDark ? "osm-dark-tiles" : "osm-light-tiles"}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains="abc"
          maxZoom={19}
        />

        {/* GeoJSON Parcels Layer with dynamic highlighted style - rendered only after loading */}
        {!isParcelsLoading && parcels && (
          <GeoJSON
            key={`parcels-layer-${parcels.features.length}-${selectedUlpin || "none"}-${(highlightedUlpins || []).join(",")}-${isHeatmapVisible ? "heat" : "norm"}-${effectiveDark ? "dark" : "light"}`}
            data={parcels as any}
            style={(feature) => getParcelStyle(feature, selectedUlpin, highlightedUlpins, isHeatmapVisible, effectiveDark)}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Real-Time Regional Heatmap Layer (leaflet.heat) */}
        {!isParcelsLoading && isHeatmapVisible && parcels && (
          <HeatmapLayer parcels={parcels} mode={heatmapMode} />
        )}

        {/* Controller to fly to targeted bounds */}
        <MapFlyToHandler targetCoordinates={targetCoordinates} />

        {/* Controller to fly to fit bounds of all AI highlighted parcels */}
        <MapBoundsFitHandler highlightedUlpins={highlightedUlpins} parcels={parcels} />

        {children}
      </MapContainer>

      {/* 1-second Simulated Loading Spinner Overlay over Map Area */}
      {isParcelsLoading && (
        <div
          data-testid="map-loading-overlay"
          className="absolute inset-0 z-[1200] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="relative mb-3 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-3 border-indigo-200 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-500 animate-spin" />
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400 absolute" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Loading parcel data...
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Rendering cadastral boundaries & spatial layers
          </p>
        </div>
      )}

      {/* Small Floating Legend Box in Bottom-Left Corner */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 shadow-lg text-xs select-none pointer-events-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
          Cadastral Legend
        </div>
        <div className="flex flex-col gap-2 text-slate-700 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-status-verified ring-2 ring-status-verified/30 inline-block shrink-0" />
            <span className="font-medium text-[11px]">Verified/Clear</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-status-disputed ring-2 ring-status-disputed/30 inline-block shrink-0" />
            <span className="font-medium text-[11px]">Disputed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-status-pending ring-2 ring-status-pending/30 inline-block shrink-0" />
            <span className="font-medium text-[11px]">Pending / Review</span>
          </div>
          {selectedUlpin && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 dark:border-zinc-700/60">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-primary ring-2 ring-brand-primary/30 animate-pulse inline-block shrink-0" />
              <span className="font-semibold text-[11px] text-brand-primary dark:text-brand-primary-light">
                Selected (Active)
              </span>
            </div>
          )}
          {highlightedUlpins && highlightedUlpins.length > 0 && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 dark:border-zinc-700/60">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-secondary ring-2 ring-brand-secondary/30 animate-pulse inline-block shrink-0" />
              <span className="font-semibold text-[11px] text-brand-secondary">
                AI Match ({highlightedUlpins.length})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
