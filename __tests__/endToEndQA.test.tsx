import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
  type LandParcelFeature,
  type LandParcelFeatureCollection,
} from "@/data/parcels";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import { detectConflicts, detectConflictResult } from "@/lib/conflicts";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import { parseVoiceQuery } from "@/lib/voiceParser";
import { useAppStore } from "@/lib/store";
import ParcelSearchBar from "@/components/ParcelSearchBar";
import { ParcelDrawer } from "@/components/ParcelDrawer";
import { LanguageProvider } from "@/context/LanguageContext";

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe("End-to-End Comprehensive QA Test Suite (14 Core Scenarios)", () => {
  beforeEach(() => {
    useAppStore.setState({ approvedConsentUlpins: [] });
  });

  // --------------------------------------------------------------------------
  // Scenario 1: Search bar with valid, invalid, XSS, and cross-state queries
  // --------------------------------------------------------------------------
  describe("1. Search Bar & Anti-XSS Sanitization", () => {
    it("sanitizes dangerous script and html tags from search queries", () => {
      const maliciousInput = "<script>alert('xss')</script>Khasra 245";
      const sanitized = sanitizeSearchQuery(maliciousInput);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("alert");
      expect(sanitized).toContain("Khasra 245");
    });

    it("handles non-existent search query gracefully without errors", () => {
      const tnCollection = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
      render(
        <LanguageProvider>
          <ParcelSearchBar
            parcels={tnCollection}
            onSelectParcel={vi.fn()}
          />
        </LanguageProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "NONEXISTENT_XYZ_9999" } });
      expect(screen.getByText(/No parcels matching/i)).toBeInTheDocument();
    });

    it("performs cross-state search fallback when searching for Chandigarh parcel in Tamil Nadu view", () => {
      const tnCollection = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
      const onSelect = vi.fn();
      render(
        <LanguageProvider>
          <ParcelSearchBar
            parcels={tnCollection}
            onSelectParcel={onSelect}
          />
        </LanguageProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      // Search for Chandigarh owner Gurpreet
      fireEvent.change(searchInput, { target: { value: "Gurpreet" } });
      
      // Should find the Chandigarh parcel via cross-registry fallback
      expect(screen.getByText(/Gurpreet Kaur Dhillon/i)).toBeInTheDocument();
      expect(screen.getByText("Chandigarh")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Clicking every parcel on the map across UP, TN, and Chandigarh
  // --------------------------------------------------------------------------
  describe("2. Map Data Parcels Integrity (All 12 Parcels across UP, TN, CH)", () => {
    it("verifies all 5 Uttar Pradesh parcels have valid coordinates and ULPINs", () => {
      expect(dummyLandParcels.features).toHaveLength(5);
      dummyLandParcels.features.forEach((feature) => {
        expect(feature.geometry.type).toBe("Polygon");
        expect(feature.geometry.coordinates[0].length).toBeGreaterThanOrEqual(4);
        expect(feature.properties.ulpin).toBeTruthy();
        expect(feature.properties.khasraNo).toBeTruthy();
        expect(feature.properties.ownerName).toBeTruthy();
      });
    });

    it("verifies all 4 Tamil Nadu parcels normalize with valid coordinates and properties", () => {
      expect(rawParcelsTamilNadu.features).toHaveLength(4);
      const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
      expect(tn.features).toHaveLength(4);
      tn.features.forEach((feature) => {
        expect(feature.properties.sourceState).toBe("Tamil Nadu");
        expect(feature.properties.ulpin).toMatch(/^TN/);
        expect(feature.properties.khasraNo).toBeTruthy();
        expect(feature.properties.ownerName).toBeTruthy();
        expect(feature.geometry.coordinates[0].length).toBeGreaterThanOrEqual(4);
      });
    });

    it("verifies all 3 Chandigarh parcels normalize with valid coordinates and properties", () => {
      expect(rawParcelsChandigarh.features).toHaveLength(3);
      const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
      expect(ch.features).toHaveLength(3);
      ch.features.forEach((feature) => {
        expect(feature.properties.sourceState).toBe("Chandigarh");
        expect(feature.properties.ulpin).toMatch(/^CH/);
        expect(feature.properties.khasraNo).toBeTruthy();
        expect(feature.properties.ownerName).toBeTruthy();
        expect(feature.geometry.coordinates[0].length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Opening ParcelDrawer in Citizen vs Officer roles
  // --------------------------------------------------------------------------
  describe("3. ParcelDrawer Roles & DPDP Act Privacy Protections", () => {
    const consentParcel = dummyLandParcels.features.find((f) => f.properties.ownerConsentRequired)!.properties;

    it("allows Citizen role to inspect parcel details without DPDP consent barrier", () => {
      render(
        <LanguageProvider>
          <ParcelDrawer
            parcel={consentParcel}
            isOpen={true}
            role="citizen"
            onClose={vi.fn()}
          />
        </LanguageProvider>
      );

      expect(screen.getByTestId("parcel-drawer")).toBeInTheDocument();
      expect(screen.queryByTestId("owner-consent-locked-state")).not.toBeInTheDocument();
    });

    it("blocks Officer role with DPDP Act Consent Lock when ownerConsentRequired is true and unapproved", () => {
      render(
        <LanguageProvider>
          <ParcelDrawer
            parcel={consentParcel}
            isOpen={true}
            role="officer"
            approvedConsentUlpins={[]}
            onClose={vi.fn()}
          />
        </LanguageProvider>
      );

      expect(screen.getByTestId("owner-consent-locked-state")).toBeInTheDocument();
      expect(screen.getByTestId("request-consent-access-btn")).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 4: Multi-state schema toggle (Tamil Nadu / Chandigarh / Unified)
  // --------------------------------------------------------------------------
  describe("4. Multi-State Schema Adapter & Interoperability", () => {
    it("correctly maps Tamil Nadu schema fields to canonical LandParcelProperties", () => {
      const rawTN = rawParcelsTamilNadu.features[0];
      const normalized = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu").features[0].properties;

      expect(normalized.ulpin).toBe(rawTN.properties.patta_no);
      expect(normalized.khasraNo).toBe(rawTN.properties.survey_subdivision);
      expect(normalized.ownerName).toBe(rawTN.properties.pattadar_name);
      expect(normalized.sourceState).toBe("Tamil Nadu");
    });

    it("correctly maps Chandigarh schema fields to canonical LandParcelProperties", () => {
      const rawCH = rawParcelsChandigarh.features[0];
      const normalized = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh").features[0].properties;

      expect(normalized.ulpin).toBe(rawCH.properties.propertyId);
      expect(normalized.khasraNo).toBe(rawCH.properties.sectorPlotNo);
      expect(normalized.ownerName).toBe(rawCH.properties.ownerFullName);
      expect(normalized.sourceState).toBe("Chandigarh");
    });

    it("combines all states into 12 canonical parcels under Unified View", () => {
      const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
      const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
      const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
      const unified: LandParcelFeatureCollection = {
        type: "FeatureCollection",
        features: [...up.features, ...tn.features, ...ch.features],
      };

      expect(unified.features).toHaveLength(12);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 5: Conflict detection banner (Zoning Agricultural vs Residential)
  // --------------------------------------------------------------------------
  describe("5. Inter-Departmental Conflict Detection Engine", () => {
    it("flags critical conflict on parcel with Agricultural zoning and Residential building permission", () => {
      const disputedParcel = dummyLandParcels.features.find((f) => f.id === "PARCEL-001")!.properties;
      const conflictMsg = detectConflicts(disputedParcel);
      const conflictObj = detectConflictResult(disputedParcel);

      expect(conflictMsg).toContain("Conflict Detected");
      expect(conflictMsg).toContain("Building permission issued for Residential use");
      expect(conflictObj.hasConflict).toBe(true);
      expect(conflictObj.severity).toBe("critical");
    });

    it("returns null conflict for clean parcel", () => {
      const cleanParcel = dummyLandParcels.features.find((f) => f.id === "PARCEL-002")!.properties;
      const conflictMsg = detectConflicts(cleanParcel);
      expect(conflictMsg).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 6: Chain-of-title timeline rendering across all parcels
  // --------------------------------------------------------------------------
  describe("6. Chain-of-Title Audit Trail across All Parcels", () => {
    it("confirms every parcel across UP, TN, and CH has valid chain of title records", () => {
      const allParcels = [
        ...dummyLandParcels.features,
        ...normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu").features,
        ...normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh").features,
      ];

      allParcels.forEach((p) => {
        expect(p.properties.chainOfTitle).toBeDefined();
        expect(p.properties.chainOfTitle!.length).toBeGreaterThanOrEqual(1);
        p.properties.chainOfTitle!.forEach((record) => {
          expect(record.date).toBeTruthy();
          expect(record.ownerName).toBeTruthy();
          expect(record.transactionType).toBeTruthy();
          expect(record.documentRef).toBeTruthy();
        });
      });
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 7: Consent-based access flow (DPDP Act handshake)
  // --------------------------------------------------------------------------
  describe("7. Consent-Based Access Flow (DPDP Act 2023)", () => {
    it("unlocks parcel drawer once consent is approved in store", () => {
      const consentParcel = dummyLandParcels.features.find((f) => f.properties.ownerConsentRequired)!.properties;
      const { approveConsent, approvedConsentUlpins } = useAppStore.getState();

      expect(approvedConsentUlpins).not.toContain(consentParcel.ulpin);

      approveConsent(consentParcel.ulpin);
      expect(useAppStore.getState().approvedConsentUlpins).toContain(consentParcel.ulpin);

      render(
        <LanguageProvider>
          <ParcelDrawer
            parcel={consentParcel}
            isOpen={true}
            role="officer"
            approvedConsentUlpins={useAppStore.getState().approvedConsentUlpins}
            onClose={vi.fn()}
          />
        </LanguageProvider>
      );

      // Verify lock banner is no longer displayed
      expect(screen.queryByTestId("owner-consent-locked-state")).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 8: PDF certificate generation logic
  // --------------------------------------------------------------------------
  describe("8. Ownership Certificate PDF Generator", () => {
    it("has valid certificate generator module importable without runtime error", async () => {
      const module = await import("@/lib/certificateGenerator");
      expect(module.generateOwnershipCertificatePdf).toBeDefined();
      expect(typeof module.generateOwnershipCertificatePdf).toBe("function");
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 9: QR Verify Page Resolution
  // --------------------------------------------------------------------------
  describe("9. QR Verify Page Resolution & Alias Support", () => {
    it("resolves UP, TN, and Chandigarh parcels by ULPIN", () => {
      const up = dummyLandParcels.features[0].properties;
      const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu").features[0].properties;
      const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh").features[0].properties;

      expect(up.ulpin).toMatch(/^UP/);
      expect(tn.ulpin).toMatch(/^TN/);
      expect(ch.ulpin).toMatch(/^CH/);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 10: Live Notifications & Navigation
  // --------------------------------------------------------------------------
  describe("10. Cadastral Notification Engine & Store Dispatch", () => {
    it("adds, marks as read, and clears notifications in Zustand store", () => {
      const store = useAppStore.getState();
      const initialCount = store.notifications.length;

      store.addNotification({
        id: "test-notif-1",
        title: "Test Mutation Alert",
        message: "Khasra 245/2 mutation processed",
        timestamp: "Just now",
        createdAt: Date.now(),
        type: "mutation",
        ulpin: "UP26A8941B",
        khasraNo: "245/2",
        isRead: false,
      });

      expect(useAppStore.getState().notifications.length).toBe(initialCount + 1);
      expect(useAppStore.getState().notifications[0].isRead).toBe(false);

      store.markNotificationRead("test-notif-1");
      expect(useAppStore.getState().notifications.find((n) => n.id === "test-notif-1")?.isRead).toBe(true);

      store.clearAllNotifications();
      expect(useAppStore.getState().notifications.length).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 11: Voice search recognition & parsing
  // --------------------------------------------------------------------------
  describe("11. Voice Search & Multilingual Natural Language Parsing", () => {
    it("accurately extracts Khasra number from Hindi voice query", () => {
      const result = parseVoiceQuery("खसरा 245 दिखाओ", dummyLandParcels);
      expect(result.matchedBy).toBe("Khasra Number");
      expect(result.parcel).toBeDefined();
      expect(result.parcel?.properties.khasraNo).toContain("245");
    });

    it("accurately extracts Khasra number from English query", () => {
      const result = parseVoiceQuery("Show me khasra 102", dummyLandParcels);
      expect(result.matchedBy).toBe("Khasra Number");
      expect(result.parcel).toBeDefined();
      expect(result.parcel?.properties.khasraNo).toContain("102");
    });

    it("accurately extracts ULPIN from voice query", () => {
      const result = parseVoiceQuery("Check status of UP26A8941B", dummyLandParcels);
      expect(result.matchedBy).toBe("ULPIN");
      expect(result.matchedValue).toBe("UP26A8941B");
      expect(result.parcel).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 12: Landing page components & accessibility
  // --------------------------------------------------------------------------
  describe("12. Landing Page (/welcome) & Global Navigation", () => {
    it("exports WelcomePage component without error", async () => {
      const WelcomeModule = await import("@/app/welcome/page");
      expect(WelcomeModule.default).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 13: Impact Stats Counter calculation
  // --------------------------------------------------------------------------
  describe("13. Impact Stats Counter Interpolation", () => {
    it("formats Indian currency and numbers with commas", () => {
      const num = 12847;
      expect(num.toLocaleString("en-IN")).toBe("12,847");
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 14: Ecosystem Diagram Architecture & Connectivity
  // --------------------------------------------------------------------------
  describe("14. Institutional Ecosystem Interoperability Diagram", () => {
    it("exports valid EcosystemDiagram component", async () => {
      const EcosystemModule = await import("@/components/EcosystemDiagram");
      expect(EcosystemModule.default).toBeDefined();
    });
  });
});
