"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export default function WalletConnectButton() {
  return <WalletMultiButton className="!h-9 !rounded-md !text-sm" />;
}
