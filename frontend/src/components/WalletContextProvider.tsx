"use client";

import React, { FC, ReactNode, useMemo, useCallback, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  WalletAdapterNetwork,
  WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
// Individual adapter packages (not @solana/wallet-adapter-wallets) to avoid
// pulling unused wallet SDKs and their transitive vulnerabilities into the bundle.
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";

import { AuthProvider } from "@/context/AuthContext";
// Solance owns the connect modal UI; we no longer use the library's modal
// provider or its default stylesheet (see WalletModalContext / WalletConnectModal).
import { SolanceWalletModalProvider } from "@/components/wallet/WalletModalContext";

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(network),
    [network],
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  const [autoConnect, setAutoConnect] = useState(false);

  useEffect(() => {
    setAutoConnect(true);
  }, []);

  const onError = useCallback((error: WalletError) => {
    if (error instanceof WalletNotReadyError) return;
    console.warn("Wallet error:", error.message || error.name);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect} onError={onError}>
        <SolanceWalletModalProvider>
          <AuthProvider>{children}</AuthProvider>
        </SolanceWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
