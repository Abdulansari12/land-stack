// scratch/verify_performance_optimizations.js
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  PERFORMANCE OPTIMIZATIONS & BUNDLE SPLITTING AUDIT');
console.log('================================================================\n');

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedChecks++;
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. MapLoadingSkeleton Component
// -----------------------------------------------------------------------------
console.log('1. Map Loading Skeleton Verification');
const skeletonPath = path.join(__dirname, '..', 'components', 'MapLoadingSkeleton.tsx');
assert(fs.existsSync(skeletonPath), 'components/MapLoadingSkeleton.tsx exists');
const skeletonCode = fs.readFileSync(skeletonPath, 'utf8');
assert(skeletonCode.includes('data-testid="map-loading-skeleton"'), 'Renders data-testid="map-loading-skeleton"');
assert(skeletonCode.includes('grid-skeleton-pattern'), 'Renders animated GIS coordinate grid pattern');
assert(skeletonCode.includes('polygon'), 'Renders simulated cadastral boundary polygons');
assert(skeletonCode.includes('Loading Cadastral Spatial Engine'), 'Renders clear spatial loading prompt');

// -----------------------------------------------------------------------------
// 2. Dynamic Imports & Skeletons in app/page.tsx
// -----------------------------------------------------------------------------
console.log('\n2. Dynamic Imports in app/page.tsx');
const pageCode = fs.readFileSync(path.join(__dirname, '..', 'app', 'page.tsx'), 'utf8');
assert(pageCode.includes('dynamic(() => import("@/components/MapComponent")'), 'MapComponent dynamically imported via next/dynamic');
assert(pageCode.includes('ssr: false'), 'MapComponent has ssr: false');
assert(pageCode.includes('loading: () => <MapLoadingSkeleton />'), 'MapComponent uses MapLoadingSkeleton as loading fallback');
assert(pageCode.includes('dynamic(() => import("@/components/DeckGL3DMap")'), 'DeckGL3DMap dynamically imported via next/dynamic');
assert(pageCode.includes('dynamic(() => import("@/components/AIEncroachmentModal")'), 'AIEncroachmentModal lazy-loaded via next/dynamic');
assert(pageCode.includes('dynamic(() => import("@/components/EcosystemModal")'), 'EcosystemModal lazy-loaded via next/dynamic');
assert(pageCode.includes('dynamic(() => import("@/components/KeyboardShortcutsModal")'), 'KeyboardShortcutsModal lazy-loaded via next/dynamic');
assert(pageCode.includes('dynamic(() => import("@/components/GuidedTour")'), 'GuidedTour lazy-loaded via next/dynamic');
assert(pageCode.includes('dynamic(() => import("@/components/CommandPalette")'), 'CommandPalette lazy-loaded via next/dynamic');

// Memoization in app/page.tsx
assert(pageCode.includes('const { clearCount, disputedCount, inReviewCount } = useMemo'), 'Status counts memoized with useMemo');

// -----------------------------------------------------------------------------
// 3. HeatmapLayer Expensive Computation Memoization
// -----------------------------------------------------------------------------
console.log('\n3. HeatmapLayer Memoization (components/HeatmapLayer.tsx)');
const heatmapCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'HeatmapLayer.tsx'), 'utf8');
assert(heatmapCode.includes('useMemo'), 'HeatmapLayer imports and uses useMemo');
assert(heatmapCode.includes('const heatPoints = useMemo'), 'heatPoints calculation wrapped in useMemo');

// -----------------------------------------------------------------------------
// 4. ParcelDrawer Memoization & React.memo
// -----------------------------------------------------------------------------
console.log('\n4. ParcelDrawer Memoization & React.memo');
const drawerCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'ParcelDrawer.tsx'), 'utf8');
assert(drawerCode.includes('memo(ParcelDrawerBase)'), 'ParcelDrawer exported with React.memo');
assert(drawerCode.includes('const conflictMessage = useMemo'), 'Conflict detection memoized with useMemo');
assert(drawerCode.includes('const areaInAcres = useMemo'), 'areaInAcres memoized with useMemo');
assert(drawerCode.includes('const areaInSqMeters = useMemo'), 'areaInSqMeters memoized with useMemo');
assert(drawerCode.includes('const formattedValuation = useMemo'), 'formattedValuation memoized with useMemo');
assert(drawerCode.includes('dynamic(') && drawerCode.includes('OwnershipCertificateModal'), 'OwnershipCertificateModal code-split with next/dynamic');

// -----------------------------------------------------------------------------
// 5. NotificationList Component & React.memo
// -----------------------------------------------------------------------------
console.log('\n5. NotificationList & NotificationBell Component Optimization');
const notifListPath = path.join(__dirname, '..', 'components', 'NotificationList.tsx');
assert(fs.existsSync(notifListPath), 'components/NotificationList.tsx exists');
const notifListCode = fs.readFileSync(notifListPath, 'utf8');
assert(notifListCode.includes('memo(NotificationListBase)'), 'NotificationList exported with React.memo');

const bellCode = fs.readFileSync(path.join(__dirname, '..', 'components', 'NotificationBell.tsx'), 'utf8');
assert(bellCode.includes('useCallback'), 'NotificationBell uses useCallback for handlers');
assert(bellCode.includes('<NotificationList'), 'NotificationBell renders memoized NotificationList');

// -----------------------------------------------------------------------------
// 6. Heavy PDF & Canvas Libraries Dynamic Code-Splitting
// -----------------------------------------------------------------------------
console.log('\n6. Heavy Libraries Dynamic Code-Splitting (>50KB)');
const certGenCode = fs.readFileSync(path.join(__dirname, '..', 'lib', 'certificateGenerator.ts'), 'utf8');
assert(!certGenCode.startsWith('import jsPDF from "jspdf"'), 'No static top-level import of jsPDF');
assert(!certGenCode.startsWith('import html2canvas from "html2canvas"'), 'No static top-level import of html2canvas');
assert(certGenCode.includes('import("jspdf")'), 'jsPDF is dynamically imported on-demand');
assert(certGenCode.includes('import("html2canvas")'), 'html2canvas is dynamically imported on-demand');

console.log('\n----------------------------------------------------------------');
console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${totalChecks - passedChecks}`);
if (passedChecks === totalChecks) {
  console.log('>>> ALL PERFORMANCE & CODE-SPLITTING CHECKS PASSED! <<<');
} else {
  process.exit(1);
}
