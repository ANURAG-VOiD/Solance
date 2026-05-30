"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Briefcase, FileCheck2, UserPlus, ChevronRight } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";

interface HeroSectionProps {
  callbackUrl: string;
}

// Public landing navigation lives in the floating bottom navbar. Anchors keep
// first-time visitors on-page; "Docs" is the only external link.
const NAV_LINKS = [
  { label: "Jobs", href: "#jobs" },
  { label: "Freelancers", href: "#freelancers" },
  { label: "Invoices", href: "#features" },
];

/*
 * FloatingActivityCard — a soft white card that drifts subtly via Motion to
 * surface a real product event (job posted, application, invoice). The product
 * activity is the hero's supporting visual, layered over the background video.
 */
function FloatingActivityCard({
  className,
  delay,
  children,
}: {
  className?: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 7, delay, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute z-20 w-56 rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-[0_20px_50px_-15px_rgba(10,27,51,0.18)] backdrop-blur-sm ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection({ callbackUrl }: HeroSectionProps) {
  const router = useRouter();
  const { isAuthenticated, isSigningIn, signIn } = useAuth();
  const { connected } = useWalletConnectionStatus();
  const { setVisible } = useWalletModal();

  // Destination the visitor intends to reach once authenticated. Both hero CTAs
  // funnel through the same wallet flow but resolve to different routes.
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  // When the wallet connects after a CTA click, automatically continue into the
  // sign-message step so the whole flow is a single, uninterrupted action.
  useEffect(() => {
    if (connected && pendingDestination && !isAuthenticated && !isSigningIn) {
      const destination = pendingDestination;
      setPendingDestination(null);
      void signIn(destination);
    }
  }, [connected, pendingDestination, isAuthenticated, isSigningIn, signIn]);

  // Routes the visitor to the correct step of the wallet flow:
  // already signed in → go straight there; wallet connected → sign in;
  // otherwise open the wallet modal and resume once connected.
  function startWalletFlow(destination: string) {
    if (isAuthenticated) {
      router.push(destination);
    } else if (connected) {
      void signIn(destination);
    } else {
      setPendingDestination(destination);
      setVisible(true);
    }
  }

  return (
    <section className="px-4 pt-6 sm:px-6">
      <div className="relative mx-auto flex h-[600px] w-full max-w-[1400px] flex-col overflow-hidden rounded-[48px] border border-slate-200/50 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)]">
        {/* Background product video — no overlays, per design reference. */}
        <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full scale-105 object-cover transition-transform duration-1000"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"
          />
        </div>

        {/* Hero copy + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-20 flex flex-1 flex-col items-start px-8 pt-12 md:px-16 md:pt-16"
        >
          <h1 className="font-display text-[42px] font-medium leading-[1.05] tracking-tight text-[#0a1b33] md:text-[56px]">
            Work. Collaborate.
            <br />
            Get paid on-chain.
          </h1>

          <p className="mt-5 max-w-md font-sans text-[14px] leading-relaxed text-[#64748b] md:text-[15px]">
            Solance connects clients and freelancers through wallet-native identities,
            real-time collaboration, transparent invoicing, and instant Solana payments.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* Freelancers onboard into their profile (name, avatar, skills). */}
            <motion.button
              type="button"
              onClick={() => startWalletFlow("/profile")}
              disabled={isSigningIn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-[#0a152d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1e293b] disabled:opacity-60"
            >
              {isSigningIn ? "Signing in…" : "Start Freelancing"}
            </motion.button>
            {/* Clients sign in, complete onboarding if new, then reach the post-job form. */}
            <motion.button
              type="button"
              onClick={() => startWalletFlow("/jobs/new")}
              disabled={isSigningIn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-slate-200/80 bg-white px-6 py-3 text-sm font-semibold text-[#0a1b33] shadow-sm transition-colors hover:border-slate-300 disabled:opacity-60"
            >
              Post a Job
            </motion.button>
          </div>
        </motion.div>

        {/* Right-side floating product activity cards (md+). */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden md:block">
          <FloatingActivityCard delay={0.25} className="right-12 top-16">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#64748b]">
              <Briefcase className="h-3.5 w-3.5 text-[#0a1b33]" /> Client posted a job
            </div>
            <p className="mt-2 text-sm font-semibold text-[#0a1b33]">Rust Backend Developer</p>
            <p className="mt-1 text-xs text-[#64748b]">
              Budget: <span className="font-semibold text-[#0a1b33]">4 SOL</span>
            </p>
          </FloatingActivityCard>

          <FloatingActivityCard delay={1.0} className="right-24 top-1/2">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#64748b]">
              <UserPlus className="h-3.5 w-3.5 text-[#0a1b33]" /> Application received
            </div>
            <p className="mt-2 font-mono text-sm font-semibold text-[#0a1b33]">7xR…92K</p>
            <p className="mt-1 text-xs text-[#64748b]">Completed projects: 12</p>
          </FloatingActivityCard>

          <FloatingActivityCard delay={0.65} className="bottom-28 right-16">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#64748b]">
              <FileCheck2 className="h-3.5 w-3.5 text-[#16a34a]" /> Invoice paid
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0a1b33]">2.5 SOL</p>
              <span className="rounded-full bg-[#16a34a]/12 px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                Confirmed
              </span>
            </div>
          </FloatingActivityCard>
        </div>

        {/* Floating bottom navbar */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/40 bg-white/90 px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
          aria-label="Primary"
        >
          <Link
            href="/"
            aria-label="Solance home"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm"
          >
            <span className="text-sm font-bold text-gradient-solana">S</span>
          </Link>
          <div className="hidden items-center gap-1 px-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#0a1b33]"
              >
                {link.label}
              </a>
            ))}
            {/* Docs navigate client-side to the in-app documentation. */}
            <Link
              href="/docs"
              className="rounded-full px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#0a1b33]"
            >
              Docs
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="ml-1 inline-flex items-center gap-1 rounded-full border border-slate-200/60 bg-white px-5 py-2 text-[12px] font-semibold text-[#0a1b33] shadow-sm transition-all hover:border-slate-300"
          >
            Launch App
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.nav>
      </div>
    </section>
  );
}
