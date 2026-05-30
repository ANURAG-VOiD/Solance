import { Wallet, MessagesSquare, ReceiptText } from "lucide-react";
import { Card } from "@/components/shared/ui/Card";

/*
 * CoreValues — the three pillars of Solance, stated plainly (no buzzwords).
 * Anchored at #features so the navbar "Invoices" link lands on the
 * On-Chain Invoicing pillar.
 */
const VALUES = [
  {
    icon: Wallet,
    title: "Wallet-Native Identity",
    description: "Your wallet becomes your account. No usernames, no passwords.",
  },
  {
    icon: MessagesSquare,
    title: "Real-Time Collaboration",
    description: "Integrated chat between clients and freelancers.",
  },
  {
    icon: ReceiptText,
    title: "On-Chain Invoicing",
    description: "Create invoices and receive transparent Solana payments.",
  },
];

export function CoreValues() {
  return (
    <section id="features" className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Why Solance
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Everything you need to hire and get paid
        </h2>
        <p className="mt-3 max-w-2xl text-text-muted">
          Built around your wallet — from first message to final payment.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="rounded-xl transition-colors hover:bg-surface-hover">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-void">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mb-2 text-sm font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
