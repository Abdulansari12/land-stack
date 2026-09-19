"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, MapPin, User, ChevronRight, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import {
  dummyLandParcels,
  rawParcelsTamilNadu,
  rawParcelsChandigarh,
  LandParcelFeature,
  LandParcelFeatureCollection,
} from "@/data/parcels";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeParcelFeatureCollection } from "@/lib/schemaAdapter";
import dynamic from "next/dynamic";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import type { UserRole } from "@/lib/store";

const VoiceSearchButton = dynamic(() => import("@/components/VoiceSearchButton"), {
  ssr: false,
});

interface ParcelSearchBarProps {
  onSelectParcel: (parcelFeature: LandParcelFeature) => void;
  role?: UserRole;
  parcels?: LandParcelFeatureCollection;
  onOpenCommandPalette?: () => void;
}

export default function ParcelSearchBar({
  onSelectParcel,
  role = "citizen",
  parcels,
  onOpenCommandPalette,
}: ParcelSearchBarProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown and mobile bar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener (⌘K / Ctrl+K, /, and Escape)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileExpanded(true);
          setIsOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 60);
        } else {
          inputRef.current?.focus();
          setIsOpen(true);
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (onOpenCommandPalette) {
          onOpenCommandPalette();
          return;
        }
        if (window.innerWidth < 768) {
          setIsMobileExpanded(true);
          setIsOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 60);
        } else {
          inputRef.current?.focus();
          setIsOpen(true);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenCommandPalette]);

  // Filter parcels by ULPIN, khasraNo, or ownerName (case-insensitive, partial match)
  // Input sanitization neutralizes HTML injection and malicious characters
  const currentCollection = parcels || dummyLandParcels;
  const sanitizedQuery = sanitizeSearchQuery(query);
  const trimmedQuery = sanitizedQuery.toLowerCase();

  const matchingParcels = useMemo(() => {
    if (!trimmedQuery) return [];

    // Search active collection first
    const primaryMatches = currentCollection.features.filter((f) => {
      const p = f.properties;
      return (
        p.ulpin.toLowerCase().includes(trimmedQuery) ||
        p.khasraNo.toLowerCase().includes(trimmedQuery) ||
        p.ownerName.toLowerCase().includes(trimmedQuery)
      );
    });

    if (primaryMatches.length > 0) return primaryMatches;

    // Fallback: Cross-registry search across all 3 state jurisdictions
    const tn = normalizeParcelFeatureCollection(rawParcelsTamilNadu, "Tamil Nadu");
    const ch = normalizeParcelFeatureCollection(rawParcelsChandigarh, "Chandigarh");
    const up = normalizeParcelFeatureCollection(dummyLandParcels, "Uttar Pradesh");
    const all = [...tn.features, ...ch.features, ...up.features];

    return all.filter((f) => {
      const p = f.properties;
      return (
        p.ulpin.toLowerCase().includes(trimmedQuery) ||
        p.khasraNo.toLowerCase().includes(trimmedQuery) ||
        p.ownerName.toLowerCase().includes(trimmedQuery)
      );
    });
  }, [currentCollection, trimmedQuery]);

  const handleSelect = (parcel: LandParcelFeature) => {
    setQuery(`Khasra #${parcel.properties.khasraNo} - ${parcel.properties.ownerName}`);
    setIsOpen(false);
    setIsMobileExpanded(false);
    onSelectParcel(parcel);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    if (isMobileExpanded) {
      mobileInputRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  };

  // Reusable search dropdown list
  const renderDropdownList = () => (
    <div className="max-h-[380px] overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl p-1.5 space-y-1 animate-in fade-in-50 duration-150">
      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
        <span>Matching Land Parcels</span>
        <span>{matchingParcels.length} Found</span>
      </div>

      {matchingParcels.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
          No parcels matching &quot;<strong className="text-slate-800 dark:text-zinc-200">{query}</strong>&quot;
        </div>
      ) : (
        matchingParcels.map((parcel) => {
          const p = parcel.properties;
          const isClear =
            p.clearOrDisputed?.toLowerCase() === "clear" ||
            p.rorStatus?.toLowerCase() === "verified" ||
            p.rorStatus?.toLowerCase() === "digitally signed";
          const isDisputed =
            p.clearOrDisputed?.toLowerCase() === "disputed" ||
            p.rorStatus?.toLowerCase() === "disputed";

          return (
            <button
              key={parcel.id}
              type="button"
              onClick={() => handleSelect(parcel)}
              className="w-full text-left p-2.5 rounded-lg hover:bg-indigo-50/70 dark:hover:bg-zinc-800/80 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Khasra #{p.khasraNo}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isClear
                          ? "bg-status-verified-bg text-status-verified-text dark:bg-emerald-950 dark:text-status-verified-light"
                          : isDisputed
                          ? "bg-status-disputed-bg text-status-disputed-text dark:bg-red-950 dark:text-status-disputed-light"
                          : "bg-status-pending-bg text-status-pending-text dark:bg-amber-950 dark:text-status-pending-light"
                      }`}
                    >
                      {isClear ? (
                        <CheckCircle2 className="h-2.5 w-2.5 text-status-verified" />
                      ) : isDisputed ? (
                        <AlertTriangle className="h-2.5 w-2.5 text-status-disputed" />
                      ) : (
                        <Scale className="h-2.5 w-2.5 text-status-pending" />
                      )}
                      <span>{p.clearOrDisputed}</span>
                    </span>

                    {p.sourceState && (
                      <span className="text-[10px] font-medium text-brand-primary dark:text-brand-primary-light bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                        {p.sourceState}
                      </span>
                    )}

                    <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {p.landUse}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300 mt-0.5 truncate">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{p.ownerName}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                    ULPIN: {p.ulpin}
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 dark:text-zinc-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Mobile Collapsed Search Trigger & Voice Search Icon (Visible on screens < 768px / md:hidden) */}
      <div className="flex items-center gap-1.5 md:hidden">
        <button
          type="button"
          data-testid="mobile-search-toggle-btn"
          onClick={() => {
            setIsMobileExpanded(true);
            setIsOpen(true);
            setTimeout(() => mobileInputRef.current?.focus(), 60);
          }}
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          title="Search Parcels"
          aria-label="Open Search Bar"
        >
          <Search className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </button>

        <VoiceSearchButton
          parcels={currentCollection}
          onSelectParcel={handleSelect}
          onQueryChange={(text) => {
            setQuery(text);
            setIsOpen(true);
          }}
          size="md"
        />
      </div>

      {/* Desktop Search Bar (Always visible on screens >= 768px / md:block) */}
      <div className="hidden md:flex items-center gap-2 relative w-full">
        <div className="relative flex items-center flex-1">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={
              role === "officer"
                ? t("searchPlaceholderOfficer")
                : t("searchPlaceholderCitizen")
            }
            aria-label={
              role === "officer"
                ? t("searchPlaceholderOfficer") || "Search by ULPIN, Khasra, or Owner"
                : t("searchPlaceholderCitizen") || "Search land records"
            }
            data-testid="parcel-search-input"
            className="w-full pl-10 pr-20 py-2 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/70 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-xs"
          />

          {/* Action icons right: Clear button and shortcut badge */}
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded transition cursor-pointer"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {!query && (
              <div className="hidden lg:flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.focus();
                    setIsOpen(true);
                  }}
                  className="flex items-center text-[10px] font-mono font-semibold text-slate-400 dark:text-zinc-400 bg-white dark:bg-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-600 transition-colors cursor-pointer"
                  title="Focus Search (/)"
                  aria-label="Focus search input"
                >
                  <span>/</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCommandPalette?.();
                  }}
                  className="flex items-center gap-0.5 text-[10px] font-mono font-semibold text-slate-400 dark:text-zinc-400 bg-white dark:bg-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-600 transition-colors cursor-pointer"
                  title="Open Command Palette (Cmd+K / Ctrl+K)"
                  aria-label="Open command palette"
                >
                  <span>⌘K</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Icon Button Next to Search Bar */}
        <VoiceSearchButton
          parcels={currentCollection}
          onSelectParcel={handleSelect}
          onQueryChange={(text) => {
            setQuery(text);
            setIsOpen(true);
          }}
          size="md"
        />

        {/* Desktop Dropdown Positioned Below Input */}
        {isOpen && trimmedQuery.length > 0 && (
          <div className="absolute top-full left-0 right-12 mt-1.5 z-[150]">
            {renderDropdownList()}
          </div>
        )}
      </div>

      {/* Mobile Expanded Full-Width Header Bar (< 768px when tapped) */}
      {isMobileExpanded && (
        <div
          data-testid="mobile-search-expanded-bar"
          className="fixed inset-x-0 top-0 h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 z-[160] px-3 sm:px-4 flex items-center gap-2.5 shadow-lg md:hidden animate-in slide-in-from-top duration-200"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder={
                role === "officer"
                  ? t("searchPlaceholderOfficer")
                  : t("searchPlaceholderCitizen")
              }
              aria-label={
                role === "officer"
                  ? t("searchPlaceholderOfficer") || "Search by ULPIN, Khasra, or Owner"
                  : t("searchPlaceholderCitizen") || "Search land records"
              }
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <VoiceSearchButton
            parcels={currentCollection}
            onSelectParcel={handleSelect}
            onQueryChange={(text) => {
              setQuery(text);
              setIsOpen(true);
            }}
            size="sm"
          />

          <button
            type="button"
            data-testid="mobile-search-close-btn"
            onClick={() => {
              setIsMobileExpanded(false);
              setIsOpen(false);
            }}
            aria-label="Cancel search and close search bar"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors shrink-0"
          >
            Cancel
          </button>

          {/* Mobile Dropdown Positioned Below Mobile Top Bar */}
          {isOpen && trimmedQuery.length > 0 && (
            <div className="fixed inset-x-0 top-16 max-h-[calc(100vh-4.5rem)] overflow-y-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-2xl p-2 z-[160]">
              {renderDropdownList()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
