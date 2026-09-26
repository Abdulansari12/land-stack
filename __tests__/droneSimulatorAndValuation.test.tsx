import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DroneLiDARSimulatorModal from "@/components/DroneLiDARSimulatorModal";
import LandValuationSimulator from "@/components/LandValuationSimulator";
import { dummyLandParcels } from "@/data/parcels";
import { LanguageProvider } from "@/context/LanguageContext";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

// Mock canvas API for Vitest / JSDOM
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    closePath: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  });
});

describe("3D Drone LiDAR Autonomous Survey Simulator", () => {
  const sampleParcel = dummyLandParcels[0];

  it("renders when isOpen is true with telemetry headers", () => {
    renderWithProviders(
      <DroneLiDARSimulatorModal
        isOpen={true}
        onClose={vi.fn()}
        parcel={sampleParcel}
      />
    );

    expect(screen.getByText(/Autonomous Cadastral LiDAR Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/SVAMITVA UAV 3D SURVEY/i)).toBeInTheDocument();
    expect(screen.getByText(/RTK-FIX/i)).toBeInTheDocument();
  });

  it("allows switching flight modes (Lawnmower, Orbit, Boundary)", () => {
    renderWithProviders(
      <DroneLiDARSimulatorModal
        isOpen={true}
        onClose={vi.fn()}
        parcel={sampleParcel}
      />
    );

    const orbitBtn = screen.getByText("Orbit");
    fireEvent.click(orbitBtn);
    expect(screen.getByText(/MODE: ORBIT/i)).toBeInTheDocument();

    const boundaryBtn = screen.getByText("Boundary");
    fireEvent.click(boundaryBtn);
    expect(screen.getByText(/MODE: PERIMETER/i)).toBeInTheDocument();
  });

  it("supports pausing and resuming flight", () => {
    renderWithProviders(
      <DroneLiDARSimulatorModal
        isOpen={true}
        onClose={vi.fn()}
        parcel={sampleParcel}
      />
    );

    const pauseBtn = screen.getByText("Pause Flight");
    fireEvent.click(pauseBtn);
    expect(screen.getByText("Resume Flight")).toBeInTheDocument();
  });

  it("renders inline when inline prop is true", () => {
    renderWithProviders(
      <DroneLiDARSimulatorModal
        isOpen={true}
        onClose={vi.fn()}
        parcel={sampleParcel}
        inline={true}
      />
    );

    expect(screen.getByTestId("drone-simulator-inline-container")).toBeInTheDocument();
  });
});

describe("AI 5-10 Year Land Valuation & Growth Simulator", () => {
  const sampleParcel = dummyLandParcels[0];

  it("renders base valuation and PM Gati Shakti engine title", () => {
    renderWithProviders(
      <LandValuationSimulator
        parcel={sampleParcel}
        inline={true}
      />
    );

    expect(screen.getByText(/AI Land Valuation & Future Growth Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/PM GATI SHAKTI INFRASTRUCTURE ENGINE/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Baseline Market Value/i)).toBeInTheDocument();
  });

  it("updates projected valuation when scrubbing timeline slider", () => {
    renderWithProviders(
      <LandValuationSimulator
        parcel={sampleParcel}
        inline={true}
      />
    );

    const slider = screen.getAllByRole("slider")[1]; // timeline slider
    fireEvent.change(slider, { target: { value: "2036" } });

    expect(screen.getByText(/Year 2036/i)).toBeInTheDocument();
    expect(screen.getByText(/Bank Collateral Unlocked/i)).toBeInTheDocument();
  });

  it("allows toggling infrastructure catalysts", () => {
    renderWithProviders(
      <LandValuationSimulator
        parcel={sampleParcel}
        inline={true}
      />
    );

    const metroCatalyst = screen.getByText(/Metro Phase 4 Station/i);
    expect(metroCatalyst).toBeInTheDocument();

    // Click to toggle
    fireEvent.click(metroCatalyst);
    // Component remains responsive and stable
    expect(screen.getByText(/Transport & SEZ/i)).toBeInTheDocument();
  });
});
