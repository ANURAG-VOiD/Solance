"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  User,
  ClipboardList,
  Plus,
  X,
  Zap,
} from "lucide-react";

import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";
import { useUiStore } from "@/store/ui.store";
import { truncateWallet, cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("freelancer" | "client")[];
}

const NAV: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/marketplace",  label: "Marketplace",  icon: Search },
  { href: "/applications", label: "Applications", icon: ClipboardList, roles: ["freelancer"] },
  { href: "/jobs",         label: "My Jobs",      icon: Briefcase,      roles: ["client"] },
  { href: "/jobs/new",     label: "Post Job",     icon: Plus,           roles: ["client"] },
  { href: "/messages",     label: "Messages",     icon: MessageSquare },
  { href: "/invoices",     label: "Invoices",     icon: FileText },
  { href: "/profile",      label: "Profile",      icon: User },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

const NAV_GROUPS = [
  { label: "Workspace", items: ["/dashboard", "/marketplace", "/applications", "/jobs", "/jobs/new"] },
  { label: "Manage",    items: ["/messages", "/invoices"] },
  { label: "Account",   items: ["/profile", "/settings"] },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = useUiStore((s) => s.role);
  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-3">
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter((item) => group.items.includes(item.href));
        if (groupItems.length === 0) return null;
        return (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-subtle">
              {group.label}
            </p>
            {groupItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 mb-0.5",
                    active
                      ? "bg-brand/15 font-semibold text-brand"
                      : "text-text-muted hover:bg-surface-3 hover:text-text",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const { connected, walletAddress } = useWalletConnectionStatus();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-surface/90 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar"
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-hover shadow-lg shadow-brand/30 group-hover:shadow-brand/50 transition-shadow">
              <Zap className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Solance</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">
                Developer OS
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-3 hover:text-text lg:hidden transition-colors"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet Status */}
        <div className="border-b border-border/60 px-4 py-3">
          {connected && walletAddress ? (
            <div className="flex items-center gap-2">
              <span className="animate-dot-pulse h-2 w-2 rounded-full bg-success" />
              <span className="font-mono text-xs font-medium text-text">
                {truncateWallet(walletAddress)}
              </span>
              <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                Live
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-text-subtle" />
              <span className="text-xs text-text-muted">Not connected</span>
            </div>
          )}
          {user && (
            <p className="mt-1.5 truncate font-mono text-[10px] text-text-subtle">
              {user.wallet_address}
            </p>
          )}
        </div>

        <NavLinks onNavigate={() => setSidebarOpen(false)} />

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface/90 to-transparent" />
      </aside>
    </>
  );
}

export function SidebarToggle() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  return (
    <button
      type="button"
      className="rounded-lg p-2 text-text-muted hover:bg-surface-3 hover:text-text lg:hidden transition-colors"
      aria-label="Open navigation menu"
      onClick={toggleSidebar}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
