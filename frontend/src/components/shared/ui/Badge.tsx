import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "brand" | "success" | "warning" | "danger" | "violet" | "teal";
  children: ReactNode;
  dot?: boolean;
}

const variants = {
  default:  "bg-surface-3 text-text-muted border-border/60",
  accent:   "bg-brand/15 text-brand border-brand/25",
  brand:    "bg-brand/15 text-brand border-brand/25",
  success:  "bg-success/12 text-success border-success/25",
  warning:  "bg-warning/12 text-warning border-warning/25",
  danger:   "bg-danger/12 text-danger border-danger/25",
  violet:   "bg-accent-violet/12 text-accent-violet border-accent-violet/25",
  teal:     "bg-accent-teal/12 text-accent-teal border-accent-teal/25",
};

const dotColors = {
  default:  "bg-text-muted",
  accent:   "bg-brand",
  brand:    "bg-brand",
  success:  "bg-success",
  warning:  "bg-warning",
  danger:   "bg-danger",
  violet:   "bg-accent-violet",
  teal:     "bg-accent-teal",
};

export function Badge({
  variant = "default",
  className,
  children,
  dot = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full animate-dot-pulse",
            dotColors[variant],
          )}
        />
      )}
      {children}
    </span>
  );
}
