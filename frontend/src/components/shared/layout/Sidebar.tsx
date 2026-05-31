"use client";

import Link from "next/link";
import Image from "next/image";
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
  Menu,
  X,
} from "lucide-react";

import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";
import { useUiStore } from "@/store/ui.store";
import { truncateWallet, cn } from "@/lib/utils";
import { Badge } from "@/components/shared/ui/Badge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("freelancer" | "client")[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Search },
  {
    href: "/applications",
    label: "Applications",
    icon: ClipboardList,
    roles: ["freelancer"],
  },
  { href: "/jobs", label: "My Jobs", icon: Briefcase, roles: ["client"] },
  { href: "/jobs/new", label: "Post Job", icon: Plus, roles: ["client"] },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const role = useUiStore((s) => s.role);

  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav aria-label="Main navigation" className="flex-1 space-y-0.5 p-2">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-brand/15 font-medium text-brand"
                : "text-text-muted hover:bg-surface-hover hover:text-text",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            {/* Real brand mark, sized up for a more prominent identity. */}
            <Image
              src="/solance-logo-clear.webp"
              alt="Solance"
              width={36}
              height={36}
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="text-base font-semibold leading-tight">Solance</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted">Developer OS</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-text-muted lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          {connected && walletAddress ? (
            <Badge variant="brand">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              {truncateWallet(walletAddress)}
            </Badge>
          ) : (
            <Badge>Not connected</Badge>
          )}
          {user && (
            <p className="mt-1 truncate font-mono text-[10px] text-text-muted">
              {user.wallet_address}
            </p>
          )}
        </div>

        <NavLinks onNavigate={() => setSidebarOpen(false)} />
      </aside>
    </>
  );
}

export function SidebarToggle() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  return (
    <button
      type="button"
      className="rounded-md p-2 text-text-muted hover:bg-bg-subtle lg:hidden"
      aria-label="Open navigation menu"
      onClick={toggleSidebar}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
