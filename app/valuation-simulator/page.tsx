"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Landmark, Layers, Database } from "lucide-react";
import LandValuationSimulator from "@/components/LandValuationSimulator";

export default function ValuationSimulatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Land Stack <span className="text-indigo-600 dark:text-indigo-400 font-mono text-xs">/ AI Growth Simulator</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/bank-verification"
            className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Landmark className="h-3.5 w-3.5 text-blue-500" />
            <span>Bank Verification</span>
          </Link>
          <Link
            href="/impact"
            className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Database className="h-3.5 w-3.5 text-emerald-500" />
            <span>National Economic Case</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <LandValuationSimulator inline={true} />
      </main>
    </div>
  );
}
