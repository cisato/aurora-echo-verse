import { cn } from "@/lib/utils";
import { AuroraAvatar } from "./AuroraAvatar";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isBot) {
    return (
      <div className="flex w-full gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="shrink-0 mt-0.5">
          <AuroraAvatar isActive isThinking={isLoading} size="sm" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          {isLoading ? (
            <div className="flex items-center gap-2 py-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse [animation-delay:-0.3s]" />
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse [animation-delay:-0.15s]" />
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
              <span className="text-xs text-muted-foreground/70 ml-1 italic">Aurora is thinking…</span>
            </div>
          ) : (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-[1.7] [&>p]:mb-3 [&>p:last-child]:mb-0 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[0.85em] [&_code]:font-mono [&_pre]:bg-muted/80 [&_pre]:rounded-2xl [&_pre]:p-4 [&_pre]:border [&_pre]:border-border/40 [&_a]:text-primary [&_a]:underline-offset-4 [&_a]:decoration-primary/40 hover:[&_a]:decoration-primary [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5">
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Copy message"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <span className="text-[10px] text-muted-foreground/50 ml-1">
                  {formatTime(timestamp)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-end group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col items-end max-w-[85%] md:max-w-[70%]">
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm",
            "bg-primary text-primary-foreground",
          )}
        >
          <span className="whitespace-pre-wrap break-words">{message}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
