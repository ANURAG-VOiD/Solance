"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { SOL_SYMBOL, symbolForMint } from "@/lib/solana-tokens";

/**
 * A single spendable holding in the connected wallet — either native SOL or an
 * SPL token. `balanceUi` is the human-readable amount (already scaled by
 * `decimals`); the raw integer amount is reconstructed at transfer time to
 * avoid carrying float-imprecise values around.
 */
export interface WalletHolding {
  kind: "sol" | "spl";
  /** Base58 mint address — undefined for native SOL. */
  mint?: string;
  symbol: string;
  balanceUi: number;
  decimals: number;
}

interface UseWalletTokensOptions {
  /**
   * Include holdings with a zero UI balance. Defaults to false so the selector
   * only offers tokens the payer can actually spend (SOL is always included).
   */
  includeZeroBalances?: boolean;
}

interface UseWalletTokensResult {
  holdings: WalletHolding[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Discover the connected wallet's spendable currencies: native SOL plus every
 * SPL token account it owns. Used to drive the payment token selector so users
 * can settle invoices in whatever they actually hold (SOL, USDC, …).
 *
 * Performance: fetches once per wallet/connection (and on explicit `reload`)
 * rather than polling, and memoizes the derived `holdings` list so consumers
 * don't re-render on unrelated state changes.
 */
export function useWalletTokens(
  options: UseWalletTokensOptions = {},
): UseWalletTokensResult {
  const { includeZeroBalances = false } = options;
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [holdings, setHoldings] = useState<WalletHolding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against state updates landing after the wallet disconnects or a
  // newer fetch supersedes this one (avoids cross-wallet balance bleed-through).
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!publicKey) {
      setHoldings([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch SOL balance and SPL token accounts in parallel to minimise the
      // perceived latency of populating the selector.
      const [lamports, tokenAccounts] = await Promise.all([
        connection.getBalance(publicKey),
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
      ]);

      // SOL is always offered first as the canonical settlement currency.
      const next: WalletHolding[] = [
        {
          kind: "sol",
          symbol: SOL_SYMBOL,
          balanceUi: lamports / LAMPORTS_PER_SOL,
          decimals: 9,
        },
      ];

      for (const { account } of tokenAccounts.value) {
        // The parsed account exposes mint + a pre-scaled `uiAmount`, so we don't
        // have to divide raw amounts by 10**decimals ourselves.
        const info = account.data.parsed?.info;
        const tokenAmount = info?.tokenAmount;
        if (!info?.mint || !tokenAmount) continue;

        const balanceUi = tokenAmount.uiAmount ?? 0;
        if (!includeZeroBalances && balanceUi <= 0) continue;

        next.push({
          kind: "spl",
          mint: info.mint,
          symbol: symbolForMint(info.mint),
          balanceUi,
          decimals: tokenAmount.decimals,
        });
      }

      // Ignore stale responses from a previous wallet/connection.
      if (requestId !== requestIdRef.current) return;
      setHoldings(next);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load wallet tokens");
      setHoldings([]);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [connection, publicKey, includeZeroBalances]);

  // Fetch on connect / mount and whenever the wallet or RPC connection changes.
  // Intentional fetch-on-mount: the resulting setState is the whole point of the
  // effect (synchronising React state with the on-chain balance).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return useMemo(
    () => ({ holdings, isLoading, error, reload: load }),
    [holdings, isLoading, error, load],
  );
}
