"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { EmptyState } from "@/components/shared/states/EmptyState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { useMyPostedJobs } from "@/hooks/useMyJobs";
import { formatSol, formatTimestamp } from "@/lib/utils";

export function MyJobsPageContent() {
  const { data, isLoading, error, reload } = useMyPostedJobs();

  return (
    <div>
      <PageHeader
        title="My posted jobs"
        description="Manage jobs you have published"
        actions={
          <Link href="/jobs/new"><Button>Post job</Button></Link>
        }
      />

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <EmptyState
          title="No jobs posted"
          description="Create your first job listing to receive applications."
          action={{ label: "Post a job", href: "/jobs/new" }}
        />
      )}
      {!isLoading && !error && (data?.length ?? 0) > 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {data?.map((job) => (
              <div key={job.id} className="rounded-md border border-border bg-surface p-3">
                <p className="font-medium">{job.title}</p>
                <p className="mt-1 text-sm text-brand">{formatSol(job.budget)}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <Badge variant="accent">{job.status}</Badge>
                  <span>{formatTimestamp(job.created_at)}</span>
                </div>
                <div className="mt-3">
                  <Link href={`/jobs/${job.id}/applicants`}>
                    <Button size="sm" variant="secondary">Applicants</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-md border border-border md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-bg-subtle">
              <tr>
                <th className="px-3 py-2 font-medium" scope="col">Title</th>
                <th className="px-3 py-2 font-medium" scope="col">Budget</th>
                <th className="px-3 py-2 font-medium" scope="col">Status</th>
                <th className="px-3 py-2 font-medium" scope="col">Posted</th>
                <th className="px-3 py-2 font-medium" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data!.map((job) => (
                <tr key={job.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 font-medium">{job.title}</td>
                  <td className="px-3 py-3">{formatSol(job.budget)}</td>
                  <td className="px-3 py-3"><Badge variant="accent">{job.status}</Badge></td>
                  <td className="px-3 py-3 text-text-muted">{formatTimestamp(job.created_at)}</td>
                  <td className="px-3 py-3">
                    <Link href={`/jobs/${job.id}/applicants`}>
                      <Button size="sm" variant="secondary">Applicants</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
