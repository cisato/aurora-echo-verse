
import { cn } from "@/lib/utils";
import { AuroraAvatar } from "./AuroraAvatar";
import { User } from "lucide-react";
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
  emotion = "neutral",
  isLoading = false
}: ChatMessageProps) {
  const isBot = sender === "bot";
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        "flex w-full",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] md:max-w-[70%]",
          isBot ? "flex-row" : "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0",
          isBot ? "mr-3" : "ml-3"
        )}>
          {isBot ? (
            <AuroraAvatar isActive={true} isThinking={isLoading} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col gap-1">
          <span className={cn(
            "text-[10px] font-medium uppercase tracking-wider px-1",
            isBot ? "text-muted-foreground" : "text-muted-foreground text-right"
          )}>
            {isBot ? "Aurora" : "You"} · {formatTime(timestamp)}
          </span>
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              isBot 
                ? "bg-muted/50 text-foreground rounded-tl-sm" 
                : "bg-primary text-primary-foreground rounded-tr-sm"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-1.5 py-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-pulse [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            ) : isBot ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:my-2 [&>ol]:my-2">
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            ) : (
              <span>{message}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
