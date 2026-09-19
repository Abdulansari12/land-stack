/**
 * Application Configuration
 * Centralized, typed access to environment variables (process.env.NEXT_PUBLIC_*)
 * with resilient fallbacks. Ready to point at a real backend without code modifications.
 */

export interface MapConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  stateCenters: {
    tamilNadu: [number, number];
    chandigarh: [number, number];
    uttarPradesh: [number, number];
  };
}

export interface FeaturesConfig {
  enableEncroachmentDetection: boolean;
  enableConsentProtocol: boolean;
}

export interface AppConfig {
  appName: string;
  appDescription: string;
  apiBaseUrl: string;
  map: MapConfig;
  features: FeaturesConfig;
}

export const APP_CONFIG: AppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Land Stack",
  appDescription:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Unified Cadastral Land Records & Spatial GIS Explorer for Rural and Urban Deployment",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  map: {
    defaultCenter: [
      parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT || "26.843"),
      parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG || "80.946"),
    ],
    defaultZoom: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || "15", 10),
    stateCenters: {
      tamilNadu: [
        parseFloat(process.env.NEXT_PUBLIC_MAP_TN_LAT || "13.004"),
        parseFloat(process.env.NEXT_PUBLIC_MAP_TN_LNG || "80.054"),
      ],
      chandigarh: [
        parseFloat(process.env.NEXT_PUBLIC_MAP_CH_LAT || "30.733"),
        parseFloat(process.env.NEXT_PUBLIC_MAP_CH_LNG || "76.782"),
      ],
      uttarPradesh: [
        parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT || "26.843"),
        parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG || "80.946"),
      ],
    },
  },
  features: {
    enableEncroachmentDetection: process.env.NEXT_PUBLIC_ENABLE_ENCROACHMENT !== "false",
    enableConsentProtocol: process.env.NEXT_PUBLIC_ENABLE_CONSENT !== "false",
  },
} as const;

// Convenient typed constants
export const APP_NAME = APP_CONFIG.appName;
export const APP_DESCRIPTION = APP_CONFIG.appDescription;
export const API_BASE_URL = APP_CONFIG.apiBaseUrl;
export const MAP_DEFAULT_CENTER = APP_CONFIG.map.defaultCenter;
export const MAP_DEFAULT_ZOOM = APP_CONFIG.map.defaultZoom;
export const MAP_STATE_CENTERS = APP_CONFIG.map.stateCenters;

export default APP_CONFIG;
