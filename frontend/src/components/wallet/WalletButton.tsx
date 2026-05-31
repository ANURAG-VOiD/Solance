"use client";

/*
 * WalletButton — Solance's connect / connected control.
 *
 * Replaces the library's `WalletMultiButton` so the trigger matches the app's
 * light theme and opens our custom `WalletConnectModal`. When connected it shows
 * the truncated address with a small dropdown (copy / change / disconnect).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronDown, Copy, LogOut, RefreshCw, Wallet } from "lucide-react";

import { useWalletModal } from "@/components/wallet/WalletModalContext";
import { cn, truncateWallet } from "@/lib/utils";

export function WalletButton({ className }: { className?: string }) {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  // Wallet state only resolves client-side; gate rendering to avoid hydration
  // mismatches between the server placeholder and the connected control.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const address = publicKey?.toBase58() ?? "";

  const copyAddress = useCallback(() => {
    if (address) void navigator.clipboard?.writeText(address);
    setOpen(false);
  }, [address]);

  if (!mounted || !connected || !publicKey) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover",
          className,
        )}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover",
          className,
        )}
      >
        {wallet?.adapter.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wallet.adapter.icon} alt="" className="h-4 w-4 shrink-0" />
        ) : (
          <Wallet className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate font-mono">{truncateWallet(address)}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={copyAddress}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
          >
            <Copy className="h-3.5 w-3.5" /> Copy address
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setVisible(true);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Change wallet
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void disconnect();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-surface-hover"
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
