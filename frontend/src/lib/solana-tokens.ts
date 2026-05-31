/**
 * Static metadata for Solana tokens used across the invoice + payment flows.
 *
 * Solana SPL mints carry no on-chain human-readable symbol, so we maintain a
 * small curated map of well-known mints → display symbol. Anything not listed
 * falls back to a truncated mint address. A full token registry / Metaplex
 * metadata lookup is a deliberate follow-up (see report) — this keeps the MVP
 * dependency-free and avoids an extra network round-trip per holding.
 */

/** Native SOL has no mint address; this sentinel identifies it in selectors. */
export const SOL_SYMBOL = "SOL";

/**
 * Curated mint → symbol map covering both Devnet and Mainnet stablecoins so
 * labels render nicely regardless of the active cluster.
 */
export const KNOWN_MINTS: Record<string, string> = {
  // USDC
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC", // Mainnet
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU": "USDC", // Devnet (Circle)
  // USDT
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT", // Mainnet
};

/**
 * Static currency choices for the invoice *creation* form. The payer may use a
 * different wallet than the freelancer, so at authoring time we only record a
 * symbol; the actual on-chain mint is resolved from the payer's holdings at
 * payment time (see `useWalletTokens`).
 */
export const INVOICE_CURRENCY_OPTIONS = [SOL_SYMBOL, "USDC", "USDT"] as const;

/** Resolve a friendly symbol for a mint, falling back to a truncated address. */
export function symbolForMint(mint: string): string {
  return KNOWN_MINTS[mint] ?? `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}
