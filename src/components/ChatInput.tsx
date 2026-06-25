import { Button } from "@/components/ui/button";
import { Mic, Send, Volume2, VolumeX, Square, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onToggleRecording: () => void;
  onToggleVoice: () => void;
  isRecording: boolean;
  isVoiceEnabled: boolean;
  isTalking: boolean;
  isTranscribing?: boolean;
}

export function ChatInput({
  inputText,
  onInputChange,
  onSend,
  onToggleRecording,
  onToggleVoice,
  isRecording,
  isVoiceEnabled,
  isTranscribing,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = inputText.trim().length > 0 && !isTranscribing;

  return (
    <div className="border-t border-border/40 bg-gradient-to-b from-background/60 to-background backdrop-blur-xl px-3 sm:px-4 pt-3 pb-3 safe-pb">
      {isRecording && (
        <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-xs animate-in fade-in slide-in-from-bottom-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
          </span>
          <span className="font-medium">Listening… tap stop when done</span>
          <div className="flex items-end gap-0.5 ml-auto h-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-0.5 bg-destructive rounded-full animate-pulse"
                style={{
                  height: `${30 + ((i * 37) % 70)}%`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            "flex items-end gap-2 p-2 rounded-3xl border bg-card/80 shadow-lg transition-all",
            isRecording
              ? "border-destructive/50 ring-2 ring-destructive/20"
              : "border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15",
          )}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onToggleVoice}
            aria-label={isVoiceEnabled ? "Mute Aurora" : "Unmute Aurora"}
          >
            {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isTranscribing
                ? "Transcribing…"
                : isRecording
                ? "Listening…"
                : "Talk to Aurora…"
            }
            disabled={isTranscribing}
            className="flex-1 min-h-[40px] max-h-[160px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2 text-[15px] leading-snug shadow-none"
            rows={1}
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              "rounded-full h-10 w-10 shrink-0 transition-all",
              isRecording
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
            onClick={onToggleRecording}
            disabled={isTranscribing}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "rounded-full h-10 w-10 shrink-0 transition-all",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:scale-105"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/70 text-center mt-2">
          Aurora can make mistakes — verify anything important.
        </p>
      </div>
    </div>
  );
}
