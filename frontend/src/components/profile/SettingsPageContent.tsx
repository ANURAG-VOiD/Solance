"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/ui/Card";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useUiStore } from "@/store/ui.store";

export function SettingsPageContent() {
  const { user, signOut } = useAuth();
  const role = useUiStore((s) => s.role);
  const setRole = useUiStore((s) => s.setRole);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Account and workspace preferences" />

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Wallet</h2>
        {user && <p className="font-mono text-xs break-all">{user.wallet_address}</p>}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Default role</h2>
        <div className="flex gap-2">
          {(["freelancer", "client"] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize ${
                role === r ? "border-accent bg-accent/10 text-accent" : "border-border"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Network</h2>
        <div className="flex gap-2">
          <Badge>Solana Devnet</Badge>
          <Badge>Phantom</Badge>
          <Badge>Solflare</Badge>
        </div>
      </Card>

      <Button variant="danger" onClick={signOut}>Sign out</Button>
    </div>
  );
}
