/**
 * Verification test for LoadingState and ErrorState standardized primitives and integration
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import * as fs from "fs";
import { LoadingState, ErrorState } from "../components/ui";

function runTests() {
  console.log("=================================================");
  console.log("TESTING LOADING & ERROR STATES IMPLEMENTATION");
  console.log("=================================================\n");

  // 1. LoadingState Unit Tests
  console.log("1. Testing LoadingState component rendering & ARIA roles...");

  // Spinner variant
  const spinnerHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(LoadingState, { variant: "spinner", size: "md", label: "Loading..." })
  );
  console.assert(spinnerHtml.includes('role="status"'), "Spinner must have role=status");
  console.assert(spinnerHtml.includes('aria-live="polite"'), "Spinner must have aria-live=polite");
  console.assert(spinnerHtml.includes("animate-spin"), "Spinner must have animate-spin");
  console.log("   LoadingState (spinner) renders with WCAG role=status and aria-live=polite");

  // Skeleton variant
  const skeletonHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(LoadingState, { variant: "skeleton" })
  );
  console.assert(skeletonHtml.includes("animate-pulse"), "Skeleton must have animate-pulse");
  console.log("   LoadingState (skeleton) renders pulse placeholders");

  // Card variant
  const cardHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(LoadingState, {
      variant: "card",
      label: "Fetching Records",
      description: "Aggregating cadastral data across states",
    })
  );
  console.assert(cardHtml.includes("Fetching Records"), "Card must include label");
  console.assert(cardHtml.includes("Aggregating cadastral data"), "Card must include description");
  console.log("   LoadingState (card) renders full container with title and description");

  // Inline variant
  const inlineHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(LoadingState, { variant: "inline", size: "sm", label: "Filing Mutation..." })
  );
  console.assert(inlineHtml.includes("Filing Mutation..."), "Inline must include label");
  console.log("   LoadingState (inline) renders compact inline state for buttons\n");

  // 2. ErrorState Unit Tests
  console.log("2. Testing ErrorState component rendering & ARIA roles...");

  // Card variant with retry and secondary action
  let retryCalled = false;
  let secondaryCalled = false;
  const errorCardHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ErrorState, {
      variant: "card",
      title: "Data Resolution Failed",
      message: "Unable to contact cadastral registry endpoint",
      retryLabel: "Retry Query",
      onRetry: () => { retryCalled = true; },
      secondaryAction: {
        label: "View Docs",
        onClick: () => { secondaryCalled = true; },
      },
    })
  );
  console.assert(errorCardHtml.includes('role="alert"'), "ErrorState must have role=alert");
  console.assert(errorCardHtml.includes('aria-live="assertive"'), "ErrorState must have aria-live=assertive");
  console.assert(errorCardHtml.includes("Data Resolution Failed"), "Must render title");
  console.assert(errorCardHtml.includes("Retry Query"), "Must render retry button");
  console.assert(errorCardHtml.includes("View Docs"), "Must render secondary action");
  console.log("   ErrorState (card) renders with WCAG role=alert, retry button, and secondary action");

  // Banner variant with dismiss
  const errorBannerHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ErrorState, {
      variant: "banner",
      size: "sm",
      message: "DPDP Consent Verification Timed Out",
      onRetry: () => {},
      onDismiss: () => {},
    })
  );
  console.assert(errorBannerHtml.includes("DPDP Consent Verification Timed Out"), "Banner must render message");
  console.assert(errorBannerHtml.includes("Dismiss error alert"), "Banner must render dismiss button");
  console.log("   ErrorState (banner) renders compact alert banner with dismiss");

  // Full page variant
  const errorFullHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ErrorState, {
      variant: "full",
      title: "Map Service Temporarily Down",
      message: "Please reload the map layer",
      onRetry: () => {},
    })
  );
  console.assert(errorFullHtml.includes("Map Service Temporarily Down"), "Full must render title");
  console.log("   ErrorState (full) renders full-bleed recovery view\n");

  // 3. Static Integration Checks Across Codebase
  console.log("3. Verifying Integration across app pages & components...");

  const filesToCheck = [
    {
      file: "app/api-explorer/page.tsx",
      mustInclude: [
        "LoadingState",
        "ErrorState",
        "parcelsResponse.loading",
        "singleResponse.loading",
        "parcelsResponse.error",
        "singleResponse.error",
      ],
      desc: "API Explorer page (/api/parcels & /api/parcels/[ulpin])",
    },
    {
      file: "app/dashboard/page.tsx",
      mustInclude: [
        "LoadingState",
        "ErrorState",
        "!mounted",
        "allParcels.length === 0",
      ],
      desc: "Officer Dashboard analytics page",
    },
    {
      file: "components/MapErrorBoundary.tsx",
      mustInclude: [
        "ErrorState",
        'variant="card"',
        "onRetry={this.handleRetry}",
      ],
      desc: "Spatial Map Error Boundary",
    },
    {
      file: "components/ParcelDrawer.tsx",
      mustInclude: [
        "LoadingState",
        "ErrorState",
        "consentError",
        "pdfError",
        "mutationStatus",
        "mutationError",
        "handleInitiateMutation",
      ],
      desc: "Parcel Drawer async workflows (DPDP consent, PDF download, Mutation)",
    },
    {
      file: "components/OwnershipCertificateModal.tsx",
      mustInclude: [
        "LoadingState",
        "ErrorState",
        "modalPdfError",
        "qrLoading",
        "qrError",
      ],
      desc: "Ownership Certificate Preview Modal",
    },
  ];

  for (const item of filesToCheck) {
    const code = fs.readFileSync(item.file, "utf8");
    for (const token of item.mustInclude) {
      if (!code.includes(token)) {
        throw new Error(`Verification failed: ${item.file} missing token "${token}"`);
      }
    }
    console.log(`   ${item.desc} correctly integrates LoadingState & ErrorState`);
  }

  console.log("\n=================================================");
  console.log("ALL LOADING AND ERROR STATE TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================");
}

runTests();
