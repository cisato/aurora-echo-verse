import { cn } from "@/lib/utils";
import { AuroraAvatar } from "./AuroraAvatar";
import ReactMarkdown from "react-markdown";

export interface ChatMessageProps {
  message: string;
  sender: "user" | "bot";
  timestamp: Date;
  emotion?: "neutral" | "happy" | "sad" | "excited" | "thoughtful" | "urgent";
  isLoading?: boolean;
}

export function ChatMessage({
  message,
  sender,
  timestamp,
  isLoading = false,
}: ChatMessageProps) {
  const isBot = sender === "bot";

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isBot) {
    return (
      <div className="flex w-full gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="shrink-0 mt-0.5">
          <AuroraAvatar isActive isThinking={isLoading} size="sm" />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-sm font-semibold">Aurora</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {formatTime(timestamp)}
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-1.5 py-2">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[0.85em] [&_pre]:bg-muted [&_pre]:rounded-xl [&_pre]:p-3 [&_a]:text-primary [&_a]:underline-offset-2">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User message — distinctive forest bubble with high contrast
  return (
    <div className="flex w-full justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col items-end max-w-[85%] md:max-w-[70%]">
        <div
          className={cn(
            "px-4 py-2.5 rounded-3xl rounded-br-md text-sm leading-relaxed shadow-sm",
            "bg-primary text-primary-foreground",
          )}
        >
          <span className="whitespace-pre-wrap break-words">{message}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 mr-1">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
