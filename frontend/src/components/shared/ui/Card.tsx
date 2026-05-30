import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // Design system: soft enterprise cards (white surface, slate border).
        "rounded-2xl border border-border bg-surface p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
