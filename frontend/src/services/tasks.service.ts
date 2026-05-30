import { authFetch, apiFetch } from "@/services/api-client";
import type {
  AcceptBidResponse,
  Bid,
  CreateBidPayload,
  CreateTaskPayload,
  MyBidWithTask,
  Task,
} from "@/types";

export async function listOpenTasks(): Promise<Task[]> {
  return apiFetch<Task[]>("/api/tasks");
}

export async function getTask(id: string): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}`);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  return authFetch<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listMyTasks(): Promise<Task[]> {
  return authFetch<Task[]>("/api/tasks/mine");
}

export async function createBid(
  taskId: string,
  payload: CreateBidPayload,
): Promise<Bid> {
  return authFetch<Bid>(`/api/tasks/${taskId}/bids`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listBidsForTask(taskId: string): Promise<Bid[]> {
  return authFetch<Bid[]>(`/api/tasks/${taskId}/bids`);
}

export async function acceptBid(bidId: string): Promise<AcceptBidResponse> {
  return authFetch<AcceptBidResponse>(`/api/bids/${bidId}/accept`, {
    method: "PATCH",
  });
}

export async function listMyBids(): Promise<MyBidWithTask[]> {
  return authFetch<MyBidWithTask[]>("/api/bids/mine");
}
