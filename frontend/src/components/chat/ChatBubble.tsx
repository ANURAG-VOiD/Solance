import { cn } from "@/lib/utils";
import { formatTimestamp, truncateWallet } from "@/lib/utils";

interface ChatBubbleProps {
  content: string;
  senderWallet: string;
  createdAt: string;
  isMine: boolean;
}

export function ChatBubble({
  content,
  senderWallet,
  createdAt,
  isMine,
}: ChatBubbleProps) {
  return (
    <div className={cn("max-w-[85%]", isMine && "ml-auto")}>
      <div className="mb-0.5 flex items-baseline gap-2">
        <span className="text-xs font-medium text-text">
          {isMine ? "You" : truncateWallet(senderWallet)}
        </span>
        <time className="text-[10px] text-text-muted" dateTime={createdAt}>
          {formatTimestamp(createdAt)}
        </time>
      </div>
      <p
        className={cn(
          "rounded-md px-3 py-2 text-sm",
          isMine
            ? "bg-brand/15 text-text"
            : "border border-border bg-surface text-text",
        )}
      >
        {content}
      </p>
    </div>
  );
}
