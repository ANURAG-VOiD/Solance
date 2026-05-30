"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import { HeroSection } from "@/components/landing/HeroSection";
import { TrustMatrix } from "@/components/landing/TrustMatrix";
import { FeaturedTalent } from "@/components/landing/FeaturedTalent";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { WalletStatus } from "@/components/shared/WalletStatus";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { Button } from "@/components/shared/ui/Button";
import { useAuth } from "@/context/AuthContext";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

function LandingContent() {
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback") ?? "/dashboard";
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = callback;
    }
  }, [isAuthenticated, callback]);

  return (
    <div className="min-h-screen bg-void text-text">
      <header className="sticky top-0 z-50 border-b border-border bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-solana">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Solance</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Public">
            <Link href="/marketplace" className="text-text-muted transition-colors hover:text-text">Marketplace</Link>
            <a href="#jobs" className="text-text-muted transition-colors hover:text-text">Jobs</a>
            <a
              href="https://github.com/solance"
              rel="noopener noreferrer"
              target="_blank"
              className="text-text-muted transition-colors hover:text-text"
            >
              Docs
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden sm:block">
              <Button variant="secondary" size="sm">Launch app</Button>
            </Link>
            <WalletMultiButton className="!h-9 !rounded-md !bg-brand hover:!bg-brand-hover" />
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl items-center gap-4 border-t border-border px-4 py-2 text-xs text-text-muted md:hidden">
          <Link href="/marketplace" className="hover:text-text">Marketplace</Link>
          <a href="#jobs" className="hover:text-text">Jobs</a>
          <a href="https://github.com/solance" rel="noopener noreferrer" target="_blank" className="hover:text-text">Docs</a>
          <Link href="/dashboard" className="hover:text-text">Launch app</Link>
        </div>
      </header>

      <main id="main-content">
        <HeroSection callbackUrl={callback} />
        <TrustMatrix />
        <FeaturedTalent />
        <FeaturedJobs />
        <section className="border-t border-border py-12">
          <div className="mx-auto max-w-md px-6">
            <WalletStatus callbackUrl={callback} />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-solana">
              <span className="text-[10px] font-bold text-white">S</span>
            </div>
            <p className="text-xs text-text-muted">© {new Date().getFullYear()} Solance · Wallet-native workspace</p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs text-text-muted">
            <a href="https://github.com/solance" target="_blank" rel="noopener noreferrer" className="hover:text-text">Docs</a>
            <a href="#" className="hover:text-text">Terms</a>
            <a href="#" className="hover:text-text">Privacy</a>
            <a href="https://github.com/solance" target="_blank" rel="noopener noreferrer" className="hover:text-text">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LandingPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <LandingContent />
    </Suspense>
  );
}
