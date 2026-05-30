import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchDashboardStats } from "@/services/dashboard.service";

export function useDashboardStats() {
  return useAsyncData(() => fetchDashboardStats(), []);
}
