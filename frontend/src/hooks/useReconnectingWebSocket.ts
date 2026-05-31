"use client";

import { useEffect, useRef } from "react";

import { getToken } from "@/lib/auth-storage";
import { buildWsUrl } from "@/services/realtime.service";

interface Options {
  /** When false, no socket is opened (e.g. while logged out). */
  enabled?: boolean;
  /** Called with each parsed JSON frame received from the server. */
  onMessage: (data: unknown) => void;
}

/**
 * Maintains a single authenticated WebSocket connection to `path` for the
 * lifetime of the component, transparently reconnecting with exponential
 * backoff if the socket drops.
 *
 * The latest `onMessage` handler is read from a ref so the socket is not torn
 * down on every render — only `path` / `enabled` changes trigger reconnection.
 */
export function useReconnectingWebSocket(
  path: string,
  { enabled = true, onMessage }: Options,
): void {
  const onMessageRef = useRef(onMessage);

  // Keep the handler ref current without retriggering the socket effect.
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!enabled) return;
    const token = getToken();
    if (!token) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      socket = new WebSocket(buildWsUrl(path, token));

      socket.onopen = () => {
        attempts = 0;
      };

      socket.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data));
        } catch {
          // Ignore frames that are not valid JSON.
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        // Exponential backoff capped at 30s avoids hammering the server when
        // the backend is unavailable, while staying responsive on brief drops.
        const delay = Math.min(30_000, 1_000 * 2 ** attempts);
        attempts += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      // Closing on error lets the standard reconnect path handle recovery.
      socket.onerror = () => socket?.close();
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [path, enabled]);
}
