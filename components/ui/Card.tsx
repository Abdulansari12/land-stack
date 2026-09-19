import React, { forwardRef, type HTMLAttributes } from "react";

export type CardVariant = "default" | "glass" | "dashed";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

const cardVariants: Record<CardVariant, string> = {
  default: "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm",
  glass:
    "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800/90 shadow-md",
  dashed:
    "border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xs shadow-xs",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", variant = "default", hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl transition-all ${cardVariants[variant]} ${
          hoverable ? "hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs text-slate-500 dark:text-zinc-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 rounded-b-2xl flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
