"use client";

import { useCallback, useMemo } from "react";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications.service";
import { useAsyncData } from "@/hooks/useAsyncData";

export function useNotifications(enabled = true) {
  const query = useAsyncData(
    async () => (enabled ? listNotifications() : []),
    [enabled],
  );

  const markRead = useCallback(async (id: string) => {
    if (!enabled) return;
    try {
      await markNotificationRead(id);
      query.reload();
    } catch {
      // Preserve current UI; next reload will reconcile state.
    }
  }, [enabled, query]);

  const markAllRead = useCallback(async () => {
    if (!enabled) return;
    try {
      await markAllNotificationsRead();
      query.reload();
    } catch {
      // Preserve current UI; next reload will reconcile state.
    }
  }, [enabled, query]);

  const items = useMemo(() => query.data ?? [], [query.data]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  return {
    items,
    unreadCount,
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
    markRead,
    markAllRead,
  };
}
