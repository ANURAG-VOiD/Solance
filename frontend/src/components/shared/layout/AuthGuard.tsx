"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/shared/states/LoadingState";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const callback = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
      router.replace(`/?callback=${encodeURIComponent(callback)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, searchParams]);

  if (isLoading) {
    return <LoadingState label="Checking session…" />;
  }

  if (!isAuthenticated) {
    return <LoadingState label="Redirecting to sign in…" />;
  }

  return children;
}
