"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/ui/Card";
import { Input } from "@/components/shared/ui/Input";
import { Textarea } from "@/components/shared/ui/Textarea";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { EmptyState } from "@/components/shared/states/EmptyState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { useOpenTasks } from "@/hooks/useTasks";
import { createBid } from "@/services/tasks.service";
import { cn, formatSol, truncateWallet } from "@/lib/utils";

type BudgetFilter = "all" | "under5" | "5to15" | "over15";
const SKILL_OPTIONS = ["Rust", "Solana", "Anchor", "React", "PostgreSQL", "TypeScript"];

export function MarketplacePageContent() {
  const router = useRouter();
  const { data: tasks, isLoading, error, reload } = useOpenTasks();

  const [search, setSearch] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>("all");
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      const budget = parseFloat(task.budget);
      if (budgetFilter === "under5" && budget >= 5) return false;
      if (budgetFilter === "5to15" && (budget < 5 || budget > 15)) return false;
      if (budgetFilter === "over15" && budget <= 15) return false;
      if (search && !`${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (skillFilter && !`${task.title} ${task.description}`.toLowerCase().includes(skillFilter.toLowerCase())) return false;
      return true;
    });
  }, [tasks, search, budgetFilter, skillFilter]);

  const selected = filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setApplying(true);
    setApplyError(null);
    try {
      await createBid(selected.id, {
        cover_letter: coverLetter.trim(),
        proposed_amount: proposedAmount.trim(),
      });
      router.push("/applications");
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <PageHeader title="Browse Jobs" description="Marketplace feed with filters and inline applications" />

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-3">
          <Card>
            <h2 className="mb-3 text-sm font-semibold">Filters</h2>
            <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or keyword" />
            <div className="mt-4 space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Budget</p>
              {([["all", "All"], ["under5", "Under 5 SOL"], ["5to15", "5–15 SOL"], ["over15", "Over 15 SOL"]] as const).map(([v, l]) => (
                <button key={v} type="button" onClick={() => setBudgetFilter(v)} className={cn("block w-full rounded-md px-3 py-1.5 text-left text-sm", budgetFilter === v ? "bg-brand/15 text-brand" : "text-text-muted hover:bg-surface-hover")}>{l}</button>
              ))}
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Skills</p>
              <div className="flex flex-wrap gap-1">
                {SKILL_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setSkillFilter(skillFilter === s ? null : s)}>
                    <Badge variant={skillFilter === s ? "brand" : "default"}>{s}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </aside>

        <div className="lg:col-span-4">
          <Card className="p-0">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">Open Jobs ({filtered.length})</div>
            {isLoading && <LoadingState />}
            {error && <ErrorState message={error} onRetry={reload} />}
            {!isLoading && filtered.length === 0 && (
              <EmptyState title="No jobs match" description="Adjust filters or check back later." action={{ label: "Clear filters", onClick: () => { setSearch(""); setBudgetFilter("all"); setSkillFilter(null); } }} />
            )}
            <ul className="max-h-[640px] overflow-y-auto p-2">
              {filtered.map((task) => (
                <li key={task.id}>
                  <button type="button" onClick={() => setSelectedId(task.id)} className={cn("mb-1 w-full rounded-md px-3 py-3 text-left", selected?.id === task.id ? "bg-brand/15 ring-1 ring-brand/30" : "hover:bg-surface-hover")}>
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="mt-1 flex justify-between text-xs text-text-muted">
                      <span>{truncateWallet(task.client_wallet)}</span>
                      <span className="font-semibold text-brand">{formatSol(task.budget)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="lg:col-span-5">
          {selected ? (
            <Card>
              <h2 className="text-lg font-semibold">{selected.title}</h2>
              <p className="mt-1 text-sm text-text-muted">Posted by {truncateWallet(selected.client_wallet)}</p>
              <p className="mt-4 text-2xl font-semibold text-brand">{formatSol(selected.budget)}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">{selected.description}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/marketplace/${selected.id}`}><Button variant="secondary" size="sm">Full details</Button></Link>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="mb-4 text-sm font-semibold">Apply</h3>
                <form onSubmit={handleApply} className="space-y-4">
                  <Textarea label="Cover letter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} required />
                  <Input label="Proposed amount (SOL)" value={proposedAmount} onChange={(e) => setProposedAmount(e.target.value)} required />
                  {applyError && <p role="alert" className="text-sm text-danger">{applyError}</p>}
                  <Button type="submit" disabled={applying}>{applying ? "Submitting…" : "Submit application"}</Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="flex h-64 items-center justify-center text-sm text-text-muted">
              {isLoading
                ? "Loading jobs…"
                : filtered.length === 0
                  ? "No jobs match the current filters."
                  : "Select a job to view details and apply"}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
