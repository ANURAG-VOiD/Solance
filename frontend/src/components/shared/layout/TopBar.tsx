"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Bell, MessageSquare, FileText, Briefcase, CheckCircle } from "lucide-react";

import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";
import { useUiStore } from "@/store/ui.store";
import { useNotifications } from "@/hooks/useNotifications";
import { SidebarToggle } from "@/components/shared/layout/Sidebar";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { Button } from "@/components/shared/ui/Button";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { cn } from "@/lib/utils";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export function TopBar() {
  const { isAuthenticated, isSigningIn, signIn, signOut } = useAuth();
  const { connected } = useWalletConnectionStatus();
  const role = useUiStore((s) => s.role);
  const setRole = useUiStore((s) => s.setRole);
  const notifications = useNotifications(isAuthenticated);

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-surface/80 backdrop-blur-xl px-3 sm:px-4">
      <div className="flex items-center gap-3">
        <SidebarToggle />

        {/* Role Switcher */}
        <div
          className="relative flex items-center rounded-lg border border-border/60 bg-surface-3 p-0.5"
          role="group"
          aria-label="Workspace role"
        >
          {/* Sliding active pill */}
          <div
            className={cn(
              "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md bg-gradient-to-r from-brand to-brand-hover shadow-sm shadow-brand/25 transition-all duration-250",
              role === "freelancer" ? "left-0.5" : "left-[calc(50%+2px)]",
            )}
          />
          {(["freelancer", "client"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={cn(
                "relative z-10 rounded-md px-3.5 py-1 text-xs font-semibold capitalize transition-colors duration-200",
                role === r ? "text-white" : "text-text-muted hover:text-text",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {/* Notification Bell */}
        {isAuthenticated && (
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              className={cn(
                "relative rounded-lg border border-border/60 p-2 text-text-muted transition-all duration-150",
                "hover:bg-surface-3 hover:text-text hover:border-border",
                open && "bg-surface-3 text-text border-border",
              )}
              aria-label={`Notifications${notifications.unreadCount ? `, ${notifications.unreadCount} unread` : ""}`}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <Bell className={cn("h-4 w-4", notifications.unreadCount > 0 && "animate-[wiggle_0.5s_ease-in-out]")} />
              {notifications.unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-[9px] font-bold text-white shadow-sm">
                  {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-1rem)] max-w-80 rounded-xl border border-border/60 glass shadow-2xl shadow-black/40 animate-scale-in"
                role="region"
                aria-label="Notification center"
              >
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-brand" />
                    <p className="text-sm font-semibold">Notifications</p>
                    {notifications.unreadCount > 0 && (
                      <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                        {notifications.unreadCount}
                      </span>
                    )}
                  </div>
                  {notifications.items.length > 0 && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
                      onClick={() => void notifications.markAllRead()}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.isLoading ? (
                  <div className="px-4 py-6">
                    <LoadingState label="Loading notifications…" />
                  </div>
                ) : notifications.error ? (
                  <div className="px-4 py-6">
                    <ErrorState message={notifications.error} onRetry={notifications.reload} />
                  </div>
                ) : notifications.items.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3">
                      <Bell className="h-4 w-4 text-text-subtle" />
                    </div>
                    <p className="text-sm text-text-muted">No notifications yet</p>
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto divide-y divide-border/40">
                    {notifications.items.map((n) => (
                      <li key={n.id}>
                        <NotificationItem
                          notification={n}
                          onMarkRead={(id) => void notifications.markRead(id)}
                          onNavigate={() => setOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <WalletMultiButton className="!h-9 !max-w-[8.5rem] !overflow-hidden !rounded-lg !text-sm !text-ellipsis !whitespace-nowrap sm:!max-w-none !font-semibold" />

        {connected && !isAuthenticated && (
          <Button size="sm" onClick={() => signIn("/dashboard")} isLoading={isSigningIn}>
            {isSigningIn ? "Signing in…" : "Sign in"}
          </Button>
        )}
        {isAuthenticated && (
          <Button size="sm" variant="ghost" onClick={signOut}>
            Sign out
          </Button>
        )}
      </div>
    </header>
  );
}
