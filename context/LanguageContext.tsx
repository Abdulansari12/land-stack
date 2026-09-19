"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      const { useAppStore } = require("@/lib/store");
      const storeState = useAppStore.getState();
      if (storeState.language !== lang) {
        useAppStore.setState({ language: lang });
      }
    } catch {}
  };

  // Toggle language between English and Hindi
  const toggleLanguage = () => {
    handleSetLanguage(language === "en" ? "hi" : "en");
  };

  // Safe translation lookup helper
  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] ?? translations["en"]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
