import { listMyBids } from "@/services/tasks.service";
import type { FreelancerProject } from "@/types/invoice";
import { useAsyncData } from "@/hooks/useAsyncData";

export function useFreelancerProjects() {
  return useAsyncData<FreelancerProject[]>(async () => {
    const rows = await listMyBids();
    return rows
      .filter(
        ({ bid, task }) =>
          bid.status === "accepted" ||
          task.status === "in_progress" ||
          task.status === "completed",
      )
      .map(({ bid, task }) => ({
        taskId: task.id,
        task,
        bid,
        agreedAmount: bid.proposed_amount,
        clientWallet: task.client_wallet,
      }));
  }, []);
}
