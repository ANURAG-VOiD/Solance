"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

import { ProjectMockup } from "@/components/landing/ProjectMockup";
import { Button } from "@/components/shared/ui/Button";
import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";

// Wallet button is client-only; render lazily to avoid SSR hydration mismatches.
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

interface HeroSectionProps {
  callbackUrl: string;
}

export function HeroSection({ callbackUrl }: HeroSectionProps) {
  const { isAuthenticated, isSigningIn, signIn } = useAuth();
  const { connected } = useWalletConnectionStatus();

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Calm depth: faint grid + a single soft top wash (no neon, no purple glow). */}
      <div className="bg-grid-faint absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,_black_30%,_transparent_75%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-12 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-solana" />
            Wallet-native freelancing on Solana
          </span>

          {/* Primary headline per brand spec — gradient reserved for one line only. */}
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Hire. Collaborate. Pay.
            <span className="mt-2 block text-gradient-solana">All from your wallet.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-muted">
            A premium workspace for posting work, messaging in real time, and settling
            invoices directly on-chain — no passwords, no middlemen.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <WalletMultiButton className="!h-11 !rounded-md !bg-brand !px-6 hover:!bg-brand-hover" />
            {connected && !isAuthenticated && (
              <Button size="lg" onClick={() => signIn(callbackUrl)} disabled={isSigningIn}>
                {isSigningIn ? "Signing in…" : "Sign in with wallet"}
              </Button>
            )}
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary">Open workspace</Button>
              </Link>
            )}
            <a href="#jobs">
              <Button size="lg" variant="secondary">Browse opportunities</Button>
            </a>
          </div>
        </div>

        {/* The product UI itself is the hero visual — centered as the centerpiece. */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 rounded-3xl bg-gradient-to-b from-brand/10 to-transparent blur-2xl" />
          <ProjectMockup />
        </div>
      </div>
    </section>
  );
}
