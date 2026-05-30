"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

import { fetchMe, requestNonce, verifySignature } from "@/lib/api";
import {
  clearSession,
  getSession,
  saveSession,
} from "@/lib/auth-storage";
import type { AuthSession } from "@/lib/types";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletStatus() {
  const { publicKey, connected, connecting, disconnect, signMessage } =
    useWallet();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getSession());
  }, []);

  const handleSignIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError("This wallet does not support message signing.");
      return;
    }

    setSigningIn(true);
    setError(null);

    try {
      const walletAddress = publicKey.toBase58();
      const { message } = await requestNonce(walletAddress);

      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      const { token, user } = await verifySignature({
        wallet_address: walletAddress,
        signature,
        message,
      });

      saveSession(token, user);
      setSession({ token, user });

      // Confirm JWT works against protected route
      await fetchMe();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
    } finally {
      setSigningIn(false);
    }
  }, [publicKey, signMessage]);

  const handleSignOut = useCallback(() => {
    clearSession();
    setSession(null);
    setError(null);
    disconnect();
  }, [disconnect]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
        <p className="text-sm text-zinc-400">Connecting wallet…</p>
      </div>
    );
  }

  if (session) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5">
        <p className="mb-1 text-xs uppercase tracking-widest text-emerald-300">
          Signed in
        </p>
        <p className="font-mono text-lg text-white" title={session.user.wallet_address}>
          {truncateAddress(session.user.wallet_address)}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          User ID: {session.user.id}
        </p>
        <p className="mt-1 text-xs text-emerald-400/80">
          JWT session active — protected API routes enabled
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (connected && publicKey) {
    const address = publicKey.toBase58();

    return (
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-5">
        <p className="mb-1 text-xs uppercase tracking-widest text-violet-300">
          Wallet connected
        </p>
        <p className="font-mono text-lg text-white" title={address}>
          {truncateAddress(address)}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-zinc-500">
          {address}
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={signingIn}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingIn ? "Signing in…" : "Sign in with wallet"}
        </button>

        <button
          type="button"
          onClick={() => disconnect()}
          className="ml-3 mt-4 text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-5">
      <p className="text-sm text-zinc-400">
        Connect your Solana wallet using the button above, then sign in to
        prove ownership and receive a session token.
      </p>
    </div>
  );
}
