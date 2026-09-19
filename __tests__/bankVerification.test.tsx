import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BankVerificationModal from "@/components/BankVerificationModal";
import { rawParcelsTamilNadu, rawParcelsChandigarh } from "@/data/parcels";
import { normalizeParcel } from "@/lib/schemaAdapter";
import { useAppStore } from "@/lib/store";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <LanguageProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </LanguageProvider>
  );
}

describe("Interstate Cross-Registry Borrower Data Integrity", () => {
  it("contains borrower Col. Harpreet Singh Sodhi in Tamil Nadu dataset", () => {
    const tnMatch = rawParcelsTamilNadu.features.find((f) =>
      (f.properties.pattadar_name || "").includes("Harpreet Singh Sodhi")
    );
    expect(tnMatch).toBeDefined();
    expect(tnMatch?.properties.patta_no).toBe("TN07H2910S");
    expect(tnMatch?.properties.guideline_val_inr).toBe(4800000);
    expect(tnMatch?.properties.extent_hectares).toBe(1.25);

    // Canonical normalization check
    const canonical = normalizeParcel(tnMatch!.properties, "Tamil Nadu");
    expect(canonical.ownerName).toContain("Harpreet Singh Sodhi");
    expect(canonical.sourceState).toBe("Tamil Nadu");
    expect(canonical.marketValueInINR).toBe(4800000);
    expect(canonical.areaInHectares).toBe(1.25);
    expect(canonical.clearOrDisputed).toBe("Clear");
  });

  it("contains borrower Col. Harpreet Singh Sodhi in Chandigarh dataset", () => {
    const chMatch = rawParcelsChandigarh.features.find((f) =>
      (f.properties.ownerFullName || "").includes("Harpreet Singh Sodhi")
    );
    expect(chMatch).toBeDefined();
    expect(chMatch?.properties.propertyId).toBe("CH01S1742A");
    expect(chMatch?.properties.collectorRateValuation).toBe(18500000);
    expect(chMatch?.properties.plotAreaHa).toBe(0.45);

    // Canonical normalization check
    const canonical = normalizeParcel(chMatch!.properties, "Chandigarh");
    expect(canonical.ownerName).toContain("Harpreet Singh Sodhi");
    expect(canonical.sourceState).toBe("Chandigarh");
    expect(canonical.marketValueInINR).toBe(18500000);
    expect(canonical.areaInHectares).toBe(0.45);
    expect(canonical.clearOrDisputed).toBe("Clear");
  });

  it("aggregates ₹2.33 Cr total valuation and 1.70 Ha across both states", () => {
    const tnMatch = rawParcelsTamilNadu.features.find((f) =>
      (f.properties.pattadar_name || "").includes("Harpreet Singh Sodhi")
    );
    const chMatch = rawParcelsChandigarh.features.find((f) =>
      (f.properties.ownerFullName || "").includes("Harpreet Singh Sodhi")
    );

    const tnNorm = normalizeParcel(tnMatch!.properties, "Tamil Nadu");
    const chNorm = normalizeParcel(chMatch!.properties, "Chandigarh");

    const totalValuation = (tnNorm.marketValueInINR || 0) + (chNorm.marketValueInINR || 0);
    const totalArea = Number(((tnNorm.areaInHectares || 0) + (chNorm.areaInHectares || 0)).toFixed(2));

    expect(totalValuation).toBe(23300000); // ₹2.33 Crore
    expect(totalArea).toBe(1.70); // 1.70 Hectares
  });
});

describe("BankVerificationModal Component UI & Interactions", () => {
  it("does not render when isOpen is false", () => {
    renderWithProviders(<BankVerificationModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("bank-verification-overlay")).toBeNull();
  });

  it("renders borrower search and cross-state assets when open", () => {
    renderWithProviders(<BankVerificationModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId("bank-verification-overlay")).toBeInTheDocument();
    expect(screen.getByText("Interstate Collateral Verification Portal")).toBeInTheDocument();
    expect(screen.getByText(/Bank Mortgage Underwriting Mode/i)).toBeInTheDocument();

    // Verify 2 states detected badge
    expect(screen.getByText(/Tamil Nadu \+ Chandigarh/i)).toBeInTheDocument();

    // Verify aggregate valuation and area
    expect(screen.getByText("₹2.33 Cr")).toBeInTheDocument();
    expect(screen.getByText("1.70 Ha")).toBeInTheDocument();

    // Verify individual parcel cards
    expect(screen.getByText(/Khasra No\. 89\/1-B/i)).toBeInTheDocument();
    expect(screen.getByText(/Sector 17-C/i)).toBeInTheDocument();
  });

  it("switches to Schema Normalization Diff tab displaying native and canonical schemas", () => {
    renderWithProviders(<BankVerificationModal isOpen={true} onClose={vi.fn()} />);

    const schemaTabButton = screen.getByText(/Interstate Schema Normalization Diff/i);
    fireEvent.click(schemaTabButton);

    expect(screen.getByText("Cross-State Heterogeneity Elimination")).toBeInTheDocument();
    expect(screen.getByText(/1\. Tamil Nadu Raw \(Patta\/Chitta\)/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Chandigarh Raw \(e-Sampark\)/i)).toBeInTheDocument();
  });

  it("simulates CERSAI mortgage lien registration and issues reference number", () => {
    renderWithProviders(<BankVerificationModal isOpen={true} onClose={vi.fn()} />);

    const registerButton = screen.getByTestId("register-cersai-lien-btn");
    expect(registerButton).toBeInTheDocument();

    fireEvent.click(registerButton);

    // After registration, badge showing CERSAI registration and print button appear
    expect(screen.getByText(/CERSAI Lien Active/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CERSAI-HYP-/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Print Memo/i)).toBeInTheDocument();
  });

  it("invokes onNavigateToParcel when Inspect on Map is clicked", () => {
    const handleNavigate = vi.fn();
    renderWithProviders(
      <BankVerificationModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateToParcel={handleNavigate}
      />
    );

    const inspectButtons = screen.getAllByRole("button", { name: /Inspect Parcel on Map/i });
    expect(inspectButtons.length).toBeGreaterThan(0);

    fireEvent.click(inspectButtons[0]);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Feature",
        properties: expect.objectContaining({
          ownerName: expect.stringContaining("Harpreet Singh Sodhi"),
        }),
      })
    );
  });

  it("invokes onClose when clicking close button", () => {
    const handleClose = vi.fn();
    renderWithProviders(<BankVerificationModal isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByTestId("bank-modal-close-btn");
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("Zustand App Store Bank Role & Modal State", () => {
  beforeEach(() => {
    useAppStore.getState().resetDemoState();
  });

  it("cycles userRole through citizen -> officer -> bank -> citizen", () => {
    const store = useAppStore.getState();
    expect(store.userRole).toBe("citizen");

    store.toggleUserRole();
    expect(useAppStore.getState().userRole).toBe("officer");

    store.toggleUserRole();
    expect(useAppStore.getState().userRole).toBe("bank");

    store.toggleUserRole();
    expect(useAppStore.getState().userRole).toBe("citizen");
  });

  it("allows setting userRole directly to bank", () => {
    const store = useAppStore.getState();
    store.setUserRole("bank");
    expect(useAppStore.getState().userRole).toBe("bank");
  });

  it("controls isBankModalOpen via openBankModal and closeBankModal", () => {
    const store = useAppStore.getState();
    expect(store.isBankModalOpen).toBe(false);

    store.openBankModal();
    expect(useAppStore.getState().isBankModalOpen).toBe(true);

    store.closeBankModal();
    expect(useAppStore.getState().isBankModalOpen).toBe(false);
  });

  it("resets isBankModalOpen when resetDemoState is invoked", () => {
    const store = useAppStore.getState();
    store.openBankModal();
    expect(useAppStore.getState().isBankModalOpen).toBe(true);

    store.resetDemoState();
    expect(useAppStore.getState().isBankModalOpen).toBe(false);
    expect(useAppStore.getState().userRole).toBe("citizen");
  });
});
