"use client";

import React, { useRef } from "react";
import {
  Keyboard,
  X,
  Command,
  Search,
  Layers,
  Box,
  Flame,
  Moon,
  User,
  RotateCcw,
  Sparkles,
  Network,
  Database,
  Tv,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  descriptionHi: string;
  icon: React.ElementType;
  badge?: string;
}

interface ShortcutCategory {
  title: string;
  titleHi: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Core Navigation & Search",
    titleHi: "मुख्य नेविगेशन व खोज",
    items: [
      {
        keys: ["⌘", "K"],
        description: "Open Global Command Palette",
        descriptionHi: "ग्लोबल कमांड पैलेट खोलें",
        icon: Command,
        badge: "Universal",
      },
      {
        keys: ["/"],
        description: "Focus Cadastral Search input",
        descriptionHi: "भू-अभिलेख खोज बार पर फ़ोकस करें",
        icon: Search,
      },
      {
        keys: ["?"],
        description: "Open this Keyboard Shortcuts help dialog",
        descriptionHi: "यह कीबोर्ड शॉर्टकट संवाद खोलें",
        icon: Keyboard,
      },
      {
        keys: ["Esc"],
        description: "Close active drawer, modal, or search popup",
        descriptionHi: "सक्रिय ड्रॉअर, मोडल या पॉपअप बंद करें",
        icon: X,
      },
    ],
  },
  {
    title: "Map & Spatial Controls",
    titleHi: "मानचित्र व स्थानिक नियंत्रण",
    items: [
      {
        keys: ["Alt", "V"],
        description: "Toggle 2D Flat / 3D Extruded WebGL View",
        descriptionHi: "2D समतल / 3D उभार वेबजीएल दृश्य बदलें",
        icon: Box,
        badge: "Deck.gl",
      },
      {
        keys: ["Alt", "H"],
        description: "Toggle Spatial Risk & Dispute Heatmap",
        descriptionHi: "स्थानिक जोखिम व विवाद हीटमैप चालू/बंद करें",
        icon: Flame,
      },
      {
        keys: ["Alt", "T"],
        description: "Toggle Dark / Light Theme (CartoDB Tiles + UI)",
        descriptionHi: "डार्क / लाइट मोड बदलें (नक्शा टाइल्स सहित)",
        icon: Moon,
      },
      {
        keys: ["Alt", "R"],
        description: "Switch Persona (Citizen RoR vs Officer)",
        descriptionHi: "नागरिक व अधिकारी भूमिका बदलें",
        icon: User,
      },
    ],
  },
  {
    title: "State Cadastral Registry",
    titleHi: "राज्य भू-राजस्व रजिस्ट्री",
    items: [
      {
        keys: ["Alt", "1"],
        description: "Switch to Tamil Nadu e-Services (Patta / Chitta)",
        descriptionHi: "तमिलनाडु ई-सेवाएं (पट्टा / चिट्टा) पर जाएं",
        icon: Database,
      },
      {
        keys: ["Alt", "2"],
        description: "Switch to Chandigarh Kadambari UT Registry",
        descriptionHi: "चंडीगढ़ कादंबरी यूटी रजिस्ट्री पर जाएं",
        icon: Database,
      },
      {
        keys: ["Alt", "3"],
        description: "Switch to National Unified View (Multi-State)",
        descriptionHi: "राष्ट्रीय एकीकृत दृश्य (बहु-राज्य) पर जाएं",
        icon: Layers,
      },
    ],
  },
  {
    title: "Presentation & Demonstration",
    titleHi: "प्रस्तुति व डेमो क्रियाएं",
    items: [
      {
        keys: ["Alt", "D"],
        description: "Reset Demo State to clean factory baseline (0s reload)",
        descriptionHi: "डेमो बेसलाइन तुरंत रीसेट करें (0 सेकंड में)",
        icon: RotateCcw,
        badge: "0s Reload",
      },
      {
        keys: ["Alt", "E"],
        description: "Open 6-Department Institutional Ecosystem view",
        descriptionHi: "6-विभागीय संस्थागत इकोसिस्टम दृश्य खोलें",
        icon: Network,
      },
      {
        keys: ["Alt", "G"],
        description: "Launch 60-Second Guided Tour for hackathon judges",
        descriptionHi: "60-सेकंड निर्देशित डेमो टूर शुरू करें",
        icon: Sparkles,
        badge: "Pitch Mode",
      },
      {
        keys: ["Alt", "P"],
        description: "Toggle Presentation Mode (Projector & Big Screen)",
        descriptionHi: "प्रस्तुति मोड बदलें (प्रोजेक्टर अनुकूलित)",
        icon: Tv,
        badge: "Kiosk",
      },
    ],
  },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const { language, t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
      data-testid="keyboard-shortcuts-modal"
    >
      {/* Click outside backdrop to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-150 focus:outline-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-purple-50/50 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="shortcuts-dialog-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100"
                >
                  {language === "hi" ? "कीबोर्ड शॉर्टकट संदर्भ" : "Keyboard Shortcuts"}
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Power User
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {language === "hi"
                  ? "भूमि रिकॉर्ड प्रबंधन व त्वरित प्रस्तुति हेतु सभी शॉर्टकट"
                  : "Quick navigation and execution shortcuts for Land Stack DPI"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block font-mono text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
              ESC
            </kbd>
            <button
              type="button"
              data-testid="close-shortcuts-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close keyboard shortcuts dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scroll-smooth">
          {SHORTCUT_CATEGORIES.map((category) => (
            <div key={category.title} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span>{language === "hi" ? category.titleHi : category.title}</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  {category.items.length} {language === "hi" ? "शॉर्टकट" : "keys"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.description}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 hover:bg-indigo-50/40 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 mr-2">
                        <div className="h-6 w-6 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 border border-slate-200 dark:border-zinc-700/80 shrink-0 shadow-2xs">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {language === "hi" ? item.descriptionHi : item.description}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Styled Key Combination Badges */}
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, index) => (
                          <React.Fragment key={k}>
                            <kbd className="min-w-[22px] px-1.5 py-1 rounded-md text-[11px] font-mono font-bold text-center bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 shadow-xs select-none">
                              {k}
                            </kbd>
                            {index < item.keys.length - 1 && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold select-none">
                                +
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hint Bar */}
        <div className="p-3 sm:px-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {language === "hi"
                ? "संवाद बंद करने हेतु Esc दबाएं। इनपुट फ़ील्ड में टाइप करते समय शॉर्टकट अक्षम रहते हैं।"
                : "Press Esc anytime to dismiss dialogs. Shortcuts auto-disable inside input fields."}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Press</span>
            <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold">
              ?
            </kbd>
            <span>anywhere</span>
          </div>
        </div>
      </div>
    </div>
  );
}
