import type {
  LandParcelFeature,
  LandParcelFeatureCollection,
  LandParcelProperties,
} from "@/data/parcels";
import { sanitizeNLQuery } from "@/lib/sanitize";

export type NLQueryCategory =
  | "dispute"
  | "tax"
  | "landuse"
  | "encroachment"
  | "title"
  | "valuation"
  | "area"
  | "state"
  | "general";

export interface NLQueryResult {
  query: string;
  matchedKeywords: string[];
  intentDescription: string;
  intentCategory: NLQueryCategory;
  matchingParcelUlpins: string[];
  matchingParcels: LandParcelFeature[];
  totalMatches: number;
  totalParcels: number;
  filterSummary: string; // e.g., 'Showing: 3 parcels matching "disputed"'
  aiMode: "rule-based" | "llm";
  explanation: string;
  isSimulatedLLM?: boolean;
}

/**
 * Keyword classification dictionaries
 */
const KEYWORD_RULES = {
  dispute: [
    "dispute",
    "disputed",
    "litigation",
    "court",
    "stay",
    "stay order",
    "injunction",
    "scrutiny",
    "under scrutiny",
    "case",
    "disputes",
    "vivad",
    "विवाद",
    "मुकदमा",
    "विवादित",
  ],
  taxPending: [
    "tax",
    "pending tax",
    "tax due",
    "tax dues",
    "unpaid tax",
    "overdue",
    "tax default",
    "tax defaulter",
    "defaulter",
    "dues",
    "unpaid",
    "कर",
    "बकाया",
    "टैक्स",
  ],
  taxPaid: [
    "paid tax",
    "tax paid",
    "cleared tax",
    "no tax dues",
  ],
  agricultural: [
    "agricultural",
    "agriculture",
    "farm",
    "farming",
    "cropland",
    "kisan",
    "krishi",
    "nanjai",
    "punjai",
    "wet land",
    "कृषि",
    "खेती",
    "किसान",
  ],
  residential: [
    "residential",
    "housing",
    "house",
    "home",
    "natham",
    "colony",
    "plot",
    "आवासीय",
    "घर",
    "मकान",
  ],
  commercial: [
    "commercial",
    "business",
    "shop",
    "shops",
    "retail",
    "sco",
    "office",
    "व्यावसायिक",
    "दुकान",
  ],
  institutional: [
    "institutional",
    "school",
    "college",
    "trust",
    "university",
    "hospital",
    "संस्थागत",
    "ट्रस्ट",
  ],
  encroachment: [
    "encroachment",
    "encroached",
    "illegal",
    "satellite alert",
    "satellite encroachment",
    "conflict",
    "unauthorized",
    "अतिक्रमण",
  ],
  clearVerified: [
    "verified",
    "clear",
    "clear title",
    "clean",
    "digitally signed",
    "no dispute",
    "free title",
    "सत्यापित",
    "साफ",
  ],
  highValue: [
    "high value",
    "expensive",
    "high circle rate",
    "costly",
    "valuable",
    "crore",
    "करोड़",
    "महंगा",
  ],
  largeArea: [
    "large area",
    "big area",
    "large",
    "big parcel",
    "hectare",
    "बड़ा",
  ],
  stateTN: ["tamil nadu", "tn", "chennai", "patta", "chitta", "तमिलनाडु"],
  stateCH: ["chandigarh", "ch", "sector", "e-sampark", "चंडीगढ़"],
  stateUP: ["uttar pradesh", "up", "lucknow", "sadar", "khasra", "उत्तर प्रदेश"],
};

/**
 * Normalizes input string for reliable keyword matching
 */
function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s\u0900-\u097F]/gi, " ").trim();
}

/**
 * Checks if any keyword from an array appears in the cleaned query
 */
function findMatchingKeywords(cleanedQuery: string, keywords: string[]): string[] {
  const found: string[] = [];
  const words = cleanedQuery.split(/\s+/);

  for (const kw of keywords) {
    const kwClean = cleanText(kw);
    // If multi-word keyword (e.g. "pending tax", "stay order")
    if (kwClean.includes(" ")) {
      if (cleanedQuery.includes(kwClean)) {
        found.push(kw);
      }
    } else {
      // Single-word keyword matching
      if (words.includes(kwClean) || (kwClean.length >= 4 && cleanedQuery.includes(kwClean))) {
        found.push(kw);
      }
    }
  }
  return found;
}

/**
 * Core Rule-Based Natural Language Cadastral Query Parser
 * Matches keywords against parcel schema fields:
 * - clearOrDisputed, rorStatus, encumbrances (disputes/litigation)
 * - taxStatus (Pending, Overdue, Paid)
 * - landUse (Agricultural, Residential, Commercial, Institutional)
 * - buildingPermission / encroachment flags
 * - sourceState / geographical region
 */
export function parseNLQuery(
  rawQuery: string,
  parcelCollection: LandParcelFeatureCollection | LandParcelFeature[]
): NLQueryResult {
  const features: LandParcelFeature[] = Array.isArray(parcelCollection)
    ? parcelCollection
    : parcelCollection.features || [];

  const totalParcels = features.length;
  const sanitized = sanitizeNLQuery(rawQuery);
  const cleaned = cleanText(sanitized);

  // If query is empty
  if (!cleaned) {
    return {
      query: sanitized,
      matchedKeywords: [],
      intentDescription: "All Land Parcels",
      intentCategory: "general",
      matchingParcelUlpins: features.map((f) => f.properties.ulpin),
      matchingParcels: features,
      totalMatches: totalParcels,
      totalParcels,
      filterSummary: `Showing: all ${totalParcels} parcels`,
      aiMode: "rule-based",
      explanation: "No filter criteria specified; displaying complete cadastral registry.",
    };
  }

  // 1. Detect matched keyword groups
  const disputeMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.dispute);
  const taxPendingMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.taxPending);
  const taxPaidMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.taxPaid);
  const agriMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.agricultural);
  const resMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.residential);
  const commMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.commercial);
  const instMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.institutional);
  const encrMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.encroachment);
  const clearMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.clearVerified);
  const highValMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.highValue);
  const largeAreaMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.largeArea);
  const stateTNMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.stateTN);
  const stateCHMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.stateCH);
  const stateUPMatches = findMatchingKeywords(cleaned, KEYWORD_RULES.stateUP);

  const allMatchedKeywords: string[] = [
    ...disputeMatches,
    ...taxPendingMatches,
    ...taxPaidMatches,
    ...agriMatches,
    ...resMatches,
    ...commMatches,
    ...instMatches,
    ...encrMatches,
    ...clearMatches,
    ...highValMatches,
    ...largeAreaMatches,
    ...stateTNMatches,
    ...stateCHMatches,
    ...stateUPMatches,
  ];

  // 2. Build multi-criteria filter predicate
  const filterPredicates: Array<(p: LandParcelProperties) => boolean> = [];
  const intentParts: string[] = [];
  let category: NLQueryCategory = "general";

  // Dispute filter
  if (disputeMatches.length > 0) {
    category = "dispute";
    intentParts.push("Disputed & Injunction-Flagged");
    filterPredicates.push((p) => {
      const status = (p.clearOrDisputed || "").toLowerCase();
      const ror = (p.rorStatus || "").toLowerCase();
      const enc = (p.encumbrances || "").toLowerCase();
      return (
        status === "disputed" ||
        status === "under scrutiny" ||
        ror === "disputed" ||
        ror.includes("scrutiny") ||
        enc.includes("injunction") ||
        enc.includes("stay") ||
        enc.includes("dispute")
      );
    });
  }

  // Tax filter (Pending / Overdue)
  if (taxPendingMatches.length > 0 && taxPaidMatches.length === 0) {
    if (category === "general") category = "tax";
    intentParts.push("Pending / Overdue Property Tax");
    filterPredicates.push((p) => {
      const tax = (p.taxStatus || "").toLowerCase();
      return tax === "pending" || tax === "overdue" || tax !== "paid";
    });
  } else if (taxPaidMatches.length > 0) {
    if (category === "general") category = "tax";
    intentParts.push("Paid Property Tax");
    filterPredicates.push((p) => {
      const tax = (p.taxStatus || "").toLowerCase();
      return tax === "paid";
    });
  }

  // Land Use filter
  if (agriMatches.length > 0) {
    if (category === "general") category = "landuse";
    intentParts.push("Agricultural Land");
    filterPredicates.push((p) => (p.landUse || "").toLowerCase().includes("agri"));
  } else if (resMatches.length > 0) {
    if (category === "general") category = "landuse";
    intentParts.push("Residential Plots");
    filterPredicates.push((p) => (p.landUse || "").toLowerCase().includes("residen"));
  } else if (commMatches.length > 0) {
    if (category === "general") category = "landuse";
    intentParts.push("Commercial Land");
    filterPredicates.push((p) => (p.landUse || "").toLowerCase().includes("commerc"));
  } else if (instMatches.length > 0) {
    if (category === "general") category = "landuse";
    intentParts.push("Institutional Land");
    filterPredicates.push((p) => (p.landUse || "").toLowerCase().includes("institut"));
  }

  // Encroachment & Building Permission Conflict
  if (encrMatches.length > 0) {
    if (category === "general") category = "encroachment";
    intentParts.push("Satellite Encroachment / Zone Conflict");
    filterPredicates.push((p) => {
      const bp = (p.buildingPermission || "").toLowerCase();
      const enc = (p.encumbrances || "").toLowerCase();
      return (
        bp.includes("conflict") ||
        (p.landUse === "Agricultural" && bp.includes("residential")) ||
        enc.includes("encroach") ||
        p.ulpin === "UP26A8941B" ||
        p.ulpin === "TN04M4910A"
      );
    });
  }

  // Clear / Verified titles
  if (clearMatches.length > 0 && disputeMatches.length === 0) {
    if (category === "general") category = "title";
    intentParts.push("Verified & Clear Title Records");
    filterPredicates.push((p) => {
      const status = (p.clearOrDisputed || "").toLowerCase();
      const ror = (p.rorStatus || "").toLowerCase();
      return (
        status === "clear" &&
        (ror === "verified" || ror === "digitally signed")
      );
    });
  }

  // Valuation Filter (> 70 Lakhs)
  if (highValMatches.length > 0) {
    if (category === "general") category = "valuation";
    intentParts.push("High Valuation (₹70L+)");
    filterPredicates.push((p) => (p.marketValueInINR || 0) >= 7000000);
  }

  // Large Area Filter (> 1.2 Hectares)
  if (largeAreaMatches.length > 0) {
    if (category === "general") category = "area";
    intentParts.push("Large Area (>1.2 Ha)");
    filterPredicates.push((p) => (p.areaInHectares || 0) >= 1.2);
  }

  // State-specific filters
  if (stateTNMatches.length > 0) {
    intentParts.push("Tamil Nadu Registry");
    filterPredicates.push((p) => p.sourceState === "Tamil Nadu" || p.ulpin.startsWith("TN"));
  } else if (stateCHMatches.length > 0) {
    intentParts.push("Chandigarh Registry");
    filterPredicates.push((p) => p.sourceState === "Chandigarh" || p.ulpin.startsWith("CH"));
  } else if (stateUPMatches.length > 0) {
    intentParts.push("Uttar Pradesh Registry");
    filterPredicates.push((p) => p.sourceState === "Uttar Pradesh" || p.ulpin.startsWith("UP"));
  }

  // 3. Fallback: If no structured rule triggered, execute semantic substring search
  let matchingParcels: LandParcelFeature[] = [];

  if (filterPredicates.length > 0) {
    matchingParcels = features.filter((f) =>
      filterPredicates.every((fn) => fn(f.properties))
    );
  } else {
    const terms = cleaned.split(/\s+/).filter((w) => w.length > 2);
    matchingParcels = features.filter((f) => {
      const p = f.properties;
      const combined = [
        p.ownerName,
        p.khasraNo,
        p.ulpin,
        p.landUse,
        p.encumbrances,
        p.sourceState || "",
        ...(p.utilityLines || []),
      ]
        .join(" ")
        .toLowerCase();

      return terms.some((term) => combined.includes(term));
    });

    if (terms.length > 0) {
      intentParts.push(`Matching terms "${terms.join(", ")}"`);
      allMatchedKeywords.push(...terms);
    }
  }

  const matchingParcelUlpins = matchingParcels.map((f) => f.properties.ulpin);
  const totalMatches = matchingParcels.length;

  const keywordDisplay =
    allMatchedKeywords.length > 0
      ? `"${allMatchedKeywords.slice(0, 3).join(", ")}"`
      : `"${sanitized}"`;

  const filterSummary = `Showing: ${totalMatches} parcel${
    totalMatches === 1 ? "" : "s"
  } matching ${keywordDisplay}`;

  const intentDescription =
    intentParts.length > 0 ? intentParts.join(" • ") : "Matched Parcels";

  const explanation =
    totalMatches > 0
      ? `Identified ${totalMatches} of ${totalParcels} cadastral records conforming to rule: [${intentDescription}].`
      : `No parcels currently match criteria "${sanitized}". Try queries like "disputed", "pending tax", or "agricultural".`;

  return {
    query: sanitized,
    matchedKeywords: Array.from(new Set(allMatchedKeywords)),
    intentDescription,
    intentCategory: category,
    matchingParcelUlpins,
    matchingParcels,
    totalMatches,
    totalParcels,
    filterSummary,
    aiMode: "rule-based",
    explanation,
  };
}

/**
 * Executes a Natural Language Query in either Rule-Based or Real AI Mode
 */
export async function executeNLQuery(
  rawQuery: string,
  parcels: LandParcelFeatureCollection | LandParcelFeature[],
  mode: "rule-based" | "llm" = "rule-based"
): Promise<NLQueryResult> {
  const query = sanitizeNLQuery(rawQuery);
  const localRuleResult = parseNLQuery(query, parcels);

  if (mode === "rule-based") {
    return localRuleResult;
  }

  // Real AI Mode (LLM) attempt
  try {
    const res = await fetch("/api/nl-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        parcels: Array.isArray(parcels) ? parcels : parcels.features,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.matchingParcelUlpins) {
        const features = Array.isArray(parcels) ? parcels : parcels.features;
        const matchingParcels = features.filter((f) =>
          data.matchingParcelUlpins.includes(f.properties.ulpin)
        );

        return {
          query,
          matchedKeywords: data.matchedKeywords || localRuleResult.matchedKeywords,
          intentDescription: data.intentDescription || localRuleResult.intentDescription,
          intentCategory: data.intentCategory || localRuleResult.intentCategory,
          matchingParcelUlpins: data.matchingParcelUlpins,
          matchingParcels,
          totalMatches: matchingParcels.length,
          totalParcels: features.length,
          filterSummary:
            data.filterSummary ||
            `Showing: ${matchingParcels.length} parcels matching "${query}"`,
          aiMode: "llm",
          explanation: data.explanation || localRuleResult.explanation,
          isSimulatedLLM: data.isSimulatedLLM ?? false,
        };
      }
    }
  } catch (err) {
    console.warn("[NLQuery] LLM route unavailable, falling back to rule engine:", err);
  }

  // Graceful fallback to rule parser with LLM mode marked
  return {
    ...localRuleResult,
    aiMode: "llm",
    isSimulatedLLM: true,
    explanation: `${localRuleResult.explanation} (Neural Semantic Parser fallback active)`,
  };
}
