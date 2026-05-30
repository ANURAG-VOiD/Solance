"use client";

import { Rocket, UserRound, Building2, ReceiptText, Boxes, Code2 } from "lucide-react";

import { DocsCard } from "@/components/docs/DocsCard";
import { DOCS_NAV } from "@/components/docs/docs-config";

const QUICK_ACTIONS = [
  { title: "Getting Started", description: "Understand Solance and the end-to-end workflow.", href: "/docs/getting-started", icon: Rocket },
  { title: "Freelancer Guide", description: "Profile, applications, invoices, and payouts.", href: "/docs/freelancers", icon: UserRound },
  { title: "Client Guide", description: "Post jobs, hire talent, and approve payments.", href: "/docs/clients", icon: Building2 },
  { title: "Invoices", description: "Create invoices and track them to paid.", href: "/docs/invoicing", icon: ReceiptText },
  { title: "Architecture", description: "How the stack fits together end to end.", href: "/docs/architecture", icon: Boxes },
  { title: "API Reference", description: "Authentication and resource endpoints.", href: "/docs/api-reference", icon: Code2 },
];

export default function DocsHomePage() {
  return (
    <div>
      <header className="mb-12 border-b border-border pb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Solance Docs
        </p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-text">
          Documentation
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-muted">
          Everything you need to understand, use, and build with Solance — the
          wallet-native freelancing platform on Solana.
        </p>
      </header>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Quick start
      </h2>
      <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <DocsCard key={action.href} {...action} />
        ))}
      </div>

      {DOCS_NAV.map((group) => (
        <section key={group.label} className="mb-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            {group.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <DocsCard
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
