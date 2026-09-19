"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Layers,
  AlertTriangle,
  Clock,
  Receipt,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Filter,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
} from "@/data/parcels";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingState, ErrorState } from "@/components/ui";

const LAND_USE_COLORS: Record<string, string> = {
  Agricultural: "#10b981", // emerald-500
  Residential: "#6366f1",  // indigo-500
  Commercial: "#f59e0b",   // amber-500
  Industrial: "#8b5cf6",   // violet-500
  Institutional: "#ec4899", // pink-500
  "Mixed Use": "#06b6d4",  // cyan-500
};

export default function OfficerDashboardPage() {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Aggregate normalized parcels across state registries
  const allParcels = useMemo(() => {
    const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
    const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");

    if (selectedState === "Tamil Nadu") return tn.features;
    if (selectedState === "Chandigarh") return ch.features;
    if (selectedState === "Uttar Pradesh") return up.features;
    return [...up.features, ...tn.features, ...ch.features];
  }, [selectedState]);

  // 1. Total Parcels count from parcels.ts
  const totalParcelsCount = allParcels.length;

  // 2. Disputed Parcels count (where rorStatus is disputed)
  const disputedParcelsCount = allParcels.filter(
    (p) =>
      p.properties.rorStatus?.toLowerCase().includes("dispute") ||
      p.properties.clearOrDisputed?.toLowerCase() === "disputed"
  ).length;

  // 3. Pending Mutations (a dummy static number as requested)
  const pendingMutationsCount = 24;

  // 4. Tax Defaulters (count where taxStatus is unpaid / pending / overdue)
  const taxDefaultersCount = allParcels.filter((p) => {
    const status = p.properties.taxStatus?.toLowerCase() || "";
    return (
      status.includes("overdue") ||
      status.includes("pending") ||
      status.includes("unpaid")
    );
  }).length;

  // Recharts data grouped by landUse type
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    allParcels.forEach((p) => {
      const type = p.properties.landUse || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([landUse, count]) => ({
      landUse,
      count,
      percentage: Math.round((count / (allParcels.length || 1)) * 100),
      color: LAND_USE_COLORS[landUse] || "#64748b",
    }));
  }, [allParcels]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 dark:bg-zinc-900 border border-slate-700 dark:border-zinc-700 p-3 rounded-xl shadow-xl text-xs font-sans">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-white">{data.landUse}</span>
          </div>
          <div className="text-slate-300">
            Parcels: <strong className="text-white font-mono">{data.count}</strong>
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            Share: {data.percentage}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back Link & Branding */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("backToMap")}</span>
            </Link>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/20">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {t("dashboardTitle")}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {t("dashboardSubtitle")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Badges & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle Button (EN/HI) */}
            <div
              data-testid="language-toggle-group-dashboard"
              className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0"
            >
              <button
                type="button"
                data-testid="lang-btn-en"
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                }`}
                title="Switch to English (EN)"
                aria-label="English"
              >
                <span>EN</span>
              </button>
              <span className="text-slate-300 dark:text-zinc-600 text-xs select-none">/</span>
              <button
                type="button"
                data-testid="lang-btn-hi"
                onClick={() => setLanguage("hi")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                  language === "hi"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                }`}
                title="Switch to Hindi (हिन्दी)"
                aria-label="Hindi"
              >
                <span>HI</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{t("roleOfficer")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!mounted ? (
          <div className="py-12">
            <LoadingState
              variant="card"
              size="lg"
              label="Loading Cadastral Analytics..."
              description="Synthesizing multi-state cadastral telemetry and jurisdiction metrics..."
            />
          </div>
        ) : allParcels.length === 0 ? (
          <div className="py-12">
            <ErrorState
              variant="card"
              size="lg"
              title="No Cadastral Records Found"
              message={`No parcel records were found for jurisdiction "${selectedState}".`}
              onRetry={() => setSelectedState("all")}
              retryLabel="Reset Jurisdiction Filter"
            />
          </div>
        ) : (
          <>
            {/* Officer Clearance Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-slate-100 dark:to-zinc-900 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Restricted Cadastral Jurisdiction View
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Aggregated metrics computed from normalized land parcel records across Uttar Pradesh, 
                Tamil Nadu, and Chandigarh registries.
              </p>
            </div>
          </div>

          {/* State Jurisdiction Filter */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-xs"
            >
              <option value="all">All Jurisdictions (Unified)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (Lucknow)</option>
              <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
              <option value="Chandigarh">Chandigarh (UT)</option>
            </select>
          </div>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* CARD 1: Total Parcels */}
          <div
            data-testid="card-total-parcels"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t("totalParcels")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {totalParcelsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Indexed from parcels.ts</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Disputed Parcels */}
          <div
            data-testid="card-disputed-parcels"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t("disputedParcels")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/40">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 font-mono tracking-tight">
                {disputedParcelsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                <span>RoR status disputed / litigation</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Pending Mutations */}
          <div
            data-testid="card-pending-mutations"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t("pendingMutations")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                {pendingMutationsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                <span>Hearing schedule pending</span>
              </div>
            </div>
          </div>

          {/* CARD 4: Tax Defaulters */}
          <div
            data-testid="card-tax-defaulters"
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t("taxDefaulters")}
              </span>
              <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/40">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 font-mono tracking-tight">
                {taxDefaultersCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                <span>Arrears pending municipal notice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Analytics: Bar Chart of Parcels Grouped by Land Use */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Parcels Grouped by Land Use Classification
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Distribution of land parcels by designated zoning category (Agricultural, Residential, Commercial, Industrial, Mixed Use)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700">
              <Building2 className="h-3.5 w-3.5 text-indigo-500" />
              <span>{chartData.length} Active Categories</span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="w-full h-80">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    className="dark:stroke-zinc-800"
                  />
                  <XAxis
                    dataKey="landUse"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={64}
                    animationDuration={600}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-2" />
                <span>Loading Analytics Chart...</span>
              </div>
            )}
          </div>

          {/* Summary Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {chartData.map((item) => (
              <div
                key={item.landUse}
                className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.landUse}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {item.count}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 py-6 text-center text-xs text-slate-500 font-mono">
        CivicPortal Cadastral Officer Console • Real-time RoR Adjudication Engine
      </footer>
    </div>
  );
}
