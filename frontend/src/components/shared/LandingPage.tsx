"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { HeroSection } from "@/components/landing/HeroSection";
import { EcosystemMarquee } from "@/components/landing/EcosystemMarquee";
import { CoreValues } from "@/components/landing/TrustMatrix";
import { FeaturedTalent } from "@/components/landing/FeaturedTalent";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { WalletStatus } from "@/components/shared/WalletStatus";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { useAuth } from "@/context/AuthContext";

function LandingContent() {
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback") ?? "/dashboard";
  const { isAuthenticated, isLoading } = useAuth();

  // Forward only visitors who *arrive* already authenticated (returning users,
  // or those bounced here by the AuthGuard) to their destination. Sign-ins that
  // happen while on this page are redirected by AuthContext.signIn instead, so
  // we must not also force-navigate them here (it would skip onboarding).
  const arrivedAuthenticated = useRef<boolean | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (arrivedAuthenticated.current === null) {
      arrivedAuthenticated.current = isAuthenticated;
      if (isAuthenticated) {
        window.location.href = callback;
      }
    }
  }, [isLoading, isAuthenticated, callback]);

  return (
    <div className="min-h-screen bg-void pb-16 text-text">
      <main id="main-content">
        <HeroSection callbackUrl={callback} />
        <EcosystemMarquee />
        <CoreValues />
        <FeaturedTalent />
        <FeaturedJobs />
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-md px-6">
            <WalletStatus callbackUrl={callback} />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-solana">
              <span className="text-[10px] font-bold text-white">S</span>
            </div>
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} Solance · Wallet-native workspace
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs text-text-muted">
            <Link href="/docs" className="hover:text-text">Docs</Link>
            <a href="#" className="hover:text-text">Terms</a>
            <a href="#" className="hover:text-text">Privacy</a>
            <a href="https://github.com/ANURAG-VOiD/Solance" target="_blank" rel="noopener noreferrer" className="hover:text-text">GitHub</a>
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
