import { ShieldCheck, Star, Wallet } from "lucide-react";
import { Card } from "@/components/shared/ui/Card";

/*
 * FeaturedTalent — anchored at #freelancers (navbar "Freelancers" link).
 * Until the live talent API ships, this presents the wallet-native trust model
 * for freelancers with representative, clearly-illustrative profile cards.
 */
const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Verified by signature",
    text: "Every freelancer authenticates by signing with their Solana wallet — identity you can trust.",
  },
  {
    icon: Star,
    title: "On-chain track record",
    text: "Completed projects and settled invoices build a transparent, portable reputation.",
  },
  {
    icon: Wallet,
    title: "Paid directly",
    text: "Freelancers receive payment straight to their wallet — no payout delays, no platform cut.",
  },
];

export function FeaturedTalent() {
  return (
    <section id="freelancers" className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          For Freelancers
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your wallet is your reputation
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="rounded-xl transition-colors hover:bg-surface-hover">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-void">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mb-2 text-sm font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
