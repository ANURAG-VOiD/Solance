import { authFetch, apiFetch } from "@/services/api-client";
import type { User, UserProfileUpdatePayload } from "@/types";

export async function fetchUserById(id: string): Promise<User> {
  return apiFetch<User>(`/api/users/${id}`);
}

export async function updateProfile(
  payload: UserProfileUpdatePayload,
): Promise<User> {
  return authFetch<User>("/api/users/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
