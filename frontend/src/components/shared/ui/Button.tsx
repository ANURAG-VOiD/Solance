import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand to-brand-hover text-white shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:shadow-xl hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-surface-2 border border-border text-text hover:bg-surface-3 hover:border-border/80",
  ghost:
    "text-text-muted hover:bg-surface-2 hover:text-text",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
  glass:
    "glass text-text hover:bg-surface/60 border-0",
};

const sizes: Record<Size, string> = {
  sm:   "h-8 px-3 text-xs rounded-lg gap-1.5",
  md:   "h-9 px-4 text-sm rounded-lg gap-2",
  lg:   "h-11 px-6 text-sm rounded-xl gap-2",
  icon: "h-9 w-9 rounded-lg",
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
