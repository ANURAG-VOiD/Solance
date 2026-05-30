import { authFetch } from "@/services/api-client";
import type { DashboardStats } from "@/types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return authFetch<DashboardStats>("/api/dashboard/stats");
}
