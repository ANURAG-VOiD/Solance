"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

import { useAuth } from "@/context/AuthContext";
import { truncateWallet } from "@/lib/utils";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";

export function WalletStatus({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const { isAuthenticated, user, isSigningIn, error, signIn, signOut } = useAuth();

  if (connecting) {
    return <p className="text-sm text-text-muted" role="status">Connecting wallet…</p>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="rounded-lg border border-brand/30 bg-brand/10 p-5">
        <Badge variant="brand">Signed in</Badge>
        <p className="mt-2 font-mono text-lg">{truncateWallet(user.wallet_address)}</p>
        <p className="mt-1 text-xs text-text-muted">JWT session active</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm text-brand hover:underline">Open workspace →</Link>
        <Button variant="ghost" size="sm" className="mt-2" onClick={signOut}>Sign out</Button>
      </div>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5">
        <Badge variant="brand">Wallet connected</Badge>
        <p className="mt-2 font-mono text-lg">{truncateWallet(publicKey.toBase58())}</p>
        {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button onClick={() => signIn(callbackUrl)} disabled={isSigningIn}>
            {isSigningIn ? "Signing in…" : "Sign in with wallet"}
          </Button>
          <Button variant="ghost" onClick={() => disconnect()}>Disconnect</Button>
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-text-muted">
      Connect your Solana wallet to authenticate with a signed message.
    </p>
  );
}
