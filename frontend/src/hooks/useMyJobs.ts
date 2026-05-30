import { useAsyncData } from "@/hooks/useAsyncData";
import { listMyTasks } from "@/services/tasks.service";

export function useMyPostedJobs() {
  return useAsyncData(() => listMyTasks(), []);
}
