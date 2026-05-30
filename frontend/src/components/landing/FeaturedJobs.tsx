"use client";

import { listOpenTasks } from "@/services/tasks.service";
import { formatSol } from "@/lib/utils";
import { Card } from "@/components/shared/ui/Card";
import { Badge } from "@/components/shared/ui/Badge";
import { useAsyncData } from "@/hooks/useAsyncData";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { EmptyState } from "@/components/shared/states/EmptyState";

export function FeaturedJobs() {
  const { data, isLoading, error, reload } = useAsyncData(
    async () => (await listOpenTasks()).slice(0, 6),
    [],
  );

  return (
    <section id="jobs" className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Open Marketplace</p>
        <h2 className="text-xl font-semibold">Featured Jobs</h2>
        <div className="mt-8 space-y-3">
          {isLoading && <LoadingState label="Loading featured jobs…" />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!isLoading && !error && (data?.length ?? 0) === 0 && (
            <EmptyState
              title="No open jobs right now"
              description="New opportunities appear here as clients publish projects."
            />
          )}
          {!isLoading && !error && data?.map((job) => (
            <Card key={job.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-surface-hover">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-text-muted">{job.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge>{job.status}</Badge>
                </div>
              </div>
              <p className="shrink-0 text-lg font-semibold text-brand">{formatSol(job.budget)}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
