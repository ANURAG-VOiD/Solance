import { useCallback, useEffect, useState } from "react";
import { listMessages } from "@/services/chats.service";
import { toApiError } from "@/services/api-client";
import type { Message } from "@/types";

export function useMessages(chatId: string | null) {
  const [data, setData] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!chatId) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const messages = await listMessages(chatId);
      setData(messages);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, isLoading, error, reload, setData };
}
