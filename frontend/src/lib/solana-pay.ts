import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import type { WalletAdapterProps } from "@solana/wallet-adapter-base";

interface SendSolPaymentParams {
  connection: Connection;
  /** Connected wallet acting as the payer / fee payer. */
  payer: PublicKey;
  /** Base58 recipient wallet address (the freelancer being paid). */
  recipient: string;
  /** Amount to transfer, denominated in SOL. */
  amountSol: number;
  /** Wallet-adapter transaction sender (prompts the user to sign). */
  sendTransaction: WalletAdapterProps["sendTransaction"];
}

/**
 * Build, sign and confirm a native SOL transfer from the connected wallet to
 * the recipient, returning the confirmed transaction signature.
 *
 * Native SOL is used for settlement on Devnet to keep the MVP custody-free —
 * funds move directly between the client and freelancer wallets with no
 * intermediary program.
 */
export async function sendSolPayment({
  connection,
  payer,
  recipient,
  amountSol,
  sendTransaction,
}: SendSolPaymentParams): Promise<string> {
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
  if (!Number.isFinite(lamports) || lamports <= 0) {
    throw new Error("Invalid payment amount");
  }

  let recipientKey: PublicKey;
  try {
    recipientKey = new PublicKey(recipient);
  } catch {
    throw new Error("Invalid recipient wallet address");
  }

  // A recent blockhash + last valid block height bounds how long the
  // transaction is replayable, which the confirmation strategy relies on.
  // We request the blockhash at "confirmed" commitment (fresher than the
  // default "finalized"), which maximises the validity window and reduces
  // spurious "block height exceeded" expiries while the user is signing.
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const transaction = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipientKey,
      lamports,
    }),
  );

  const signature = await sendTransaction(transaction, connection);

  // Use a manual polling strategy instead of `connection.confirmTransaction`.
  // The built-in helper throws a raw `TransactionExpiredBlockheightExceededError`
  // the moment the blockhash window passes — even though the transaction has
  // frequently already landed on Devnet. Polling the signature status lets us
  // detect that success and only fail with a friendly message when the
  // transaction genuinely never confirmed.
  await confirmSignature(connection, signature, lastValidBlockHeight);

  return signature;
}

interface SendSplTokenPaymentParams {
  connection: Connection;
  /** Connected wallet acting as the payer / fee payer. */
  payer: PublicKey;
  /** Base58 recipient wallet address (the freelancer being paid). */
  recipient: string;
  /** Base58 mint address of the SPL token being transferred. */
  mint: string;
  /** Amount to transfer, expressed in the token's UI units (e.g. 10.5 USDC). */
  amountUi: number;
  /** Token decimals — required to scale `amountUi` and verify the transfer. */
  decimals: number;
  /** Wallet-adapter transaction sender (prompts the user to sign). */
  sendTransaction: WalletAdapterProps["sendTransaction"];
}

/**
 * Build, sign and confirm an SPL token transfer (e.g. USDC) from the connected
 * wallet to the recipient, returning the confirmed transaction signature.
 *
 * SPL transfers move tokens between *associated token accounts* (ATAs) rather
 * than wallet addresses directly, so this:
 *   1. Derives the deterministic ATA for both payer and recipient.
 *   2. Creates the recipient ATA on the fly (payer-funded) when it doesn't yet
 *      exist — without it the transfer instruction would fail. This is the
 *      common case the first time a freelancer receives a given token.
 *   3. Uses `transferChecked` (vs `transfer`) so the on-chain program validates
 *      the mint + decimals, guarding against silent precision mismatches.
 */
export async function sendSplTokenPayment({
  connection,
  payer,
  recipient,
  mint,
  amountUi,
  decimals,
  sendTransaction,
}: SendSplTokenPaymentParams): Promise<string> {
  if (!Number.isFinite(amountUi) || amountUi <= 0) {
    throw new Error("Invalid payment amount");
  }

  let recipientKey: PublicKey;
  let mintKey: PublicKey;
  try {
    recipientKey = new PublicKey(recipient);
  } catch {
    throw new Error("Invalid recipient wallet address");
  }
  try {
    mintKey = new PublicKey(mint);
  } catch {
    throw new Error("Invalid token mint address");
  }

  // Convert the UI amount to the token's smallest integer unit using BigInt to
  // avoid float drift (e.g. 0.1 * 1e6 must be exactly 100000). We scale via a
  // fixed-point string so fractional inputs survive without rounding error.
  const rawAmount = uiAmountToBaseUnits(amountUi, decimals);
  if (rawAmount <= BigInt(0)) {
    throw new Error("Invalid payment amount");
  }

  const senderAta = await getAssociatedTokenAddress(mintKey, payer);
  const recipientAta = await getAssociatedTokenAddress(mintKey, recipientKey);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const transaction = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  });

  // The recipient ATA must exist before tokens can land in it. Probe for it and
  // prepend a (payer-funded) creation instruction when absent. A missing/closed
  // account surfaces as one of these typed errors; anything else is rethrown.
  let recipientAtaExists = true;
  try {
    await getAccount(connection, recipientAta);
  } catch (err) {
    if (
      err instanceof TokenAccountNotFoundError ||
      err instanceof TokenInvalidAccountOwnerError
    ) {
      recipientAtaExists = false;
    } else {
      throw err;
    }
  }

  if (!recipientAtaExists) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer, // funds the rent for the new account
        recipientAta,
        recipientKey, // owner of the new ATA
        mintKey,
      ),
    );
  }

  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      mintKey,
      recipientAta,
      payer, // authority over the sender ATA
      rawAmount,
      decimals,
    ),
  );

  const signature = await sendTransaction(transaction, connection);

  // Reuse the same resilient polling strategy as the SOL path so SPL transfers
  // don't regress on the "block height exceeded" false-negative.
  await confirmSignature(connection, signature, lastValidBlockHeight);

  return signature;
}

/**
 * Convert a UI token amount to its integer base-unit representation as a BigInt.
 * Done via fixed-point string parsing (not `amount * 10**decimals`) so we never
 * introduce IEEE-754 float drift on values like 0.1 or 1234.567.
 */
function uiAmountToBaseUnits(amountUi: number, decimals: number): bigint {
  const [whole, fraction = ""] = amountUi.toFixed(decimals).split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const scale = BigInt(10) ** BigInt(decimals);
  return BigInt(whole) * scale + BigInt(paddedFraction || "0");
}

/**
 * Poll a transaction signature until it is confirmed/finalized, fails on-chain,
 * or its blockhash validity window elapses. Resolves on success; throws a
 * human-readable error otherwise.
 */
async function confirmSignature(
  connection: Connection,
  signature: string,
  lastValidBlockHeight: number,
): Promise<void> {
  // Poll roughly every 1.5s; Devnet typically confirms within a few seconds.
  const POLL_INTERVAL_MS = 1500;

  for (;;) {
    const { value } = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });

    if (value) {
      if (value.err) {
        throw new Error("Payment failed on-chain. No funds were transferred.");
      }
      if (
        value.confirmationStatus === "confirmed" ||
        value.confirmationStatus === "finalized"
      ) {
        return;
      }
    }

    // Once the network passes the last valid block height, the blockhash can no
    // longer be included. Do one final status check (the tx may have landed in
    // the same window) before declaring the payment expired.
    const blockHeight = await connection.getBlockHeight("confirmed");
    if (blockHeight > lastValidBlockHeight) {
      const finalStatus = await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });
      if (finalStatus.value && !finalStatus.value.err) return;
      throw new Error(
        "Payment expired before it could be confirmed. Please check your wallet and try again.",
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

/** Build a Solana Explorer URL for a transaction signature on the given cluster. */
export function explorerTxUrl(signature: string, cluster = "devnet"): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}
