"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { Textarea } from "@/components/shared/ui/Textarea";
import { Input } from "@/components/shared/ui/Input";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
import { Card } from "@/components/shared/ui/Card";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { useTask } from "@/hooks/useTask";
import { createBid } from "@/services/tasks.service";
import { formatSol, truncateWallet } from "@/lib/utils";

export function JobDetailContent({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { data: task, isLoading, error, reload } = useTask(taskId);

  const [coverLetter, setCoverLetter] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createBid(task.id, {
        cover_letter: coverLetter.trim(),
        proposed_amount: amount.trim(),
      });
      setSuccess(true);
      router.push("/applications");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!task) return <ErrorState message="Job not found" />;

  return (
    <div>
      <PageHeader
        title={task.title}
        description={`Posted by ${truncateWallet(task.client_wallet)}`}
        actions={
          <Link href="/marketplace">
            <Button variant="secondary" size="sm">Back to marketplace</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Badge variant="accent">{task.status}</Badge>
            <p className="mt-4 whitespace-pre-wrap text-sm text-text-muted">{task.description}</p>
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold">Submit proposal</h2>
            {success ? (
              <p className="text-sm text-success">Proposal submitted. Redirecting…</p>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <Textarea
                  label="Proposal text"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                  rows={6}
                />
                <Input
                  label="Expected budget (SOL)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Apply"}
                </Button>
              </form>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <p className="text-xs text-text-muted">Budget</p>
            <p className="text-xl font-semibold">{formatSol(task.budget)}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-muted">Client wallet</p>
            <p className="break-all font-mono text-xs">{task.client_wallet}</p>
            <Link href="/messages" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">Message client</Button>
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
