"use client";

import { useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import { LandParcelFeatureCollection } from "@/data/parcels";

export type HeatmapMode = "disputes" | "transactions";

export interface HeatmapLayerProps {
  parcels: LandParcelFeatureCollection;
  mode: HeatmapMode;
}

/**
 * Calculates centroid [lat, lon] of a polygon coordinate array ([lon, lat])
 */
export function getCentroid(coords: [number, number][]): [number, number] {
  let sumLon = 0;
  let sumLat = 0;
  const n = coords.length;
  for (const [lon, lat] of coords) {
    sumLon += lon;
    sumLat += lat;
  }
  return [sumLat / n, sumLon / n];
}

/**
 * Generates heat points [lat, lon, intensity] based on active mode
 */
export function generateHeatPoints(
  parcels: LandParcelFeatureCollection,
  mode: HeatmapMode
): [number, number, number][] {
  const points: [number, number, number][] = [];

  if (!parcels?.features) return points;

  for (const feature of parcels.features) {
    const coords = feature.geometry?.coordinates?.[0];
    if (!coords || coords.length === 0) continue;

    const [centerLat, centerLon] = getCentroid(coords);
    const p = feature.properties;

    let intensity = 0.3;

    if (mode === "disputes") {
      const status = (p.rorStatus || "").toLowerCase();
      const clearStatus = (p.clearOrDisputed || "").toLowerCase();
      const encumbrances = (p.encumbrances || "").toLowerCase();

      if (
        status.includes("dispute") ||
        clearStatus.includes("dispute") ||
        encumbrances.includes("court") ||
        encumbrances.includes("injunction")
      ) {
        intensity = 1.0; // Urgent red dispute hot-spot
      } else if (
        status.includes("pending") ||
        status.includes("scrutiny") ||
        status.includes("review") ||
        p.buildingPermission?.toLowerCase().includes("conflict")
      ) {
        intensity = 0.55; // Amber warning
      } else {
        intensity = 0.15; // Cool baseline clear title
      }
    } else {
      // Transaction Activity Mode: weighted by mutation frequency / chain of title depth
      const chainCount = p.chainOfTitle?.length || 1;
      const isCommercial = p.landUse === "Commercial" || p.landUse === "Industrial";

      if (chainCount >= 3) {
        intensity = 0.95; // High mutation turnover (3+ transactions)
      } else if (chainCount === 2) {
        intensity = 0.70; // Active turnover (2 transactions)
      } else if (isCommercial) {
        intensity = 0.65; // Commercial activity
      } else {
        intensity = 0.35; // Standard single title deed
      }
    }

    // 1. Primary center anchor point
    points.push([centerLat, centerLon, intensity]);

    // 2. Vertex perimeter points to radiate heat cloud naturally across parcel
    for (const [lon, lat] of coords) {
      points.push([lat, lon, intensity * 0.75]);
    }
  }

  return points;
}

export default function HeatmapLayer({ parcels, mode }: HeatmapLayerProps) {
  const map = useMap();

  // Memoize expensive centroid and perimeter weight calculation across parcel collection
  const heatPoints = useMemo(() => {
    return generateHeatPoints(parcels, mode);
  }, [parcels, mode]);

  useEffect(() => {
    if (!map || typeof window === "undefined") return;

    // Ensure Leaflet instance is available and window.L is populated for leaflet.heat plugin
    const L = (window as any).L || require("leaflet");
    if (!(window as any).L) {
      (window as any).L = L;
    }
    require("leaflet.heat");

    if (heatPoints.length === 0) return;

    // Gradient styling:
    // Dispute mode: Blue -> Yellow -> Red -> Dark Crimson
    // Transaction mode: Cyan -> Emerald -> Indigo -> Fuchsia
    const gradient =
      mode === "disputes"
        ? { 0.2: "#3b82f6", 0.45: "#eab308", 0.75: "#ef4444", 1.0: "#991b1b" }
        : { 0.2: "#06b6d4", 0.45: "#10b981", 0.75: "#6366f1", 1.0: "#d946ef" };

    if (!L.heatLayer) {
      console.warn("leaflet.heat plugin did not attach heatLayer to L");
      return;
    }

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 38,
      blur: 24,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.45,
      gradient,
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, heatPoints, mode]);

  return null;
}
