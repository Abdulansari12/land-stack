"use client";

import React, { memo } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Receipt,
  Scale,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { CadastralNotification } from "@/components/NotificationBell";

export interface NotificationListProps {
  notifications: CadastralNotification[];
  onNotificationClick: (notif: CadastralNotification) => void;
  emptyMessage?: string;
}

function renderNotificationIcon(type: CadastralNotification["type"]) {
  switch (type) {
    case "mutation":
      return <CheckCircle2 className="h-4 w-4 text-status-verified" />;
    case "encroachment":
      return <AlertTriangle className="h-4 w-4 text-status-disputed" />;
    case "dispute":
      return <Scale className="h-4 w-4 text-status-disputed" />;
    case "tax":
      return <Receipt className="h-4 w-4 text-status-pending" />;
    case "ror":
    default:
      return <FileText className="h-4 w-4 text-brand-primary" />;
  }
}

/**
 * Memoized NotificationList component.
 * Prevents unnecessary re-renders of the entire notification items list
 * when parent timers or unrelated states trigger renders.
 */
function NotificationListBase({
  notifications,
  onNotificationClick,
  emptyMessage = "No new activity notifications.",
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-slate-400 dark:text-zinc-500 flex flex-col items-center justify-center">
        <Bell className="h-8 w-8 text-slate-300 dark:text-zinc-700 mb-2" />
        <span>{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => onNotificationClick(notif)}
          className={`p-3 sm:p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer group ${
            !notif.isRead
              ? "bg-brand-primary-light/40 dark:bg-brand-primary-dark/20"
              : "bg-white dark:bg-zinc-900"
          }`}
        >
          {/* Activity Icon */}
          <div className="mt-0.5 h-7 w-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {renderNotificationIcon(notif.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span
                className={`text-xs truncate ${
                  !notif.isRead
                    ? "font-bold text-slate-900 dark:text-white"
                    : "font-semibold text-slate-700 dark:text-zinc-300"
                }`}
              >
                {notif.title}
              </span>
              {!notif.isRead && (
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary dark:bg-brand-primary-light shrink-0" />
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-1.5">
              {notif.message}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
              <span className="font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                {notif.ulpin}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{notif.timestamp}</span>
                </span>
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const NotificationList = memo(NotificationListBase);
export default NotificationList;
