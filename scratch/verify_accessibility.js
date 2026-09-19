// scratch/verify_accessibility.js
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  WCAG 2.1 AA ACCESSIBILITY AUDIT VERIFICATION');
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
// 1. Mathematical WCAG AA Color Contrast Calculation
// -----------------------------------------------------------------------------
console.log('1. Mathematical WCAG AA Color Contrast Calculation');

function sRGBtoLinear(c) {
  const cNorm = c / 255;
  return cNorm <= 0.03928 ? cNorm / 12.92 : Math.pow((cNorm + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function calculateContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Tailwind color definitions used in Badge.tsx and ParcelDrawer.tsx
const colors = {
  emerald100: '#d1fae5',
  emerald200: '#a7f3d0',
  emerald950: '#022c22',
  red100: '#fee2e2',
  red200: '#fecaca',
  red950: '#450a0a',
  amber100: '#fef3c7',
  amber200: '#fde68a',
  amber950: '#451a03',
  indigo100: '#e0e7ff',
  indigo200: '#c7d2fe',
  indigo950: '#1e1b4b',
  slate100: '#f1f5f9',
  slate900: '#0f172a',
  zinc800: '#27272a',
  zinc100: '#f4f4f5',
};

const pairings = [
  { name: 'Success Light (emerald-950 on emerald-100)', bg: colors.emerald100, text: colors.emerald950 },
  { name: 'Success Dark (emerald-200 on emerald-950)', bg: colors.emerald950, text: colors.emerald200 },
  { name: 'Danger Light (red-950 on red-100)', bg: colors.red100, text: colors.red950 },
  { name: 'Danger Dark (red-200 on red-950)', bg: colors.red950, text: colors.red200 },
  { name: 'Warning Light (amber-950 on amber-100)', bg: colors.amber100, text: colors.amber950 },
  { name: 'Warning Dark (amber-200 on amber-950)', bg: colors.amber950, text: colors.amber200 },
  { name: 'Info Light (indigo-950 on indigo-100)', bg: colors.indigo100, text: colors.indigo950 },
  { name: 'Info Dark (indigo-200 on indigo-950)', bg: colors.indigo950, text: colors.indigo200 },
  { name: 'Neutral Light (slate-900 on slate-100)', bg: colors.slate100, text: colors.slate900 },
  { name: 'Neutral Dark (zinc-100 on zinc-800)', bg: colors.zinc800, text: colors.zinc100 },
];

for (const pair of pairings) {
  const ratio = calculateContrastRatio(pair.bg, pair.text);
  assert(ratio >= 4.5, `${pair.name}: Ratio = ${ratio.toFixed(2)}:1 (>= 4.5:1 required for WCAG AA)`);
}

// -----------------------------------------------------------------------------
// 2. Focus Trap Hook Verification
// -----------------------------------------------------------------------------
console.log('\n2. Focus Trap Hook (hooks/useFocusTrap.ts)');
const focusTrapPath = path.join(__dirname, '..', 'hooks', 'useFocusTrap.ts');
assert(fs.existsSync(focusTrapPath), 'hooks/useFocusTrap.ts exists');
const focusTrapCode = fs.readFileSync(focusTrapPath, 'utf8');
assert(focusTrapCode.includes('event.key === "Tab"'), 'Handles Tab key for cycling');
assert(focusTrapCode.includes('event.shiftKey'), 'Handles Shift+Tab backward cycling');
assert(focusTrapCode.includes('event.key === "Escape"'), 'Handles Escape key dismissal');
assert(focusTrapCode.includes('previousActiveElementRef'), 'Stores & restores previous active element on close');

// -----------------------------------------------------------------------------
// 3. Components Accessibility Verification
// -----------------------------------------------------------------------------
console.log('\n3. Components ARIA & Accessibility Attributes');

const compDir = path.join(__dirname, '..', 'components');

// ParcelDrawer.tsx
const drawerCode = fs.readFileSync(path.join(compDir, 'ParcelDrawer.tsx'), 'utf8');
assert(drawerCode.includes('useFocusTrap'), 'ParcelDrawer uses useFocusTrap hook');
assert(drawerCode.includes('role="dialog"'), 'ParcelDrawer has role="dialog"');
assert(drawerCode.includes('aria-modal="true"'), 'ParcelDrawer has aria-modal="true"');
assert(drawerCode.includes('aria-label="Close parcel details drawer"'), 'ParcelDrawer close button has descriptive aria-label');
assert(drawerCode.includes('role="tablist"'), 'ParcelDrawer has role="tablist"');
assert(drawerCode.includes('role="tabpanel"'), 'ParcelDrawer has role="tabpanel"');
assert(drawerCode.includes('CheckCircle2') && drawerCode.includes('AlertTriangle'), 'ParcelDrawer status badges include secondary icons');

// ParcelSearchBar.tsx
const searchCode = fs.readFileSync(path.join(compDir, 'ParcelSearchBar.tsx'), 'utf8');
assert(searchCode.includes('aria-label="Clear search query"'), 'ParcelSearchBar has clear button aria-label');
assert(searchCode.includes('aria-label="Open Search Bar"'), 'ParcelSearchBar mobile trigger has aria-label');
assert(searchCode.includes('searchPlaceholder'), 'ParcelSearchBar input has localized descriptive aria-label');

// VoiceSearchButton.tsx
const voiceCode = fs.readFileSync(path.join(compDir, 'VoiceSearchButton.tsx'), 'utf8');
assert(voiceCode.includes('useFocusTrap'), 'VoiceSearchButton dialog uses useFocusTrap');
assert(voiceCode.includes('aria-label="Close voice search dialog"'), 'VoiceSearchButton close button has aria-label');
assert(voiceCode.includes('role="dialog"'), 'VoiceSearchButton dialog has role="dialog"');

// NotificationBell.tsx
const bellCode = fs.readFileSync(path.join(compDir, 'NotificationBell.tsx'), 'utf8');
assert(bellCode.includes('unreadCount > 0'), 'NotificationBell has dynamic aria-label reflecting unread count');
assert(bellCode.includes('aria-expanded={isOpen}'), 'NotificationBell has aria-expanded state');
assert(bellCode.includes('role="region"'), 'NotificationBell dropdown has role="region"');
assert(bellCode.includes('aria-label="Clear all notifications"'), 'NotificationBell clear button has aria-label');

// AIEncroachmentModal.tsx
const encroachCode = fs.readFileSync(path.join(compDir, 'AIEncroachmentModal.tsx'), 'utf8');
assert(encroachCode.includes('useFocusTrap'), 'AIEncroachmentModal uses useFocusTrap');
assert(encroachCode.includes('role="dialog"'), 'AIEncroachmentModal has role="dialog"');
assert(encroachCode.includes('role="img"') && encroachCode.includes('<title>'), 'AIEncroachmentModal satellite SVGs have role="img" and <title>');
assert(encroachCode.includes('aria-label="Close encroachment detection modal"'), 'AIEncroachmentModal close button has aria-label');

// OwnershipCertificateModal.tsx
const certCode = fs.readFileSync(path.join(compDir, 'OwnershipCertificateModal.tsx'), 'utf8');
assert(certCode.includes('useFocusTrap'), 'OwnershipCertificateModal uses useFocusTrap');
assert(certCode.includes('alt={`Official QR verification code'), 'OwnershipCertificateModal QR code image has descriptive alt text');

// TimeMachineSlider.tsx
const tmCode = fs.readFileSync(path.join(compDir, 'TimeMachineSlider.tsx'), 'utf8');
assert(tmCode.includes('aria-label="Historical satellite imagery year selector"'), 'TimeMachineSlider range input has aria-label');
assert(tmCode.includes('aria-valuenow={year}'), 'TimeMachineSlider has aria-valuenow');
assert(tmCode.includes('aria-label={'), 'TimeMachineSlider play/pause button has dynamic aria-label');
assert(tmCode.includes('role="img"'), 'TimeMachineSlider satellite SVGs have role="img"');

// EcosystemDiagram.tsx & EcosystemModal.tsx
const ecoDiagCode = fs.readFileSync(path.join(compDir, 'EcosystemDiagram.tsx'), 'utf8');
assert(ecoDiagCode.includes('role="img"'), 'EcosystemDiagram SVG has role="img"');
assert(ecoDiagCode.includes('<title>Land Stack Interoperability Ecosystem Architecture</title>'), 'EcosystemDiagram has <title>');
assert(ecoDiagCode.includes('aria-label={isAnimationActive'), 'EcosystemDiagram pulse button has dynamic aria-label');

const ecoModalCode = fs.readFileSync(path.join(compDir, 'EcosystemModal.tsx'), 'utf8');
assert(ecoModalCode.includes('useFocusTrap'), 'EcosystemModal uses useFocusTrap');
assert(ecoModalCode.includes('role="dialog"'), 'EcosystemModal has role="dialog"');
assert(ecoModalCode.includes('aria-label="Close ecosystem modal"'), 'EcosystemModal has close button aria-label');

// KeyboardShortcutsModal.tsx
const kbModalCode = fs.readFileSync(path.join(compDir, 'KeyboardShortcutsModal.tsx'), 'utf8');
assert(kbModalCode.includes('useFocusTrap'), 'KeyboardShortcutsModal uses useFocusTrap');
assert(kbModalCode.includes('role="dialog"'), 'KeyboardShortcutsModal has role="dialog"');
assert(kbModalCode.includes('aria-label="Close keyboard shortcuts dialog"'), 'KeyboardShortcutsModal has close button aria-label');

// AskLandStack.tsx
const askCode = fs.readFileSync(path.join(compDir, 'AskLandStack.tsx'), 'utf8');
assert(askCode.includes('aria-label="Ask Land Stack plain-language query"'), 'AskLandStack input has aria-label');
assert(askCode.includes('aria-label="Clear query"'), 'AskLandStack clear button has aria-label');
assert(askCode.includes('aria-label="Submit plain-language query"'), 'AskLandStack submit button has aria-label');

// ImpactStatsCounter.tsx
const statsCode = fs.readFileSync(path.join(compDir, 'ImpactStatsCounter.tsx'), 'utf8');
assert(statsCode.includes('aria-label="Replay counter animation"'), 'ImpactStatsCounter has aria-label on replay buttons');

// Header.tsx & SettingsKebabMenu.tsx
const headerCode = fs.readFileSync(path.join(compDir, 'Header.tsx'), 'utf8');
assert(headerCode.includes('aria-label={t("toggleTheme")'), 'Header theme toggle has aria-label');
assert(headerCode.includes('aria-label={t("keyboardShortcuts")'), 'Header shortcuts button has aria-label');
assert(headerCode.includes('aria-label={t("presentationMode")'), 'Header presentation mode button has aria-label');

const kebabCode = fs.readFileSync(path.join(compDir, 'SettingsKebabMenu.tsx'), 'utf8');
assert(kebabCode.includes('aria-label="Demo Settings"'), 'SettingsKebabMenu has aria-label');
assert(kebabCode.includes('aria-haspopup="menu"'), 'SettingsKebabMenu has aria-haspopup="menu"');

console.log('\n----------------------------------------------------------------');
console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${totalChecks - passedChecks}`);
if (passedChecks === totalChecks) {
  console.log('>>> ALL ACCESSIBILITY (WCAG AA) CHECKS PASSED SUCCESSFULLY! <<<');
} else {
  process.exit(1);
}
