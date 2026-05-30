import { Star } from "lucide-react";
import { Badge } from "@/components/shared/ui/Badge";

const MOCK_TALENT = [
  {
    initials: "AK",
    name: "alexk.sol",
    title: "Full-Stack Solana Dev",
    skills: ["Rust", "Anchor", "React"],
    rating: 4.9,
    projects: 12,
    gradient: "from-brand to-amber-500",
  },
  {
    initials: "MN",
    name: "meera.sol",
    title: "Smart Contract Engineer",
    skills: ["Solana", "TypeScript", "Web3.js"],
    rating: 5.0,
    projects: 8,
    gradient: "from-accent-violet to-purple-400",
  },
  {
    initials: "JP",
    name: "jake_p.sol",
    title: "dApp Frontend Specialist",
    skills: ["Next.js", "Phantom", "NFTs"],
    rating: 4.8,
    projects: 21,
    gradient: "from-accent-teal to-emerald-400",
  },
];

export function FeaturedTalent() {
  return (
    <section id="talent" className="border-t border-border/60 py-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_50%,rgba(124,58,237,0.04),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center animate-slide-up">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Live Feed
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Featured Talent</h2>
          <p className="mt-3 text-text-muted">
            Top developers shipping on Solana.{" "}
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
              Live profiles coming soon
            </span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_TALENT.map(({ initials, name, title, skills, rating, projects, gradient }, i) => (
            <div
              key={name}
              className="animate-slide-up group relative rounded-xl border border-border/60 bg-surface-2 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/30"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Coming-soon overlay */}
              <div className="absolute inset-0 rounded-xl bg-void/40 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="rounded-full bg-surface-3 border border-border px-4 py-2 text-xs font-semibold text-text-muted">
                  Profile coming soon
                </span>
              </div>

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} font-bold text-white text-sm shadow-lg`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text truncate">{name}</p>
                  <p className="text-xs text-text-muted truncate">{title}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="text-xs font-semibold text-text">{rating}</span>
                    <span className="text-xs text-text-muted">· {projects} projects</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {skills.map((skill, si) => (
                  <Badge
                    key={skill}
                    variant={si === 0 ? "brand" : si === 1 ? "violet" : "teal"}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
