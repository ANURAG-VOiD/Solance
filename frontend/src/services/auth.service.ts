import { authFetch, apiFetch } from "@/services/api-client";
import type {
  RequestNonceResponse,
  User,
  VerifyResponse,
} from "@/types";

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
  return authFetch<User>("/api/auth/me");
}
