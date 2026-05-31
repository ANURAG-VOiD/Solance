"use client";

// Thin wrapper kept for backward compatibility; the real implementation now
// lives in the custom, on-brand WalletButton (opens our dark-glass modal).
import { WalletButton } from "@/components/wallet/WalletButton";

export default function WalletConnectButton() {
  return <WalletButton />;
}
