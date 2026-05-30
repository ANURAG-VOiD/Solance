"use client";

import Link from "next/link";
import type { Notification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onNavigate?: () => void;
}

export function NotificationItem({ notification, onMarkRead, onNavigate }: NotificationItemProps) {
  return (
    <Link
      href={notification.href}
      onClick={() => {
        onMarkRead?.(notification.id);
        onNavigate?.();
      }}
      className={`block px-4 py-3 text-left transition-colors hover:bg-bg-subtle ${
        !notification.read ? "bg-accent/5" : ""
      }`}
    >
      <p className="text-sm font-medium text-text">{notification.title}</p>
      <p className="mt-0.5 text-xs text-text-muted">{notification.body}</p>
      <p className="mt-1 text-[10px] text-text-muted">
        {formatRelativeTime(notification.created_at)}
      </p>
    </Link>
  );
}
