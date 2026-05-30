"use client";

import WalletConnectButton from "@/components/WalletConnectButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
          <span className="text-lg font-semibold tracking-tight text-white">
            Solance
          </span>
        </div>
        <WalletConnectButton />
      </div>
    </header>
  );
}
