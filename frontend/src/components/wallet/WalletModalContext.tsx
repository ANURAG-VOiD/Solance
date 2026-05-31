"use client";

/*
 * WalletModalContext — Solance's own wallet-modal visibility provider.
 *
 * We intentionally replace `@solana/wallet-adapter-react-ui`'s `WalletModalProvider`
 * so we can render a fully custom, on-brand connect experience (see
 * `WalletConnectModal`). The public API (`visible` / `setVisible`) mirrors the
 * library hook of the same name, so call sites read identically.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";

interface WalletModalContextValue {
  /** Whether the connect modal is currently shown. */
  visible: boolean;
  /** Open (true) or close (false) the connect modal. */
  setVisible: (open: boolean) => void;
}

const WalletModalContext = createContext<WalletModalContextValue | null>(null);

/**
 * Holds connect-modal visibility state and renders the custom modal once, at the
 * root of the wallet tree. Place inside `WalletProvider` so the modal can access
 * the live adapter list via `useWallet`.
 */
export function SolanceWalletModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  // Memoize so consumers don't re-render on unrelated parent updates.
  const value = useMemo<WalletModalContextValue>(
    () => ({ visible, setVisible }),
    [visible],
  );

  return (
    <WalletModalContext.Provider value={value}>
      {children}
      <WalletConnectModal />
    </WalletModalContext.Provider>
  );
}

/** Access connect-modal visibility. Must be used within `SolanceWalletModalProvider`. */
export function useWalletModal(): WalletModalContextValue {
  const ctx = useContext(WalletModalContext);
  if (!ctx) {
    throw new Error("useWalletModal must be used within SolanceWalletModalProvider");
  }
  return ctx;
}
