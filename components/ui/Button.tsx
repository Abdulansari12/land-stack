import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "amber"
  | "gradient";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-active text-white shadow-xs font-semibold focus-visible:ring-brand-primary",
  secondary:
    "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-brand-primary dark:hover:text-brand-primary-light border border-slate-200 dark:border-zinc-700 hover:border-brand-primary-border dark:hover:border-zinc-600 shadow-xs font-semibold focus-visible:ring-slate-400",
  outline:
    "border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 shadow-xs font-medium focus-visible:ring-slate-400",
  ghost:
    "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60 font-medium focus-visible:ring-slate-400",
  danger:
    "bg-status-disputed-bg hover:bg-status-disputed/20 text-status-disputed-text border border-status-disputed-border shadow-xs font-semibold focus-visible:ring-status-disputed",
  amber:
    "bg-status-pending-bg hover:bg-status-pending/20 text-status-pending-text border border-status-pending-border shadow-xs font-semibold focus-visible:ring-status-pending",
  gradient:
    "bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-secondary hover:from-brand-primary-hover hover:to-purple-700 text-white font-bold shadow-sm shadow-brand-primary/25 hover:shadow-brand-primary/40 focus-visible:ring-brand-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-2xl gap-2.5",
  icon: "p-2 rounded-xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "secondary",
      size = "sm",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
