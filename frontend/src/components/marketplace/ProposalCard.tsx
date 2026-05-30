import Link from "next/link";
import type { Bid, Task } from "@/types";
import { formatSol, formatTimestamp, truncateWallet } from "@/lib/utils";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";

interface ProposalCardProps {
  bid: Bid;
  task: Task;
  showTask?: boolean;
  actions?: React.ReactNode;
}

function statusVariant(status: Bid["status"]) {
  if (status === "accepted") return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "warning" as const;
}

export function ProposalCard({
  bid,
  task,
  showTask = true,
  actions,
}: ProposalCardProps) {
  return (
    <article className="rounded-md border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {showTask && (
            <Link
              href={`/marketplace/${task.id}`}
              className="text-sm font-semibold text-text hover:text-accent"
            >
              {task.title}
            </Link>
          )}
          <p className="mt-1 font-mono text-xs text-text-muted">
            {truncateWallet(bid.freelancer_wallet)}
          </p>
          <p className="mt-2 text-sm text-text-muted">{bid.cover_letter}</p>
          <p className="mt-2 text-xs text-text-muted">
            Submitted {formatTimestamp(bid.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={statusVariant(bid.status)}>{bid.status}</Badge>
          <p className="text-sm font-semibold text-text">
            {formatSol(bid.proposed_amount)}
          </p>
          {actions}
        </div>
      </div>
    </article>
  );
}

export function ProposalActions({
  onViewProfile,
  onMessage,
  onHire,
  hiring,
}: {
  onViewProfile: () => void;
  onMessage: () => void;
  onHire: () => void;
  hiring?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" onClick={onViewProfile}>
        View profile
      </Button>
      <Button size="sm" variant="secondary" onClick={onMessage}>
        Message
      </Button>
      <Button size="sm" onClick={onHire} disabled={hiring}>
        {hiring ? "Hiring…" : "Hire"}
      </Button>
    </div>
  );
}
