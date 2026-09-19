import React from "react";
import { ChevronRight, MousePointerClick, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui";
import { useAppStore } from "@/lib/store";

export interface WorkspaceSubheaderProps {
  role?: "citizen" | "officer";
  dataSource?: string;
  clearCount: number;
  disputedCount: number;
  inReviewCount: number;
}

export default function WorkspaceSubheader({
  role,
  dataSource,
  clearCount,
  disputedCount,
  inReviewCount,
}: WorkspaceSubheaderProps) {
  const { t } = useLanguage();
  const storeRole = useAppStore((s) => s.userRole);
  const storeDataSource = useAppStore((s) => s.currentDataSource);

  const activeRole = role ?? storeRole;
  const activeDataSource = dataSource ?? storeDataSource;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1">
          <span>{t("portal")}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{t("gisMap")}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {activeDataSource}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="capitalize">
            {activeRole === "citizen" ? t("citizenView") : t("officerView")}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {activeRole === "citizen" ? t("pageTitleCitizen") : t("pageTitleOfficer")}
        </h1>
      </div>

      {/* Quick Metrics Bar & Prompt */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs">
          <MousePointerClick className="h-3.5 w-3.5 text-indigo-500" />
          <span>{t("clickToInspect")}</span>
        </div>

        <Badge
          variant="success"
          size="md"
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
        >
          {clearCount} {t("clearVerified")}
        </Badge>

        <Badge
          variant="danger"
          size="md"
          icon={<AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
        >
          {disputedCount} {t("disputed")}
        </Badge>

        <Badge
          variant="warning"
          size="md"
          icon={<Clock className="h-3.5 w-3.5 text-amber-600" />}
        >
          {inReviewCount} {t("inReview")}
        </Badge>
      </div>
    </div>
  );
}
