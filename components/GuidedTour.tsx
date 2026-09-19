"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  MapPin,
  Layers,
  Shield,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  onLaunchAIScan?: () => void;
}

interface TourStepConfig {
  id: string;
  targetSelector: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  preferredPosition: "bottom" | "top" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    id: "search",
    targetSelector: '[data-tour="search-bar"]',
    icon: Search,
    title: "1. Unified Cadastral Search",
    description:
      "Search land parcels across heterogeneous state registries by 14-digit ULPIN, Khasra survey plot number, or registered owner name with real-time filtering and ⌘K quick access.",
    badge: "Step 1 of 5",
    preferredPosition: "bottom",
  },
  {
    id: "map",
    targetSelector: '[data-tour="map-area"]',
    icon: MapPin,
    title: "2. Interactive Cadastral Map",
    description:
      "Cadastral polygons are rendered dynamically with health coloration: 🟢 Green for Verified titles, 🔴 Red for Disputed land, 🟡 Amber for Pending. We've highlighted a sample parcel for you!",
    badge: "Step 2 of 5",
    preferredPosition: "right",
  },
  {
    id: "drawer-tabs",
    targetSelector: '[data-tour="drawer-tabs"]',
    icon: Layers,
    title: "3. Three-Tier Record Drawer",
    description:
      "Inspect detailed cadastral data across 3 tabs: Essential (RoR title & historical ownership chain), Base Spatial (ULPIN & raw state payloads), and Use-Case (property tax & municipal utility easements).",
    badge: "Step 3 of 5",
    preferredPosition: "left",
  },
  {
    id: "role-toggle",
    targetSelector: '[data-tour="role-toggle"]',
    icon: Shield,
    title: "4. Citizen vs. Officer Perspectives",
    description:
      "Switch perspectives instantly. Citizen view offers public transparency and title verification, while Officer view unlocks executive analytics, title mutation controls, and DPDP Act consent workflows.",
    badge: "Step 4 of 5",
    preferredPosition: "bottom",
  },
  {
    id: "ai-encroachment",
    targetSelector: '[data-tour="ai-encroachment"]',
    icon: Radio,
    title: "5. AI Satellite Encroachment Detection",
    description:
      "For revenue officers: Trigger multi-temporal satellite radar scans to detect unauthorized constructions with 94% CNN confidence and auto-generate official legal notices under UP Revenue Code § 67!",
    badge: "Step 5 of 5",
    preferredPosition: "left",
  },
];

export default function GuidedTour({
  isOpen,
  onClose,
  currentStep,
  onStepChange,
  onLaunchAIScan,
}: GuidedTourProps) {
  const { t } = useLanguage();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const activeStepConfig = TOUR_STEPS[currentStep - 1] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    const targetElement = document.querySelector(activeStepConfig.targetSelector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, activeStepConfig.targetSelector]);

  // Update target rect on step change or window resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow potential drawer open / role toggle animations
    const timer = setTimeout(() => {
      updateTargetPosition();
    }, 150);

    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [isOpen, currentStep, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < totalSteps) {
          onStepChange(currentStep + 1);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft" && currentStep > 1) {
        onStepChange(currentStep - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, totalSteps, onStepChange, onClose]);

  if (!isOpen) return null;

  // Calculate tooltip position relative to target
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10000,
  };

  const cardWidth = 350;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768;

  if (targetRect && viewportWidth >= 768) {
    const { preferredPosition } = activeStepConfig;

    if (preferredPosition === "bottom") {
      tooltipStyle.top = Math.min(targetRect.bottom + 16, viewportHeight - 280);
      tooltipStyle.left = Math.max(16, Math.min(targetRect.left, viewportWidth - cardWidth - 24));
    } else if (preferredPosition === "left") {
      tooltipStyle.top = Math.max(20, Math.min(targetRect.top, viewportHeight - 320));
      tooltipStyle.left = Math.max(16, targetRect.left - cardWidth - 20);
    } else if (preferredPosition === "right") {
      tooltipStyle.top = Math.max(80, Math.min(targetRect.top + 20, viewportHeight - 320));
      tooltipStyle.left = Math.min(targetRect.left + 24, viewportWidth - cardWidth - 24);
    } else {
      tooltipStyle.top = Math.max(80, Math.min(targetRect.bottom + 16, viewportHeight - 300));
      tooltipStyle.left = Math.max(16, Math.min(targetRect.left, viewportWidth - cardWidth - 24));
    }
  } else {
    // Mobile or fallback: floating centered card near bottom
    tooltipStyle.bottom = 24;
    tooltipStyle.left = "50%";
    tooltipStyle.transform = "translateX(-50%)";
    tooltipStyle.width = "calc(100% - 32px)";
    tooltipStyle.maxWidth = `${cardWidth}px`;
  }

  const StepIcon = activeStepConfig.icon;

  return (
    <>
      {/* Backdrop & Transparent Cutout Spotlight */}
      {targetRect ? (
        <>
          {/* Transparent click catcher to allow closing when clicking outside */}
          <div
            data-testid="guided-tour-backdrop"
            onClick={onClose}
            className="fixed inset-0 z-[9990] bg-transparent cursor-pointer"
          />

          {/* Spotlight Cutout: Inside is 100% clear and unblurred; outward 9999px shadow darkens everything else */}
          <div
            data-testid="guided-tour-spotlight"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.78)",
              zIndex: 9995,
              borderRadius: "16px",
            }}
            className="ring-4 ring-indigo-500 ring-offset-2 ring-offset-transparent shadow-[0_0_35px_rgba(99,102,241,0.7)] animate-pulse transition-all duration-300"
          />
        </>
      ) : (
        /* Fallback darkened backdrop if targetRect is not yet measured */
        <div
          data-testid="guided-tour-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-[9990] bg-slate-950/78 transition-opacity duration-300 cursor-pointer"
        />
      )}

      {/* Floating Tour Tooltip Card */}
      <div
        data-testid="guided-tour-card"
        style={tooltipStyle}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-700 p-5 w-[350px] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header: Badge, Step Counter, and Close 'X' */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span>{activeStepConfig.badge}</span>
          </div>

          <button
            type="button"
            data-testid="tour-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title with Icon */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <StepIcon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {activeStepConfig.title}
          </h3>
        </div>

        {/* Step Description */}
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
          {activeStepConfig.description}
        </p>

        {/* Special Action on Step 5: Launch AI Scan Directly */}
        {currentStep === 5 && onLaunchAIScan && (
          <div className="mb-4">
            <button
              type="button"
              data-testid="tour-launch-ai-btn"
              onClick={() => {
                onClose();
                onLaunchAIScan();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Radio className="h-3.5 w-3.5 animate-spin" />
              <span>Launch Live AI Radar Scan 🛰️</span>
            </button>
          </div>
        )}

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {TOUR_STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCurrent = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange(stepNum)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? "w-6 bg-indigo-600 dark:bg-indigo-500"
                    : isCompleted
                    ? "w-2 bg-indigo-300 dark:bg-indigo-800"
                    : "w-2 bg-slate-200 dark:bg-zinc-700"
                }`}
                title={`Go to step ${stepNum}`}
                aria-label={`Step ${stepNum}`}
              />
            );
          })}
        </div>

        {/* Footer Navigation Buttons: Skip Tour, Prev, Next */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            data-testid="tour-skip-btn"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            {t("skipTour") || "Skip Tour"}
          </button>

          <div className="flex items-center gap-1.5">
            {currentStep > 1 && (
              <button
                type="button"
                data-testid="tour-prev-btn"
                onClick={() => onStepChange(currentStep - 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>{t("prevStep") || "Back"}</span>
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                data-testid="tour-next-btn"
                onClick={() => onStepChange(currentStep + 1)}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition cursor-pointer"
              >
                <span>{t("nextStep") || "Next"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                data-testid="tour-finish-btn"
                onClick={onClose}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm shadow-green-500/20 transition cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t("finishTour") || "Done"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
