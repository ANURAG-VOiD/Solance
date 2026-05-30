import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "glass" | "glow" | "elevated";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  noPadding?: boolean;
}

const variants: Record<CardVariant, string> = {
  default:
    "border border-border bg-surface",
  glass:
    "glass border-0",
  glow:
    "border border-brand/30 bg-surface glow-brand-sm",
  elevated:
    "border border-border bg-surface-2 shadow-xl shadow-black/40",
};

export function Card({
  children,
  className,
  variant = "default",
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        variants[variant],
        !noPadding && "p-5",
        "hover:-translate-y-px hover:border-border/80",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
