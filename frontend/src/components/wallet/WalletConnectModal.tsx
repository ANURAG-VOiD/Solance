"use client";

/*
 * WalletConnectModal — premium dark-glass connect experience.
 *
 * Design goals (matches Vercel / Linear / Raycast / Phantom / Jupiter polish):
 *   - No heavy dim: the page stays visible behind a very subtle 5px blur.
 *   - Dark glassmorphism card: translucent navy, 24px blur, hairline border.
 *   - Lists every wallet the browser exposes (Wallet Standard auto-registration
 *     + configured adapters), detected wallets first.
 *
 * Connection flow: the adapter `WalletProvider` is configured with
 * `autoConnect`, so calling `select(name)` is sufficient to trigger the wallet's
 * connect prompt (this mirrors the upstream modal's behaviour). We never call
 * `connect()` directly, avoiding double-connect races.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import type { WalletName } from "@solana/wallet-adapter-base";
import Image from "next/image";
import { Wallet, X } from "lucide-react";

import { useWalletModal } from "@/components/wallet/WalletModalContext";

interface WalletRow {
  name: string;
  icon: string | undefined;
  adapterName: WalletName;
  /** Wallet homepage, used as an install fallback when not detected. */
  url: string;
  /** Physically present in the browser — drives the "Detected" badge. */
  detected: boolean;
  /** Can be connected directly (installed extension or loadable web wallet). */
  connectable: boolean;
}

export function WalletConnectModal() {
  const { wallets, select } = useWallet();
  const { visible, setVisible } = useWalletModal();

  // Portals require the DOM; gate on mount to stay SSR-safe.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setVisible(false), [setVisible]);

  // Lock page scroll and wire Escape-to-close while the modal is open.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, close]);

  // Map the live adapter list into display rows, surfacing detected wallets
  // (Installed / Loadable) first while still listing the rest so users can pick
  // anything available in their browser. We hide the `Unsupported` ones.
  const rows = useMemo<WalletRow[]>(() => {
    return wallets
      .filter((w) => w.readyState !== WalletReadyState.Unsupported)
      .map((w) => ({
        name: w.adapter.name,
        icon: w.adapter.icon,
        adapterName: w.adapter.name,
        url: w.adapter.url,
        // Only a physically installed wallet is reported as "Detected".
        detected: w.readyState === WalletReadyState.Installed,
        // Loadable web wallets can still connect even without an extension.
        connectable:
          w.readyState === WalletReadyState.Installed ||
          w.readyState === WalletReadyState.Loadable,
      }))
      .sort((a, b) => Number(b.connectable) - Number(a.connectable));
  }, [wallets]);

  const handleSelect = useCallback(
    (row: WalletRow) => {
      if (row.connectable) {
        // autoConnect=true → selecting the wallet triggers its connect prompt.
        select(row.adapterName);
        close();
        return;
      }
      // Not installed: send the user to the wallet's download page.
      window.open(row.url, "_blank", "noopener,noreferrer");
    },
    [select, close],
  );

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="solance-wallet-modal-title"
    >
      {/* Subtle blurred backdrop — page stays visible (no heavy gray dim). */}
      <button
        type="button"
        aria-label="Close wallet modal"
        onClick={close}
        className="absolute inset-0 cursor-default"
        style={{
          background: "rgba(2, 6, 16, 0.18)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
        }}
      />

      {/* Glass card */}
      <div
        className="relative w-full"
        style={{
          maxWidth: "420px",
          background: "rgba(8, 12, 24, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pb-7 pt-8">
          {/* Branding: real shield mark + wordmark. The mark asset is dark navy,
              so on this dark-glass modal we render it white via brightness-0 +
              invert (pure white) rather than shipping a separate white asset. */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/solance-logo-clear.webp"
              alt="Solance"
              width={36}
              height={36}
              className="h-9 w-9 object-contain brightness-0 invert"
            />
            <span className="text-base font-semibold tracking-[0.22em] text-white">
              SOLANCE
            </span>
          </div>

          {/* Title */}
          <h2
            id="solance-wallet-modal-title"
            className="mt-6 text-2xl font-semibold leading-[1.15] text-white"
          >
            Connect your wallet
            <br />
            to continue
          </h2>

          {/* Wallet list */}
          {rows.length === 0 ? (
            <p className="mt-7 rounded-2xl bg-white/5 px-4 py-5 text-sm text-white/55">
              No Solana wallets detected. Install{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline-offset-2 hover:underline"
              >
                Phantom
              </a>{" "}
              or{" "}
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline-offset-2 hover:underline"
              >
                Solflare
              </a>{" "}
              to continue.
            </p>
          ) : (
            <ul className="mt-7 max-h-[320px] space-y-1 overflow-y-auto">
              {rows.map((row) => (
              <li key={row.name}>
                <button
                  type="button"
                  onClick={() => handleSelect(row)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                    {row.icon ? (
                      // Adapter icons are data URIs; next/image is unnecessary here.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.icon} alt="" className="h-6 w-6" />
                    ) : (
                      <Wallet className="h-4 w-4 text-white/70" />
                    )}
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-white">
                    {row.name}
                  </span>
                  {row.detected ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#14f195]" />
                      Detected
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-white/40">Install</span>
                  )}
                </button>
              </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
