"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { ProposalCard } from "@/components/marketplace/ProposalCard";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { EmptyState } from "@/components/shared/states/EmptyState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { Button } from "@/components/shared/ui/Button";
import { useMyApplications } from "@/hooks/useApplications";

export function ApplicationsPageContent() {
  const { data, isLoading, error, reload } = useMyApplications();
  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Track proposals you have submitted"
        actions={
          <Link href="/marketplace">
            <Button size="sm">Browse jobs</Button>
          </Link>
        }
      />

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!isLoading && !error && rows.length === 0 && (
        <EmptyState
          title="No applications yet"
          description="Browse the marketplace and submit your first proposal."
          action={{ label: "Browse marketplace", href: "/marketplace" }}
        />
      )}
      {!isLoading && !error && rows.length > 0 && (
        <ul className="space-y-3">
          {rows.map(({ bid, task }) => (
            <li key={bid.id}>
              <ProposalCard bid={bid} task={task} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
