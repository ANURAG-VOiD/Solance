import { useAsyncData } from "@/hooks/useAsyncData";
import { listOpenTasks } from "@/services/tasks.service";

export function useOpenTasks() {
  return useAsyncData(() => listOpenTasks(), []);
}
