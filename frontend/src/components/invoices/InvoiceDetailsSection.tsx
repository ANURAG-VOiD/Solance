"use client";

import type { FreelancerProject } from "@/types/invoice";
import type { InvoiceDetailsDraft, InvoicePricingType } from "@/types/invoice";
import { Card } from "@/components/shared/ui/Card";
import { Input } from "@/components/shared/ui/Input";
import { Textarea } from "@/components/shared/ui/Textarea";
import { Badge } from "@/components/shared/ui/Badge";
import { formatSol, formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InvoiceDetailsSectionProps {
  project: FreelancerProject | null;
  details: InvoiceDetailsDraft;
  onChange: (patch: Partial<InvoiceDetailsDraft>) => void;
  onPricingTypeChange: (type: InvoicePricingType) => void;
  onMilestoneChange: (percent: string) => void;
  calculations: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
  };
  errors: { amount?: string; dueDate?: string };
}

const PRICING_TYPES: { id: InvoicePricingType; label: string; desc: string }[] = [
  { id: "fixed", label: "Fixed price", desc: "Full agreed project amount" },
  { id: "milestone", label: "Milestone", desc: "Percentage of agreed budget" },
  { id: "custom", label: "Custom", desc: "Enter any amount manually" },
];

const MILESTONES = ["25", "50", "75", "100"];

export function InvoiceDetailsSection({
  project,
  details,
  onChange,
  onPricingTypeChange,
  onMilestoneChange,
  calculations,
  errors,
}: InvoiceDetailsSectionProps) {
  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold">Invoice details</h2>

      {project && (
        <div className="mb-4 rounded-md border border-border bg-void p-3 text-xs">
          <p className="font-medium">{project.task.title}</p>
          <p className="mt-1 line-clamp-2 text-text-muted">{project.task.description}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-text-muted">
            <span>Budget {formatSol(project.task.budget)}</span>
            <span>Agreed {formatSol(project.agreedAmount)}</span>
            <span>Started {formatTimestamp(project.task.created_at)}</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          Invoice type
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PRICING_TYPES.map(({ id, label, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => onPricingTypeChange(id)}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-xs transition-colors",
                details.pricingType === id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border hover:bg-surface-hover",
              )}
            >
              <p className="font-medium">{label}</p>
              <p className="mt-0.5 text-text-muted">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {details.pricingType === "milestone" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {MILESTONES.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onMilestoneChange(pct)}
            >
              <Badge variant={details.milestonePercent === pct ? "brand" : "default"}>
                {pct}%
              </Badge>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Invoice number"
          value={details.invoiceNumber}
          onChange={(e) => onChange({ invoiceNumber: e.target.value })}
        />
        <Input
          label="Currency"
          value={details.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
        />
        <Input
          label="Issue date"
          type="date"
          value={details.issueDate}
          onChange={(e) => onChange({ issueDate: e.target.value })}
        />
        <Input
          label="Due date"
          type="date"
          value={details.dueDate}
          onChange={(e) => onChange({ dueDate: e.target.value })}
          error={errors.dueDate}
        />
        <Input
          label="Amount"
          value={details.amount}
          onChange={(e) => onChange({ amount: e.target.value, pricingType: "custom" })}
          error={errors.amount}
          disabled={details.pricingType !== "custom"}
        />
        <Input
          label="Tax %"
          type="number"
          min="0"
          step="0.1"
          value={details.taxPercent}
          onChange={(e) => onChange({ taxPercent: e.target.value })}
        />
        <Input
          label="Discount %"
          type="number"
          min="0"
          step="0.1"
          value={details.discountPercent}
          onChange={(e) => onChange({ discountPercent: e.target.value })}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Line item / description"
          value={details.lineItemDescription}
          onChange={(e) => onChange({ lineItemDescription: e.target.value })}
          rows={3}
        />
      </div>
      <div className="mt-4">
        <Textarea
          label="Notes"
          value={details.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Additional context for the client"
        />
      </div>
      <div className="mt-4">
        <Input
          label="Payment terms"
          value={details.paymentTerms}
          onChange={(e) => onChange({ paymentTerms: e.target.value })}
        />
      </div>

      <div className="mt-6 rounded-md border border-border bg-void p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Live total
        </p>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Subtotal</dt>
            <dd>{calculations.subtotal.toFixed(4)} {details.currency}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Tax ({details.taxPercent}%)</dt>
            <dd>+{calculations.taxAmount.toFixed(4)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Discount ({details.discountPercent}%)</dt>
            <dd>-{calculations.discountAmount.toFixed(4)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total payable</dt>
            <dd className="text-brand">{calculations.total.toFixed(4)} {details.currency}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
