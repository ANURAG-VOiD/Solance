import { useAsyncData } from "@/hooks/useAsyncData";
import { listMyBids } from "@/services/tasks.service";
import type { MyBidWithTask } from "@/types";

export function useMyApplications() {
  return useAsyncData<MyBidWithTask[]>(() => listMyBids(), []);
}
