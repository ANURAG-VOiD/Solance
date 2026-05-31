import { useCallback, useEffect, useState } from "react";
import { listMessages } from "@/services/chats.service";
import { parseMessageEvent } from "@/services/realtime.service";
import { useReconnectingWebSocket } from "@/hooks/useReconnectingWebSocket";
import { toApiError } from "@/services/api-client";
import type { Message } from "@/types";

export function useMessages(chatId: string | null) {
  const [data, setData] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial REST fetch of conversation history. Live updates afterwards arrive
  // over the WebSocket, so this only runs on mount and when the chat changes.
  const load = useCallback(async () => {
    if (!chatId) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setData(await listMessages(chatId));
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const reload = useCallback(() => load(), [load]);

  useEffect(() => {
    // Fetch-on-mount when the active chat changes; loading flag is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Live push: the backend broadcasts each newly persisted message to the
  // recipient participant over the shared realtime socket. We merge frames that
  // belong to the active chat, deduplicating by id (protects against a frame
  // arriving for a message already loaded via REST) and appending to preserve
  // the chronological order the history endpoint returns.
  const handleEvent = useCallback(
    (frame: unknown) => {
      const message = parseMessageEvent(frame);
      if (!message || message.chat_id !== chatId) return;
      setData((prev) =>
        prev.some((existing) => existing.id === message.id)
          ? prev
          : [...prev, message],
      );
    },
    [chatId],
  );

  // Reuse the notifications endpoint: it is a single per-user realtime stream
  // that now multiplexes both notification and message events, filtered to the
  // authenticated wallet on the server. Keeping `path`/`enabled` stable across
  // chat switches avoids tearing down and reconnecting the socket — only the
  // `handleEvent` ref (which closes over the latest `chatId`) changes.
  useReconnectingWebSocket("/api/ws/notifications", {
    enabled: chatId != null,
    onMessage: handleEvent,
  });

  return { data, isLoading, error, reload, setData };
}
