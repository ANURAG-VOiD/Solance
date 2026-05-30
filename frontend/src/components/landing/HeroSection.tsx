"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

import { ProjectMockup } from "@/components/landing/ProjectMockup";
import { Button } from "@/components/shared/ui/Button";
import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

const STATS = [
  { value: "1,200+", label: "Developers" },
  { value: "340+",   label: "Projects" },
  { value: "8,900",  label: "SOL Settled" },
];

interface HeroSectionProps {
  callbackUrl: string;
}

export function HeroSection({ callbackUrl }: HeroSectionProps) {
  const { isAuthenticated, isSigningIn, signIn } = useAuth();
  const { connected } = useWalletConnectionStatus();

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Multi-layer gradient mesh */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent-violet/8 blur-3xl" />
        <div className="absolute top-1/4 -right-16 h-80 w-80 rounded-full bg-brand/8 blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 h-64 w-64 rounded-full bg-accent-teal/6 blur-3xl" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
        {/* Left — Copy */}
        <div className="animate-slide-up">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-dot-pulse" />
            <span className="text-xs font-semibold tracking-wide text-brand">
              Solance · Wallet-native freelancing
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="gradient-text-hero block">Work. Collaborate.</span>
            <span className="gradient-text block mt-1">Get Paid.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-muted">
            A structured developer workspace for hiring, messaging, and settling invoices directly on Solana.{" "}
            <span className="text-text">No middlemen.</span>
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <WalletMultiButton className="!h-11 !rounded-xl !bg-gradient-to-r !from-brand !to-brand-hover !px-6 !font-semibold !text-sm hover:!shadow-xl hover:!shadow-brand/30" />

            {connected && !isAuthenticated && (
              <Button size="lg" onClick={() => signIn(callbackUrl)} isLoading={isSigningIn}>
                Sign In with Wallet
              </Button>
            )}
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary">Open Workspace</Button>
              </Link>
            )}
            <a href="#jobs">
              <Button size="lg" variant="glass">Browse Opportunities</Button>
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap gap-6 border-t border-border/50 pt-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-xl font-bold text-text">{value}</p>
                <p className="text-xs text-text-muted font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Mockup */}
        <div className="hidden animate-slide-up animate-delay-200 lg:block">
          <div className="animate-float">
            <ProjectMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
