"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

import { listOpenTasks } from "@/services/tasks.service";
import { formatSol } from "@/lib/utils";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { useAsyncData } from "@/hooks/useAsyncData";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { EmptyState } from "@/components/shared/states/EmptyState";

const SKILL_COLORS = [
  "brand", "violet", "teal", "success",
] as const;

function SkillTag({ skill, idx }: { skill: string; idx: number }) {
  const color = SKILL_COLORS[idx % SKILL_COLORS.length];
  return <Badge variant={color}>{skill}</Badge>;
}

export function FeaturedJobs() {
  const { data, isLoading, error, reload } = useAsyncData(
    async () => (await listOpenTasks()).slice(0, 6),
    [],
  );

  return (
    <section id="jobs" className="border-t border-border/60 py-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(255,107,0,0.03),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between animate-slide-up">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Open Marketplace
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Featured Jobs</h2>
            <p className="mt-2 text-text-muted">
              Live opportunities published by clients on Solance.
            </p>
          </div>
          <Link href="/marketplace" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {isLoading && <LoadingState label="Loading featured jobs…" />}
        {error && <ErrorState message={error} onRetry={reload} />}

        {!isLoading && !error && (data?.length ?? 0) === 0 && (
          <EmptyState
            title="No open jobs right now"
            description="New opportunities appear here as clients publish projects."
          />
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((job, i) => (
              <div
                key={job.id}
                className="animate-slide-up group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-surface-2 p-5 transition-all duration-200 hover:-translate-y-px hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Left accent border on hover */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r bg-brand opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div className="min-w-0">
                  <h3 className="font-semibold text-text group-hover:text-brand transition-colors duration-150">
                    {job.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-text-muted">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="default">{job.status}</Badge>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-brand" />
                    <p className="text-xl font-bold text-brand tabular-nums">
                      {formatSol(job.budget)}
                    </p>
                  </div>
                  <Link href={`/marketplace`}>
                    <Button size="sm" variant="secondary">
                      View <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/marketplace">
            <Button variant="secondary">
              View all opportunities <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
