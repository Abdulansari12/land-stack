"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Mic, MicOff, Volume2, X, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import {
  LandParcelFeature,
  LandParcelFeatureCollection,
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
} from "@/data/parcels";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import { parseVoiceQuery, VoiceParseResult } from "@/lib/voiceParser";
import { useLanguage } from "@/context/LanguageContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { LoadingState, ErrorState } from "@/components/ui";
import { sanitizeSearchQuery } from "@/lib/sanitize";

export interface VoiceSearchButtonProps {
  parcels?: LandParcelFeatureCollection;
  onSelectParcel: (parcel: LandParcelFeature) => void;
  onQueryChange?: (query: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export default function VoiceSearchButton({
  parcels,
  onSelectParcel,
  onQueryChange,
  className = "",
  size = "md",
}: VoiceSearchButtonProps) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [parseResult, setParseResult] = useState<VoiceParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap for listening modal dialog
  useFocusTrap({
    isOpen: showModal,
    containerRef: modalRef,
    onClose: () => handleCloseModal(),
  });

  // Check Web Speech API support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleProcessQuery = (spokenText: string) => {
    const cleanSpoken = sanitizeSearchQuery(spokenText);
    const activeCollection = parcels || dummyLandParcels;
    let result = parseVoiceQuery(cleanSpoken, activeCollection);

    // Fallback: If not found in current active state collection, search across all state registries
    if (!result.parcel) {
      const allCollections: LandParcelFeatureCollection = {
        type: "FeatureCollection",
        features: [
          ...dummyLandParcels.features,
          ...normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu").features,
          ...normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh").features,
        ],
      };
      const crossResult = parseVoiceQuery(spokenText, allCollections);
      if (crossResult.parcel) {
        result = crossResult;
      }
    }

    setParseResult(result);

    if (onQueryChange) {
      onQueryChange(spokenText);
    }

    if (result.parcel) {
      // Auto-navigate to matched parcel after visual confirmation
      timeoutRef.current = setTimeout(() => {
        onSelectParcel(result.parcel!);
        setShowModal(false);
        setIsListening(false);
        setParseResult(null);
        setTranscript("");
        setInterimText("");
      }, 1400);
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    setParseResult(null);
    setTranscript("");
    setInterimText("");

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setShowModal(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Indian English / Hindi locale depending on user language
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setShowModal(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTrans += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTrans) {
          setTranscript(finalTrans);
          setInterimText("");
          handleProcessQuery(finalTrans);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMessage(
            language === "hi"
              ? "माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन चालू करें।"
              : "Microphone access is blocked. Please allow microphone permissions in your browser."
          );
        } else if (event.error === "no-speech") {
          setErrorMessage(
            language === "hi"
              ? "कोई आवाज़ नहीं सुनी गई। कृपया पुनः बोलें।"
              : "No speech detected. Please try speaking again."
          );
        } else {
          setErrorMessage(
            language === "hi"
              ? `ध्वनि त्रुटि: ${event.error}`
              : `Speech recognition error: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start SpeechRecognition:", err);
      setIsListening(false);
      setShowModal(true);
      setErrorMessage(err.message || "Failed to initialize speech recognition.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleCloseModal = () => {
    stopListening();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowModal(false);
    setParseResult(null);
    setErrorMessage(null);
    setTranscript("");
    setInterimText("");
  };

  const handleSampleQueryClick = (sampleQuery: string) => {
    setTranscript(sampleQuery);
    setInterimText("");
    setErrorMessage(null);
    handleProcessQuery(sampleQuery);
  };

  const sampleQueries = useMemo(() => {
    const activeFeatures = parcels?.features?.length ? parcels.features : dummyLandParcels.features;
    const queries: { label: string; query: string }[] = [];

    if (activeFeatures.length > 0) {
      const f0 = activeFeatures[0]?.properties;
      if (f0) {
        const num = f0.khasraNo.replace(/^(khasra\s*(no\.?)?|plot\s*(no\.?)?|survey\s*(no\.?)?)\s*/i, "").trim();
        queries.push({
          label: `show me ${num}`,
          query: `show me parcel ${num}`,
        });
      }
      const f1 = activeFeatures[1]?.properties || activeFeatures[0]?.properties;
      if (f1) {
        const num = f1.khasraNo.replace(/^(khasra\s*(no\.?)?|plot\s*(no\.?)?|survey\s*(no\.?)?)\s*/i, "").trim();
        queries.push({
          label: `who owns ${num}`,
          query: `who owns ${num}`,
        });
      }
      const f2 = activeFeatures[2]?.properties || activeFeatures[0]?.properties;
      if (f2) {
        const ownerFirst = f2.ownerName.split(/[\s,&]+/)[0] || f2.ownerName;
        queries.push({
          label: `find ${ownerFirst}`,
          query: `find ${ownerFirst}`,
        });
      }
      const f3 = activeFeatures[3]?.properties;
      if (f3) {
        const num = f3.khasraNo.replace(/^(khasra\s*(no\.?)?|plot\s*(no\.?)?|survey\s*(no\.?)?)\s*/i, "").trim();
        queries.push({
          label: num,
          query: num,
        });
      }
      const f4 = activeFeatures[4]?.properties || activeFeatures[0]?.properties;
      if (f4) {
        queries.push({
          label: f4.ulpin,
          query: f4.ulpin,
        });
      }
    }

    if (queries.length < 3) {
      return [
        { label: "show me parcel 245", query: "show me parcel 245" },
        { label: "who owns khasra 88", query: "who owns khasra 88" },
        { label: "find Rameshwar", query: "find Rameshwar" },
        { label: "khasra 102", query: "who owns khasra 102" },
        { label: "parcel 512", query: "show me parcel 512" },
      ];
    }

    return queries.slice(0, 5);
  }, [parcels]);

  return (
    <>
      {/* Microphone Icon Button */}
      <button
        type="button"
        data-testid="voice-search-mic-btn"
        onClick={isListening ? stopListening : startListening}
        className={`relative rounded-xl font-medium transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
          size === "sm" ? "p-1.5" : "p-2 sm:px-2.5"
        } ${
          isListening
            ? "bg-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-400/40 animate-pulse scale-105"
            : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-zinc-700 shadow-xs"
        } ${className}`}
        title={isListening ? "Listening... Click to stop" : t("voiceSearchTooltip") || "Voice Search"}
        aria-label={
          isListening
            ? language === "hi"
              ? "आवाज पहचानना रोकें"
              : "Stop listening"
            : t("voiceSearch") || "Search land records by voice"
        }
      >
        {isListening ? (
          <>
            {/* Pulsing red mic animation */}
            <span className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-white opacity-75"></span>
              <Mic className="h-4 w-4 relative z-10 text-white animate-bounce" />
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-xs font-bold text-white tracking-wide animate-pulse">
              {language === "hi" ? "सुन रहे हैं..." : "Listening..."}
            </span>
          </>
        ) : (
          <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        )}
      </button>

      {/* Voice Search Modal / Listening Dialog */}
      {showModal && (
        <div
          data-testid="voice-search-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-search-modal-title"
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              data-testid="voice-modal-close-btn"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Close Voice Search"
              aria-label="Close voice search dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Pulsing Red Mic Animation or Status Indicator */}
            <div className="my-2 relative flex items-center justify-center">
              {isListening ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-red-400 opacity-30"></span>
                  <span className="animate-pulse absolute inline-flex h-16 w-16 rounded-full bg-red-500/20"></span>
                  <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-red-500/40 z-10 animate-bounce">
                    <Mic className="h-7 w-7 text-white" />
                  </div>
                </div>
              ) : parseResult?.parcel ? (
                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-950/70 text-green-600 dark:text-green-400 flex items-center justify-center shadow-lg animate-in zoom-in-75">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              ) : errorMessage || !isSupported ? (
                <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-8 w-8" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg">
                  <Volume2 className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Audio Wave Equalizer Animation while Listening */}
            {isListening && (
              <div className="flex flex-col items-center gap-2 my-2">
                <div className="flex items-center gap-1 h-5 justify-center">
                  <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3"></span>
                  <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-5"></span>
                  <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-4"></span>
                  <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.3s] h-6"></span>
                  <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.15s] h-3"></span>
                </div>
                <LoadingState
                  variant="inline"
                  size="sm"
                  label={language === "hi" ? "ध्वनि इनपुट सुना जा रहा है..." : "Processing live speech stream..."}
                  className="text-slate-600 dark:text-zinc-400 justify-center"
                />
              </div>
            )}

            {/* Title & Status Message */}
            <h3 id="voice-search-modal-title" className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-2">
              {isListening
                ? t("voiceSearchListening") || "Listening... Speak now"
                : parseResult?.parcel
                ? t("voiceSearchNavigating") || "Navigating to parcel..."
                : errorMessage
                ? "Voice Query Status"
                : !isSupported
                ? "Voice Search Unsupported"
                : "Voice Search"}
            </h3>

            {/* Spoken Text Display */}
            {(transcript || interimText) && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700 w-full text-sm">
                <span className="text-xs text-slate-400 dark:text-zinc-500 block mb-1 font-medium">
                  {language === "hi" ? "पहचाने गए शब्द:" : "Transcribed Query:"}
                </span>
                <p className="font-semibold text-slate-900 dark:text-white italic">
                  &ldquo;{transcript || interimText}&rdquo;
                </p>
              </div>
            )}

            {/* Match Success Card */}
            {parseResult?.parcel && (
              <div className="mt-3 p-3.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl w-full text-left animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-xs font-bold text-green-800 dark:text-green-300 mb-1">
                  <span>✓ {t("voiceSearchMatchedBy") || "Matched by"} {parseResult.matchedBy}</span>
                  <span className="font-mono text-[11px]">{parseResult.parcel.properties.ulpin}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Khasra #{parseResult.parcel.properties.khasraNo}
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                  Owner: {parseResult.parcel.properties.ownerName}
                </div>
              </div>
            )}

            {/* No Match Card */}
            {parseResult && !parseResult.parcel && !isListening && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl w-full text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>{t("voiceSearchNotFound") || "No matching parcel found"}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {language === "hi"
                    ? "कृपया खसरा नंबर (जैसे 245, 88) या पंजीकृत भूस्वामी का नाम स्पष्ट रूप से बोलें।"
                    : "Try speaking the Khasra number (e.g. '245' or '88') or the registered owner name."}
                </p>
              </div>
            )}

            {/* Error Message with Consistent ErrorState & Retry Option */}
            {errorMessage && (
              <div className="mt-3 w-full text-left">
                <ErrorState
                  variant="banner"
                  size="sm"
                  title={language === "hi" ? "ध्वनि पहचान त्रुटि" : "Voice Recognition Error"}
                  message={errorMessage}
                  onRetry={startListening}
                  retryLabel={language === "hi" ? "पुनः बोलें" : "Try Speaking Again"}
                  onDismiss={() => setErrorMessage(null)}
                />
              </div>
            )}

            {/* Unsupported Fallback Notice */}
            {!isSupported && (
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                {t("voiceSearchUnsupported") ||
                  "Web Speech API is not supported in this browser. Try Chrome, Edge, or Safari."}
              </p>
            )}

            {/* Sample Queries for Rural Accessibility / Instant Demo */}
            <div className="mt-5 w-full text-left pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  {t("voiceSearchSampleQueries") || "Quick Sample Spoken Queries:"}
                </span>
                {isListening && (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Stop
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sampleQueries.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleQueryClick(item.query)}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-zinc-300 rounded-lg border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>&ldquo;{item.label}&rdquo;</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-center gap-3 w-full">
              {!isListening && (
                <button
                  type="button"
                  data-testid="voice-retry-btn"
                  onClick={startListening}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>{t("voiceSearchTryAgain") || "Speak Again"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                {t("voiceSearchCancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
