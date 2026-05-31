"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, FileText, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { EmptyState } from "@/components/shared/states/EmptyState";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
import { Card } from "@/components/shared/ui/Card";
import { useChats } from "@/hooks/useChats";
import { useMessages } from "@/hooks/useMessages";
import { createChat, sendMessage } from "@/services/chats.service";
import { getStoredUser } from "@/lib/auth-storage";
import { cn, truncateWallet } from "@/lib/utils";

interface MessagesWorkspaceProps {
  chatId?: string | null;
}

function channelLabel(chat: { id: string; client_wallet: string | null; freelancer_wallet: string | null }) {
  if (chat.client_wallet && chat.freelancer_wallet) {
    return `project-${truncateWallet(chat.freelancer_wallet, 3)}`;
  }
  return `channel-${chat.id.slice(0, 6)}`;
}

export function MessagesWorkspace({ chatId: initialChatId = null }: MessagesWorkspaceProps) {
  const router = useRouter();
  const { data: chats, isLoading: chatsLoading, error: chatsError, reload: reloadChats } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId);
  const effectiveChatId = activeChatId ?? initialChatId;

  const { data: messages, isLoading: msgsLoading, error: msgsError, reload: reloadMsgs, setData } = useMessages(effectiveChatId);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const myWallet = getStoredUser()?.wallet_address;

  const selectChat = (id: string) => {
    setActiveChatId(id);
    router.push(`/messages/${id}`);
  };

  const handleNewChat = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const chat = await createChat();
      selectChat(chat.id);
      reloadChats();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!effectiveChatId || !content.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await sendMessage(effectiveChatId, content.trim());
      setData((prev) => [...prev, msg]);
      setContent("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      <PageHeader title="Messages" description="Slack-style workspace chat" actions={
        <Button size="sm" onClick={handleNewChat} disabled={creating}>{creating ? "Creating…" : "New channel"}</Button>
      } />
      {createError && <p role="alert" className="mb-3 text-sm text-danger">{createError}</p>}

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-lg border border-border lg:grid-cols-12">
        <aside className="flex flex-col border-b border-border bg-surface lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Channels</p>
          <div className="flex-1 overflow-y-auto p-2">
            {chatsLoading && <LoadingState label="Loading channels…" />}
            {chatsError && <ErrorState message={chatsError} onRetry={reloadChats} />}
            {!chatsLoading && (chats?.length ?? 0) === 0 && (
              <EmptyState title="No channels" description="Create a channel to start messaging." action={{ label: "New channel", onClick: handleNewChat }} />
            )}
            {chats?.map((chat) => (
              <button key={chat.id} type="button" onClick={() => selectChat(chat.id)} className={cn("mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm", effectiveChatId === chat.id ? "bg-brand/15 text-brand" : "text-text-muted hover:bg-surface-hover")}>
                <Hash className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{channelLabel(chat)}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col bg-void lg:col-span-7">
          {effectiveChatId ? (
            <>
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">#{chats?.find((c) => c.id === effectiveChatId) ? channelLabel(chats.find((c) => c.id === effectiveChatId)!) : "channel"}</p>
                <p className="font-mono text-[10px] text-text-muted">{effectiveChatId}</p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
                {msgsLoading && <LoadingState />}
                {msgsError && <ErrorState message={msgsError} onRetry={reloadMsgs} />}
                {!msgsLoading && messages.length === 0 && (
                  <EmptyState
                    title="No messages yet"
                    description="Start the conversation by sending the first message."
                  />
                )}
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} content={msg.content} senderWallet={msg.sender_wallet} createdAt={msg.created_at} isMine={msg.sender_wallet === myWallet} />
                ))}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
                <label htmlFor="msg" className="sr-only">Message</label>
                <input id="msg" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message #channel" className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm" />
                <Button type="submit" disabled={sending || !content.trim()}>{sending ? "…" : "Send"}</Button>
              </form>
              {sendError && <p role="alert" className="px-4 pb-3 text-sm text-danger">{sendError}</p>}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-text-muted">Select or create a channel</div>
          )}
        </section>

        <aside className="hidden flex-col border-t border-border bg-surface p-4 lg:col-span-3 lg:flex lg:border-l lg:border-t-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Project Context</p>
          <Card className="mb-4 p-3">
            <p className="text-xs font-semibold">Channel participants</p>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              {(() => {
                const active = chats?.find((chat) => chat.id === effectiveChatId);
                if (!active) return "Select a channel to view participants.";
                return [active.client_wallet, active.freelancer_wallet]
                  .filter(Boolean)
                  .join(" ↔ ") || "General chat channel";
              })()}
            </p>
          </Card>
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Chat status</p>
            {["Authenticated", "Live sync active", "Ready to collaborate"].map((m, i) => (
              <div key={m} className="mb-1 flex items-center gap-2 text-xs text-text-muted">
                <span className={cn("h-1.5 w-1.5 rounded-full", i < 3 ? "bg-success" : "bg-border")} />{m}
              </div>
            ))}
          </div>
          <Card className="p-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold"><FileText className="h-3.5 w-3.5 text-brand" /> Workspace</p>
            <Badge variant="accent">Live channel</Badge>
            <p className="mt-2 text-[10px] text-text-muted">Use invoices page for payment status and settlement details.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
