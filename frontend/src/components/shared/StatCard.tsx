"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  accentColor?: "brand" | "violet" | "teal" | "success";
  delay?: number;
}

const accentStyles = {
  brand:   { ring: "ring-brand/20", bg: "bg-brand/15",   text: "text-brand",         glow: "shadow-brand/25" },
  violet:  { ring: "ring-accent-violet/20", bg: "bg-accent-violet/15", text: "text-accent-violet", glow: "shadow-accent-violet/25" },
  teal:    { ring: "ring-accent-teal/20",   bg: "bg-accent-teal/15",   text: "text-accent-teal",   glow: "shadow-teal-500/25" },
  success: { ring: "ring-success/20",       bg: "bg-success/15",       text: "text-success",       glow: "shadow-success/25" },
};

function useCountUp(target: number, duration = 900, delay = 0) {
  const [count, setCount] = useState(0);
  const frame = useRef<number>(null);

  useEffect(() => {
    if (typeof target !== "number") return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) {
          frame.current = requestAnimationFrame(tick);
        }
      };
      frame.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, delay]);

  return count;
}

export function StatCard({
  label,
  value,
  icon,
  trend = "neutral",
  trendLabel,
  accentColor = "brand",
  delay = 0,
}: StatCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const displayValue = typeof value === "number" ? useCountUp(numericValue, 900, delay) : value;
  const accent = accentStyles[accentColor];

  return (
    <div
      className={cn(
        "animate-slide-up rounded-xl border border-border bg-surface-2 p-5",
        "hover:-translate-y-0.5 hover:border-border/70 transition-all duration-200",
        "relative overflow-hidden",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle ambient glow */}
      <div className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-20", accent.bg)} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted tracking-wide uppercase">{label}</p>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums tracking-tight", typeof value === "number" ? accent.text : "text-text")}>
            {displayValue}
          </p>
          {trendLabel && (
            <p className={cn(
              "mt-1 text-xs font-medium",
              trend === "up"   ? "text-success" :
              trend === "down" ? "text-danger"  : "text-text-muted"
            )}>
              {trend === "up" && "↑ "}
              {trend === "down" && "↓ "}
              {trendLabel}
            </p>
          )}
        </div>

        {icon && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
            accent.bg, accent.ring,
            `shadow-lg ${accent.glow}`,
          )}>
            <span className={accent.text}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
