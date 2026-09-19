import React, { type HTMLAttributes, type ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "purple"
  | "neutral";

export type BadgeSize = "xs" | "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success:
    "bg-status-verified-bg text-status-verified-text border border-status-verified-border",
  danger:
    "bg-status-disputed-bg text-status-disputed-text border border-status-disputed-border",
  warning:
    "bg-status-pending-bg text-status-pending-text border border-status-pending-border",
  info:
    "bg-brand-primary-light text-brand-primary-dark dark:bg-brand-primary-dark/80 dark:text-brand-primary-light border border-brand-primary-border dark:border-brand-primary/40",
  purple:
    "bg-brand-secondary-light text-brand-secondary dark:bg-purple-950/80 dark:text-purple-200 border border-brand-secondary-border dark:border-purple-800",
  neutral:
    "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-status-verified",
  danger: "bg-status-disputed",
  warning: "bg-status-pending",
  info: "bg-brand-primary",
  purple: "bg-brand-secondary",
  neutral: "bg-slate-400",
};

const badgeSizes: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[11px] rounded-md gap-1",
  sm: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
  md: "px-3 py-1.5 text-xs font-semibold rounded-xl gap-2",
};

export function Badge({
  children,
  className = "",
  variant = "neutral",
  size = "sm",
  dot = false,
  icon,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium transition-colors select-none ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
          />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}
