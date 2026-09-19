"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  ShieldCheck,
  Clock,
  Building2,
  TrendingDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface ImpactStatsCounterProps {
  variant?: "hero-cards" | "collapsible-strip" | "compact";
  className?: string;
  defaultExpanded?: boolean;
}

interface StatConfig {
  id: string;
  labelEn: string;
  labelHi: string;
  target: number;
  suffix?: string;
  prefix?: string;
  formatNumber: boolean;
  descEn: string;
  descHi: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    glowColor: string;
  };
}

const STATS: StatConfig[] = [
  {
    id: "parcels",
    labelEn: "Parcels Digitized",
    labelHi: "डिजिटाइज़्ड भू-खंड",
    target: 12847,
    formatNumber: true,
    descEn: "Normalized across UP, TN & Chandigarh",
    descHi: "3 राज्यों में एकीकृत भू-कर",
    icon: Layers,
    color: {
      iconBg: "bg-indigo-500/10 dark:bg-indigo-950/60",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      badgeBg: "bg-indigo-50 dark:bg-indigo-950/40",
      badgeText: "text-indigo-700 dark:text-indigo-300",
      borderColor: "border-indigo-200 dark:border-indigo-800/60",
      glowColor: "group-hover:shadow-indigo-500/10",
    },
  },
  {
    id: "disputes",
    labelEn: "Disputes Resolved",
    labelHi: "निस्तारित भूमि विवाद",
    target: 342,
    formatNumber: true,
    descEn: "Via AI Encroachment & Hash-Chain Audit",
    descHi: "उपग्रह व ब्लॉकचेन सत्यापन द्वारा",
    icon: ShieldCheck,
    color: {
      iconBg: "bg-emerald-500/10 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      borderColor: "border-emerald-200 dark:border-emerald-800/60",
      glowColor: "group-hover:shadow-emerald-500/10",
    },
  },
  {
    id: "mutation",
    labelEn: "Avg. Mutation Time Reduced",
    labelHi: "औसत दाखिल-खारिज समय बचत",
    target: 68,
    suffix: "%",
    formatNumber: false,
    descEn: "Accelerated from 45 days to 14 days",
    descHi: "45 दिनों से घटकर मात्र 14 दिन",
    icon: Clock,
    color: {
      iconBg: "bg-amber-500/10 dark:bg-amber-950/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-50 dark:bg-amber-950/40",
      badgeText: "text-amber-700 dark:text-amber-300",
      borderColor: "border-amber-200 dark:border-amber-800/60",
      glowColor: "group-hover:shadow-amber-500/10",
    },
  },
  {
    id: "departments",
    labelEn: "Departments Integrated",
    labelHi: "एकीकृत सरकारी विभाग",
    target: 6,
    formatNumber: false,
    descEn: "Revenue, Survey, Stamps, MC & Banks",
    descHi: "राजस्व, सर्वे, स्टांप, निगम व बैंक",
    icon: Building2,
    color: {
      iconBg: "bg-purple-500/10 dark:bg-purple-950/60",
      iconColor: "text-purple-600 dark:text-purple-400",
      badgeBg: "bg-purple-50 dark:bg-purple-950/40",
      badgeText: "text-purple-700 dark:text-purple-300",
      borderColor: "border-purple-200 dark:border-purple-800/60",
      glowColor: "group-hover:shadow-purple-500/10",
    },
  },
];

/**
 * Animated individual counter component with ease-out cubic interpolation
 */
function SingleAnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  formatNumber,
  triggerKey,
  duration = 1500,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  formatNumber: boolean;
  triggerKey: number;
  duration?: number;
}) {
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic formula for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrentVal(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentVal(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, triggerKey]);

  const displayString = formatNumber
    ? currentVal.toLocaleString("en-IN")
    : currentVal.toString();

  return (
    <span className="tabular-nums">
      {prefix}
      {displayString}
      {suffix}
    </span>
  );
}

export default function ImpactStatsCounter({
  variant = "hero-cards",
  className = "",
  defaultExpanded = true,
}: ImpactStatsCounterProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [triggerKey, setTriggerKey] = useState(0);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTriggerKey((prev) => prev + 1);
  };

  // =========================================================================
  // 1. COLLAPSIBLE TOP STRIP (for Dashboard app/page.tsx)
  // =========================================================================
  if (variant === "collapsible-strip") {
    return (
      <div
        data-testid="dashboard-impact-strip"
        className={`w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 overflow-hidden ${className}`}
      >
        {/* Strip Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2.5 bg-slate-50/80 dark:bg-zinc-800/50 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 flex items-center justify-between cursor-pointer select-none transition-colors border-b border-slate-200/80 dark:border-zinc-800"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {language === "hi"
                  ? "राष्ट्रीय भू-सुधार प्रभाव मेट्रिक्स (लाइव टेलीमेट्री)"
                  : "National Land Governance DPI Impact Metrics"}
              </span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Live Impact
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplay}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              title="Replay counter animation"
              aria-label="Replay counter animation"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              aria-label={isExpanded ? "Collapse impact strip" : "Expand impact strip"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className={`p-3 rounded-xl border ${stat.color.borderColor} bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col justify-between transition-all hover:shadow-xs group`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 line-clamp-1">
                      {language === "hi" ? stat.labelHi : stat.labelEn}
                    </span>
                    <div className={`p-1.5 rounded-lg ${stat.color.iconBg} ${stat.color.iconColor}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    <SingleAnimatedCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      formatNumber={stat.formatNumber}
                      triggerKey={triggerKey}
                    />
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">
                    {language === "hi" ? stat.descHi : stat.descEn}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. HERO CARDS (Flagship design for Welcome Page app/welcome/page.tsx)
  // =========================================================================
  return (
    <div
      data-testid="welcome-impact-stats-section"
      className={`w-full ${className}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            {language === "hi"
              ? "राष्ट्रीय स्तर पर डिजिटल प्रभाव (DPI स्केल)"
              : "National DPI Scale & Measured Impact"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReplay}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
          title="Replay counter animation"
          aria-label="Replay counter animation"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Replay</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="relative p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-zinc-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 backdrop-blur-md shadow-sm hover:shadow-xl dark:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Subtle Ambient Radial Glow on Hover */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

              {/* Icon & Category Pill */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div
                  className={`h-9 w-9 rounded-xl ${stat.color.iconBg} ${stat.color.iconColor} border border-slate-200/60 dark:border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-current/20 ${stat.color.badgeBg} ${stat.color.badgeText}`}
                >
                  {stat.id === "parcels"
                    ? "Coverage"
                    : stat.id === "disputes"
                    ? "Resolution"
                    : stat.id === "mutation"
                    ? "Efficiency"
                    : "Interoperability"}
                </span>
              </div>

              {/* Big Animated Count-Up Number */}
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight relative z-10">
                <SingleAnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  formatNumber={stat.formatNumber}
                  triggerKey={triggerKey}
                />
              </div>

              {/* Stat Title */}
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 relative z-10">
                {language === "hi" ? stat.labelHi : stat.labelEn}
              </div>

              {/* Stat Description */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 relative z-10">
                {language === "hi" ? stat.descHi : stat.descEn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
