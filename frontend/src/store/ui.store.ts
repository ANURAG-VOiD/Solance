import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types";

interface UiState {
  role: UserRole;
  sidebarOpen: boolean;
  setRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      role: "freelancer",
      sidebarOpen: false,
      setRole: (role) => set({ role }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: "solance-ui" },
  ),
);
