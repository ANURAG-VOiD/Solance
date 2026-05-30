import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FileText,
  Wallet,
  Briefcase,
} from "lucide-react";

import { Badge } from "@/components/shared/ui/Badge";

/*
 * ProjectMockup — a static, pixel-faithful preview of the Solance workspace.
 * It mirrors the real product surfaces (sidebar, wallet balance, jobs, chat,
 * invoices) so the landing hero showcases the actual UI rather than stock art.
 * Purely presentational: no data fetching, no interactivity.
 */

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Search, label: "Marketplace", active: false },
  { icon: MessageSquare, label: "Messages", active: false },
  { icon: FileText, label: "Invoices", active: false },
];

const JOBS = [
  { title: "Anchor program audit", budget: "120 SOL", tag: "Open" },
  { title: "Solana pay integration", budget: "65 SOL", tag: "Open" },
  { title: "Next.js dashboard build", budget: "48 SOL", tag: "Open" },
];

const CHAT = [
  { from: "client.sol", text: "Milestone specs are uploaded — ready when you are.", me: false },
  { from: "you", text: "On it. Running the integration tests now.", me: true },
];

export function ProjectMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-hover px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-3 font-mono text-[11px] text-text-muted">
          app.solance.xyz/dashboard
        </span>
      </div>

      <div className="grid grid-cols-12">
        {/* Sidebar */}
        <aside className="col-span-3 hidden flex-col border-r border-border p-3 sm:flex">
          <div className="mb-4 flex items-center gap-2 px-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-solana text-xs font-bold text-white">
              S
            </span>
            <span className="text-sm font-semibold">Solance</span>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                  active
                    ? "bg-brand/15 font-medium text-brand"
                    : "text-text-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="col-span-12 space-y-4 p-4 sm:col-span-9">
          {/* Wallet balance + quick stats */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-void p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-muted">
                <Wallet className="h-3.5 w-3.5" /> Wallet balance
              </div>
              <p className="mt-1.5 text-xl font-semibold tabular-nums">248.5 SOL</p>
              <p className="text-[10px] text-success">+15 SOL settled today</p>
            </div>
            <div className="rounded-lg border border-border bg-void p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-muted">
                <Briefcase className="h-3.5 w-3.5" /> Active contracts
              </div>
              <p className="mt-1.5 text-xl font-semibold tabular-nums">3</p>
              <p className="text-[10px] text-text-muted">2 awaiting review</p>
            </div>
            <div className="rounded-lg border border-border bg-void p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-muted">
                <FileText className="h-3.5 w-3.5" /> Pending invoices
              </div>
              <p className="mt-1.5 text-xl font-semibold tabular-nums">1</p>
              <p className="text-[10px] text-text-muted">due in 4 days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Open jobs */}
            <div className="rounded-lg border border-border bg-void p-3">
              <p className="mb-2 text-[11px] font-semibold">Open jobs</p>
              <div className="space-y-2">
                {JOBS.map((job) => (
                  <div
                    key={job.title}
                    className="flex items-center justify-between rounded-md border border-border px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{job.title}</p>
                      <span className="text-[10px] text-text-muted">{job.tag}</span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-brand">
                      {job.budget}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="flex flex-col rounded-lg border border-border bg-void p-3">
              <p className="mb-2 text-[11px] font-semibold"># project-alpha</p>
              <div className="flex-1 space-y-2">
                {CHAT.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[11px] ${
                      msg.me
                        ? "ml-auto bg-brand/15 text-text"
                        : "bg-surface-hover text-text-muted"
                    }`}
                  >
                    {!msg.me && (
                      <span className="mr-1 font-medium text-brand">{msg.from}</span>
                    )}
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-md border border-border px-2.5 py-1.5 text-[10px] text-text-muted">
                Message client…
              </div>
            </div>
          </div>

          {/* Invoice row */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-void px-3 py-2.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-text-muted" />
              <div>
                <p className="text-xs font-medium">INV-0042 · Project Alpha</p>
                <p className="text-[10px] text-text-muted">Sprint 2 deliverables</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tabular-nums">15 SOL</span>
              <Badge variant="success">Paid</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
