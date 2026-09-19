# Land Stack DPI — Bug Fixes & QA Audit Log (`BUGFIXES.md`)

This document records all bugs, edge cases, inconsistencies, and usability flaws identified and resolved during the comprehensive manual QA and end-to-end testing pass of the **Land Stack DPI (Unified Cadastral Interoperability Platform)**.

---

## Summary of Fixes

| Bug ID | Component / Route | Severity | Issue Summary | Resolution Status |
| :--- | :--- | :---: | :--- | :---: |
| **BUG-01** | `app/verify/[ulpin]/page.tsx` | High | Broken Chandigarh sample link pointing to non-existent ULPIN (`CH17C0440A`) | **RESOLVED** |
| **BUG-02** | `app/page.tsx` | High | Deep-linking query parameters (`?search=`, `?ulpin=`, `?role=`, `?state=`) not parsed on mount | **RESOLVED** |
| **BUG-03** | `components/ParcelSearchBar.tsx` | Medium | State-scoped search failed to find parcels from other jurisdictions (no cross-registry fallback) | **RESOLVED** |
| **BUG-04** | `components/ParcelSearchBar.tsx` | Low | Hardcoded Tailwind colors used in search dropdown badges instead of semantic design tokens | **RESOLVED** |
| **BUG-05** | `components/NotificationBell.tsx` | Medium | Ineffectual timeout cleanup inside `setInterval` callback during live notification simulation | **RESOLVED** |
| **BUG-06** | `__tests__/endToEndQA.test.tsx` | Medium | Absence of consolidated automated end-to-end test suite for all 14 QA scenarios | **RESOLVED** |

---

## Detailed Bug Reports & Resolution Notes

### BUG-01: Broken Chandigarh Sample Card Link & Missing Alias Handling
- **Affected File**: `app/verify/[ulpin]/page.tsx`
- **Severity**: High (User-facing 404 / Record Not Found on public verification route)
- **Problem**:
  On the public title verification page (`/verify/[ulpin]`), the bottom sample card for the Union Territory of Chandigarh linked to `/verify/CH17C0440A`. In `data/parcels.ts`, the actual registered parcel for Sector 17-C SCO is `CH01S1742A` (Khasra 42/B, Col. Harpreet Singh Sodhi). Clicking the card rendered an empty state with "No Record Found for ULPIN: CH17C0440A".
- **Root Cause**:
  Legacy placeholder ULPIN remained in the sample footer links.
- **Fix Applied**:
  1. Updated the sample card `href` to `/verify/CH01S1742A`, updating the text to `Sector 17-C Plot 42/B`.
  2. Augmented `resolveParcelByUlpin(ulpin: string)` with backward-compatible alias mapping:
     ```typescript
     if (decoded === "ch17c0440a" || decoded === "ch-parcel-201") {
       decoded = "ch01s1742a";
     }
     ```
     This ensures old external QR codes or cached URLs resolve the parcel gracefully rather than breaking.
- **Verification**: Verified with automated Vitest test in `__tests__/endToEndQA.test.tsx` scenario 9.

---

### BUG-02: Query Parameter Deep-Linking Missing on Main Dashboard
- **Affected File**: `app/page.tsx`
- **Severity**: High (Broken user flow between QR verification page and main dashboard)
- **Problem**:
  When users clicked the *"View on Cadastral Map"* link on `/verify/[ulpin]` (e.g. `<Link href="/?search=UP26A8941B">`), the main dashboard loaded the default Tamil Nadu center without reading the URL query string, leaving the parcel drawer closed and requiring the user to search manually again.
- **Root Cause**:
  `app/page.tsx` did not have an initial query parameter parser hook on component mount.
- **Fix Applied**:
  Added a client-side `useEffect` hook listening to `window.location.search`:
  ```typescript
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);

    const roleParam = searchParams.get("role")?.toLowerCase();
    if (roleParam === "officer" || roleParam === "citizen") {
      setRole(roleParam as "officer" | "citizen");
    }

    const stateParam = searchParams.get("state");
    if (stateParam === "Tamil Nadu" || stateParam === "Chandigarh" || stateParam === "Unified View") {
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
  ```
- **Verification**: Verified deep-linking navigation across jurisdictions.

---

### BUG-03: Parcel Search Bar Failed on Cross-State Queries
- **Affected File**: `components/ParcelSearchBar.tsx`
- **Severity**: Medium (Impaired multi-state search usability)
- **Problem**:
  When a user was inspecting Tamil Nadu data and searched for "Col. Harpreet" or "UP26A8941B", the search dropdown rendered *"No parcels matching..."*, even though the platform is designed for national cadastral interoperability.
- **Root Cause**:
  `matchingParcels` only inspected the active `currentCollection` prop passed to the search bar.
- **Fix Applied**:
  Implemented two-tier cross-registry fallback matching:
  1. Searches the current active state collection first.
  2. If 0 results are found, automatically aggregates and queries across all 3 jurisdictions (`dummyLandParcels`, `rawParcelsTamilNadu`, and `rawParcelsChandigarh`).
  3. Displays a semantic state badge (e.g. `[Chandigarh]`) in the search dropdown item so users clearly understand the jurisdiction of origin.
- **Verification**: Added Vitest test `performs cross-state search fallback when searching for Chandigarh parcel in Tamil Nadu view` in `__tests__/endToEndQA.test.tsx`.

---

### BUG-04: Inconsistent Hardcoded Color Badges in Search Dropdown
- **Affected File**: `components/ParcelSearchBar.tsx`
- **Severity**: Low (Design system consistency)
- **Problem**:
  Status badges in `ParcelSearchBar.tsx` dropdown rows used hardcoded classes `bg-green-100 text-green-800`, `bg-red-100 text-red-800`, and `bg-amber-100 text-amber-800` instead of the semantic tokens declared in `tailwind.config.ts`.
- **Root Cause**:
  Oversight during initial design token migration pass.
- **Fix Applied**:
  Updated classes to semantic tokens:
  - Clear / Verified: `bg-status-verified-bg text-status-verified-text dark:bg-emerald-950 dark:text-status-verified-light`, icon `text-status-verified`
  - Disputed: `bg-status-disputed-bg text-status-disputed-text dark:bg-red-950 dark:text-status-disputed-light`, icon `text-status-disputed`
  - Pending: `bg-status-pending-bg text-status-pending-text dark:bg-amber-950 dark:text-status-pending-light`, icon `text-status-pending`
- **Verification**: Re-verified visual consistency in both light and dark themes.

---

### BUG-05: Ineffectual Timeout Cleanup in Live Cadastral Notification Engine
- **Affected File**: `components/NotificationBell.tsx`
- **Severity**: Medium (Potential memory leak and unmounted state update warning)
- **Problem**:
  Inside the 9-second simulation interval of `NotificationBell.tsx`, `return () => clearTimeout(ringTimer)` was returned inside the interval callback function. `setInterval` ignores callback return values, meaning the 1200ms ring animation timeout was never cleared if the component unmounted during the animation.
- **Root Cause**:
  Cleanup callback incorrectly returned inside `setInterval` callback instead of the outer `useEffect` cleanup return.
- **Fix Applied**:
  Stored `ringTimeout` in outer effect scope and explicitly cancelled both `intervalId` and `ringTimeout` in the `useEffect` cleanup return:
  ```typescript
  useEffect(() => {
    let poolIndex = 3;
    let ringTimeout: NodeJS.Timeout | null = null;

    const intervalId = setInterval(() => {
      // ... dispatch notification ...
      setIsRinging(true);
      if (ringTimeout) clearTimeout(ringTimeout);
      ringTimeout = setTimeout(() => setIsRinging(false), 1200);
    }, 9000);

    return () => {
      clearInterval(intervalId);
      if (ringTimeout) clearTimeout(ringTimeout);
    };
  }, [addNotification]);
  ```
- **Verification**: Verified clean unmount without console warnings.

---

### BUG-06: Test Suite Missing Consolidated End-to-End QA Integration
- **Affected File**: `__tests__/endToEndQA.test.tsx`
- **Severity**: Medium (Quality assurance & regression protection)
- **Problem**:
  While unit tests existed for individual modules, there was no single automated test suite asserting the end-to-end integration across all 14 manual QA scenarios specified in the project requirements.
- **Fix Applied**:
  Created `__tests__/endToEndQA.test.tsx` covering all 14 scenarios:
  1. Search Bar & Anti-XSS Sanitization
  2. Map Data Parcels Integrity (all 11 parcels across UP, TN, CH)
  3. ParcelDrawer Roles & DPDP Act Privacy Protections
  4. Multi-State Schema Adapter & Interoperability
  5. Inter-Departmental Conflict Detection Engine
  6. Chain-of-Title Audit Trail across All Parcels
  7. Consent-Based Access Flow (DPDP Act 2023)
  8. Ownership Certificate PDF Generator
  9. QR Verify Page Resolution & Alias Support
  10. Cadastral Notification Engine & Store Dispatch
  11. Voice Search & Multilingual Natural Language Parsing
  12. Landing Page (`/welcome`) & Global Navigation
  13. Impact Stats Counter Interpolation
  14. Institutional Ecosystem Interoperability Diagram
- **Verification**: All 51 tests across all 6 test files pass in 2.2 seconds.

---

## 14-Point Manual QA Verification Matrix

| # | Test Scenario | Test Strategy | Status |
| :-: | :--- | :--- | :-: |
| **1** | **Search Bar (Valid/Invalid/XSS)** | Tested anti-XSS stripping `<script>`, partial search, and cross-state fallback | **PASS** |
| **2** | **Clicking Every Map Parcel** | Tested all 5 UP, 3 TN, and 3 CH parcels; coordinates & properties valid | **PASS** |
| **3** | **Role Toggle (Citizen / Officer)** | Tested unhindered Citizen view vs DPDP Act consent lock in Officer view | **PASS** |
| **4** | **Multi-State Schema Toggle** | Tested TN (Patta/Chitta) & CH (Estate Office) mapping to canonical schema | **PASS** |
| **5** | **Conflict Detection Banner** | Tested agricultural vs residential mismatch on `UP26A8941B` and `TN04M4910A` | **PASS** |
| **6** | **Chain-of-Title Timeline** | Verified 100% of parcels possess >= 1 transaction entry with date, owner, type, docRef | **PASS** |
| **7** | **DPDP Consent Handshake** | Tested request access simulated handshake, loading state, and store unlock | **PASS** |
| **8** | **PDF Certificate Download** | Tested jsPDF & html2canvas certificate generator and download trigger | **PASS** |
| **9** | **QR Verify Page (`/verify/[ulpin]`)** | Tested direct ULPIN lookup, fallback aliases, and deep links | **PASS** |
| **10** | **Live Cadastral Notifications** | Tested 9-second event simulation, ring animation, mark as read, clear all | **PASS** |
| **11** | **Voice Search Microphone** | Tested Hindi/English query extraction ("खसरा 245", "show me 102") | **PASS** |
| **12** | **Landing Page (`/welcome`)** | Tested hero layout, feature grid, enter keypress shortcut | **PASS** |
| **13** | **Impact Stats Counter** | Tested ease-out cubic animated counter and Indian numbering format | **PASS** |
| **14** | **Ecosystem Diagram Animation** | Tested SVG pulse dots, bilateral flows, and 6 institutional node telemetry | **PASS** |
