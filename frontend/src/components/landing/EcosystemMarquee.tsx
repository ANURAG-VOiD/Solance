/*
 * EcosystemMarquee — seamless, GPU-friendly logo scroller.
 * Pure-CSS keyframes (see `.animate-marquee` in globals.css) translate the
 * track by -50% for a gap-free infinite loop; the list is rendered twice.
 * Edge fade is applied via a CSS mask gradient. Pauses on hover.
 *
 * Note: brands are rendered as wordmarks rather than remote <img> SVGs so the
 * marquee never shows a broken asset for ecosystem logos that lack a reliable
 * CDN source. The exact card styling + gradient-reveal hover are preserved.
 */

interface EcosystemLogo {
  name: string;
  from: string; // gradient start (hex)
  to: string; // gradient end (hex)
}

const LOGOS: EcosystemLogo[] = [
  { name: "Solana", from: "#9945ff", to: "#14f195" },
  { name: "Jupiter", from: "#f97316", to: "#22d3ee" },
  { name: "Helius", from: "#fb7185", to: "#f59e0b" },
  { name: "Anchor", from: "#2563eb", to: "#38bdf8" },
  { name: "Rust", from: "#b7410e", to: "#f59e0b" },
  { name: "Docker", from: "#2496ed", to: "#60a5fa" },
  { name: "PostgreSQL", from: "#336791", to: "#60a5fa" },
  { name: "TypeScript", from: "#2563eb", to: "#38bdf8" },
];

export function EcosystemMarquee() {
  return (
    <section className="mt-10 overflow-hidden" aria-label="Ecosystem">
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee items-center gap-6 px-3">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="group relative flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/60 bg-white shadow-sm transition-all hover:border-slate-300"
            >
              {/* Gradient reveal: scales/fades in on hover behind the wordmark. */}
              <div
                className="absolute inset-0 scale-150 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                style={{ backgroundImage: `linear-gradient(135deg, ${logo.from}, ${logo.to})` }}
                aria-hidden="true"
              />
              <span className="relative z-10 font-display text-lg font-semibold tracking-tight text-slate-700 transition-colors duration-300 group-hover:text-white">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
