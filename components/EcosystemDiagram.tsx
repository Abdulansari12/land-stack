"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  FileText,
  Landmark,
  Building2,
  Zap,
  Scale,
  Compass,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Wifi,
  Database,
  Lock,
} from "lucide-react";
import { APP_NAME } from "@/config";
import { useLanguage } from "@/context/LanguageContext";

export interface DepartmentNode {
  id: string;
  nameEn: string;
  nameHi: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  color: {
    stroke: string;
    fill: string;
    glow: string;
    text: string;
    badge: string;
    dot: string;
  };
  roleEn: string;
  roleHi: string;
  dataFlowEn: string;
  dataFlowHi: string;
  protocol: string;
  endpoint: string;
  lastEventEn: string;
  lastEventHi: string;
  latencyMs: number;
  packetRate: string;
}

const DEPARTMENTS: DepartmentNode[] = [
  {
    id: "registration",
    nameEn: "Registration Dept",
    nameHi: "पंजीकरण विभाग (स्टाम्प)",
    category: "Deeds & Stamps",
    icon: FileText,
    x: 450,
    y: 95,
    color: {
      stroke: "#a855f7",
      fill: "rgba(168, 85, 247, 0.12)",
      glow: "rgba(168, 85, 247, 0.4)",
      text: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      dot: "#c084fc",
    },
    roleEn: "Sale Deeds, Stamp Duty Clearance & Automatic Mutation Triggers",
    roleHi: "बैनामा (सेल डीड), स्टाम्प शुल्क सत्यापन व स्वचालित दाखिल-खारिज",
    dataFlowEn: "Bilateral: Registered Deed Handshake ↔ ULPIN Title Passport Generation",
    dataFlowHi: "द्वि-पक्षीय: पंजीकृत डीड सत्यापन ↔ 14-अंकीय ULPIN पासपोर्ट",
    protocol: "ISO 19152 (LADM) / REST Webhook",
    endpoint: "/api/v2/registry/deeds",
    lastEventEn: "Deed #REG/2026/8812 verified with digital stamp certification",
    lastEventHi: "बैनामा संख्या #REG/2026/8812 डिजिटल स्टाम्प से सत्यापित",
    latencyMs: 14,
    packetRate: "18.4 tx/s",
  },
  {
    id: "revenue",
    nameEn: "Revenue Dept",
    nameHi: "राजस्व विभाग (तहसील)",
    category: "RoR & Cadastre",
    icon: Landmark,
    x: 690,
    y: 215,
    color: {
      stroke: "#6366f1",
      fill: "rgba(99, 102, 241, 0.12)",
      glow: "rgba(99, 102, 241, 0.4)",
      text: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
      dot: "#818cf8",
    },
    roleEn: "Record of Rights (RoR), Khasra Spatial Polygons & Tahsildar Approvals",
    roleHi: "अधिकार अभिलेख (खतौनी), खसरा भू-नक्शा व तहसीलदार अनुमोदन",
    dataFlowEn: "Subdivision Parcel Geometry ↔ Canonical Jamabandi Ledger",
    dataFlowHi: "खसरा उप-विभाजन ज्यामिति ↔ राष्ट्रीय जमाबंदी खाता",
    protocol: "BND Schema / OGC WFS 2.0",
    endpoint: "/api/v2/revenue/cadastre",
    lastEventEn: "Mutation #MUT-2026-402 approved; spatial boundary synchronized",
    lastEventHi: "दाखिल-खारिज #MUT-2026-402 स्वीकृत; खसरा सीमाएं अपडेटेड",
    latencyMs: 11,
    packetRate: "24.6 tx/s",
  },
  {
    id: "banks",
    nameEn: "Banks / NBFCs",
    nameHi: "बैंक व वित्तीय संस्थाएं",
    category: "Mortgage & Credit",
    icon: Building2,
    x: 690,
    y: 465,
    color: {
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.12)",
      glow: "rgba(16, 185, 129, 0.4)",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      dot: "#34d399",
    },
    roleEn: "Mortgage Liens, Collateral Verification & Digital Kisan Credit Card (KCC)",
    roleHi: "बंधक भार (मॉर्गेज), बंधक सत्यापन व डिजिटल किसान क्रेडिट कार्ड",
    dataFlowEn: "CERSAI Hypothecation Charge ↔ Instant Title Encumbrance Check",
    dataFlowHi: "CERSAI बंधक प्रविष्टि ↔ तत्काल भारमुक्त प्रमाणपत्र (EC) जांच",
    protocol: "RBI Account Aggregator / DigiLocker Protocol",
    endpoint: "/api/v2/underwriting/lien",
    lastEventEn: "State Bank loan charge recorded for ULPIN UP09K2452M (₹28.5L)",
    lastEventHi: "एसबीआई गृह ऋण भार ULPIN UP09K2452M पर दर्ज (₹28.5 लाख)",
    latencyMs: 16,
    packetRate: "9.2 tx/s",
  },
  {
    id: "utilities",
    nameEn: "Utilities",
    nameHi: "उपयोगिता सेवाएं (बिजली/जल)",
    category: "Infrastructure & Grid",
    icon: Zap,
    x: 450,
    y: 585,
    color: {
      stroke: "#06b6d4",
      fill: "rgba(6, 182, 212, 0.12)",
      glow: "rgba(6, 182, 212, 0.4)",
      text: "text-cyan-600 dark:text-cyan-400",
      badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
      dot: "#22d3ee",
    },
    roleEn: "Electricity Discom Grids, Potable Water Pipelines & BharatNet Optical Fiber",
    roleHi: "विद्युत वितरण ग्रिड, पेयजल पाइपलाइन व भारतनेट ऑप्टिकल फाइबर",
    dataFlowEn: "Infrastructure Right-of-Way (RoW) ↔ Spatial Easement Registry",
    dataFlowHi: "सुविधाधिकार (ईजमेंट) ↔ भूमि पर अवसंरचना रेखांकन",
    protocol: "Open Spatial Utility Standard (OSUS)",
    endpoint: "/api/v2/utilities/easements",
    lastEventEn: "TANGEDCO 11kV agricultural grid feeder easement cross-verified",
    lastEventHi: "तांगेडको 11kV कृषि विद्युत ग्रिड सुविधाधिकार सत्यापित",
    latencyMs: 19,
    packetRate: "12.8 tx/s",
  },
  {
    id: "judiciary",
    nameEn: "Judiciary / Courts",
    nameHi: "न्यायालय व विधिक अधिकरण",
    category: "Legal & Litigation",
    icon: Scale,
    x: 210,
    y: 465,
    color: {
      stroke: "#f43f5e",
      fill: "rgba(244, 63, 94, 0.12)",
      glow: "rgba(244, 63, 94, 0.4)",
      text: "text-rose-600 dark:text-rose-400",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800",
      dot: "#fb7185",
    },
    roleEn: "Civil Court Injunctions, Stay Orders & Automated Title Caveat Locks",
    roleHi: "सिविल न्यायालय स्थगनादेश (स्टे), निषेधाज्ञा व स्वतः टाइटल लॉक",
    dataFlowEn: "e-Courts Case Status (CNR) ↔ Instant Dispute Caveat on GIS Map",
    dataFlowHi: "ई-कोर्ट वाद संख्या ↔ जीआईएस भू-नक्शे पर तत्काल विवाद चेतावनी",
    protocol: "NJDG Interoperable Justice Data Format",
    endpoint: "/api/v2/judiciary/caveats",
    lastEventEn: "Civil Court Suit #104/2026 interim stay attached to Khasra 88/3",
    lastEventHi: "सिविल सूट #104/2026 स्थगनादेश खसरा संख्या 88/3 से लिंक",
    latencyMs: 22,
    packetRate: "6.1 tx/s",
  },
  {
    id: "municipal",
    nameEn: "Municipal Planning",
    nameHi: "नगर पालिका व नगर नियोजन",
    category: "Zoning & Master Plan",
    icon: Compass,
    x: 210,
    y: 215,
    color: {
      stroke: "#0284c7",
      fill: "rgba(2, 132, 199, 0.12)",
      glow: "rgba(2, 132, 199, 0.4)",
      text: "text-sky-600 dark:text-sky-400",
      badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800",
      dot: "#38bdf8",
    },
    roleEn: "Master Plan Zoning, Building Permission NOCs & Property Tax Assessment",
    roleHi: "मास्टर प्लान भू-उपयोग, भवन निर्माण अनुमति NOC व गृहकर कर-निर्धारण",
    dataFlowEn: "Zoning Bye-Laws (Agricultural vs Residential) ↔ Building Permits",
    dataFlowHi: "जोनिंग उप-नियम (कृषि बनाम आवासीय) ↔ भवन निर्माण स्वीकृतियां",
    protocol: "National Urban Digital Mission (NUDM) API",
    endpoint: "/api/v2/municipal/zoning",
    lastEventEn: "Building Permit #BP-8812 verified with municipal tax clearance",
    lastEventHi: "भवन निर्माण स्वीकृति #BP-8812 नगर निगम कर-समाशोधन सहित पुष्ट",
    latencyMs: 13,
    packetRate: "15.7 tx/s",
  },
];

export interface EcosystemDiagramProps {
  className?: string;
  isCompact?: boolean;
}

export default function EcosystemDiagram({
  className = "",
  isCompact = false,
}: EcosystemDiagramProps) {
  const { language } = useLanguage();
  const [selectedDept, setSelectedDept] = useState<DepartmentNode>(DEPARTMENTS[0]);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [activeCycle, setActiveCycle] = useState(0);

  // Auto-cycle through departments every 6 seconds if no manual click has occurred recently
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCycle((prev) => (prev + 1) % DEPARTMENTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const centerX = 450;
  const centerY = 340;

  return (
    <div
      data-testid="ecosystem-diagram-container"
      className={`w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${className}`}
    >
      {/* Top Header Strip */}
      <div className="px-5 sm:px-8 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                {language === "hi"
                  ? "राष्ट्रीय संस्थागत अंतर-संचालनीयता (DPI इकोसिस्टम)"
                  : "National Institutional Interoperability Architecture"}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>6 Gateways Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === "hi"
                ? "6 प्रमुख सरकारी विभागों व बैंकों के बीच वास्तविक समय में द्विपक्षीय डेटा समन्वय"
                : "Real-time bidirectional synchronization across Revenue, Registration, Banks, Courts & Utilities"}
            </p>
          </div>
        </div>

        {/* Live Telemetry Pill & Animation Pause/Play */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-2xs">
            <Wifi className="h-3 w-3 text-indigo-500 animate-pulse" />
            <span>Avg Latency: 15.8ms</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAnimationActive(!isAnimationActive)}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer shadow-2xs"
            title={isAnimationActive ? "Pause pulse animation" : "Resume pulse animation"}
            aria-label={isAnimationActive ? "Pause pulse animation" : "Resume pulse animation"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnimationActive ? "text-emerald-500" : "text-slate-400"}`} />
          </button>
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="relative w-full overflow-x-auto select-none py-4 sm:py-6 flex items-center justify-center">
        <svg
          viewBox="0 0 900 680"
          className="w-full max-w-[860px] h-auto object-contain transition-all"
          role="img"
          aria-label="Interactive 6-department interoperability ecosystem diagram showing Land Stack central core connected to Registration, Revenue, Planning, Banks, Utilities, and Courts"
        >
          <title>Land Stack Interoperability Ecosystem Architecture</title>
          <defs>
            {/* Ambient Center Glow */}
            <radialGradient id="center-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Linear gradients for each connecting pipeline */}
            {DEPARTMENTS.map((dept) => (
              <linearGradient
                key={`grad-${dept.id}`}
                id={`beam-${dept.id}`}
                x1={centerX}
                y1={centerY}
                x2={dept.x}
                y2={dept.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
                <stop offset="100%" stopColor={dept.color.stroke} stopOpacity="0.7" />
              </linearGradient>
            ))}

            {/* Filter for glowing elements */}
            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Concentric Radar Rings */}
          <circle
            cx={centerX}
            cy={centerY}
            r={130}
            className="stroke-slate-200/80 dark:stroke-slate-800/80"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4 6"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={245}
            className="stroke-indigo-300/30 dark:stroke-indigo-900/40"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 8"
          />

          {/* Core Radial Glow */}
          <circle cx={centerX} cy={centerY} r={170} fill="url(#center-core-glow)" pointerEvents="none" />

          {/* Connecting Lines & Traveling Live Data Pulses */}
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept.id === dept.id;
            const pathId = `flow-path-${dept.id}`;

            return (
              <g key={`connection-${dept.id}`}>
                {/* Master SVG Path definition used for layout & animateMotion */}
                <path
                  id={pathId}
                  d={`M ${centerX} ${centerY} L ${dept.x} ${dept.y}`}
                  fill="none"
                  stroke={`url(#beam-${dept.id})`}
                  strokeWidth={isSelected ? 3 : 1.8}
                  strokeDasharray={isSelected ? undefined : "5 5"}
                  className="transition-all duration-300"
                />

                {/* Secondary reverse path for bidirectional traveling dot */}
                <path
                  id={`${pathId}-rev`}
                  d={`M ${dept.x} ${dept.y} L ${centerX} ${centerY}`}
                  fill="none"
                  stroke="transparent"
                />

                {/* Live Data Pulse 1: Central Hub Outward to Department */}
                {isAnimationActive && (
                  <circle r="4" fill={dept.color.dot} filter="url(#node-glow)">
                    <animateMotion
                      dur={`${2.4 + (dept.latencyMs % 4) * 0.3}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                    >
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}

                {/* Live Data Pulse 2: Department Inward to Central Hub (Staggered for bidirectional sync) */}
                {isAnimationActive && (
                  <circle r="3" fill="#38bdf8" opacity="0.9">
                    <animateMotion
                      dur={`${2.8 + (dept.latencyMs % 5) * 0.25}s`}
                      repeatCount="indefinite"
                      begin="1.2s"
                      rotate="auto"
                    >
                      <mpath href={`#${pathId}-rev`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Central Hub: Land Stack DPI Core Engine */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedDept(DEPARTMENTS[0])}
          >
            {/* Outer pulsating ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={68}
              className="fill-indigo-500/10 dark:fill-indigo-950/40 stroke-indigo-500/40 dark:stroke-indigo-500/60 animate-pulse"
              strokeWidth="2"
            />
            {/* Main Core Circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={52}
              className="fill-white dark:fill-slate-900 stroke-indigo-600 dark:stroke-indigo-400 drop-shadow-md transition-transform group-hover:scale-105"
              strokeWidth="3"
            />

            {/* Central Icon: Layers / Emblem */}
            <g transform={`translate(${centerX - 16}, ${centerY - 22})`}>
              <rect width="32" height="32" rx="8" className="fill-indigo-600" />
              <path
                d="M 16 6 L 26 11 L 16 16 L 6 11 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M 6 15 L 16 20 L 26 15"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M 6 19 L 16 24 L 26 19"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Central Text Label */}
            <text
              x={centerX}
              y={centerY + 20}
              textAnchor="middle"
              className="font-black text-[12px] fill-slate-900 dark:fill-white font-sans tracking-tight"
            >
              {APP_NAME}
            </text>
            <text
              x={centerX}
              y={centerY + 32}
              textAnchor="middle"
              className="font-bold text-[9px] fill-indigo-600 dark:fill-indigo-400 font-mono"
            >
              DPI CORE HUB
            </text>
          </g>

          {/* 6 Peripheral Department Nodes */}
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept.id === dept.id;
            const Icon = dept.icon;

            return (
              <g
                key={`node-${dept.id}`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedDept(dept)}
              >
                {/* Highlight Halo Ring when Selected */}
                {isSelected && (
                  <circle
                    cx={dept.x}
                    cy={dept.y}
                    r={46}
                    fill={dept.color.glow}
                    className="animate-ping opacity-40"
                  />
                )}

                {/* Outer Department Card Circle */}
                <circle
                  cx={dept.x}
                  cy={dept.y}
                  r={38}
                  fill={dept.color.fill}
                  stroke={dept.color.stroke}
                  strokeWidth={isSelected ? 3.5 : 2}
                  className="transition-all hover:scale-110 drop-shadow-sm"
                />

                {/* Inner White / Dark Backing Circle */}
                <circle
                  cx={dept.x}
                  cy={dept.y}
                  r={28}
                  className="fill-white dark:fill-slate-900"
                />

                {/* Department Node Icon */}
                <foreignObject
                  x={dept.x - 14}
                  y={dept.y - 14}
                  width="28"
                  height="28"
                  className="pointer-events-none"
                >
                  <div className={`w-full h-full flex items-center justify-center ${dept.color.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </foreignObject>

                {/* Primary Department Name Label */}
                <text
                  x={dept.x}
                  y={dept.y > centerY ? dept.y + 54 : dept.y - 48}
                  textAnchor="middle"
                  className={`font-black text-[12px] font-sans tracking-tight ${
                    isSelected
                      ? "fill-indigo-600 dark:fill-indigo-400"
                      : "fill-slate-900 dark:fill-white"
                  }`}
                >
                  {language === "hi" ? dept.nameHi : dept.nameEn}
                </text>

                {/* Secondary Category / Sub-label */}
                <text
                  x={dept.x}
                  y={dept.y > centerY ? dept.y + 68 : dept.y - 34}
                  textAnchor="middle"
                  className="font-medium text-[10px] fill-slate-500 dark:fill-slate-400 font-sans"
                >
                  {dept.category}
                </text>

                {/* Live packet telemetry pill */}
                <rect
                  x={dept.x - 30}
                  y={dept.y > centerY ? dept.y + 74 : dept.y - 26}
                  width="60"
                  height="16"
                  rx="8"
                  className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="0.8"
                />
                <text
                  x={dept.x}
                  y={dept.y > centerY ? dept.y + 85 : dept.y - 15}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold fill-emerald-600 dark:fill-emerald-400"
                >
                  {dept.packetRate}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM TELEMETRY DRAWER: Live Handshake Inspector for Selected Department */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-4 sm:p-6 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Department Meta & Role */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedDept.color.badge}`}>
                {selectedDept.category}
              </span>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {language === "hi" ? selectedDept.nameHi : selectedDept.nameEn}
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                • {selectedDept.latencyMs}ms response
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {language === "hi" ? selectedDept.roleHi : selectedDept.roleEn}
            </p>

            {/* Live Data Handshake Description */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <Database className="h-3 w-3 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Data Flow:</span>
              <span className="truncate">
                {language === "hi" ? selectedDept.dataFlowHi : selectedDept.dataFlowEn}
              </span>
            </div>
          </div>

          {/* Technical Protocol Specs Card */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 flex flex-col gap-1.5 text-xs shadow-2xs min-w-[260px]">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Standard / Protocol:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDept.protocol}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>API Gateway:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedDept.endpoint}</span>
            </div>

            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-900 flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="leading-tight">
                {language === "hi" ? selectedDept.lastEventHi : selectedDept.lastEventEn}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Department Selector Pills */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Switch Node:
          </span>
          {DEPARTMENTS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDept(d)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition cursor-pointer border ${
                selectedDept.id === d.id
                  ? `${d.color.badge} shadow-xs font-bold`
                  : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {language === "hi" ? d.nameHi.split(" ")[0] : d.nameEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
