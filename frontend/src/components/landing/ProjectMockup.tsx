import { Badge } from "@/components/shared/ui/Badge";

export function ProjectMockup() {
  return (
    <div className="relative">
      {/* Outer glow ring */}
      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-brand/15 via-accent-violet/10 to-accent-teal/10 blur-xl opacity-70" />

      <div className="relative rounded-2xl border border-border/70 bg-surface overflow-hidden shadow-2xl shadow-black/60 gradient-border">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-surface-3 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-3 flex-1 rounded bg-surface px-3 py-1 text-[10px] font-mono text-text-muted">
            solance://workspace/project-alpha
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-12 min-h-[260px]">
          {/* Sidebar channels */}
          <div className="col-span-3 border-r border-border/60 p-3 bg-surface-2">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-text-subtle px-2">
              Channels
            </p>
            {[
              { ch: "# project-alpha", active: true },
              { ch: "# milestone-2",   active: false },
              { ch: "# general",       active: false },
            ].map(({ ch, active }) => (
              <div
                key={ch}
                className={`mb-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "bg-brand/15 text-brand"
                    : "text-text-subtle hover:text-text-muted"
                }`}
              >
                {ch}
              </div>
            ))}

            <p className="mt-4 mb-2 text-[9px] font-bold uppercase tracking-widest text-text-subtle px-2">
              Team
            </p>
            {["dev.sol", "client.sol"].map((member) => (
              <div key={member} className="mb-0.5 flex items-center gap-1.5 rounded px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="text-[10px] text-text-muted">{member}</span>
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="col-span-6 p-4">
            <p className="mb-3 text-[11px] font-bold tracking-tight">
              Project Alpha — Sprint Board
            </p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { col: "Backlog",     items: ["Design review"], color: "text-text-subtle" },
                { col: "In Progress", items: ["Anchor audit"],  color: "text-brand" },
                { col: "Done",        items: ["Wallet auth"],   color: "text-success" },
              ].map(({ col, items, color }) => (
                <div key={col} className="rounded-lg border border-border/60 bg-surface-3 p-2">
                  <p className={`mb-2 text-[9px] font-semibold uppercase ${color}`}>{col}</p>
                  {items.map((item) => (
                    <div
                      key={item}
                      className="rounded border border-border/50 bg-surface px-1.5 py-1 text-[9px] text-text-muted"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Chat preview */}
            <div className="rounded-lg border border-border/60 bg-surface-3 p-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-text-subtle">
                Messages
              </p>
              <div className="space-y-1.5 text-[10px]">
                <p>
                  <span className="font-semibold text-brand">dev.sol</span>
                  <span className="ml-1.5 text-text-muted">Milestone specs uploaded.</span>
                </p>
                <p>
                  <span className="font-semibold text-accent-teal">client.sol</span>
                  <span className="ml-1.5 text-text-muted">Running integration tests.</span>
                </p>
                <p>
                  <span className="font-semibold text-brand">dev.sol</span>
                  <span className="ml-1.5 text-text-muted">Ready for review</span>
                  <span className="animate-blink text-text ml-0.5">▊</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="col-span-3 border-l border-border/60 p-3 bg-surface-2">
            <Badge variant="success" className="mb-3 w-full justify-center text-[9px]">
              ✓ Invoice Paid · 15 SOL
            </Badge>

            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-text-subtle">
              Milestones
            </p>
            {[
              { label: "Auth module",     done: true },
              { label: "Marketplace API", done: true },
              { label: "Frontend shell",  done: false },
            ].map(({ label, done }) => (
              <div key={label} className="mb-1.5 flex items-center gap-2 text-[9px]">
                <span className={`h-2 w-2 rounded-full ${done ? "bg-success" : "bg-border"}`} />
                <span className={done ? "text-text-muted line-through" : "text-text-muted"}>
                  {label}
                </span>
              </div>
            ))}

            <div className="mt-3 rounded-lg border border-border/60 bg-surface p-2">
              <p className="text-[9px] text-text-subtle mb-1">Budget used</p>
              <div className="h-1.5 w-full rounded-full bg-surface-3">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand to-amber-400" />
              </div>
              <p className="mt-1 text-[9px] text-text-muted">10 / 15 SOL</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
