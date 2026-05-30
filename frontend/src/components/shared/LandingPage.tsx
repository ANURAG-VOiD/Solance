"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Zap, ExternalLink } from "lucide-react";

import { HeroSection } from "@/components/landing/HeroSection";
import { TrustMatrix } from "@/components/landing/TrustMatrix";
import { FeaturedTalent } from "@/components/landing/FeaturedTalent";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { WalletStatus } from "@/components/shared/WalletStatus";
import { LoadingState } from "@/components/shared/states/LoadingState";
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
      {/* Sticky frosted nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-hover shadow-lg shadow-brand/30 group-hover:shadow-brand/50 transition-shadow duration-200">
              <Zap className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight">Solance</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Public">
            {[
              { label: "Talent",    href: "#talent" },
              { label: "Jobs",      href: "#jobs" },
              { label: "Workspace", href: "/dashboard" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-text-muted hover:text-text transition-colors duration-150 font-medium"
              >
                {label}
              </a>
            ))}
          </nav>

          <WalletMultiButton className="!h-9 !rounded-lg !bg-gradient-to-r !from-brand !to-brand-hover !font-semibold hover:!shadow-brand/30 hover:!shadow-lg" />
        </div>

        {/* Mobile sub-nav */}
        <div className="mx-auto flex max-w-7xl items-center gap-4 border-t border-border/40 px-5 py-2 text-xs text-text-muted md:hidden">
          <a href="#talent" className="hover:text-text transition-colors">Talent</a>
          <a href="#jobs" className="hover:text-text transition-colors">Jobs</a>
          <Link href="/dashboard" className="hover:text-text transition-colors">Workspace</Link>
        </div>
      </header>

      <main id="main-content">
        <HeroSection callbackUrl={callback} />
        <TrustMatrix />
        <FeaturedTalent />
        <FeaturedJobs />

        {/* Wallet CTA section */}
        <section className="border-t border-border/60 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,107,0,0.04),transparent)]" />
          <div className="relative mx-auto max-w-md px-6">
            <WalletStatus callbackUrl={callback} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-hover">
                <Zap className="h-3 w-3 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold">Solance</span>
              <span className="text-xs text-text-subtle">· Wallet-native developer workspace</span>
            </div>
            <div className="flex flex-wrap gap-5 text-xs text-text-muted">
              <span className="hover:text-text cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-text cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-text cursor-pointer transition-colors">Privacy</span>
              <a
                href="https://github.com"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors flex items-center gap-1"
              >
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-text-subtle">
            © {new Date().getFullYear()} Solance. Built on Solana.
          </p>
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
