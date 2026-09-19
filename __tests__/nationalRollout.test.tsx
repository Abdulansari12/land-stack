import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  pilotStatesData,
  nationalRolloutMetrics,
  indiaBoundaryGeoJSON,
} from "@/data/nationalRollout";
import NationalRolloutPage from "@/app/national-view/page";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/national-view",
}));

// Mock dynamic Leaflet map to avoid window.L issues in jsdom
vi.mock("@/components/NationalIndiaMap", () => ({
  default: ({
    states,
    selectedState,
    onSelectState,
  }: {
    states: any[];
    selectedState: any;
    onSelectState: (s: any) => void;
  }) => (
    <div data-testid="mock-national-india-map">
      <div data-testid="selected-state-marker">
        {selectedState?.name || "None"}
      </div>
      <div data-testid="rendered-state-count">{states.length}</div>
      <button
        data-testid="mock-click-chandigarh"
        onClick={() => {
          const ch = states.find((s) => s.id === "chandigarh");
          if (ch) onSelectState(ch);
        }}
      >
        Select Chandigarh
      </button>
      <button
        data-testid="mock-click-karnataka"
        onClick={() => {
          const ka = states.find((s) => s.id === "karnataka");
          if (ka) onSelectState(ka);
        }}
      >
        Select Karnataka
      </button>
      <button
        data-testid="mock-click-rajasthan"
        onClick={() => {
          const rj = states.find((s) => s.id === "rajasthan");
          if (rj) onSelectState(rj);
        }}
      >
        Select Rajasthan
      </button>
    </div>
  ),
}));

describe("National Phased Rollout Dataset & Metrics", () => {
  it("contains all 36 Indian States and Union Territories", () => {
    expect(pilotStatesData.length).toBe(36);
    expect(nationalRolloutMetrics.totalStatesAndUTs).toBe(36);
  });

  it("accurately marks Live Pilot states with parcels and deep links", () => {
    const liveStates = pilotStatesData.filter((s) => s.status === "live");
    expect(liveStates.length).toBe(3);

    const tn = pilotStatesData.find((s) => s.id === "tamil-nadu");
    expect(tn).toBeDefined();
    expect(tn?.status).toBe("live");
    expect(tn?.phase).toBe(1);
    expect(tn?.parcelsCount).toBe(3);
    expect(tn?.deepLinkUrl).toContain("/?state=Tamil+Nadu");

    const ch = pilotStatesData.find((s) => s.id === "chandigarh");
    expect(ch).toBeDefined();
    expect(ch?.status).toBe("live");
    expect(ch?.phase).toBe(1);
    expect(ch?.parcelsCount).toBe(3);
    expect(ch?.deepLinkUrl).toContain("/?state=Chandigarh");

    const up = pilotStatesData.find((s) => s.id === "uttar-pradesh");
    expect(up).toBeDefined();
    expect(up?.status).toBe("live");
    expect(up?.phase).toBe(1);
    expect(up?.parcelsCount).toBe(5);
  });

  it("accurately categorizes Phase 2 In-Progress technical pilot states", () => {
    const inProgress = pilotStatesData.filter((s) => s.status === "in-progress");
    expect(inProgress.length).toBe(4);

    const ids = inProgress.map((s) => s.id);
    expect(ids).toContain("karnataka");
    expect(ids).toContain("maharashtra");
    expect(ids).toContain("telangana");
    expect(ids).toContain("gujarat");

    inProgress.forEach((st) => {
      expect(st.phase).toBe(2);
      expect(st.parcelsCount).toBe(0);
      expect(st.registrySystem.length).toBeGreaterThan(0);
    });
  });

  it("contains valid geospatial centroids and bounding boxes for all jurisdictions", () => {
    pilotStatesData.forEach((st) => {
      const [lat, lng] = st.center;
      // India latitude range ~6° N to 38° N
      expect(lat).toBeGreaterThan(6);
      expect(lat).toBeLessThan(38);
      // India longitude range ~68° E to 98° E
      expect(lng).toBeGreaterThan(68);
      expect(lng).toBeLessThan(98);

      const [[south, west], [north, east]] = st.bounds;
      expect(north).toBeGreaterThanOrEqual(south);
      expect(east).toBeGreaterThanOrEqual(west);
    });
  });

  it("validates simplified India perimeter GeoJSON structure", () => {
    expect(indiaBoundaryGeoJSON.type).toBe("FeatureCollection");
    expect(indiaBoundaryGeoJSON.features.length).toBeGreaterThan(0);
    const coords = (indiaBoundaryGeoJSON.features[0].geometry as any).coordinates[0];
    expect(coords.length).toBeGreaterThan(20);
  });
});

describe("NationalRolloutPage Component Integration", () => {
  const renderPage = () => {
    return render(
      <LanguageProvider>
        <ThemeProvider>
          <NationalRolloutPage />
        </ThemeProvider>
      </LanguageProvider>
    );
  };

  it("renders header metrics and executive KPI cards", () => {
    renderPage();

    expect(screen.getByText("National Phased Rollout")).toBeInTheDocument();
    expect(screen.getByText("Live Pilots (TN, CH, UP)")).toBeInTheDocument();
    expect(screen.getByText("Phase 2 In-Progress (KA, MH, TS, GJ)")).toBeInTheDocument();
    expect(screen.getByText("Upcoming States & UTs")).toBeInTheDocument();
    expect(screen.getByText("National Readiness by 2027")).toBeInTheDocument();
  });

  it("displays Live Pilot details for default selected state (Tamil Nadu)", () => {
    renderPage();

    // Default selected state is Tamil Nadu
    const stateHeadings = screen.getAllByText("Tamil Nadu");
    expect(stateHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText("Tamil Nilam (Patta / Chitta)")).toBeInTheDocument();
    expect(screen.getByText("Explore Tamil Nadu Cadastral Map")).toBeInTheDocument();
    expect(screen.getByText("Live Pilot")).toBeInTheDocument();
  });

  it("updates dossier when selecting a different pilot state (Chandigarh)", () => {
    renderPage();

    const selectChBtn = screen.getByTestId("mock-click-chandigarh");
    fireEvent.click(selectChBtn);

    const chHeadings = screen.getAllByText("Chandigarh");
    expect(chHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText("e-Sampark / UT Estate Office Records")).toBeInTheDocument();
    expect(screen.getByText("Explore Chandigarh Cadastral Map")).toBeInTheDocument();
  });

  it("displays 'Phase 2 (Q4 2026)' badge for in-progress state (Karnataka)", () => {
    renderPage();

    const selectKaBtn = screen.getByTestId("mock-click-karnataka");
    fireEvent.click(selectKaBtn);

    const kaHeadings = screen.getAllByText("Karnataka");
    expect(kaHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText("Bhoomi API & Mojini Spatial Cadastre")).toBeInTheDocument();
    expect(screen.getByText("Phase 2 (Q4 2026)")).toBeInTheDocument();
    expect(screen.getByText("Pilot Not Yet Launched for Karnataka")).toBeInTheDocument();
  });

  it("displays 'Pilot Not Yet Launched' badge for upcoming expansion state (Rajasthan)", () => {
    renderPage();

    const selectRjBtn = screen.getByTestId("mock-click-rajasthan");
    fireEvent.click(selectRjBtn);

    const rjHeadings = screen.getAllByText("Rajasthan");
    expect(rjHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText("Apna Khata (E-Dharti)")).toBeInTheDocument();
    expect(screen.getByText("Pilot Not Yet Launched")).toBeInTheDocument();
    expect(screen.getByText("Pilot Not Yet Launched for Rajasthan")).toBeInTheDocument();
  });

  it("filters state list when clicking status filter tabs", () => {
    renderPage();

    // Click Live Pilots (3) filter tab
    const liveFilterBtn = screen.getByText("Live Pilots (3)");
    fireEvent.click(liveFilterBtn);

    const countElem = screen.getByTestId("rendered-state-count");
    expect(countElem.textContent).toBe("3");

    // Click Phase 2 (4) filter tab
    const p2FilterBtn = screen.getByText("Phase 2 (4)");
    fireEvent.click(p2FilterBtn);
    expect(screen.getByTestId("rendered-state-count").textContent).toBe("4");

    // Click All States (36)
    const allFilterBtn = screen.getByText("All States & UTs (36)");
    fireEvent.click(allFilterBtn);
    expect(screen.getByTestId("rendered-state-count").textContent).toBe("36");
  });

  it("filters states using text search input", () => {
    renderPage();

    const searchInput = screen.getByPlaceholderText("Search state, UT, or registry...");
    fireEvent.change(searchInput, { target: { value: "Punjab" } });

    expect(screen.getByTestId("rendered-state-count").textContent).toBe("1");
  });
});
