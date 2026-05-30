import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
            {value}
          </p>
        </div>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
    </div>
  );
}
