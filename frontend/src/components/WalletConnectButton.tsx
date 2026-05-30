"use client";

import dynamic from "next/dynamic";

// We MUST dynamically import the button to prevent Next.js SSR hydration crashes
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function WalletConnectButton() {
  return (
    <WalletMultiButton className="!bg-violet-600 !font-medium hover:!bg-violet-700 transition-colors" />
  );
}
