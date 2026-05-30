"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/shared/layout/AppShell";
import { AuthGuard } from "@/components/shared/layout/AuthGuard";
import { PageSkeleton } from "@/components/shared/states/LoadingState";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </Suspense>
  );
}
