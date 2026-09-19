import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Brand Design Tokens
        "brand-primary": {
          DEFAULT: "#4f46e5", // indigo-600
          hover: "#4338ca",   // indigo-700
          active: "#3730a3",  // indigo-800
          light: "#eef2ff",   // indigo-50
          muted: "#e0e7ff",   // indigo-100
          dark: "#312e81",    // indigo-900
          border: "#c7d2fe",  // indigo-200
        },
        "brand-secondary": {
          DEFAULT: "#9333ea", // purple-600
          light: "#faf5ff",   // purple-50
          border: "#e9d5ff",  // purple-200
        },

        // Semantic Cadastral Status Tokens (Interoperable RoR & Dispute States)
        "status-verified": {
          DEFAULT: "#10b981", // emerald-500
          hover: "#059669",   // emerald-600
          text: "#065f46",    // emerald-800
          "text-dark": "#a7f3d0", // emerald-200
          bg: "#d1fae5",      // emerald-100
          "bg-dark": "rgba(6, 78, 59, 0.8)", // emerald-950/80
          border: "#6ee7b7",  // emerald-300
          "border-dark": "#065f46", // emerald-800
        },
        "status-disputed": {
          DEFAULT: "#ef4444", // red-500
          hover: "#dc2626",   // red-600
          text: "#991b1b",    // red-800
          "text-dark": "#fecaca", // red-200
          bg: "#fee2e2",      // red-100
          "bg-dark": "rgba(127, 29, 29, 0.8)", // red-950/80
          border: "#fca5a5",  // red-300
          "border-dark": "#991b1b", // red-800
        },
        "status-pending": {
          DEFAULT: "#f59e0b", // amber-500
          hover: "#d97706",   // amber-600
          text: "#92400e",    // amber-800
          "text-dark": "#fde68a", // amber-200
          bg: "#fef3c7",      // amber-100
          "bg-dark": "rgba(120, 53, 15, 0.8)", // amber-950/80
          border: "#fcd34d",  // amber-300
          "border-dark": "#78350f", // amber-900
        },
        "status-info": {
          DEFAULT: "#3b82f6", // blue-500
          text: "#1e40af",    // blue-800
          bg: "#dbeafe",      // blue-100
          border: "#93c5fd",  // blue-300
        },
      },
    },
  },
  plugins: [],
};

export default config;
