"use client";

import { Wallet, Shield, Network } from "lucide-react";

import { Card } from "@/components/shared/ui/Card";
import { Badge } from "@/components/shared/ui/Badge";
import { truncateWallet } from "@/lib/utils";

interface SolanaPaymentSectionProps {
  clientWallet: string;
  freelancerWallet: string;
  amount: string;
  currency: string;
}

export function SolanaPaymentSection({
  clientWallet,
  freelancerWallet,
  amount,
  currency,
}: SolanaPaymentSectionProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-brand" />
        <h2 className="text-sm font-semibold">Pay with Solana</h2>
        <Badge variant="brand">Devnet</Badge>
      </div>

      <p className="mb-4 text-xs text-text-muted">
        Settlement is wallet-native. The client pays directly to your connected wallet — no intermediary custody.
      </p>

      <div className="space-y-3 rounded-md border border-border bg-void p-4 text-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-text-muted">Receiving wallet (you)</p>
            <p className="mt-0.5 font-mono text-text">{truncateWallet(freelancerWallet, 10)}</p>
          </div>
          <Shield className="h-4 w-4 shrink-0 text-success" aria-hidden />
        </div>
        <div>
          <p className="text-text-muted">Payer wallet (client)</p>
          <p className="mt-0.5 font-mono text-text">{truncateWallet(clientWallet, 10)}</p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-text-muted">
            <Network className="h-3.5 w-3.5" />
            Solana Devnet
          </span>
          <span className="font-semibold text-brand">
            {amount || "0"} {currency}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-text-muted">
        On-chain settlement UI will activate when the client authorizes payment from their wallet.
      </p>
    </Card>
  );
}
