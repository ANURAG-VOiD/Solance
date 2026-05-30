import type { RequestNonceResponse, User, VerifyResponse } from "./types";
import { getToken } from "./auth-storage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function requestNonce(
  walletAddress: string,
): Promise<RequestNonceResponse> {
  return apiFetch<RequestNonceResponse>("/api/auth/request-nonce", {
    method: "POST",
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
}

export async function verifySignature(payload: {
  wallet_address: string;
  signature: string;
  message: string;
}): Promise<VerifyResponse> {
  return apiFetch<VerifyResponse>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe(): Promise<User> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  return apiFetch<User>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
