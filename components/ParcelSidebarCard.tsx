import React from "react";
import { MousePointerClick, ChevronRight, Landmark, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { LandParcelProperties } from "@/data/parcels";
import { Button, Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";

export interface ParcelSidebarCardProps {
  selectedParcel?: LandParcelProperties | null;
  isDrawerOpen?: boolean;
  role?: "citizen" | "officer" | "bank";
  approvedConsentUlpins?: string[];
  onOpenDrawer?: () => void;
  onClearSelection?: () => void;
}

export default function ParcelSidebarCard({
  selectedParcel: propParcel,
  isDrawerOpen: propDrawerOpen,
  role: propRole,
  approvedConsentUlpins: propApprovedConsentUlpins,
  onOpenDrawer: propOpenDrawer,
  onClearSelection: propClearSelection,
}: ParcelSidebarCardProps) {
  const { t } = useLanguage();
  const storeParcel = useAppStore((s) => s.selectedParcel);
  const storeIsOpen = useAppStore((s) => s.isDrawerOpen);
  const storeRole = useAppStore((s) => s.userRole);
  const storeApprovedUlpins = useAppStore((s) => s.approvedConsentUlpins);
  const storeOpenDrawer = useAppStore((s) => s.openDrawer);
  const storeCloseDrawer = useAppStore((s) => s.closeDrawer);
  const storeOpenBankModal = useAppStore((s) => s.openBankModal);

  const selectedParcel = propParcel !== undefined ? propParcel : storeParcel;
  const isDrawerOpen = propDrawerOpen !== undefined ? propDrawerOpen : storeIsOpen;
  const role = propRole ?? storeRole;
  const approvedConsentUlpins = propApprovedConsentUlpins ?? storeApprovedUlpins;
  const onOpenDrawer = propOpenDrawer ?? storeOpenDrawer;
  const onClearSelection = propClearSelection ?? storeCloseDrawer;

  if (!selectedParcel || !isDrawerOpen) {
    if (role === "bank") {
      return (
        <div className="hidden lg:flex w-full lg:w-[380px] xl:w-[400px] flex-col shrink-0 animate-in fade-in duration-200">
          <div
            data-testid="parcel-drawer-placeholder"
            className="h-full min-h-[420px] rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 backdrop-blur-xs p-8 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
              <Landmark className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Bank Underwriter Mode
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 max-w-[280px] leading-relaxed">
              Click any parcel on the map to verify clear title deed, encumbrance registry, and CERSAI lien status.
            </p>
            <button
              type="button"
              onClick={storeOpenBankModal}
              className="mt-5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Multi-State Borrower Search</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex w-full lg:w-[380px] xl:w-[400px] flex-col shrink-0 animate-in fade-in duration-200">
        <div
          data-testid="parcel-drawer-placeholder"
          className="h-full min-h-[420px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xs p-8 flex flex-col items-center justify-center text-center shadow-xs"
        >
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
            <MousePointerClick className="h-8 w-8 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-1.5">
            {t("noParcelSelected")}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 max-w-[260px]">
            {t("clickParcelPrompt")}
          </p>
          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 w-full flex flex-col gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>{t("rorFeature1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>{t("rorFeature2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{t("rorFeature3")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isConsentLocked =
    role === "officer" &&
    selectedParcel.ownerConsentRequired &&
    !approvedConsentUlpins.includes(selectedParcel.ulpin);

  return (
    <div className="hidden lg:flex w-full lg:w-[380px] xl:w-[400px] flex-col shrink-0 animate-in fade-in duration-200">
      <Card className="h-full min-h-[420px] p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {t("activeInspection")}
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {t("clearSelection")}
            </button>
          </div>

          <div className="py-6 text-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              {t("ulpin")}: {selectedParcel.ulpin}
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("khasra")}
              {selectedParcel.khasraNo}
            </h4>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
              {t("owner")}:{" "}
              <strong className="text-slate-800 dark:text-zinc-200">
                {isConsentLocked ? t("consentRequiredBadge") : selectedParcel.ownerName}
              </strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
              {t("area")}: {selectedParcel.areaInHectares} Ha | {t("status")}:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedParcel.rorStatus}
              </span>
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenDrawer}
          rightIcon={<ChevronRight className="h-4 w-4" />}
          className="w-full"
        >
          {t("inspectDrawerBtn")}
        </Button>
      </Card>
    </div>
  );
}
