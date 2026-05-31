"use client";

import { useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { Card } from "@/components/shared/ui/Card";
import { InvoicePreviewPanel } from "@/components/invoices/InvoicePreviewPanel";
import { SolanaPaymentSection } from "@/components/invoices/SolanaPaymentSection";
import { getInvoice, updateInvoiceStatus } from "@/services/invoices.service";
import type { Invoice } from "@/types";
import { formatSol, formatTimestamp, truncateWallet } from "@/lib/utils";
import { useAsyncData } from "@/hooks/useAsyncData";

function computeTotals(amount: string, taxPercent: string, discountPercent: string) {
  const subtotal = parseFloat(amount) || 0;
  const taxPct = parseFloat(taxPercent) || 0;
  const discPct = parseFloat(discountPercent) || 0;
  const taxAmount = subtotal * (taxPct / 100);
  const discountAmount = subtotal * (discPct / 100);
  const total = Math.max(0, subtotal + taxAmount - discountAmount);
  return { subtotal, taxAmount, discountAmount, total };
}

export function InvoiceDetailContent({ invoiceId }: { invoiceId: string }) {
  const query = useAsyncData(() => getInvoice(invoiceId), [invoiceId]);
  const [invoiceOverride, setInvoiceOverride] = useState<Invoice | null>(null);
  const invoice = invoiceOverride ?? query.data;

  // Persist the paid state once the on-chain transfer has confirmed. The
  // Solana transaction itself is executed inside `SolanaPaymentSection`.
  const handlePaid = async () => {
    if (!invoice) return;
    const updated = await updateInvoiceStatus(invoice.id, "paid");
    setInvoiceOverride(updated);
  };

  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState message={query.error} onRetry={query.reload} />;
  if (!invoice) return <ErrorState message="Invoice not found" />;

  const statusVariant =
    invoice.status === "paid"
      ? "success"
      : invoice.status === "pending"
        ? "warning"
        : "default";

  const client = {
    name: truncateWallet(invoice.receiver_wallet, 6),
    walletAddress: invoice.receiver_wallet,
    email: "",
    companyName: "",
    billingAddress: "",
  };

  const details = {
    invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
    issueDate: invoice.created_at.slice(0, 10),
    dueDate: "",
    currency: "SOL",
    amount: invoice.amount,
    taxPercent: "0",
    discountPercent: "0",
    notes: "",
    paymentTerms: "Net 14 — payment due upon milestone acceptance via Solana.",
    pricingType: "fixed" as const,
    milestonePercent: "100",
    lineItemDescription: "Professional services",
  };

  const calculations = computeTotals(
    details.amount,
    details.taxPercent,
    details.discountPercent,
  );

  return (
    <div>
      <PageHeader
        title="Invoice detail"
        description={`Created ${formatTimestamp(invoice.created_at)}`}
        actions={
          <Link href="/invoices">
            <Button variant="secondary" size="sm">All invoices</Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <Card className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs text-text-muted">Amount due</p>
              <p className="text-3xl font-semibold text-brand">{formatSol(invoice.amount)}</p>
            </div>
            <Badge variant={statusVariant}>{invoice.status}</Badge>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold">Parties</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">From (freelancer)</dt>
                <dd className="font-medium">{truncateWallet(invoice.sender_wallet)}</dd>
                <dd className="break-all font-mono text-xs text-text-muted">{invoice.sender_wallet}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Bill to (client)</dt>
                <dd className="font-medium">{client.name}</dd>
                {client.companyName && <dd className="text-text-muted">{client.companyName}</dd>}
                <dd className="break-all font-mono text-xs text-text-muted">{client.walletAddress}</dd>
                {client.email && <dd className="text-xs text-text-muted">{client.email}</dd>}
              </div>
            </dl>
          </Card>

          <SolanaPaymentSection
            clientWallet={client.walletAddress}
            freelancerWallet={invoice.sender_wallet}
            amount={calculations.total.toFixed(4)}
            currency={details.currency}
            payable={invoice.status === "pending"}
            onPaid={handlePaid}
          />
        </div>

        <div className="xl:col-span-5">
          <InvoicePreviewPanel
            meta={null}
            client={client}
            details={details}
            calculations={calculations}
            freelancerWallet={invoice.sender_wallet}
            freelancerName={truncateWallet(invoice.sender_wallet)}
            statusLabel={invoice.status}
            statusVariant={statusVariant}
          />
        </div>
      </div>
    </div>
  );
}
