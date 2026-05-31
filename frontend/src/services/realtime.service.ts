import type { Message, Notification } from "@/types";
import {
  normalizeNotification,
  type BackendNotification,
} from "@/services/notifications.service";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * Build a WebSocket URL from the configured HTTP API base.
 *
 * Browsers cannot attach an `Authorization` header to a WebSocket handshake,
 * so the JWT is appended as a `token` query parameter (the backend validates
 * it inline before upgrading the connection — see `routes/ws.rs`).
 */
export function buildWsUrl(path: string, token: string): string {
  const url = new URL(`${API_BASE}${path}`);
  // Map http(s) -> ws(s) so the same base URL works for REST and realtime.
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

/** Envelope emitted by the backend realtime hub over the WebSocket. */
export interface WsEnvelope<TPayload = unknown> {
  event: string;
  wallet: string;
  payload: TPayload;
}

/**
 * Parse a raw WebSocket frame into a normalized `Notification`.
 * Returns `null` for unrelated or malformed events so callers can ignore them.
 */
export function parseNotificationEvent(data: unknown): Notification | null {
  const envelope = data as WsEnvelope<BackendNotification> | null;
  if (
    !envelope ||
    envelope.event !== "notification.created" ||
    !envelope.payload
  ) {
    return null;
  }
  return normalizeNotification(envelope.payload);
}

/**
 * Parse a raw WebSocket frame into a chat `Message`.
 *
 * The backend broadcasts the same `Message` shape the REST endpoints return,
 * so no normalization is required. Returns `null` for unrelated or malformed
 * events (including notification frames) so callers can safely ignore them.
 */
export function parseMessageEvent(data: unknown): Message | null {
  const envelope = data as WsEnvelope<Message> | null;
  if (!envelope || envelope.event !== "message.created" || !envelope.payload) {
    return null;
  }
  return envelope.payload;
}
