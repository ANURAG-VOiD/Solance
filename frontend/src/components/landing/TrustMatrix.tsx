import { Shield, MessageCircle, Zap } from "lucide-react";

const VALUES = [
  {
    icon: Shield,
    title: "Wallet-based identity",
    description: "Cryptographic sign-in replaces passwords. Your Solana wallet is your credential.",
    accent: "brand" as const,
    delay: 0,
  },
  {
    icon: MessageCircle,
    title: "Direct communication",
    description: "Slack-style project channels keep clients and freelancers aligned in one workspace.",
    accent: "violet" as const,
    delay: 100,
  },
  {
    icon: Zap,
    title: "Zero middle-man fees",
    description: "Settle invoices directly on Solana without platform escrow cuts.",
    accent: "teal" as const,
    delay: 200,
  },
];

const accentMap = {
  brand: {
    iconBg:   "bg-brand/15",
    iconText: "text-brand",
    iconRing: "ring-brand/20",
    glow:     "hover:shadow-brand/10",
    border:   "hover:border-brand/30",
  },
  violet: {
    iconBg:   "bg-accent-violet/15",
    iconText: "text-accent-violet",
    iconRing: "ring-accent-violet/20",
    glow:     "hover:shadow-accent-violet/10",
    border:   "hover:border-accent-violet/30",
  },
  teal: {
    iconBg:   "bg-accent-teal/15",
    iconText: "text-accent-teal",
    iconRing: "ring-accent-teal/20",
    glow:     "hover:shadow-teal-500/10",
    border:   "hover:border-accent-teal/30",
  },
};

export function TrustMatrix() {
  return (
    <section className="relative border-b border-border/60 py-24 overflow-hidden">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(124,58,237,0.04),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-14 animate-slide-up">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Trust Matrix
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for developers who ship
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-text-muted leading-relaxed">
            Structural values over marketing fluff. Every interaction is wallet-verified and settlement-ready.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description, accent, delay }) => {
            const a = accentMap[accent];
            return (
              <div
                key={title}
                className={`animate-slide-up animate-delay-${delay} group relative rounded-xl border border-border/60 bg-surface-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${a.glow} ${a.border}`}
                style={{ animationDelay: `${delay}ms` }}
              >
                {/* Ambient top glow */}
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${a.iconBg}`} />

                <div className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${a.iconBg} ${a.iconRing}`}>
                  <Icon className={`h-5 w-5 ${a.iconText}`} aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold text-text">{title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
