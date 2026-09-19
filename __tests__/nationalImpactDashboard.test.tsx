import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NationalImpactDashboard from "@/app/impact/page";
import ImpactStatsCounter from "@/components/ImpactStatsCounter";
import Header from "@/components/Header";
import { useAppStore } from "@/lib/store";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <LanguageProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </LanguageProvider>
  );
}

describe("National Economic Impact & DPI Case Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 4 core national flagship KPIs with exact cited targets", () => {
    renderWithProviders(<NationalImpactDashboard />);

    // 1. States Onboarded: 2 of 36
    const statesCard = screen.getByTestId("stat-states-onboarded");
    expect(statesCard).toBeInTheDocument();
    expect(statesCard).toHaveTextContent("2 of 36");
    expect(statesCard).toHaveTextContent(/TN & Chandigarh Live/i);

    // 2. Total Parcels: 20+ Crore
    const parcelsCard = screen.getByTestId("stat-total-parcels");
    expect(parcelsCard).toBeInTheDocument();
    expect(parcelsCard).toHaveTextContent("20+ Crore");
    expect(parcelsCard).toHaveTextContent(/200\+ Million Cadastres Nationwide/i);

    // 3. Mutation Time Reduction: 68%
    const mutationCard = screen.getByTestId("stat-mutation-reduction");
    expect(mutationCard).toBeInTheDocument();
    expect(mutationCard).toHaveTextContent("68%");
    expect(mutationCard).toHaveTextContent(/45 days to ~14 days/i);

    // 4. Annual Litigation Cost Saved: ₹28,500 Cr
    const litigationCard = screen.getByTestId("stat-litigation-saved");
    expect(litigationCard).toBeInTheDocument();
    expect(litigationCard).toHaveTextContent("₹28,500 Cr");
    expect(litigationCard).toHaveTextContent(/CPR & DAKSH judicial studies/i);
  });

  it("renders the interactive scaling simulator with preset buttons and updates numbers", () => {
    renderWithProviders(<NationalImpactDashboard />);

    const slider = screen.getByTestId("scaling-slider");
    expect(slider).toBeInTheDocument();

    // Click Current Pilot (2 States) preset
    const pilotPresetBtn = screen.getByTestId("preset-pilots-btn");
    fireEvent.click(pilotPresetBtn);

    expect(screen.getByText("2 / 36 States & UTs")).toBeInTheDocument();
    expect(screen.getByText("6% India Coverage")).toBeInTheDocument();
    expect(screen.getByText("1.1 Cr")).toBeInTheDocument();

    // Click Pan-India (36 States) preset
    const panIndiaBtn = screen.getByTestId("preset-panindia-btn");
    fireEvent.click(panIndiaBtn);

    expect(screen.getByText("36 / 36 States & UTs")).toBeInTheDocument();
    expect(screen.getByText("100% India Coverage")).toBeInTheDocument();
    expect(screen.getByText("20.4 Cr")).toBeInTheDocument();
    expect(screen.getAllByText("₹28,500 Cr").length).toBeGreaterThanOrEqual(1);

    // Click Phase 2 (8 States) preset
    const phase2Btn = screen.getByTestId("preset-phase2-btn");
    fireEvent.click(phase2Btn);
    expect(screen.getByText("8 / 36 States & UTs")).toBeInTheDocument();
  });

  it("supports dragging or updating the simulation range slider", () => {
    renderWithProviders(<NationalImpactDashboard />);

    const slider = screen.getByTestId("scaling-slider");
    fireEvent.change(slider, { target: { value: "18" } });

    expect(screen.getByText("18 / 36 States & UTs")).toBeInTheDocument();
    expect(screen.getByText("50% India Coverage")).toBeInTheDocument();
    expect(screen.getByText("10.2 Cr")).toBeInTheDocument();
  });

  it("displays the 4 Pillars of National Impact and academic research citations", () => {
    renderWithProviders(<NationalImpactDashboard />);

    // Check 4 Pillars
    expect(screen.getByText(/1\. Judicial Relief & De-clogging India's Courts/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Credit Velocity & CERSAI Hypothecation/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Citizen Ease of Living & Zero-Bribery Mutation/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Municipal Geo-Referencing & Ecocadastre/i)).toBeInTheDocument();

    // Check Academic Citations
    expect(screen.getByText(/Centre for Policy Research \(CPR\)/i)).toBeInTheDocument();
    expect(screen.getByText(/DAKSH Judicial & World Bank Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/NITI Aayog & MoRD \(DoLR\)/i)).toBeInTheDocument();
  });

  it("renders state-by-state projected dividends table", () => {
    renderWithProviders(<NationalImpactDashboard />);

    expect(screen.getByText("State-Wise Projected Dividends Matrix")).toBeInTheDocument();
    expect(screen.getByText("Uttar Pradesh")).toBeInTheDocument();
    expect(screen.getByText("Maharashtra")).toBeInTheDocument();
    expect(screen.getByText("Tamil Nadu")).toBeInTheDocument();
    expect(screen.getByText("Karnataka")).toBeInTheDocument();
    expect(screen.getByText("Chandigarh")).toBeInTheDocument();
  });
});

describe("Cross-App Navigation & Integration with National Impact", () => {
  it("renders National Impact link in Header", () => {
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

    const impactLink = screen.getByTestId("national-impact-nav-link");
    expect(impactLink).toBeInTheDocument();
    expect(impactLink).toHaveAttribute("href", "/impact");
  });

  it("renders National Economic Case CTA in ImpactStatsCounter hero-cards variant", () => {
    renderWithProviders(<ImpactStatsCounter variant="hero-cards" />);

    const ctaBtn = screen.getByTestId("welcome-view-economic-dashboard-btn");
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn).toHaveAttribute("href", "/impact");
  });

  it("renders National Economic Case CTA in ImpactStatsCounter collapsible-strip variant", () => {
    renderWithProviders(<ImpactStatsCounter variant="collapsible-strip" defaultExpanded={true} />);

    const stripCta = screen.getByTestId("strip-view-economic-case-btn");
    expect(stripCta).toBeInTheDocument();
    expect(stripCta).toHaveAttribute("href", "/impact");
  });
});
