"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radar, Landmark, Database } from "lucide-react";
import DroneLiDARSimulatorModal from "@/components/DroneLiDARSimulatorModal";

export default function DroneSurveyPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Radar className="h-4 w-4 animate-spin" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Land Stack <span className="text-cyan-400 font-mono text-xs">/ SVAMITVA 3D Drone LiDAR</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/valuation-simulator"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <span>Valuation AI</span>
          </Link>
          <Link
            href="/bank-verification"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Landmark className="h-3.5 w-3.5 text-blue-400" />
            <span>Bank Verification</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <DroneLiDARSimulatorModal
          isOpen={true}
          onClose={() => {}}
          inline={true}
        />
      </main>
    </div>
  );
}
