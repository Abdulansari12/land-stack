import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoadingState, ErrorState } from "@/components/ui";

describe("UI Primitives: <LoadingState /> and <ErrorState />", () => {
  it("renders LoadingState with role=status and label", () => {
    render(<LoadingState variant="card" label="Querying Cadastral Registry" description="Aggregating records" />);

    const statusElem = screen.getByRole("status");
    expect(statusElem).toBeInTheDocument();
    expect(screen.getByText("Querying Cadastral Registry")).toBeInTheDocument();
    expect(screen.getByText("Aggregating records")).toBeInTheDocument();
  });

  it("renders ErrorState with role=alert and fires retry callback on click", () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        variant="card"
        title="Registry Connection Failed"
        message="Unable to reach State Land Records server"
        retryLabel="Retry Connection"
        onRetry={handleRetry}
      />
    );

    const alertElem = screen.getByRole("alert");
    expect(alertElem).toBeInTheDocument();
    expect(screen.getByText("Registry Connection Failed")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /Retry Connection/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("AuditTrailTab renders icon buttons with proper aria-labels and uses LoadingState during verification", async () => {
    const AuditTrailTab = (await import("@/components/AuditTrailTab")).default;
    const { LanguageProvider } = await import("@/context/LanguageContext");
    const { dummyLandParcels } = await import("@/data/parcels");
    const sampleParcel = dummyLandParcels.features[0].properties;

    render(
      <LanguageProvider>
        <AuditTrailTab parcel={sampleParcel} />
      </LanguageProvider>
    );

    // Check copy buttons have aria-label
    const copyButtons = screen.getAllByLabelText("Copy Full Block Hash");
    expect(copyButtons.length).toBeGreaterThan(0);

    // Verify chain integrity button
    const verifyBtn = screen.getByRole("button", { name: /Verify chain integrity/i });
    expect(verifyBtn).toBeInTheDocument();

    fireEvent.click(verifyBtn);

    // Should show LoadingState with role="status"
    const loadingElem = screen.getByRole("status");
    expect(loadingElem).toBeInTheDocument();
    expect(screen.getByText(/Verifying Merkle Hashes/i)).toBeInTheDocument();
  });

  it("MapControls renders all control buttons with explicit aria-labels", async () => {
    const MapControls = (await import("@/components/MapControls")).default;
    const { LanguageProvider } = await import("@/context/LanguageContext");
    const onToggleHeatmap = vi.fn();
    const onViewModeChange = vi.fn();
    const onHeatmapModeChange = vi.fn();

    render(
      <LanguageProvider>
        <MapControls
          viewMode="2D"
          onViewModeChange={onViewModeChange}
          isHeatmapActive={false}
          onToggleHeatmap={onToggleHeatmap}
          heatmapMode="disputes"
          onHeatmapModeChange={onHeatmapModeChange}
        />
      </LanguageProvider>
    );

    expect(screen.getByLabelText(/Toggle Regional Heatmap Layer/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to 2D Flat Cadastral Map")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch to 3D Extruded Parcels")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Switch to 3D Extruded Parcels"));
    expect(onViewModeChange).toHaveBeenCalledWith("3D");
  });

  it("AskLandStack renders accessible input and submit button with aria-label", async () => {
    const AskLandStack = (await import("@/components/AskLandStack")).default;
    const { LanguageProvider } = await import("@/context/LanguageContext");
    const { dummyLandParcels } = await import("@/data/parcels");
    const onFilterChange = vi.fn();
    render(
      <LanguageProvider>
        <AskLandStack
          parcels={dummyLandParcels}
          onFilterChange={onFilterChange}
          activeResult={null}
        />
      </LanguageProvider>
    );

    const input = screen.getByLabelText("Ask Land Stack plain-language query");
    expect(input).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Submit plain-language query/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: "show all disputed parcels" } });
    expect(submitBtn).not.toBeDisabled();
  });
});
