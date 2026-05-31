"use client";

import { useMemo, useState } from "react";
import { Wallet, Shield, Network, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Card } from "@/components/shared/ui/Card";
import { Badge } from "@/components/shared/ui/Badge";
import { Button } from "@/components/shared/ui/Button";
import { truncateWallet } from "@/lib/utils";
import { sendSolPayment, sendSplTokenPayment, explorerTxUrl } from "@/lib/solana-pay";
import { useWalletTokens, type WalletHolding } from "@/hooks/useWalletTokens";

interface SolanaPaymentSectionProps {
  clientWallet: string;
  freelancerWallet: string;
  amount: string;
  currency: string;
  /** Enables the on-chain "Pay now" action (e.g. an invoice awaiting payment). */
  payable?: boolean;
  /** Invoked with the confirmed signature once the transfer settles on-chain. */
  onPaid?: (signature: string) => void | Promise<void>;
}

/** Stable selector key for a holding: the mint for SPL tokens, "sol" for SOL. */
function holdingKey(holding: WalletHolding): string {
  return holding.kind === "sol" ? "sol" : (holding.mint ?? "sol");
}

export function SolanaPaymentSection({
  clientWallet,
  freelancerWallet,
  amount,
  currency,
  payable = false,
  onPaid,
}: SolanaPaymentSectionProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  // null → follow the auto-selected default; a key → an explicit user override.
  const [overrideKey, setOverrideKey] = useState<string | null>(null);

  const connectedWallet = publicKey?.toBase58() ?? null;
  // Only the client (the invoice payer) may authorize the transfer.
  const isClientConnected = connected && connectedWallet === clientWallet;

  // Discover the payer's spendable currencies once the client wallet connects.
  // We only fetch holdings when this section is actionable to avoid needless
  // RPC traffic on read-only invoice previews.
  const { holdings, isLoading, error: holdingsError, reload } = useWalletTokens();

  // Default to the holding whose symbol matches the invoice currency (when the
  // payer actually holds it); otherwise fall back to native SOL.
  const defaultKey = useMemo(() => {
    const match = holdings.find(
      (h) => h.symbol.toUpperCase() === currency.toUpperCase(),
    );
    if (match) return holdingKey(match);
    const sol = holdings.find((h) => h.kind === "sol");
    return sol ? holdingKey(sol) : null;
  }, [holdings, currency]);

  const selectedKey = overrideKey ?? defaultKey;
  const selectedHolding = useMemo(
    () => holdings.find((h) => holdingKey(h) === selectedKey) ?? null,
    [holdings, selectedKey],
  );

  const amountNum = parseFloat(amount) || 0;
  const insufficient =
    selectedHolding != null && amountNum > selectedHolding.balanceUi;

  const canPay =
    payable &&
    !signature &&
    isClientConnected &&
    selectedHolding != null &&
    amountNum > 0 &&
    !insufficient;

  const handlePay = async () => {
    if (!publicKey || !selectedHolding) return;
    setPaying(true);
    setError(null);
    try {
      // Route to the matching on-chain transfer for the selected currency.
      const sig =
        selectedHolding.kind === "sol"
          ? await sendSolPayment({
              connection,
              payer: publicKey,
              recipient: freelancerWallet,
              amountSol: amountNum,
              sendTransaction,
            })
          : await sendSplTokenPayment({
              connection,
              payer: publicKey,
              recipient: freelancerWallet,
              mint: selectedHolding.mint!,
              amountUi: amountNum,
              decimals: selectedHolding.decimals,
              sendTransaction,
            });
      setSignature(sig);
      // Let the parent persist the settled state (e.g. mark the invoice paid).
      await onPaid?.(sig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const selectedSymbol = selectedHolding?.symbol ?? currency;

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
            {amount || "0"} {selectedSymbol}
          </span>
        </div>
      </div>

      {payable ? (
        <div className="mt-4 space-y-3">
          {signature ? (
            <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-3 text-xs">
              <p className="font-semibold text-success">Payment confirmed on-chain</p>
              <a
                href={explorerTxUrl(signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-brand hover:underline"
              >
                {truncateWallet(signature, 8)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <>
              {/* Token selector driven by the payer's actual wallet holdings. */}
              {isClientConnected && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="payment-token"
                      className="block text-sm font-medium text-text"
                    >
                      Pay with
                    </label>
                    <button
                      type="button"
                      onClick={reload}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </button>
                  </div>
                  <select
                    id="payment-token"
                    value={selectedKey ?? ""}
                    onChange={(e) => setOverrideKey(e.target.value)}
                    disabled={isLoading || holdings.length === 0}
                    className="h-9 w-full rounded-md border border-border bg-void px-3 text-sm text-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
                  >
                    {holdings.map((h) => (
                      <option key={holdingKey(h)} value={holdingKey(h)}>
                        {h.symbol} — {h.balanceUi.toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}{" "}
                        available
                      </option>
                    ))}
                  </select>
                  {selectedHolding && (
                    <p className="text-xs text-text-muted">
                      Balance:{" "}
                      <span className="font-mono text-text">
                        {selectedHolding.balanceUi.toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}{" "}
                        {selectedHolding.symbol}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handlePay}
                disabled={!canPay || paying}
                size="lg"
                className="w-full sm:w-auto"
              >
                {paying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming on-chain…
                  </span>
                ) : (
                  `Pay ${amount || "0"} ${selectedSymbol}`
                )}
              </Button>

              {!isClientConnected && (
                <p className="text-xs text-text-muted">
                  Connect the client wallet{" "}
                  <span className="font-mono">{truncateWallet(clientWallet, 6)}</span>{" "}
                  to authorize this payment.
                </p>
              )}
              {isClientConnected && isLoading && (
                <p className="text-xs text-text-muted">Loading wallet balances…</p>
              )}
              {isClientConnected && insufficient && selectedHolding && (
                <p className="text-xs text-danger">
                  Insufficient {selectedHolding.symbol} balance. You need{" "}
                  {amountNum.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                  but hold{" "}
                  {selectedHolding.balanceUi.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                  .
                </p>
              )}
              {holdingsError && (
                <p className="text-xs text-text-muted">
                  Could not load wallet balances. {holdingsError}
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs text-danger">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[10px] text-text-muted">
          On-chain settlement UI will activate when the client authorizes payment from their wallet.
        </p>
      )}
    </Card>
  );
}
