/**
 * Input Sanitization & Anti-XSS Utilities
 *
 * Provides defense-in-depth sanitization for user inputs entering the application
 * (search queries, natural language prompts, API inputs, and URL parameters).
 *
 * Prevents Cross-Site Scripting (XSS), script injection, and payload execution
 * even if search or query strings are subsequently interpolated into HTML strings
 * (e.g. Leaflet map popups, PDF generators, or innerHTML containers).
 */

/**
 * Encodes special HTML characters to prevent breaking out of HTML tags or attributes.
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Strips HTML tags, script elements, event handlers, and dangerous pseudo-protocols.
 */
export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    // Remove script and style tags with their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove all remaining HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove javascript:, vbscript:, data:text/html pseudo-protocols
    .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, "")
    // Remove inline event handlers (e.g. onload=, onerror=)
    .replace(/\bon\w+\s*=/gi, "");
}

/**
 * Basic input sanitizer: strips HTML tags, removes non-printable control characters,
 * normalizes whitespace, and enforces a maximum string length.
 */
export function sanitizeInput(input: string, maxLength: number = 200): string {
  if (!input || typeof input !== "string") return "";

  // 1. Strip HTML tags and dangerous protocols
  let cleaned = stripHtmlTags(input);

  // 2. Remove non-printable control characters (except common whitespace)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 3. Normalize multiple whitespace characters to a single space
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 4. Enforce max length to prevent buffer/regex Denial of Service (ReDoS)
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength).trim();
  }

  return cleaned;
}

/**
 * Sanitizes search input specifically for parcel searches (ULPIN, Khasra #, Owner name).
 * Strips potentially dangerous punctuation while preserving alphanumeric characters,
 * hyphens, slashes (common in Khasra e.g. 412/1), and spaces.
 */
export function sanitizeSearchQuery(input: string, maxLength: number = 100): string {
  if (!input || typeof input !== "string") return "";
  const cleaned = sanitizeInput(input, maxLength);
  // Keep alphanumeric, spaces, hyphens, hashes, and slashes for Indian cadastral notation
  return cleaned.replace(/[^\w\s\-\/#]/gi, "").trim();
}

/**
 * Sanitizes natural language query inputs (Ask Land Stack, /api/nl-query).
 * Allows international characters (including Hindi Devnagari script \u0900-\u097F),
 * punctuation, and spaces, while stripping HTML tags and prompt-injection prefixes.
 */
export function sanitizeNLQuery(input: string, maxLength: number = 300): string {
  if (!input || typeof input !== "string") return "";
  let cleaned = sanitizeInput(input, maxLength);

  // Strip potential prompt injection prefixes in case sent to LLMs
  cleaned = cleaned.replace(
    /^(?:system\s*:|assistant\s*:|user\s*:|ignore\s+(?:all\s+)?previous\s+instructions\b)/gi,
    ""
  ).trim();

  return cleaned;
}
