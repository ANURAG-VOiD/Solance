import { Shield, MessageCircle, Zap } from "lucide-react";
import { Card } from "@/components/shared/ui/Card";

const VALUES = [
  { icon: Shield, title: "Wallet-based identity", description: "Cryptographic sign-in replaces passwords. Your Solana wallet is your credential." },
  { icon: MessageCircle, title: "Direct communication", description: "Slack-style project channels keep clients and freelancers aligned in one workspace." },
  { icon: Zap, title: "Zero middle-man fees", description: "Settle invoices directly on Solana without platform escrow cuts." },
];

export function TrustMatrix() {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Trust Matrix</p>
        <h2 className="text-2xl font-semibold sm:text-3xl">Built for developers who ship</h2>
        <p className="mt-3 max-w-2xl text-text-muted">Structural values over marketing fluff. Every interaction is wallet-verified and settlement-ready.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition-colors hover:bg-surface-hover">
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
