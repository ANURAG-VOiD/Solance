import { authFetch } from "@/services/api-client";
import type { Notification, NotificationType } from "@/types";

/** Raw notification shape returned by the backend (snake_case fields). */
export interface BackendNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  href: string;
  created_at: string;
  read: boolean;
}

/** Map a backend notification to the camelCase frontend `Notification` type. */
export function normalizeNotification(input: BackendNotification): Notification {
  return {
    id: input.id,
    type: input.notification_type,
    title: input.title,
    body: input.body,
    href: input.href,
    created_at: input.created_at,
    read: input.read,
  };
}

export async function listNotifications(): Promise<Notification[]> {
  const data = await authFetch<BackendNotification[]>("/api/notifications");
  return data.map(normalizeNotification);
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const data = await authFetch<BackendNotification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
  return normalizeNotification(data);
}

export async function markAllNotificationsRead(): Promise<void> {
  await authFetch<{ updated: number }>("/api/notifications/read-all", {
    method: "PATCH",
  });
}
