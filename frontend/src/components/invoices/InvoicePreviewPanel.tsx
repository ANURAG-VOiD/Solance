"use client";

import type { InvoiceClientDraft, InvoiceDetailsDraft, InvoiceDraftMeta } from "@/types/invoice";
import { Badge } from "@/components/shared/ui/Badge";
import { truncateWallet, formatTimestamp } from "@/lib/utils";

interface InvoicePreviewPanelProps {
  meta: Partial<InvoiceDraftMeta> | null;
  client: InvoiceClientDraft;
  details: InvoiceDetailsDraft;
  calculations: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
  };
  freelancerWallet: string;
  freelancerName: string;
  statusLabel?: string;
  statusVariant?: "default" | "brand" | "success" | "warning" | "accent";
}

export function InvoicePreviewPanel({
  meta,
  client,
  details,
  calculations,
  freelancerWallet,
  freelancerName,
  statusLabel = "Draft",
  statusVariant = "warning",
}: InvoicePreviewPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-surface shadow-sm lg:sticky lg:top-4">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
              Solance Invoice
            </p>
            <p className="mt-1 font-mono text-sm text-text-muted">
              {details.invoiceNumber || "—"}
            </p>
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
      </div>

      <div className="space-y-6 px-6 py-5 text-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              From
            </p>
            {/* Names may be a full base58 wallet (no profile title yet); break
                long unbroken strings so they wrap instead of overlapping. */}
            <p className="break-all font-medium">{freelancerName || "Freelancer"}</p>
            <p className="mt-0.5 font-mono text-xs text-text-muted">
              {truncateWallet(freelancerWallet, 8)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Bill to
            </p>
            <p className="break-all font-medium">{client.name || "Client"}</p>
            {client.companyName && (
              <p className="text-text-muted">{client.companyName}</p>
            )}
            <p className="mt-0.5 font-mono text-xs text-text-muted">
              {truncateWallet(client.walletAddress, 8)}
            </p>
            {client.email && (
              <p className="mt-1 text-xs text-text-muted">{client.email}</p>
            )}
          </div>
        </div>

        {meta?.projectTitle && (
          <div className="rounded-md border border-border bg-void p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Project
            </p>
            <p className="mt-1 font-medium">{meta.projectTitle}</p>
            {meta.projectDescription && (
              <p className="mt-1 line-clamp-3 text-xs text-text-muted">
                {meta.projectDescription}
              </p>
            )}
            {meta.projectStatus && (
              <Badge className="mt-2" variant="brand">{meta.projectStatus}</Badge>
            )}
          </div>
        )}

        <div>
          <div className="mb-2 grid grid-cols-1 gap-1 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted sm:grid-cols-12 sm:gap-2">
            <span className="sm:col-span-8">Description</span>
            <span className="sm:col-span-4 sm:text-right">Amount</span>
          </div>
          <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-12 sm:gap-2">
            <span className="text-text-muted sm:col-span-8">
              {details.lineItemDescription || "Professional services"}
            </span>
            <span className="font-medium sm:col-span-4 sm:text-right">
              {calculations.subtotal.toFixed(4)} {details.currency}
            </span>
          </div>
        </div>

        <dl className="space-y-1 border-t border-border pt-4 text-xs">
          <div className="flex justify-between text-text-muted">
            <dt>Tax ({details.taxPercent}%)</dt>
            <dd>+{calculations.taxAmount.toFixed(4)}</dd>
          </div>
          <div className="flex justify-between text-text-muted">
            <dt>Discount ({details.discountPercent}%)</dt>
            <dd>-{calculations.discountAmount.toFixed(4)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total due</dt>
            <dd className="text-brand">
              {calculations.total.toFixed(4)} {details.currency}
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 text-xs text-text-muted sm:grid-cols-2">
          <div>
            <p>Issue date</p>
            <p className="font-medium text-text">{details.issueDate || "—"}</p>
          </div>
          <div>
            <p>Due date</p>
            <p className="font-medium text-text">{details.dueDate || "—"}</p>
          </div>
        </div>

        {details.paymentTerms && (
          <p className="border-t border-border pt-4 text-xs text-text-muted">
            {details.paymentTerms}
          </p>
        )}

        {details.notes && (
          <p className="text-xs italic text-text-muted">{details.notes}</p>
        )}

        {meta?.projectStartDate && (
          <p className="text-[10px] text-text-muted">
            Project started {formatTimestamp(meta.projectStartDate)}
          </p>
        )}
      </div>
    </div>
  );
}
