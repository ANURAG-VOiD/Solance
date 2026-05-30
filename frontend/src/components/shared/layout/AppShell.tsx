"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/layout/Sidebar";
import { TopBar } from "@/components/shared/layout/TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-void text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
