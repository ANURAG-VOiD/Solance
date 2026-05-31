import { authFetch, apiFetch, ApiClientError } from "@/services/api-client";
import type { User, UserProfileUpdatePayload } from "@/types";

export async function fetchUserById(id: string): Promise<User> {
  return apiFetch<User>(`/api/users/${id}`);
}

/**
 * Resolve a user by wallet address. Returns `null` when no profile exists yet
 * (404) so callers can gracefully fall back to showing the raw wallet.
 */
export async function fetchUserByWallet(wallet: string): Promise<User | null> {
  try {
    return await apiFetch<User>(`/api/users/by-wallet/${wallet}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

/** Public: freelancers with completed profiles, for landing-page discovery. */
export async function listTalent(): Promise<User[]> {
  return apiFetch<User[]>("/api/users/talent");
}

export async function updateProfile(
  payload: UserProfileUpdatePayload,
): Promise<User> {
  return authFetch<User>("/api/users/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
