"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Radio,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import NotificationList from "@/components/NotificationList";
import {
  useAppStore,
  type CadastralNotification,
  SIMULATION_EVENTS_POOL,
  INITIAL_NOTIFICATIONS,
} from "@/lib/store";

export type { CadastralNotification };

export interface NotificationBellProps {
  onSelectParcelByUlpin: (ulpin: string) => void;
}

export { SIMULATION_EVENTS_POOL, INITIAL_NOTIFICATIONS };

export default function NotificationBell({ onSelectParcelByUlpin }: NotificationBellProps) {
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Listen to global Reset Demo event to close dropdown
  useEffect(() => {
    function handleDemoReset() {
      setIsOpen(false);
    }
    window.addEventListener("landstack:reset-demo", handleDemoReset);
    return () => window.removeEventListener("landstack:reset-demo", handleDemoReset);
  }, []);

  // Simulate real-time government activity: pushes new notification every 8-10 seconds
  useEffect(() => {
    let poolIndex = 3; // start cycling through remaining pool items
    let ringTimeout: NodeJS.Timeout | null = null;

    const intervalId = setInterval(() => {
      const template = SIMULATION_EVENTS_POOL[poolIndex % SIMULATION_EVENTS_POOL.length];
      poolIndex++;

      const newNotification: CadastralNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: template.title,
        message: template.message,
        timestamp: "Just now",
        createdAt: Date.now(),
        type: template.type,
        ulpin: template.ulpin,
        khasraNo: template.khasraNo,
        isRead: false,
      };

      addNotification(newNotification);

      // Trigger visual ring animation on bell
      setIsRinging(true);
      if (ringTimeout) clearTimeout(ringTimeout);
      ringTimeout = setTimeout(() => setIsRinging(false), 1200);
    }, 9000); // 9-second interval between 8 and 10s

    // STRICT CLEANUP on unmount
    return () => {
      clearInterval(intervalId);
      if (ringTimeout) clearTimeout(ringTimeout);
    };
  }, [addNotification]);

  // Mark all notifications as read
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllNotificationsRead();
  };

  // Clear all notifications
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllNotifications();
  };

  // Handle clicking a notification: mark as read, close dropdown, and jump to parcel drawer
  const handleNotificationClick = useCallback((notif: CadastralNotification) => {
    if (!notif.isRead) {
      markNotificationRead(notif.id);
    }
    setIsOpen(false);
    onSelectParcelByUlpin(notif.ulpin);
  }, [markNotificationRead, onSelectParcelByUlpin]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button with Live Red Badge Count */}
      <button
        type="button"
        data-testid="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all relative cursor-pointer ${
          isOpen ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 ring-2 ring-indigo-500/20" : ""
        }`}
        aria-label={
          unreadCount > 0
            ? `${t("notifications") || "Government Activity Notifications"} (${unreadCount} unread)`
            : t("notifications") || "Government Activity Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Live Government Activity Feed"
      >
        <Bell
          className={`h-4 w-4 transition-transform ${
            isRinging ? "animate-bounce text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />

        {/* Live Red Badge Count */}
        {unreadCount > 0 && (
          <span
            data-testid="notification-badge-count"
            className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900 animate-in zoom-in-75 duration-200"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Dropdown Menu */}
      {isOpen && (
        <div
          data-testid="notification-dropdown-panel"
          role="region"
          aria-label={t("notifTitle") || "Government Activity Feed"}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        >
          {/* Dropdown Header */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                <span>{t("notifTitle") || "Government Activity Feed"}</span>
              </div>
              <span className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                {t("notifLive") || "LIVE FEED"}
              </span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                  title="Mark all as read"
                  aria-label={t("notifMarkAllRead") || "Mark all notifications as read"}
                >
                  <CheckCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">{t("notifMarkAllRead") || "Mark read"}</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Clear all notifications"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Notification List (Memoized) */}
          <div className="max-h-[380px] overflow-y-auto">
            <NotificationList
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              emptyMessage={t("notifEmpty") || "No new activity notifications."}
            />
          </div>

          {/* Footer Prompt */}
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium">
              <ExternalLink className="h-2.5 w-2.5 text-indigo-500" />
              <span>{t("notifClickPrompt") || "Click any alert to inspect parcel"}</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400">~9s interval</span>
          </div>
        </div>
      )}
    </div>
  );
}
