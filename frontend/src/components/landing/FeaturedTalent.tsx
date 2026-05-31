"use client";

import { ShieldCheck, Star, Wallet } from "lucide-react";

import { Card } from "@/components/shared/ui/Card";
import { Badge } from "@/components/shared/ui/Badge";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listTalent } from "@/services/users.service";
import { truncateWallet } from "@/lib/utils";

/*
 * FeaturedTalent — anchored at #freelancers (navbar "Freelancers" link).
 * Surfaces real freelancers (users who have completed a public profile) from
 * `GET /api/users/talent`. While the network is empty (e.g. fresh deployment),
 * it falls back to the wallet-native trust highlights so the section never
 * renders blank.
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
  // Show up to 6 live profiles; the backend already caps and orders the result.
  const { data, isLoading } = useAsyncData(
    async () => (await listTalent()).slice(0, 6),
    [],
  );

  const talent = data ?? [];
  const hasTalent = !isLoading && talent.length > 0;

  return (
    <section id="freelancers" className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          For Freelancers
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {hasTalent ? "Talent building on Solance" : "Your wallet is your reputation"}
        </h2>

        {hasTalent ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {talent.map((freelancer) => (
              <Card
                key={freelancer.id}
                className="rounded-xl transition-colors hover:bg-surface-hover"
              >
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  <span className="font-mono text-xs text-text-muted">
                    {truncateWallet(freelancer.wallet_address, 4)}
                  </span>
                </div>
                <h3 className="mb-1 text-sm font-semibold">
                  {freelancer.title ?? "Solance freelancer"}
                </h3>
                {freelancer.bio && (
                  <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {freelancer.bio}
                  </p>
                )}
                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {freelancer.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
