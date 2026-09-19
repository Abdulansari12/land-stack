import { LandParcelFeature, LandParcelFeatureCollection } from "@/data/parcels";

export interface VoiceParseResult {
  parcel: LandParcelFeature | null;
  queryText: string;
  matchedBy?: string;
  matchedValue?: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Parses spoken voice query transcripts (e.g., 'show me parcel 245', 'who owns khasra 88', 'Sunita Devi')
 * and matches them against land parcel datasets (ULPIN, Khasra Number, Owner Name).
 */
export function parseVoiceQuery(
  transcript: string,
  parcels: LandParcelFeatureCollection
): VoiceParseResult {
  if (!transcript || !transcript.trim() || !parcels?.features?.length) {
    return {
      parcel: null,
      queryText: transcript || "",
      confidence: "low",
    };
  }

  const clean = transcript.trim();
  const lower = clean.toLowerCase();

  // 1. Check ULPIN match (handling spaces spoken by speech engines e.g., "UP 26 A 8941 B" -> "up26a8941b")
  const compactLower = lower.replace(/[^a-z0-9]/g, "");
  for (const feature of parcels.features) {
    const ulpin = feature.properties.ulpin.toLowerCase();
    const compactUlpin = ulpin.replace(/[^a-z0-9]/g, "");
    if (compactLower.includes(compactUlpin) || (compactLower.length >= 6 && compactUlpin.includes(compactLower))) {
      return {
        parcel: feature,
        queryText: clean,
        matchedBy: "ULPIN",
        matchedValue: feature.properties.ulpin,
        confidence: "high",
      };
    }
  }

  // 2. Extract numeric tokens / Khasra patterns (e.g., '245', '88', '102/1', '245/2', '142/3A1', '89/2B')
  // Speech engines often transcribe '245/2' as '245 / 2' or '245 by 2'
  const normalizedForNumbers = lower
    .replace(/\bby\b/g, "/")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*-\s*/g, "-");

  // Match numbers like 245, 88, 245/2, 102/1-ka, 142/3A1, 89/2B, 44/B
  const numberTokens = normalizedForNumbers.match(/\b\d+(\/[a-z0-9]+)?(-[a-z0-9]+)?\b/gi) || [];
  const rawDigits = lower.match(/\b\d+\b/g) || [];
  const allNumericCandidates = Array.from(new Set([...numberTokens, ...rawDigits]));

  for (const token of allNumericCandidates) {
    const cleanToken = token.toLowerCase();
    
    // Check against all parcels
    for (const feature of parcels.features) {
      const khasra = feature.properties.khasraNo.toLowerCase();
      const khasraNumbers = khasra.match(/\d+(\/[a-z0-9]+)?(-[a-z0-9]+)?/g) || [];
      const baseNumber = khasra.match(/\b\d+\b/)?.[0];

      if (khasraNumbers.some(kn => kn === cleanToken) || (baseNumber && baseNumber === cleanToken)) {
        return {
          parcel: feature,
          queryText: clean,
          matchedBy: "Khasra Number",
          matchedValue: feature.properties.khasraNo,
          confidence: "high",
        };
      }

      if (khasra.includes(cleanToken)) {
        return {
          parcel: feature,
          queryText: clean,
          matchedBy: "Khasra Number",
          matchedValue: feature.properties.khasraNo,
          confidence: "high",
        };
      }
    }
  }

  // 3. Match Owner Names
  const stopWords = new Set([
    "show", "me", "the", "parcel", "parcels", "khasra", "plot", "land", "area", "survey",
    "who", "owns", "owner", "of", "find", "search", "for", "look", "up", "open", "patta",
    "details", "about", "is", "a", "an", "where", "what", "which", "tell", "please",
    // Hindi stopwords
    "दिखाओ", "मालिक", "कौन", "है", "का", "की", "के", "पार्सल", "खसरा", "जमीन", "प्लॉट", "खोजो", "बताओ",
    // Tamil stopwords
    "பார்சல்", "காட்டு", "யார்", "உரிமையாளர்"
  ]);

  const queryTokens = lower
    .split(/[^a-zA-Z0-9\u0900-\u097F\u0B80-\u0BFF]+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  if (queryTokens.length > 0) {
    let bestParcel: LandParcelFeature | null = null;
    let highestScore = 0;
    let bestMatchedValue = "";

    for (const feature of parcels.features) {
      const p = feature.properties;
      const ownerLower = p.ownerName.toLowerCase();
      const khasraLower = p.khasraNo.toLowerCase();

      const joinedTokens = queryTokens.join(" ");
      if (ownerLower.includes(joinedTokens)) {
        return {
          parcel: feature,
          queryText: clean,
          matchedBy: "Owner Name",
          matchedValue: p.ownerName,
          confidence: "high",
        };
      }

      let score = 0;
      for (const token of queryTokens) {
        if (token.length < 3) continue;
        if (ownerLower.includes(token)) {
          score += 5;
        }
        if (khasraLower.includes(token)) {
          score += 4;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestParcel = feature;
        bestMatchedValue = p.ownerName;
      }
    }

    if (bestParcel && highestScore >= 4) {
      return {
        parcel: bestParcel,
        queryText: clean,
        matchedBy: "Owner Name",
        matchedValue: bestMatchedValue,
        confidence: highestScore >= 5 ? "high" : "medium",
      };
    }
  }

  // 4. Fallback broad search across properties
  for (const feature of parcels.features) {
    const p = feature.properties;
    const combined = `${p.khasraNo} ${p.ownerName} ${p.ulpin} ${p.landUse}`.toLowerCase();
    for (const token of queryTokens) {
      if (token.length >= 3 && combined.includes(token)) {
        return {
          parcel: feature,
          queryText: clean,
          matchedBy: "Keyword Match",
          matchedValue: p.khasraNo,
          confidence: "medium",
        };
      }
    }
  }

  return {
    parcel: null,
    queryText: clean,
    confidence: "low",
  };
}
