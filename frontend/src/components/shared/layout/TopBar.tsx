"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { useAuth, useWalletConnectionStatus } from "@/context/AuthContext";
import { useUiStore } from "@/store/ui.store";
import { useNotifications } from "@/hooks/useNotifications";
import { SidebarToggle } from "@/components/shared/layout/Sidebar";
import { NotificationItem } from "@/components/shared/NotificationItem";
import { Button } from "@/components/shared/ui/Button";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { WalletButton } from "@/components/wallet/WalletButton";

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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <SidebarToggle />
        <div
          className="flex items-center rounded-md border border-border p-0.5"
          role="group"
          aria-label="Workspace role"
        >
          {(["freelancer", "client"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`rounded px-3 py-1 text-xs capitalize ${
                role === r
                  ? "bg-brand text-white"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {isAuthenticated && (
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              className="relative rounded-md border border-border p-2 text-text-muted hover:bg-bg-subtle"
              aria-label={`Notifications${notifications.unreadCount ? `, ${notifications.unreadCount} unread` : ""}`}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <Bell className="h-4 w-4" />
              {notifications.unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                  {notifications.unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-1rem)] max-w-80 rounded-md border border-border bg-surface shadow-lg"
                role="region"
                aria-label="Notification center"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-2">
                  <p className="text-sm font-medium">Notifications</p>
                  {notifications.items.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline"
                      onClick={() => void notifications.markAllRead()}
                    >
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
                  <p className="px-4 py-6 text-center text-sm text-text-muted">
                    No notifications yet
                  </p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
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

        <WalletButton className="max-w-[8.5rem] sm:max-w-none" />

        {connected && !isAuthenticated && (
          <Button size="sm" onClick={() => signIn("/dashboard")} disabled={isSigningIn}>
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
