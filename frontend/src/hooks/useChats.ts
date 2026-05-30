import { useAsyncData } from "@/hooks/useAsyncData";
import { listChats } from "@/services/chats.service";

export function useChats() {
  return useAsyncData(() => listChats(), []);
}
