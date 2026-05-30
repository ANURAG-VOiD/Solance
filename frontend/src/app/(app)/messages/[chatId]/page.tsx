import { MessagesWorkspace } from "@/components/chat/MessagesWorkspace";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return <MessagesWorkspace chatId={chatId} />;
}
