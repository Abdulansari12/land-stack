"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Landmark, ArrowLeft, ShieldCheck, Database, Layers } from "lucide-react";
import BankVerificationModal from "@/components/BankVerificationModal";
import { LandParcelFeature } from "@/data/parcels";

export default function BankVerificationPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  const handleNavigateToParcel = (parcel: LandParcelFeature) => {
    router.push(`/?ulpin=${encodeURIComponent(parcel.properties.ulpin)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-blue-950/30 pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-amber-400">
              <Landmark className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Land Stack <span className="text-amber-400 font-mono text-xs">/ Bank Interoperability</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/national-view"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span>National Rollout</span>
          </Link>
          <Link
            href="/impact"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Economic Impact</span>
          </Link>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            >
              Re-open Portal
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        {isOpen ? (
          <BankVerificationModal
            isOpen={isOpen}
            onClose={handleClose}
            onNavigateToParcel={handleNavigateToParcel}
            inline={true}
          />
        ) : (
          <div className="text-center p-8 max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Landmark className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-white mb-2">Portal Session Closed</h1>
            <p className="text-xs text-slate-400 mb-6">
              You can reopen the Interstate Collateral Verification Portal or return to the main Land Stack interactive map.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Launch Verification Portal
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Back to Map
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
