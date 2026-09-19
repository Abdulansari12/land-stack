import { useEffect } from "react";
import toast from "react-hot-toast";
import type { StateDataSource } from "@/lib/schemaAdapter";
import type { TranslationKey } from "@/lib/translations";

export interface UseGlobalKeyboardShortcutsProps {
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEcosystemModalOpen: boolean;
  setIsEcosystemModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEncroachmentModalOpen: boolean;
  setIsEncroachmentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTourOpen: boolean;
  setIsTourOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedParcel: (parcel: any) => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
  setRole: (role: "citizen" | "officer" | ((prev: "citizen" | "officer") => "citizen" | "officer")) => void;
  setViewMode: React.Dispatch<React.SetStateAction<"2D" | "3D">>;
  handleToggleHeatmap: () => void;
  handleResetDemo: () => void;
  handleStartTour: () => void;
  handleDataSourceChange: (source: StateDataSource) => void;
  togglePresentationMode: () => void;
  t: (key: TranslationKey) => string;
}

export function useGlobalKeyboardShortcuts({
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
}: UseGlobalKeyboardShortcutsProps) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInputActive =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      // Escape key closes modals / drawer in priority order
      if (e.key === "Escape") {
        if (isShortcutsModalOpen) {
          e.preventDefault();
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isEcosystemModalOpen) {
          e.preventDefault();
          setIsEcosystemModalOpen(false);
          return;
        }
        if (isEncroachmentModalOpen) {
          e.preventDefault();
          setIsEncroachmentModalOpen(false);
          return;
        }
        if (isTourOpen) {
          e.preventDefault();
          setIsTourOpen(false);
          return;
        }
        if (isDrawerOpen) {
          e.preventDefault();
          setIsDrawerOpen(false);
          setSelectedParcel(null);
          return;
        }
        if (isPresentationMode) {
          e.preventDefault();
          setIsPresentationMode(false);
          toast(t("presentationModeExited") || "Exited Presentation Mode", {
            icon: "🖥️",
            id: "presentation-mode-toast",
            duration: 2000,
          });
          return;
        }
      }

      // Command Palette (Cmd+K / Ctrl+K) - works even inside input fields
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // If user is currently typing in an input or textarea, skip single-key or Alt shortcuts
      if (isInputActive) return;

      // '?' or 'Shift + /' to open shortcuts modal
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // '/' to focus search bar
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[data-testid="parcel-search-input"], input[placeholder*="ULPIN"]'
        );
        searchInput?.focus();
        return;
      }

      // Alt + T: Toggle Theme
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Alt + R: Switch Role (Citizen <-> Officer)
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setRole((prev) => (prev === "citizen" ? "officer" : "citizen"));
        return;
      }

      // Alt + V: Toggle 2D / 3D
      if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setViewMode((prev) => (prev === "2D" ? "3D" : "2D"));
        return;
      }

      // Alt + H: Toggle Spatial Heatmap
      if (e.altKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        handleToggleHeatmap();
        return;
      }

      // Alt + D: Reset Demo to Factory Baseline (0s Reload)
      if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleResetDemo();
        return;
      }

      // Alt + E: Toggle Ecosystem Modal
      if (e.altKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsEcosystemModalOpen((prev) => !prev);
        return;
      }

      // Alt + G: Launch 60-Second Guided Tour
      if (e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        handleStartTour();
        return;
      }

      // Alt + P: Toggle Presentation Mode (Projector & Kiosk Optimization)
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        togglePresentationMode();
        return;
      }

      // Alt + 1, 2, 3: Switch State Registry
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        handleDataSourceChange("Tamil Nadu");
        return;
      }
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        handleDataSourceChange("Chandigarh");
        return;
      }
      if (e.altKey && e.key === "3") {
        e.preventDefault();
        handleDataSourceChange("Unified View");
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    isShortcutsModalOpen,
    isEcosystemModalOpen,
    isEncroachmentModalOpen,
    isTourOpen,
    isDrawerOpen,
    isPresentationMode,
    toggleTheme,
    handleToggleHeatmap,
    handleResetDemo,
    handleStartTour,
    handleDataSourceChange,
    togglePresentationMode,
    setIsShortcutsModalOpen,
    setIsEcosystemModalOpen,
    setIsEncroachmentModalOpen,
    setIsTourOpen,
    setIsDrawerOpen,
    setSelectedParcel,
    setIsPresentationMode,
    setIsCommandPaletteOpen,
    setRole,
    setViewMode,
    t,
  ]);
}
