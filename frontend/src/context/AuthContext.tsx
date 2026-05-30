"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

import { fetchMe, requestNonce, verifySignature } from "@/services/auth.service";
import {
  clearSession,
  getSession,
  saveSession,
} from "@/lib/auth-storage";
import type { AuthSession, User } from "@/types";

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signIn: (callbackUrl?: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { publicKey, signMessage, disconnect } = useWallet();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(getSession());
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = getSession();
    if (!current) return;

    try {
      const user = await fetchMe();
      saveSession(current.token, user);
      setSession({ token: current.token, user });
    } catch {
      clearSession();
      setSession(null);
    }
  }, []);

  const signIn = useCallback(
    async (callbackUrl = "/dashboard") => {
      if (!publicKey || !signMessage) {
        setError("This wallet does not support message signing.");
        return;
      }

      setIsSigningIn(true);
      setError(null);

      try {
        const walletAddress = publicKey.toBase58();
        const { message } = await requestNonce(walletAddress);
        const signatureBytes = await signMessage(new TextEncoder().encode(message));
        const signature = bs58.encode(signatureBytes);

        const { token, user } = await verifySignature({
          wallet_address: walletAddress,
          signature,
          message,
        });

        saveSession(token, user);
        setSession({ token, user });
        router.push(callbackUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      } finally {
        setIsSigningIn(false);
      }
    },
    [publicKey, signMessage, router],
  );

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
    setError(null);
    disconnect();
    router.push("/");
  }, [disconnect, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isLoading,
      isSigningIn,
      error,
      signIn,
      signOut,
      refreshUser,
    }),
    [session, isLoading, isSigningIn, error, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useWalletConnectionStatus() {
  const { publicKey, connected } = useWallet();
  return { connected, walletAddress: publicKey?.toBase58() ?? null };
}
