import Link from "next/link";
import type { Task } from "@/types";
import { formatSol, formatTimestamp } from "@/lib/utils";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";

interface JobCardProps {
  task: Task;
  skills?: string[];
}

export function JobCard({ task, skills = [] }: JobCardProps) {
  return (
    <article className="rounded-md border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text">
            <Link href={`/marketplace/${task.id}`} className="hover:text-brand">
              {task.title}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
            {task.description}
          </p>
          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-text-muted">
            Posted {formatTimestamp(task.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="text-base font-semibold text-text">{formatSol(task.budget)}</p>
          <Link href={`/marketplace/${task.id}`}>
            <Button size="sm" variant="secondary">
              View details
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
