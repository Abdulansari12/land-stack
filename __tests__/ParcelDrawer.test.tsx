import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParcelDrawer } from "@/components/ParcelDrawer";
import { LanguageProvider } from "@/context/LanguageContext";
import type { LandParcelProperties } from "@/lib/schemas";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("<ParcelDrawer /> Component", () => {
  const sampleParcel: LandParcelProperties = {
    ulpin: "UP092837418293",
    khasraNo: "412/1",
    ownerName: "Rameshwar Prasad Sharma",
    landUse: "Agricultural",
    rorStatus: "Verified",
    clearOrDisputed: "Clear",
    encumbrances: "Nil Encumbrance",
    taxStatus: "Paid",
    utilityLines: ["TANGEDCO 11kV Agricultural Feeder", "Tubewell 3-Phase"],
    areaInHectares: 1.5,
    marketValueInINR: 4500000,
    sourceState: "Uttar Pradesh",
    chainOfTitle: [
      {
        date: "12 Oct 2021",
        ownerName: "Rameshwar Prasad Sharma",
        transactionType: "Inheritance",
        documentRef: "WLL/2021/8812",
      },
    ],
    ownerConsentRequired: false,
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<LanguageProvider>{ui}</LanguageProvider>);
  };

  it("renders parcel details when open with an active parcel", () => {
    renderWithProviders(
      <ParcelDrawer
        parcel={sampleParcel}
        isOpen={true}
        onClose={vi.fn()}
        role="citizen"
      />
    );

    // 1. Verify drawer container exists
    const drawer = screen.getByTestId("parcel-drawer");
    expect(drawer).toBeInTheDocument();

    // 2. Verify Khasra and ULPIN information
    expect(screen.getAllByText(/412\/1/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/UP092837418293/i)).toBeInTheDocument();

    // 3. Verify Owner name
    expect(screen.getAllByText("Rameshwar Prasad Sharma").length).toBeGreaterThanOrEqual(1);

    // 4. Verify clearance status badge
    expect(screen.getByText("Clear")).toBeInTheDocument();

    // 5. Verify tab navigation elements
    expect(screen.getByRole("tab", { name: /Essential/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Spatial/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Use-case/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Audit Trail/i })).toBeInTheDocument();
  });

  it("renders empty state placeholder when no parcel is selected", () => {
    renderWithProviders(
      <ParcelDrawer
        parcel={null}
        isOpen={true}
        onClose={vi.fn()}
        role="citizen"
      />
    );

    const drawer = screen.getByTestId("parcel-drawer");
    expect(drawer).toBeInTheDocument();
    expect(screen.getByText(/No Parcel Selected/i)).toBeInTheDocument();
  });

  it("does not render when closed and parcel is null", () => {
    renderWithProviders(
      <ParcelDrawer
        parcel={null}
        isOpen={false}
        onClose={vi.fn()}
        role="citizen"
      />
    );

    expect(screen.queryByTestId("parcel-drawer")).not.toBeInTheDocument();
  });
});
