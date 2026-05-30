"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { ProposalCard, ProposalActions } from "@/components/marketplace/ProposalCard";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { EmptyState } from "@/components/shared/states/EmptyState";
import { Button } from "@/components/shared/ui/Button";
import { useTask } from "@/hooks/useTask";
import { acceptBid, listBidsForTask } from "@/services/tasks.service";
import type { Bid } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";

export function ApplicantsPageContent({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { data: task, isLoading: taskLoading, error: taskError, reload } = useTask(taskId);
  const bidsQuery = useAsyncData(() => listBidsForTask(taskId), [taskId]);
  const [hiringId, setHiringId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleHire = async (bid: Bid) => {
    setHiringId(bid.id);
    setActionError(null);
    try {
      const result = await acceptBid(bid.id);
      bidsQuery.reload();
      router.push(`/messages/${result.chat.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to hire applicant");
    } finally {
      setHiringId(null);
    }
  };

  if (taskLoading) return <LoadingState />;
  if (taskError) return <ErrorState message={taskError} onRetry={reload} />;
  if (!task) return <ErrorState message="Job not found" />;

  return (
    <div>
      <PageHeader
        title={`Applicants — ${task.title}`}
        description="Review and hire freelancers"
        actions={
          <Link href="/jobs"><Button variant="secondary" size="sm">Back to jobs</Button></Link>
        }
      />

      {bidsQuery.isLoading && <LoadingState label="Loading applicants…" />}
      {bidsQuery.error && <ErrorState message={bidsQuery.error} onRetry={bidsQuery.reload} />}
      {actionError && <ErrorState message={actionError} />}
      {!bidsQuery.isLoading && !bidsQuery.error && (bidsQuery.data?.length ?? 0) === 0 && (
        <EmptyState title="No applicants yet" description="Share your job listing to receive proposals." />
      )}
      {!bidsQuery.isLoading && !bidsQuery.error && (bidsQuery.data?.length ?? 0) > 0 && (
        <ul className="space-y-3">
          {bidsQuery.data?.map((bid) => (
            <li key={bid.id}>
              <ProposalCard
                bid={bid}
                task={task}
                showTask={false}
                actions={
                  bid.status === "pending" ? (
                    <ProposalActions
                      onViewProfile={() => router.push("/profile")}
                      onMessage={() => router.push("/messages")}
                      onHire={() => handleHire(bid)}
                      hiring={hiringId === bid.id}
                    />
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
