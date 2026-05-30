const TOKEN_KEY = "solance_token";
const USER_KEY = "solance_user";

import type { AuthSession, User } from "./types";

export function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getSession(): AuthSession | null {
  const token = getToken();
  const user = getStoredUser();
  if (!token || !user) return null;
  return { token, user };
}

export function isAuthenticated(): boolean {
  return getToken() !== null && getStoredUser() !== null;
}
