const fs = require("fs");
const path = require("path");

function runVerification() {
  console.log("=== VERIFYING DARK MODE & CARTO DB DARK MATTER INTEGRATION ===");
  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
    }
  }

  const baseDir = path.resolve(__dirname, "..");

  // 1. Check globals.css
  const globalsCss = fs.readFileSync(path.join(baseDir, "app", "globals.css"), "utf-8");
  assert(
    globalsCss.includes("@custom-variant dark (&:where(.dark, .dark *));"),
    "globals.css defines Tailwind v4 @custom-variant dark"
  );
  assert(
    globalsCss.includes(".dark {") && globalsCss.includes("--background: #09090b;"),
    "globals.css defines .dark CSS variables"
  );
  assert(
    globalsCss.includes(".dark .leaflet-container") && globalsCss.includes(".dark .leaflet-popup-content-wrapper"),
    "globals.css includes Leaflet dark mode overrides for popup and container"
  );

  // 2. Check ThemeContext.tsx
  const themeContext = fs.readFileSync(path.join(baseDir, "context", "ThemeContext.tsx"), "utf-8");
  assert(
    themeContext.includes("export function ThemeProvider") && themeContext.includes("export function useTheme"),
    "ThemeContext exports ThemeProvider and useTheme"
  );
  assert(
    themeContext.includes("land_stack_theme"),
    "ThemeContext persists theme to localStorage ('land_stack_theme')"
  );
  assert(
    themeContext.includes("prefers-color-scheme: dark"),
    "ThemeContext supports system dark mode preference fallback"
  );
  assert(
    themeContext.includes("root.classList.add(\"dark\")") && themeContext.includes("root.classList.remove(\"dark\")"),
    "ThemeContext toggles .dark class on document.documentElement"
  );

  // 3. Check layout.tsx
  const layoutTsx = fs.readFileSync(path.join(baseDir, "app", "layout.tsx"), "utf-8");
  assert(
    layoutTsx.includes("<ThemeProvider>") && layoutTsx.includes("</ThemeProvider>"),
    "layout.tsx wraps application in ThemeProvider"
  );
  assert(
    layoutTsx.includes("land_stack_theme") && layoutTsx.includes("classList.add('dark')"),
    "layout.tsx includes inline anti-flicker script in <head>"
  );

  // 4. Check MapComponent.tsx
  const mapComponent = fs.readFileSync(path.join(baseDir, "components", "MapComponent.tsx"), "utf-8");
  assert(
    mapComponent.includes("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"),
    "MapComponent uses CartoDB Dark Matter tile layer URL in dark mode"
  );
  assert(
    mapComponent.includes("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"),
    "MapComponent uses CartoDB Light tile layer URL in light mode"
  );
  assert(
    mapComponent.includes("effectiveDark ? \"carto-dark-matter\" : \"carto-positron-light\""),
    "MapComponent dynamically switches TileLayer key to force clean Leaflet remount"
  );
  assert(
    mapComponent.includes("isDarkMode?: boolean"),
    "MapComponent accepts isDarkMode prop"
  );

  // 5. Check DeckGL3DMap.tsx
  const deckglMap = fs.readFileSync(path.join(baseDir, "components", "DeckGL3DMap.tsx"), "utf-8");
  assert(
    deckglMap.includes("https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png") &&
    deckglMap.includes("https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"),
    "DeckGL3DMap switches 3D base tiles between CartoDB dark and light"
  );

  // 6. Check app/page.tsx
  const pageTsx = fs.readFileSync(path.join(baseDir, "app", "page.tsx"), "utf-8");
  assert(
    pageTsx.includes("data-testid=\"theme-toggle-btn\""),
    "app/page.tsx renders theme toggle button in header with test ID"
  );
  assert(
    pageTsx.includes("isDarkMode={isDark}"),
    "app/page.tsx passes isDarkMode to MapComponent and DeckGL3DMap"
  );

  // 7. Check app/welcome/page.tsx
  const welcomeTsx = fs.readFileSync(path.join(baseDir, "app", "welcome", "page.tsx"), "utf-8");
  assert(
    welcomeTsx.includes("data-testid=\"welcome-theme-toggle-btn\""),
    "app/welcome/page.tsx renders theme toggle button in top navigation"
  );

  // 8. Check CommandPalette.tsx
  const cmdPalette = fs.readFileSync(path.join(baseDir, "components", "CommandPalette.tsx"), "utf-8");
  assert(
    cmdPalette.includes("toggle switch dark light mode theme"),
    "CommandPalette includes Cmd+K shortcut action to switch theme"
  );

  // 9. Check translations.ts
  const translations = fs.readFileSync(path.join(baseDir, "lib", "translations.ts"), "utf-8");
  assert(
    translations.includes("darkMode: \"Dark Mode\"") && translations.includes("darkMode: \"डार्क मोड\""),
    "translations.ts provides bilingual translations for theme toggle"
  );

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
  if (passed === total) {
    console.log("🎉 ALL DARK MODE VERIFICATION CHECKS PASSED!");
    process.exit(0);
  } else {
    console.error("❌ Some verification checks failed.");
    process.exit(1);
  }
}

runVerification();
