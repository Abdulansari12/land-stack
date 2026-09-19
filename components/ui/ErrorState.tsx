import React from "react";
import { AlertTriangle, AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "./Button";

export type ErrorStateVariant = "card" | "banner" | "inline" | "full";
export type ErrorStateSize = "sm" | "md" | "lg";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onDismiss?: () => void;
  variant?: ErrorStateVariant;
  size?: ErrorStateSize;
  className?: string;
  icon?: React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  "data-testid"?: string;
}

export function ErrorState({
  title = "Error Encountered",
  message,
  onRetry,
  retryLabel = "Try Again",
  onDismiss,
  variant = "card",
  size = "md",
  className = "",
  icon,
  secondaryAction,
  "data-testid": testId = "error-state",
}: ErrorStateProps) {
  // 1. Inline Variant
  if (variant === "inline") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid={testId}
        className={`inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium ${className}`}
      >
        {icon || <AlertCircle className="h-4 w-4 shrink-0" />}
        <span>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="underline hover:text-rose-700 dark:hover:text-rose-300 font-semibold cursor-pointer ml-1 inline-flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>{retryLabel}</span>
          </button>
        )}
      </div>
    );
  }

  // 2. Banner Variant (horizontal notification bar)
  if (variant === "banner") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid={testId}
        className={`w-full p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${className}`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            {icon || <AlertTriangle className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            {title && (
              <h4 className="text-xs font-bold tracking-tight text-rose-950 dark:text-rose-100 mb-0.5">
                {title}
              </h4>
            )}
            <p className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              className="text-xs border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
            >
              {secondaryAction.label}
            </Button>
          )}
          {onRetry && (
            <Button
              variant="danger"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="h-3 w-3" />}
              className="text-xs shadow-xs"
            >
              {retryLabel}
            </Button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss error alert"
              className="p-1 rounded-lg text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-100 hover:bg-rose-200/50 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Full / Large Fallback Variant
  if (variant === "full") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid={testId}
        className={`flex-1 min-h-[420px] sm:min-h-[500px] md:min-h-[580px] w-full rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-900/80 p-8 flex flex-col items-center justify-center text-center shadow-sm ${className}`}
      >
        <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-xs">
          {icon || <AlertTriangle className="h-8 w-8" />}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button variant="secondary" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {onRetry && (
            <Button
              variant="primary"
              size="md"
              onClick={onRetry}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 4. Default Card Variant (contained card for panels, modal bodies, dashboards)
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid={testId}
      className={`w-full rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-6 flex flex-col items-center justify-center text-center shadow-xs ${className}`}
    >
      <div className={`rounded-xl bg-rose-100/80 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 shadow-2xs ${
        isSm ? "h-10 w-10" : isLg ? "h-16 w-16" : "h-12 w-12"
      }`}>
        {icon || <AlertTriangle className={isSm ? "h-5 w-5" : isLg ? "h-8 w-8" : "h-6 w-6"} />}
      </div>

      <h4 className={`font-bold text-slate-900 dark:text-white tracking-tight ${
        isSm ? "text-xs mb-1" : isLg ? "text-base mb-1.5" : "text-sm mb-1"
      }`}>
        {title}
      </h4>

      <p className={`text-slate-600 dark:text-zinc-400 max-w-md leading-relaxed ${
        isSm ? "text-[11px] mb-3" : "text-xs mb-4"
      }`}>
        {message}
      </p>

      <div className="flex items-center gap-2">
        {secondaryAction && (
          <Button
            variant="secondary"
            size={isSm ? "sm" : "sm"}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        {onRetry && (
          <Button
            variant="danger"
            size={isSm ? "sm" : "sm"}
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3 w-3" />}
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
