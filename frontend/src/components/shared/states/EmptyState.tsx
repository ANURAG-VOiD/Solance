import type { ReactNode } from "react";
import { Button } from "@/components/shared/ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-12 text-center"
      role="status"
    >
      {icon && <div className="mb-3 text-text-muted">{icon}</div>}
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a href={action.href}>
              <Button>{action.label}</Button>
            </a>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
