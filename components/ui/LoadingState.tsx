import React from "react";
import { Loader2 } from "lucide-react";

export type LoadingStateVariant = "spinner" | "skeleton" | "card" | "inline";
export type LoadingStateSize = "sm" | "md" | "lg";

export interface LoadingStateProps {
  label?: string;
  description?: string;
  variant?: LoadingStateVariant;
  size?: LoadingStateSize;
  className?: string;
  icon?: React.ReactNode;
  "data-testid"?: string;
}

const SIZE_CLASSES = {
  sm: {
    icon: "h-3.5 w-3.5",
    label: "text-xs",
    desc: "text-[11px]",
    skeleton: "h-3",
  },
  md: {
    icon: "h-5 w-5",
    label: "text-sm",
    desc: "text-xs",
    skeleton: "h-4",
  },
  lg: {
    icon: "h-8 w-8",
    label: "text-base font-semibold",
    desc: "text-sm",
    skeleton: "h-5",
  },
};

export function LoadingState({
  label = "Loading...",
  description,
  variant = "spinner",
  size = "md",
  className = "",
  icon,
  "data-testid": testId = "loading-state",
}: LoadingStateProps) {
  const sizeConfig = SIZE_CLASSES[size];

  // 1. Inline Variant (for buttons, status bars, chips)
  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-live="polite"
        data-testid={testId}
        className={`inline-flex items-center gap-2 text-slate-600 dark:text-zinc-400 font-medium ${sizeConfig.label} ${className}`}
      >
        {icon ? (
          <span className="animate-spin shrink-0">{icon}</span>
        ) : (
          <Loader2 className={`${sizeConfig.icon} animate-spin text-brand-primary dark:text-brand-primary-light shrink-0`} />
        )}
        <span>{label}</span>
        <span className="sr-only">Loading in progress</span>
      </span>
    );
  }

  // 2. Skeleton Variant (content placeholder lines)
  if (variant === "skeleton") {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid={testId}
        className={`w-full space-y-2.5 animate-pulse ${className}`}
      >
        <div className={`w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md ${sizeConfig.skeleton}`} />
        <div className={`w-full bg-slate-100 dark:bg-zinc-800/60 rounded-md ${sizeConfig.skeleton}`} />
        <div className={`w-5/6 bg-slate-200/80 dark:bg-zinc-800/80 rounded-md ${sizeConfig.skeleton}`} />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  // 3. Card / Contained Container Variant
  if (variant === "card") {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid={testId}
        className={`w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xs ${className}`}
      >
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 blur-md animate-pulse" />
          {icon ? (
            <div className="animate-spin text-brand-primary dark:text-brand-primary-light">{icon}</div>
          ) : (
            <Loader2 className={`${sizeConfig.icon} animate-spin text-brand-primary dark:text-brand-primary-light`} />
          )}
        </div>
        <p className={`font-semibold text-slate-800 dark:text-zinc-100 ${sizeConfig.label}`}>
          {label}
        </p>
        {description && (
          <p className={`text-slate-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed ${sizeConfig.desc}`}>
            {description}
          </p>
        )}
        <span className="sr-only">Loading in progress</span>
      </div>
    );
  }

  // 4. Default Centered Spinner
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={testId}
      className={`flex flex-col items-center justify-center gap-2 p-4 text-center ${className}`}
    >
      {icon ? (
        <div className="animate-spin text-brand-primary dark:text-brand-primary-light">{icon}</div>
      ) : (
        <Loader2 className={`${sizeConfig.icon} animate-spin text-brand-primary dark:text-brand-primary-light`} />
      )}
      <p className={`font-medium text-slate-700 dark:text-zinc-300 ${sizeConfig.label}`}>
        {label}
      </p>
      {description && (
        <p className={`text-slate-400 dark:text-zinc-500 ${sizeConfig.desc}`}>
          {description}
        </p>
      )}
      <span className="sr-only">Loading in progress</span>
    </div>
  );
}
