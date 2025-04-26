
import { cn } from "@/lib/utils";
import { AuroraAvatar } from "./AuroraAvatar";
import { User } from "lucide-react";

export interface ChatMessageProps {
  message: string;
  sender: "user" | "bot";
  timestamp: Date;
  emotion?: "neutral" | "happy" | "sad" | "excited" | "thoughtful";
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
        "flex w-full mb-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] md:max-w-[70%]",
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
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          <div
            className={cn(
              "px-4 py-3 rounded-2xl",
              isBot 
                ? "bg-gradient-to-br from-primary/10 to-accent/10 text-foreground rounded-tl-none glass-panel" 
                : "bg-primary text-primary-foreground rounded-tr-none"
            )}
          >
            <div className={cn(
              "mb-1 text-xs opacity-70",
              isBot ? "" : "text-primary-foreground/80"
            )}>
              {isBot ? "Aurora" : "You"} • {formatTime(timestamp)}
            </div>
            
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-300"></div>
              </div>
            ) : (
              <div>{message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
