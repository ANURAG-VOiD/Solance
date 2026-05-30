import { authFetch } from "@/services/api-client";
import type { Chat, Message } from "@/types";

export async function createChat(): Promise<Chat> {
  return authFetch<Chat>("/api/chats", { method: "POST" });
}

export async function listChats(): Promise<Chat[]> {
  return authFetch<Chat[]>("/api/chats");
}

export async function sendMessage(
  chatId: string,
  content: string,
): Promise<Message> {
  return authFetch<Message>("/api/messages", {
    method: "POST",
    body: JSON.stringify({ chat_id: chatId, content }),
  });
}

export async function listMessages(chatId: string): Promise<Message[]> {
  return authFetch<Message[]>(`/api/messages/${chatId}`);
}
