"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications.service";
import { parseNotificationEvent } from "@/services/realtime.service";
import { toApiError } from "@/services/api-client";
import { useReconnectingWebSocket } from "@/hooks/useReconnectingWebSocket";
import type { Notification } from "@/types";

export function useNotifications(enabled = true) {
  // Single source of truth so live WebSocket events and optimistic read-state
  // updates can be reflected instantly alongside REST snapshots.
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setItems(await listNotifications());
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    // Fetch-on-mount/enable: the loading flag transition is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  // Live push: subscribe to the backend notifications WebSocket and prepend
  // newly created notifications as they arrive (deduplicated by id).
  const handleEvent = useCallback((data: unknown) => {
    const incoming = parseNotificationEvent(data);
    if (!incoming) return;
    setItems((prev) =>
      prev.some((item) => item.id === incoming.id) ? prev : [incoming, ...prev],
    );
  }, []);

  useReconnectingWebSocket("/api/ws/notifications", {
    enabled,
    onMessage: handleEvent,
  });

  const markRead = useCallback(async (id: string) => {
    if (!enabled) return;
    // Optimistically flip the flag, then reconcile with the server.
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      await markNotificationRead(id);
    } catch {
      void reload();
    }
  }, [enabled, reload]);

  const markAllRead = useCallback(async () => {
    if (!enabled) return;
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      void reload();
    }
  }, [enabled, reload]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  return {
    items,
    unreadCount,
    isLoading,
    error,
    reload,
    markRead,
    markAllRead,
  };
}
