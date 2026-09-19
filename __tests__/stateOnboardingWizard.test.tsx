import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardStatePage from "@/app/admin/onboard-state/page";
import Header from "@/components/Header";
import { useAppStore } from "@/lib/store";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
}));

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

describe("State Onboarding Admin Panel & Schema Adapter Wizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ userRole: "officer" });
  });

  it("renders the wizard header and officer authority indicator when in officer role", () => {
    renderWithProviders(<OnboardStatePage />);

    expect(screen.getByText("Add New State Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Officer Authority Active")).toBeInTheDocument();
    expect(screen.getByText(/Zero-Rebuild Adapter Pattern/i)).toBeInTheDocument();
  });

  it("shows bypass switch button when in citizen role and switches to officer", () => {
    useAppStore.setState({ userRole: "citizen" });
    renderWithProviders(<OnboardStatePage />);

    const switchBtn = screen.getByTestId("bypass-switch-officer-btn");
    expect(switchBtn).toBeInTheDocument();
    expect(screen.getByText("Switch to Officer Persona")).toBeInTheDocument();

    fireEvent.click(switchBtn);
    expect(useAppStore.getState().userRole).toBe("officer");
  });

  it("loads 1-click state presets for Karnataka, Maharashtra, and Gujarat", () => {
    renderWithProviders(<OnboardStatePage />);

    // Default is Karnataka
    expect(screen.getByDisplayValue("Karnataka")).toBeInTheDocument();
    expect(screen.getByDisplayValue("KA")).toBeInTheDocument();

    // Click Maharashtra preset
    const mhBtn = screen.getByTestId("preset-maharashtra-btn");
    fireEvent.click(mhBtn);
    expect(screen.getByDisplayValue("Maharashtra")).toBeInTheDocument();
    expect(screen.getByDisplayValue("MH")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Mahabhulekh (e-Ferfar & 7/12 Gaon Namuna)")
    ).toBeInTheDocument();

    // Click Gujarat preset
    const gjBtn = screen.getByTestId("preset-gujarat-btn");
    fireEvent.click(gjBtn);
    expect(screen.getByDisplayValue("Gujarat")).toBeInTheDocument();
    expect(screen.getByDisplayValue("GJ")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("AnyRoR (Village Form 7 & 8-A e-Dhara)")
    ).toBeInTheDocument();

    // Click back to Karnataka
    const kaBtn = screen.getByTestId("preset-karnataka-btn");
    fireEvent.click(kaBtn);
    expect(screen.getByDisplayValue("Karnataka")).toBeInTheDocument();
    expect(screen.getByDisplayValue("KA")).toBeInTheDocument();
  });

  it("navigates through all 4 wizard steps sequentially", () => {
    renderWithProviders(<OnboardStatePage />);

    // Step 1: State Authority & Metadata
    expect(screen.getByText("Step 1: State Authority & System Metadata")).toBeInTheDocument();
    const nextStep1 = screen.getByTestId("next-step-1-btn");
    fireEvent.click(nextStep1);

    // Step 2: Sample Schema Payload
    expect(screen.getByText("Step 2: Sample State Schema Payload")).toBeInTheDocument();
    expect(
      screen.getByText(/Drop sample State Cadastral Payload file/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/native fields detected/i)).toBeInTheDocument();

    const nextStep2 = screen.getByTestId("next-step-2-btn");
    fireEvent.click(nextStep2);

    // Step 3: Visual Field Mapping Engine
    expect(screen.getByText("Step 3: Visual Field Mapping Engine")).toBeInTheDocument();
    expect(screen.getByText("6 of 6 Core Canonical Fields Bound")).toBeInTheDocument();
    expect(screen.getByText("Direct String Pass-Through")).toBeInTheDocument();

    const nextStep3 = screen.getByTestId("next-step-3-btn");
    fireEvent.click(nextStep3);

    // Step 4: Live Normalized Preview & Deployment Sandbox
    expect(
      screen.getByText("Step 4: Live Normalized Preview & Deployment Sandbox")
    ).toBeInTheDocument();
    expect(screen.getByText("Benchmark: 4.8ms / record")).toBeInTheDocument();
    expect(screen.getByText("RFC 7946 Standard")).toBeInTheDocument();
  });

  it("allows navigating backward from Step 2 to Step 1 and Step 3 to Step 2", () => {
    renderWithProviders(<OnboardStatePage />);

    // Advance to Step 2
    fireEvent.click(screen.getByTestId("next-step-1-btn"));
    expect(screen.getByText("Step 2: Sample State Schema Payload")).toBeInTheDocument();

    // Click Back
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText("Step 1: State Authority & System Metadata")).toBeInTheDocument();

    // Advance to Step 3
    fireEvent.click(screen.getByTestId("next-step-1-btn"));
    fireEvent.click(screen.getByTestId("next-step-2-btn"));
    expect(screen.getByText("Step 3: Visual Field Mapping Engine")).toBeInTheDocument();

    // Click Back
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText("Step 2: Sample State Schema Payload")).toBeInTheDocument();
  });

  it("copies generated TypeScript adapter code to clipboard", () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderWithProviders(<OnboardStatePage />);

    // Navigate to step 4
    fireEvent.click(screen.getByTestId("next-step-1-btn"));
    fireEvent.click(screen.getByTestId("next-step-2-btn"));
    fireEvent.click(screen.getByTestId("next-step-3-btn"));

    const copyBtn = screen.getByRole("button", { name: /Copy Code/i });
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining("normalizeKarnatakaParcel")
    );

    // Restore clipboard
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it("publishes state adapter to Land Mesh with success message and confirmation banner", () => {
    renderWithProviders(<OnboardStatePage />);

    // Navigate to step 4
    fireEvent.click(screen.getByTestId("next-step-1-btn"));
    fireEvent.click(screen.getByTestId("next-step-2-btn"));
    fireEvent.click(screen.getByTestId("next-step-3-btn"));

    const publishBtn = screen.getByTestId("publish-state-adapter-btn");
    expect(publishBtn).toBeInTheDocument();
    expect(publishBtn).toHaveTextContent("Publish to National Land Mesh");

    fireEvent.click(publishBtn);

    // Button updates state
    expect(publishBtn).toHaveTextContent("State Onboarded");
    expect(publishBtn).toBeDisabled();

    // Confirmation banner appears
    expect(
      screen.getByText("Karnataka Successfully Onboarded into National Land Mesh!")
    ).toBeInTheDocument();
    expect(screen.getByText("View on Map")).toBeInTheDocument();
  });
});

describe("Header and Navigation Integration for Onboard State", () => {
  it("renders Onboard State nav link in Header when user is Officer", () => {
    useAppStore.setState({ userRole: "officer" });
    renderWithProviders(
      <Header
        activeParcels={{ type: "FeatureCollection", features: [] }}
        onSelectParcel={vi.fn()}
        onOpenCommandPalette={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenEcosystem={vi.fn()}
        onOpenShortcuts={vi.fn()}
        onSelectParcelByUlpin={vi.fn()}
      />
    );

    const onboardLink = screen.getByTestId("onboard-state-nav-link");
    expect(onboardLink).toBeInTheDocument();
    expect(onboardLink).toHaveAttribute("href", "/admin/onboard-state");
  });

  it("hides Onboard State nav link in Header when user is Citizen", () => {
    useAppStore.setState({ userRole: "citizen" });
    renderWithProviders(
      <Header
        activeParcels={{ type: "FeatureCollection", features: [] }}
        onSelectParcel={vi.fn()}
        onOpenCommandPalette={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenEcosystem={vi.fn()}
        onOpenShortcuts={vi.fn()}
        onSelectParcelByUlpin={vi.fn()}
      />
    );

    expect(screen.queryByTestId("onboard-state-nav-link")).toBeNull();
  });
});
