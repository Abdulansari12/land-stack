"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeParcel = normalizeParcel;
exports.normalizeParcelFeature = normalizeParcelFeature;
exports.normalizeParcelFeatureCollection = normalizeParcelFeatureCollection;
/**
 * Cross-State Schema Adapter
 * Normalizes heterogeneous state-specific land registry schemas into a single
 * canonical national ULPIN schema.
 *
 * Canonical schema:
 * {
 *   ulpin: string;
 *   khasraNo: string;
 *   ownerName: string;
 *   landUse: string;
 *   rorStatus: string;
 *   taxStatus: string;
 * }
 */
function normalizeParcel(rawParcel, sourceState) {
    try {
        if (!rawParcel || typeof rawParcel !== "object") {
            throw new Error("Cannot normalize empty or non-object parcel data");
        }
        // Preserve the original raw un-normalized source object for inspection
        const rawSourceData = { ...rawParcel };
        // 1. TAMIL NADU (e-Services Patta/Chitta Schema)
        if (sourceState === "Tamil Nadu" || rawParcel.patta_no) {
            const raw = rawParcel;
            const disputeStatusStr = typeof raw.dispute_status === "string" ? raw.dispute_status : "";
            const ecStatusStr = typeof raw.ec_status === "string" ? raw.ec_status : "";
            const isDisputed = disputeStatusStr.toLowerCase().includes("disputed") ||
                ecStatusStr.toLowerCase().includes("stay order");
            const classStr = typeof raw.classification === "string" ? raw.classification.toLowerCase() : "";
            let canonicalLandUse = "Mixed Use";
            if (classStr.includes("wet") || classStr.includes("nanjai")) {
                canonicalLandUse = "Agricultural";
            }
            else if (classStr.includes("residential") || classStr.includes("natham")) {
                canonicalLandUse = "Residential";
            }
            else if (classStr.includes("institutional")) {
                canonicalLandUse = "Institutional";
            }
            else if (classStr.includes("commercial") || classStr.includes("punjai")) {
                canonicalLandUse = "Commercial";
            }
            const taxPaidStr = typeof raw.tax_paid_status === "string" ? raw.tax_paid_status.toLowerCase() : "";
            return {
                ulpin: raw.patta_no || "TN-ULPIN-UNKNOWN",
                khasraNo: raw.survey_subdivision || "Survey N/A",
                ownerName: raw.pattadar_name || "Unknown Pattadar",
                landUse: canonicalLandUse,
                rorStatus: isDisputed ? "Disputed" : "Verified",
                clearOrDisputed: isDisputed ? "Disputed" : "Clear",
                encumbrances: raw.ec_status || "Nil (Encumbrance Certificate Clean)",
                taxStatus: taxPaidStr.includes("overdue") ? "Overdue" : taxPaidStr.includes("paid") ? "Paid" : "Pending",
                utilityLines: Array.isArray(raw.utility_feeders)
                    ? raw.utility_feeders
                    : ["TANGEDCO Agricultural Grid", "Irrigation Pipeline"],
                areaInHectares: Number(raw.extent_hectares) || 1.0,
                marketValueInINR: Number(raw.guideline_val_inr) || 5000000,
                sourceState: "Tamil Nadu",
                rawSourceData,
                buildingPermission: raw.buildingPermission || raw.building_permission,
                chainOfTitle: Array.isArray(raw.chainOfTitle) ? raw.chainOfTitle : [],
                ownerConsentRequired: Boolean(raw.ownerConsentRequired || raw.owner_consent_required),
            };
        }
        // 2. CHANDIGARH (UT Estate Office / e-Sampark Schema)
        if (sourceState === "Chandigarh" || rawParcel.propertyId) {
            const raw = rawParcel;
            const isDisputed = Boolean(raw.disputeFlag);
            const useTypeStr = typeof raw.useType === "string" ? raw.useType.toLowerCase() : "";
            let canonicalLandUse = "Commercial";
            if (useTypeStr.includes("residential")) {
                canonicalLandUse = "Residential";
            }
            else if (useTypeStr.includes("institutional")) {
                canonicalLandUse = "Institutional";
            }
            else if (useTypeStr.includes("commercial") || useTypeStr.includes("sco")) {
                canonicalLandUse = "Commercial";
            }
            const taxDuesStr = typeof raw.propertyTaxDues === "string" ? raw.propertyTaxDues.toLowerCase() : "";
            return {
                ulpin: raw.propertyId || "CH-ULPIN-UNKNOWN",
                khasraNo: raw.sectorPlotNo || "Sector Plot N/A",
                ownerName: raw.ownerFullName || "Unknown Property Holder",
                landUse: canonicalLandUse,
                rorStatus: isDisputed ? "Disputed" : "Digitally Signed",
                clearOrDisputed: isDisputed ? "Disputed" : "Clear",
                encumbrances: raw.encumbranceSummary || "Nil (Estate Office NOC Clear)",
                taxStatus: taxDuesStr.includes("overdue") ? "Overdue" : taxDuesStr.includes("paid") ? "Paid" : "Pending",
                utilityLines: Array.isArray(raw.utilityInfrastructure)
                    ? raw.utilityInfrastructure
                    : ["Chandigarh MC Potable Water Network", "Underground Utility Duct"],
                areaInHectares: Number(raw.plotAreaHa) || 0.5,
                marketValueInINR: Number(raw.collectorRateValuation) || 12000000,
                sourceState: "Chandigarh",
                rawSourceData,
                chainOfTitle: Array.isArray(raw.chainOfTitle) ? raw.chainOfTitle : [],
                ownerConsentRequired: Boolean(raw.ownerConsentRequired || raw.owner_consent_required),
            };
        }
        // 3. UTTAR PRADESH / CANONICAL FALLBACK
        return {
            ulpin: rawParcel.ulpin || "UP-ULPIN-UNKNOWN",
            khasraNo: rawParcel.khasraNo || "Khasra N/A",
            ownerName: rawParcel.ownerName || "Unknown Owner",
            landUse: rawParcel.landUse || "Agricultural",
            rorStatus: rawParcel.rorStatus || "Verified",
            clearOrDisputed: rawParcel.clearOrDisputed || "Clear",
            encumbrances: rawParcel.encumbrances || "Nil",
            taxStatus: rawParcel.taxStatus || "Paid",
            utilityLines: Array.isArray(rawParcel.utilityLines) ? rawParcel.utilityLines : [],
            areaInHectares: Number(rawParcel.areaInHectares) || 1.0,
            marketValueInINR: Number(rawParcel.marketValueInINR) || 6000000,
            sourceState: rawParcel.sourceState || "Uttar Pradesh",
            rawSourceData,
            buildingPermission: rawParcel.buildingPermission || rawParcel.building_permission,
            chainOfTitle: Array.isArray(rawParcel.chainOfTitle) ? rawParcel.chainOfTitle : [],
            ownerConsentRequired: Boolean(rawParcel.ownerConsentRequired || rawParcel.owner_consent_required),
        };
    }
    catch (error) {
        console.warn(`[SchemaAdapter] Warning: Malformed parcel data encountered for state "${sourceState}":`, error, rawParcel);
        return {
            ulpin: rawParcel?.ulpin || rawParcel?.patta_no || rawParcel?.propertyId || "MALFORMED-PARCEL",
            khasraNo: rawParcel?.khasraNo || rawParcel?.survey_subdivision || rawParcel?.sectorPlotNo || "Plot N/A",
            ownerName: rawParcel?.ownerName || rawParcel?.pattadar_name || rawParcel?.ownerFullName || "Record Unavailable",
            landUse: "Mixed Use",
            rorStatus: "Disputed",
            clearOrDisputed: "Disputed",
            encumbrances: "Malformed record - verification required",
            taxStatus: "Pending",
            utilityLines: [],
            areaInHectares: 0,
            marketValueInINR: 0,
            sourceState: sourceState || "Unknown",
            rawSourceData: rawParcel || {},
            chainOfTitle: [],
            ownerConsentRequired: false,
        };
    }
}
/**
 * Normalizes an entire GeoJSON Feature from raw state schema to canonical schema
 */
function normalizeParcelFeature(rawFeature, sourceState) {
    try {
        if (!rawFeature || typeof rawFeature !== "object") {
            throw new Error("Cannot normalize empty or non-object feature");
        }
        return {
            type: "Feature",
            id: rawFeature.id || `PARCEL-${Math.random().toString(36).substr(2, 9)}`,
            geometry: rawFeature.geometry || { type: "Polygon", coordinates: [] },
            properties: normalizeParcel(rawFeature.properties, sourceState),
        };
    }
    catch (error) {
        console.warn(`[SchemaAdapter] Warning: Malformed parcel feature encountered for state "${sourceState}":`, error, rawFeature);
        return {
            type: "Feature",
            id: rawFeature?.id || `PARCEL-MALFORMED-${Math.random().toString(36).substr(2, 9)}`,
            geometry: rawFeature?.geometry || { type: "Polygon", coordinates: [] },
            properties: normalizeParcel(rawFeature?.properties, sourceState),
        };
    }
}
/**
 * Normalizes an entire GeoJSON FeatureCollection from raw state schema to canonical schema
 */
function normalizeParcelFeatureCollection(rawCollection, sourceState) {
    try {
        if (!rawCollection || !Array.isArray(rawCollection.features)) {
            console.warn(`[SchemaAdapter] Warning: Invalid or malformed FeatureCollection for state "${sourceState}". Returning empty collection.`, rawCollection);
            return { type: "FeatureCollection", features: [] };
        }
        return {
            type: "FeatureCollection",
            features: rawCollection.features
                .map((feature) => normalizeParcelFeature(feature, sourceState))
                .filter(Boolean),
        };
    }
    catch (error) {
        console.warn(`[SchemaAdapter] Warning: Failed to normalize feature collection for state "${sourceState}":`, error);
        return { type: "FeatureCollection", features: [] };
    }
}
