"use client";

import Link from "next/link";

import type { Invoice, InvoiceStatus } from "@/types";
import { formatSol, cn } from "@/lib/utils";

const KANBAN: { status: InvoiceStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "pending", label: "Pending" },
  { status: "paid", label: "Paid" },
  { status: "rejected", label: "Rejected" },
];

interface InvoiceKanbanProps {
  invoices: Invoice[];
}

export function InvoiceKanban({ invoices }: InvoiceKanbanProps) {
  const columnInvoices = (status: InvoiceStatus) =>
    invoices.filter(
      (inv) =>
        inv.status === status ||
        (status === "draft" && inv.status === "cancelled"),
    );

  if (invoices.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold">Invoice pipeline</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KANBAN.map(({ status, label }) => {
          const items = columnInvoices(status);
          return (
            <div
              key={status}
              className="rounded-md border border-border bg-surface p-3"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {label} ({items.length})
              </p>
              <ul className="space-y-2">
                {items.map((inv) => {
                  return (
                    <li key={inv.id}>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className={cn(
                          "block rounded-md border border-border bg-void px-2 py-2 transition-colors hover:border-brand/40 hover:bg-brand/5",
                        )}
                      >
                        <p className="text-xs font-semibold text-brand">
                          {formatSol(inv.amount)}
                        </p>
                        <p className="font-mono text-[10px] text-text-muted">
                          {inv.id.slice(0, 8)}…
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
