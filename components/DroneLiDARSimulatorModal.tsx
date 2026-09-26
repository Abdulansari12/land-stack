"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Plane,
  Radar,
  Crosshair,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Camera,
  Download,
  Layers,
  Sparkles,
  Maximize2,
  ChevronRight,
  Info,
  CheckCircle2,
  Activity,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { LandParcelProperties } from "@/data/parcels";
import { useLanguage } from "@/context/LanguageContext";
import { Badge, Button } from "@/components/ui";

export interface DroneLiDARSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel?: LandParcelProperties | null;
  inline?: boolean;
}

export type FlightMode = "lawnmower" | "orbit" | "perimeter";
export type ColorMode = "rgb" | "elevation" | "intensity";

export default function DroneLiDARSimulatorModal({
  isOpen,
  onClose,
  parcel,
  inline = false,
}: DroneLiDARSimulatorModalProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flight simulation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [flightMode, setFlightMode] = useState<FlightMode>("lawnmower");
  const [colorMode, setColorMode] = useState<ColorMode>("elevation");
  const [altitude, setAltitude] = useState(65); // meters AGL
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [detectedAnomaly, setDetectedAnomaly] = useState(true);
  const [pointsCollected, setPointsCollected] = useState(142850);
  const [batteryLevel, setBatteryLevel] = useState(91);
  const [droneHeading, setDroneHeading] = useState(42);

  // Active parcel details fallback
  const activeParcelName = parcel?.khasraNo
    ? `Khasra #${parcel.khasraNo}`
    : "Cadastral Plot #TN-482";
  const activeUlpin = parcel?.ulpin || "TN02K9821A4429";
  const activeOwner = parcel?.ownerName || "Karthik Subramanian";

  // Canvas 3D Drone & LiDAR simulation loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    // Simulation dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 800;
      canvas.height = rect.height * window.devicePixelRatio || 500;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Random point cloud particles
    const pointCloud: { x: number; y: number; z: number; intensity: number }[] = [];
    const numPoints = 220;
    for (let i = 0; i < numPoints; i++) {
      pointCloud.push({
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 350,
        z: Math.random() * 25,
        intensity: Math.random(),
      });
    }

    const render = () => {
      if (isPlaying) {
        tick += 0.02 * speedMultiplier;
        setPointsCollected((p) => p + Math.floor(18 * speedMultiplier));
      }

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // Clear background
      ctx.fillStyle = "#070b14";
      ctx.fillRect(0, 0, w, h);

      // Draw Perspective Grid (Ground Plane)
      ctx.strokeStyle = "rgba(30, 58, 138, 0.25)";
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      const horizonY = centerY * 0.7;

      ctx.beginPath();
      for (let x = -w; x <= w * 2; x += gridSpacing * 1.5) {
        ctx.moveTo(centerX + (x - centerX) * 0.2, horizonY);
        ctx.lineTo(x, h);
      }
      for (let y = horizonY; y <= h; y += gridSpacing) {
        const factor = (y - horizonY) / (h - horizonY);
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Drone flight trajectory based on mode
      let droneX = centerX;
      let droneY = centerY - 60;
      let targetX = centerX;
      let targetY = centerY + 80;

      if (flightMode === "lawnmower") {
        const sweepX = Math.sin(tick * 1.2) * (w * 0.25);
        const sweepY = Math.cos(tick * 0.4) * (h * 0.15);
        droneX = centerX + sweepX;
        droneY = centerY - 40 + sweepY;
        targetX = droneX;
        targetY = droneY + 120 + (altitude - 60);
      } else if (flightMode === "orbit") {
        const angle = tick * 0.8;
        const radius = Math.min(w, h) * 0.22;
        droneX = centerX + Math.cos(angle) * radius;
        droneY = centerY - 50 + Math.sin(angle) * (radius * 0.55);
        targetX = centerX;
        targetY = centerY + 70;
      } else if (flightMode === "perimeter") {
        const tCycle = (tick * 0.5) % 4;
        const hw = w * 0.22;
        const hh = h * 0.15;
        let px = 0;
        let py = 0;
        if (tCycle < 1) {
          px = -hw + tCycle * 2 * hw;
          py = -hh;
        } else if (tCycle < 2) {
          px = hw;
          py = -hh + (tCycle - 1) * 2 * hh;
        } else if (tCycle < 3) {
          px = hw - (tCycle - 2) * 2 * hw;
          py = hh;
        } else {
          px = -hw;
          py = hh - (tCycle - 3) * 2 * hh;
        }
        droneX = centerX + px;
        droneY = centerY - 60 + py;
        targetX = droneX;
        targetY = droneY + 110;
      }

      // Draw Legal Cadastral Boundary Polygonal Footprint on Ground
      const parcelPoly = [
        { x: centerX - 140, y: centerY + 30 },
        { x: centerX + 120, y: centerY + 20 },
        { x: centerX + 160, y: centerY + 140 },
        { x: centerX - 110, y: centerY + 160 },
      ];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(parcelPoly[0].x, parcelPoly[0].y);
      for (let i = 1; i < parcelPoly.length; i++) {
        ctx.lineTo(parcelPoly[i].x, parcelPoly[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Draw Boundary Pillar Beacons (Survey Corner Points)
      parcelPoly.forEach((pt, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#34d399";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "rgba(52, 211, 153, 0.85)";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`P${idx + 1}`, pt.x + 8, pt.y - 4);
        ctx.restore();
      });

      // Draw Encroachment Anomaly Zone (if detected)
      if (detectedAnomaly) {
        const anomalyPoly = [
          { x: centerX + 120, y: centerY + 20 },
          { x: centerX + 175, y: centerY + 35 },
          { x: centerX + 160, y: centerY + 140 },
        ];
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(anomalyPoly[0].x, anomalyPoly[0].y);
        anomalyPoly.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
        ctx.fill();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Anomaly Flag Marker
        const pulse = (Math.sin(tick * 4) + 1) * 3;
        ctx.beginPath();
        ctx.arc(centerX + 155, centerY + 65, 6 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("! SPATIAL ANOMALY (+4.2 m²)", centerX + 170, centerY + 68);
        ctx.restore();
      }

      // Draw LiDAR Point Cloud with Hypsometric Elevation Tinting
      pointCloud.forEach((pt) => {
        const screenX = centerX + pt.x;
        const screenY = centerY + 80 + pt.y * 0.5 - pt.z * 1.5;

        let col = "#10b981";
        if (colorMode === "elevation") {
          const elevNorm = pt.z / 25;
          col = elevNorm > 0.6 ? "#f59e0b" : elevNorm > 0.3 ? "#06b6d4" : "#10b981";
        } else if (colorMode === "intensity") {
          col = pt.intensity > 0.7 ? "#ffffff" : "#94a3b8";
        } else {
          col = "#22c55e";
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      // Draw LiDAR Volumetric Laser Cone (Drone to Ground)
      const coneRadius = 70 + (altitude - 40) * 0.8;
      const grad = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        coneRadius
      );
      grad.addColorStop(0, "rgba(6, 182, 212, 0.35)");
      grad.addColorStop(0.7, "rgba(16, 185, 129, 0.15)");
      grad.addColorStop(1, "rgba(16, 185, 129, 0)");

      // Laser Cone Beams
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(droneX, droneY + 12);
      ctx.lineTo(targetX - coneRadius, targetY);
      ctx.lineTo(targetX + coneRadius, targetY);
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
      ctx.fill();

      // Ground Laser Footprint Ellipse
      ctx.beginPath();
      ctx.ellipse(targetX, targetY, coneRadius, coneRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Raster Scan Line sweeping inside ground footprint
      const sweepLineY = targetY + Math.sin(tick * 3) * (coneRadius * 0.35);
      ctx.beginPath();
      ctx.moveTo(targetX - coneRadius * 0.8, sweepLineY);
      ctx.lineTo(targetX + coneRadius * 0.8, sweepLineY);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Draw Center Targeting Reticle (HUD crosshair)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
      ctx.moveTo(targetX - 26, targetY);
      ctx.lineTo(targetX + 26, targetY);
      ctx.moveTo(targetX, targetY - 26);
      ctx.lineTo(targetX, targetY + 26);
      ctx.stroke();
      ctx.restore();

      // =========================================================================
      // DRAW 3D QUADCOPTER DRONE MODEL
      // =========================================================================
      ctx.save();
      ctx.translate(droneX, droneY);

      // Drone shadow on ground
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 110 + (altitude - 50), 24, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();
      ctx.restore();

      // Drone Carbon-Fiber Arm Cross (X-Frame)
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-28, -14);
      ctx.lineTo(28, 14);
      ctx.moveTo(-28, 14);
      ctx.lineTo(28, -14);
      ctx.stroke();

      // Drone Central Fuselage Chassis
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Status LED in center (Pulsing Cyan)
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4 Rotors & Spinning Propellers
      const rotorPositions = [
        { x: -28, y: -14 },
        { x: 28, y: -14 },
        { x: -28, y: 14 },
        { x: 28, y: 14 },
      ];

      rotorPositions.forEach((rp, idx) => {
        // Motor bell
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();

        // Spinning Propeller Blur Disc
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, 14, 4, tick * 18 + idx, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fill();
        ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Navigation Strobes
        const strobeColor =
          idx === 0 ? "#ef4444" : idx === 1 ? "#10b981" : "#ffffff";
        ctx.beginPath();
        ctx.arc(rp.x, rp.y + 4, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = strobeColor;
        ctx.fill();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isOpen, isPlaying, flightMode, colorMode, altitude, speedMultiplier, detectedAnomaly]);

  if (!isOpen) return null;

  const handleSnapshot = () => {
    toast.success("High-Resolution Drone Orthomosaic Snapshot captured!");
  };

  const handleExportLas = () => {
    toast.success(`Exporting LAS Point Cloud & GeoTIFF for ${activeParcelName}...`);
  };

  const content = (
    <div
      role={inline ? "region" : "dialog"}
      aria-modal={inline ? undefined : "true"}
      aria-labelledby="drone-sim-title"
      className={
        inline
          ? "relative w-full max-w-5xl bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-100"
          : "relative w-full max-w-5xl max-h-[92vh] bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150"
      }
    >
      {/* ========================================================================= */}
      {/* COCKPIT HUD TOP BAR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Radar className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SVAMITVA UAV 3D SURVEY
              </span>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                RTK-FIX ±2.1cm
              </span>
            </div>
            <h2 id="drone-sim-title" className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Autonomous Cadastral LiDAR Simulator</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close drone simulator"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TELEMETRY HEADS-UP DISPLAY STRIP */}
      {/* ========================================================================= */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Target:</span>
            <span className="font-bold text-white">{activeParcelName}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">ULPIN:</span>
            <span className="text-amber-300 font-semibold">{activeUlpin}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-400">Alt: </span>
            <span className="text-cyan-400 font-bold">{altitude.toFixed(1)}m AGL</span>
          </div>
          <div>
            <span className="text-slate-400">Battery: </span>
            <span className="text-emerald-400 font-bold">{batteryLevel}%</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-slate-400">Pts: </span>
            <span className="text-purple-400 font-bold">{pointsCollected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE 3D FLIGHT VIEWPORT */}
      {/* ========================================================================= */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-black overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Floating Flight Mode & Camera Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>MODE: {flightMode.toUpperCase()} ({speedMultiplier}x SPEED)</span>
          </div>
          {detectedAnomaly && (
            <div className="px-2.5 py-1 rounded-lg bg-red-950/80 backdrop-blur-md border border-red-800 text-[11px] font-mono text-red-300 flex items-center gap-2 animate-pulse">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              <span>ENCROACHMENT DETECTED: +4.2m² NW</span>
            </div>
          )}
        </div>

        {/* Viewport Floating Snapshot Tool */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSnapshot}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-md backdrop-blur-md cursor-pointer"
            title="Capture High-Res Orthomosaic Snapshot"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLIGHT CONTROL DASHBOARD & LIDAR ANALYTICS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 shrink-0 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Flight Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isPlaying ? "secondary" : "primary"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              leftIcon={isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            >
              {isPlaying ? "Pause Flight" : "Resume Flight"}
            </Button>

            {/* Flight Pattern Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFlightMode("lawnmower")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  flightMode === "lawnmower"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Serpentine Grid Flight"
              >
                Lawnmower
              </button>
              <button
                type="button"
                onClick={() => setFlightMode("orbit")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  flightMode === "orbit"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="360° Orbital Scan"
              >
                Orbit
              </button>
              <button
                type="button"
                onClick={() => setFlightMode("perimeter")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  flightMode === "perimeter"
                    ? "bg-cyan-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Boundary Pillar Trace"
              >
                Boundary
              </button>
            </div>
          </div>

          {/* Altitude Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono shrink-0">Altitude:</span>
            <input
              type="range"
              min={30}
              max={120}
              value={altitude}
              onChange={(e) => setAltitude(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-xs font-bold text-cyan-400 font-mono shrink-0">{altitude}m</span>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setColorMode(colorMode === "elevation" ? "intensity" : "elevation")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Spectrum: {colorMode.toUpperCase()}</span>
            </button>
            <button
              type="button"
              onClick={handleExportLas}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export LAS Cloud</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div data-testid="drone-simulator-inline-container" className="w-full flex justify-center py-4">
        {content}
      </div>
    );
  }

  return (
    <div
      data-testid="drone-simulator-modal-overlay"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {content}
    </div>
  );
}
