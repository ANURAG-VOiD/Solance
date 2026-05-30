"use client";

import { User, Wallet } from "lucide-react";

import type { InvoiceClientDraft } from "@/types/invoice";
import { Card } from "@/components/shared/ui/Card";
import { Input } from "@/components/shared/ui/Input";

interface ClientInfoCardProps {
  client: InvoiceClientDraft;
  onChange: (patch: Partial<InvoiceClientDraft>) => void;
  autoFilled?: boolean;
  error?: string;
}

export function ClientInfoCard({
  client,
  onChange,
  autoFilled,
  error,
}: ClientInfoCardProps) {
  return (
    <Card>
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-brand" />
          <h2 className="text-sm font-semibold">Client information</h2>
        </div>
        {autoFilled && (
          <span className="text-[10px] uppercase tracking-wider text-text-muted">
            Auto-filled from project
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Client name"
          value={client.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Client or company display name"
        />
        <Input
          label="Wallet address"
          value={client.walletAddress}
          onChange={(e) => onChange({ walletAddress: e.target.value })}
          error={error}
        />
        <Input
          label="Email"
          type="email"
          value={client.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="billing@company.com"
          hint="Optional — not stored on-chain"
        />
        <Input
          label="Company name"
          value={client.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <Input
          label="Billing address"
          value={client.billingAddress}
          onChange={(e) => onChange({ billingAddress: e.target.value })}
          placeholder="Street, city, country"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-void px-3 py-2 text-xs text-text-muted">
        <Wallet className="h-3.5 w-3.5 shrink-0 text-brand" />
        Payment will be sent to this wallet on Solana devnet.
      </div>
    </Card>
  );
}
