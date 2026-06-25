import { useRef, useEffect } from "react";
import { ChatMessage, ChatMessageProps } from "../ChatMessage";
import { AuroraAvatar } from "../AuroraAvatar";

interface MessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
  onSuggestionClick?: (text: string) => void;
}

const SUGGESTIONS = [
  { icon: "✦", title: "Set the tone", prompt: "Help me set a clear intention for today." },
  { icon: "✎", title: "Think out loud", prompt: "I want to think through something — ask me one good question." },
  { icon: "☼", title: "Brighten it up", prompt: "Tell me something genuinely interesting I probably don't know." },
  { icon: "⤴", title: "Plan ahead", prompt: "Help me plan the next three hours so I feel less scattered." },
];

export function Messages({ messages, isLoading, onSuggestionClick }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  if (isEmpty) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center text-center min-h-full justify-center">
          <div className="mb-5">
            <AuroraAvatar isActive size="lg" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight mb-2">
            What's on your mind?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            I remember our conversations, notice patterns, and check in when it matters. Start anywhere.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => onSuggestionClick?.(s.prompt)}
                className="group text-left p-3 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-primary text-lg leading-none mt-0.5">{s.icon}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{s.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {s.prompt}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {isLoading && (
          <ChatMessage message="" sender="bot" timestamp={new Date()} isLoading />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
