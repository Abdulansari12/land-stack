"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
  type LandParcelFeature,
  type LandParcelFeatureCollection,
  type LandParcelProperties,
} from "@/data/parcels";
import {
  normalizeParcelFeatureCollection,
  type StateDataSource,
} from "@/lib/schemaAdapter";
import type { NLQueryResult } from "@/lib/nlQuery";
import { MAP_DEFAULT_CENTER, MAP_STATE_CENTERS } from "@/config";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { useAppStore } from "@/lib/store";

// Extracted Modular Components
import Header from "@/components/Header";
import WorkspaceSubheader from "@/components/WorkspaceSubheader";
import MapControls from "@/components/MapControls";
import ParcelSidebarCard from "@/components/ParcelSidebarCard";
import PresentationModeIndicator from "@/components/PresentationModeIndicator";
import ParcelDrawer from "@/components/ParcelDrawer";
import ImpactStatsCounter from "@/components/ImpactStatsCounter";
import AskLandStack from "@/components/AskLandStack";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import MapLoadingSkeleton from "@/components/MapLoadingSkeleton";

// Dynamic import with SSR disabled and high-fidelity GIS skeleton
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

// Dynamic import for heavy 3D WebGL Deck.gl engine (>640KB chunk split)
const DeckGL3DMap = dynamic(() => import("@/components/DeckGL3DMap"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

// Lazy-loaded interactive modals (loaded on user interaction to save initial bundle payload)
const AIEncroachmentModal = dynamic(() => import("@/components/AIEncroachmentModal"), {
  ssr: false,
});
const GuidedTour = dynamic(() => import("@/components/GuidedTour"), {
  ssr: false,
});
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), {
  ssr: false,
});
const EcosystemModal = dynamic(() => import("@/components/EcosystemModal"), {
  ssr: false,
});
const BankVerificationModal = dynamic(() => import("@/components/BankVerificationModal"), {
  ssr: false,
});
const DroneLiDARSimulatorModal = dynamic(() => import("@/components/DroneLiDARSimulatorModal"), {
  ssr: false,
});
const KeyboardShortcutsModal = dynamic(() => import("@/components/KeyboardShortcutsModal"), {
  ssr: false,
});

type Role = "citizen" | "officer";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  // Centralized Zustand App Store (selectedParcel, userRole, currentDataSource, notifications, drawer, etc.)
  const {
    selectedParcel,
    setSelectedParcel,
    userRole: role,
    setUserRole: setRole,
    currentDataSource: dataSource,
    setCurrentDataSource: setDataSource,
    isDrawerOpen,
    setIsDrawerOpen,
    targetCoordinates,
    setTargetCoordinates,
    approvedConsentUlpins,
    setApprovedConsentUlpins,
    isPresentationMode,
    setIsPresentationMode,
    isBankModalOpen,
    openBankModal,
    closeBankModal,
    resetDemoState,
  } = useAppStore();

  // Local Presentation & View Mode States
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(false);
  const [heatmapMode, setHeatmapMode] = useState<"disputes" | "transactions">("disputes");

  // Modals & Query Overlays
  const [isEncroachmentModalOpen, setIsEncroachmentModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [activeNLFilter, setActiveNLFilter] = useState<NLQueryResult | null>(null);
  const [isEcosystemModalOpen, setIsEcosystemModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isDroneModalOpen, setIsDroneModalOpen] = useState<boolean>(false);

  // Normalized parcels based on selected state data source
  const activeParcels = useMemo<LandParcelFeatureCollection>(() => {
    if (dataSource === "Tamil Nadu") {
      return normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    }
    if (dataSource === "Chandigarh") {
      return normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
    }
    const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
    const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
    return {
      type: "FeatureCollection",
      features: [...tn.features, ...ch.features, ...up.features],
    };
  }, [dataSource]);

  // Aggregated dataset across all states for cross-registry searching
  const allAvailableParcels = useMemo<LandParcelFeature[]>(() => {
    const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
    const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
    return [...tn.features, ...ch.features, ...up.features];
  }, []);

  const stateCenter = useMemo<[number, number]>(() => {
    if (dataSource === "Tamil Nadu") return MAP_STATE_CENTERS.tamilNadu;
    if (dataSource === "Chandigarh") return MAP_STATE_CENTERS.chandigarh;
    return MAP_DEFAULT_CENTER;
  }, [dataSource]);

  const handleToggleHeatmap = () => {
    setIsHeatmapActive((prev) => {
      const next = !prev;
      if (next && viewMode === "3D") {
        setViewMode("2D");
      }
      return next;
    });
  };

  const handleResetDemo = () => {
    resetDemoState();
    setViewMode("2D");
    setIsHeatmapActive(false);
    setHeatmapMode("disputes");
    setIsEncroachmentModalOpen(false);
    setIsTourOpen(false);
    setTourStep(1);
    setIsCommandPaletteOpen(false);
    setActiveNLFilter(null);
    setIsEcosystemModalOpen(false);
    setIsShortcutsModalOpen(false);

    if (rawParcelsTamilNadu.features[0]?.geometry?.coordinates?.[0]) {
      setTargetCoordinates(rawParcelsTamilNadu.features[0].geometry.coordinates[0] as [number, number][]);
    }

    toast.success(t("resetDemoSuccess") || "Demo baseline restored cleanly! (0s reload)", {
      icon: "🔄",
      id: "landstack-reset-demo-toast",
      duration: 3000,
    });
  };

  const togglePresentationMode = () => {
    setIsPresentationMode((prev) => {
      const next = !prev;
      if (next) {
        toast.success(
          t("presentationModeEntered") ||
            "Presentation Mode activated! Projector optimized with 3s idle cursor auto-hide.",
          {
            icon: "📽️",
            id: "presentation-mode-toast",
            duration: 3500,
          }
        );
      } else {
        toast(t("presentationModeExited") || "Exited Presentation Mode", {
          icon: "🖥️",
          id: "presentation-mode-toast",
          duration: 2000,
        });
      }
      return next;
    });
  };

  // Auto-hide mouse cursor after 3 seconds of inactivity in Presentation Mode
  useEffect(() => {
    if (!isPresentationMode) {
      document.body.classList.remove("hide-cursor");
      return;
    }

    let idleTimer: NodeJS.Timeout;
    const resetCursorTimer = () => {
      document.body.classList.remove("hide-cursor");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        document.body.classList.add("hide-cursor");
      }, 3000);
    };

    resetCursorTimer();
    window.addEventListener("mousemove", resetCursorTimer);
    window.addEventListener("mousedown", resetCursorTimer);
    window.addEventListener("keydown", resetCursorTimer);
    window.addEventListener("touchstart", resetCursorTimer);

    return () => {
      clearTimeout(idleTimer);
      document.body.classList.remove("hide-cursor");
      window.removeEventListener("mousemove", resetCursorTimer);
      window.removeEventListener("mousedown", resetCursorTimer);
      window.removeEventListener("keydown", resetCursorTimer);
      window.removeEventListener("touchstart", resetCursorTimer);
    };
  }, [isPresentationMode]);

  const handleStartTour = () => {
    setTourStep(1);
    setIsTourOpen(true);
  };

  const handleTourStepChange = (step: number) => {
    setTourStep(step);
    if (step === 2) {
      const sample = activeParcels.features[0]?.properties;
      if (sample) {
        setSelectedParcel(sample);
        setIsDrawerOpen(true);
        if (activeParcels.features[0]?.geometry?.coordinates?.[0]) {
          setTargetCoordinates(activeParcels.features[0].geometry.coordinates[0] as [number, number][]);
        }
      }
    }
    if (step === 3 || step === 5) {
      if (step === 5) setRole("officer");
      if (!selectedParcel && activeParcels.features[0]) {
        setSelectedParcel(activeParcels.features[0].properties);
      }
      setIsDrawerOpen(true);
    }
  };

  const handleApproveConsent = (ulpin: string) => {
    setApprovedConsentUlpins((prev) => (prev.includes(ulpin) ? prev : [...prev, ulpin]));
  };

  const handleDataSourceChange = (newSource: StateDataSource) => {
    setDataSource(newSource);
    setSelectedParcel(null);
    setIsDrawerOpen(false);
    const nextCoordinates =
      newSource === "Tamil Nadu"
        ? rawParcelsTamilNadu.features[0]?.geometry?.coordinates?.[0]
        : newSource === "Chandigarh"
        ? rawParcelsChandigarh.features[0]?.geometry?.coordinates?.[0]
        : rawParcelsTamilNadu.features[0]?.geometry?.coordinates?.[0];

    if (nextCoordinates) {
      setTargetCoordinates(nextCoordinates as [number, number][]);
    }
  };

  const handleSelectParcelFromSearch = (parcelFeature: LandParcelFeature) => {
    const state = parcelFeature.properties?.sourceState;
    if (state === "Tamil Nadu" && dataSource !== "Tamil Nadu" && dataSource !== "Unified View") {
      setDataSource("Tamil Nadu");
    } else if (state === "Chandigarh" && dataSource !== "Chandigarh" && dataSource !== "Unified View") {
      setDataSource("Chandigarh");
    } else if (state === "Uttar Pradesh" && dataSource !== "Unified View") {
      setDataSource("Unified View");
    }

    setSelectedParcel(parcelFeature.properties);
    setIsDrawerOpen(true);
    if (parcelFeature.geometry?.coordinates?.[0]) {
      setTargetCoordinates(parcelFeature.geometry.coordinates[0] as [number, number][]);
    }
  };

  const handleSelectParcelFromCommandPalette = (parcel: LandParcelFeature) => {
    handleSelectParcelFromSearch(parcel);
  };

  const handleSelectParcelByUlpin = (ulpin: string) => {
    const foundParcel = allAvailableParcels.find(
      (p) => p.properties.ulpin.toLowerCase() === ulpin.toLowerCase()
    );
    if (foundParcel) {
      handleSelectParcelFromCommandPalette(foundParcel);
    }
  };

  // Handle URL query parameters on initial page load (e.g. from /verify/[ulpin] or external deep links)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);

    const roleParam = searchParams.get("role")?.toLowerCase();
    if (roleParam === "officer" || roleParam === "citizen") {
      setRole(roleParam as "officer" | "citizen");
    }

    const stateParam = searchParams.get("state");
    if (
      stateParam === "Tamil Nadu" ||
      stateParam === "Chandigarh" ||
      stateParam === "Unified View"
    ) {
      setDataSource(stateParam as StateDataSource);
    }

    const query = searchParams.get("search") || searchParams.get("ulpin");
    if (query) {
      const clean = decodeURIComponent(query).trim().toLowerCase();
      const match = allAvailableParcels.find((p) => {
        const u = p.properties.ulpin.toLowerCase();
        const k = p.properties.khasraNo.toLowerCase();
        const id = p.id.toLowerCase();
        return (
          u === clean ||
          k === clean ||
          id === clean ||
          u.replace(/[^a-z0-9]/g, "") === clean.replace(/[^a-z0-9]/g, "")
        );
      });
      if (match) {
        handleSelectParcelFromSearch(match);
      }
    }
  }, [allAvailableParcels, handleSelectParcelFromSearch, setDataSource, setRole]);

  const handleParcelSelectFromMap = (properties: LandParcelProperties) => {
    setSelectedParcel(properties);
    setIsDrawerOpen(true);
    const match = activeParcels.features.find((f) => f.properties.ulpin === properties.ulpin);
    if (match?.geometry?.coordinates?.[0]) {
      setTargetCoordinates(match.geometry.coordinates[0] as [number, number][]);
    }
  };

  // Wire global keyboard shortcuts hook
  useGlobalKeyboardShortcuts({
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isEcosystemModalOpen,
    setIsEcosystemModalOpen,
    isEncroachmentModalOpen,
    setIsEncroachmentModalOpen,
    isTourOpen,
    setIsTourOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    setSelectedParcel,
    isPresentationMode,
    setIsPresentationMode,
    setIsCommandPaletteOpen,
    toggleTheme,
    setRole,
    setViewMode,
    handleToggleHeatmap,
    handleResetDemo,
    handleStartTour,
    handleDataSourceChange,
    togglePresentationMode,
    t,
  });

  // Dynamic status counts for subheader (memoized to prevent re-filtering on incidental renders)
  const { clearCount, disputedCount, inReviewCount } = useMemo(() => {
    let clear = 0;
    let disputed = 0;
    for (const f of activeParcels.features) {
      const clearStatus = f.properties.clearOrDisputed?.toLowerCase();
      const rorStatus = f.properties.rorStatus?.toLowerCase();
      if (
        clearStatus === "clear" ||
        rorStatus === "verified" ||
        rorStatus === "digitally signed"
      ) {
        clear++;
      } else if (clearStatus === "disputed" || rorStatus === "disputed") {
        disputed++;
      }
    }
    return {
      clearCount: clear,
      disputedCount: disputed,
      inReviewCount: activeParcels.features.length - clear - disputed,
    };
  }, [activeParcels]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-all duration-300 ${
        isPresentationMode ? "presentation-mode" : ""
      }`}
    >
      {/* Extracted Top Header Navigation (Zustand Store Backed) */}
      <Header
        dataSource={dataSource}
        onDataSourceChange={handleDataSourceChange}
        activeParcels={activeParcels}
        onSelectParcel={handleSelectParcelFromSearch}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTour={handleStartTour}
        onOpenEcosystem={() => setIsEcosystemModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenBankVerification={openBankModal}
        onSelectParcelByUlpin={handleSelectParcelByUlpin}
      />

      {/* Main Workspace Area */}
      <main
        className={`flex-1 w-full mx-auto p-4 sm:p-6 flex flex-col gap-5 transition-all duration-300 ${
          isPresentationMode ? "max-w-full lg:px-8" : "max-w-7xl lg:p-8"
        }`}
      >
        {/* Collapsible National DPI Impact Metrics Strip */}
        {!isPresentationMode && (
          <ImpactStatsCounter variant="collapsible-strip" defaultExpanded={false} />
        )}

        {/* Extracted Workspace Sub-header */}
        <WorkspaceSubheader
          clearCount={clearCount}
          disputedCount={disputedCount}
          inReviewCount={inReviewCount}
        />

        {/* 'Ask Land Stack' Natural Language AI Cadastral Query Bar */}
        <AskLandStack
          parcels={activeParcels}
          onFilterChange={setActiveNLFilter}
          activeResult={activeNLFilter}
        />

        {/* Main Workspace: Interactive Map & Right-Side Drawer Area / Placeholder */}
        <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Map Section */}
          <div
            data-tour="map-area"
            className={`flex-1 flex flex-col relative transition-all duration-300 ${
              isPresentationMode
                ? "min-h-[72vh] lg:min-h-[80vh]"
                : "min-h-[420px] sm:min-h-[500px] md:min-h-[580px]"
            }`}
          >
            {/* Extracted Floating Map Controls & Scale Legend */}
            <MapControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isHeatmapActive={isHeatmapActive}
              onToggleHeatmap={handleToggleHeatmap}
              heatmapMode={heatmapMode}
              onHeatmapModeChange={setHeatmapMode}
              onLaunchDroneSurvey={() => setIsDroneModalOpen(true)}
            />

            {viewMode === "2D" ? (
              <MapErrorBoundary fallbackMessage={t("mapTemporarilyUnavailable")}>
                <MapComponent
                  key={`map-${dataSource}-${isHeatmapActive ? "heat-on" : "heat-off"}-${isDark ? "dark" : "light"}`}
                  className="flex-1 min-h-[420px] sm:min-h-[500px] md:min-h-[580px] w-full rounded-2xl shadow-sm"
                  center={stateCenter}
                  parcels={activeParcels}
                  onParcelSelect={handleParcelSelectFromMap}
                  targetCoordinates={targetCoordinates}
                  selectedUlpin={isDrawerOpen && selectedParcel ? selectedParcel.ulpin : null}
                  highlightedUlpins={activeNLFilter ? activeNLFilter.matchingParcelUlpins : null}
                  isHeatmapVisible={isHeatmapActive}
                  heatmapMode={heatmapMode}
                  isDarkMode={isDark}
                />
              </MapErrorBoundary>
            ) : (
              <DeckGL3DMap
                key={`deckgl-${dataSource}-${isDark ? "dark" : "light"}`}
                className="flex-1 min-h-[420px] sm:min-h-[500px] md:min-h-[580px] w-full rounded-2xl shadow-sm"
                center={stateCenter}
                parcels={activeParcels}
                selectedUlpin={isDrawerOpen && selectedParcel ? selectedParcel.ulpin : null}
                highlightedUlpins={activeNLFilter ? activeNLFilter.matchingParcelUlpins : null}
                onParcelSelect={handleParcelSelectFromMap}
                isDarkMode={isDark}
              />
            )}
          </div>

          {/* Extracted Right-Side Drawer Area / Placeholder (Direct Zustand Subscription) */}
          {(!isPresentationMode || (selectedParcel && isDrawerOpen)) && (
            <ParcelSidebarCard />
          )}
        </div>
      </main>

      {/* 400px Right-Side Sliding Drawer (Direct Zustand Subscription) */}
      <ParcelDrawer
        onFlagEncroachment={() => setIsEncroachmentModalOpen(true)}
      />

      {/* AI Satellite Encroachment Detection Modal */}
      <AIEncroachmentModal
        isOpen={isEncroachmentModalOpen}
        onClose={() => setIsEncroachmentModalOpen(false)}
        parcel={selectedParcel}
      />

      {/* Interactive Step-by-Step Guided Tour for Hackathon Judges */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        currentStep={tourStep}
        onStepChange={handleTourStepChange}
        onLaunchAIScan={() => setIsEncroachmentModalOpen(true)}
      />

      {/* Institutional Interoperability Ecosystem Modal */}
      <EcosystemModal
        isOpen={isEcosystemModalOpen}
        onClose={() => setIsEcosystemModalOpen(false)}
      />

      {/* Global Cmd+K / Ctrl+K Command Palette Modal Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        parcels={allAvailableParcels}
        onSelectParcel={handleSelectParcelFromCommandPalette}
        onDataSourceChange={handleDataSourceChange}
        onStartTour={handleStartTour}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Power-User Keyboard Shortcuts Help Dialog ('?') */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Interstate Bank Verification Modal */}
      <BankVerificationModal
        isOpen={isBankModalOpen}
        onClose={closeBankModal}
        onNavigateToParcel={handleSelectParcelFromSearch}
      />

      {/* SVAMITVA 3D Drone LiDAR Autonomous Survey Modal */}
      <DroneLiDARSimulatorModal
        isOpen={isDroneModalOpen}
        onClose={() => setIsDroneModalOpen(false)}
        parcel={selectedParcel}
      />

      {/* Extracted Floating Presentation Mode Exit Indicator Pill */}
      {isPresentationMode && (
        <PresentationModeIndicator onExit={togglePresentationMode} />
      )}
    </div>
  );
}
