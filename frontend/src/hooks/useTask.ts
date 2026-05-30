import { useAsyncData } from "@/hooks/useAsyncData";
import { getTask } from "@/services/tasks.service";

export function useTask(taskId: string | null) {
  return useAsyncData(
    () => {
      if (!taskId) return Promise.resolve(null);
      return getTask(taskId);
    },
    [taskId],
  );
}
