
import { Button } from "@/components/ui/button";
import { Mic, Send, Volume2, VolumeX, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useEffect } from "react";

interface ChatInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onToggleRecording: () => void;
  onToggleVoice: () => void;
  isRecording: boolean;
  isVoiceEnabled: boolean;
  isTalking: boolean;
}

export function ChatInput({
  inputText,
  onInputChange,
  onSend,
  onToggleRecording,
  onToggleVoice,
  isRecording,
  isVoiceEnabled,
  isTalking
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <Button 
          size="icon" 
          variant={isRecording ? "destructive" : "ghost"} 
          className={`rounded-full h-9 w-9 shrink-0 ${isRecording ? "animate-pulse" : ""}`} 
          onClick={onToggleRecording}
        >
          {isRecording ? <XCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Aurora..."
            className="min-h-[40px] max-h-[120px] resize-none rounded-2xl bg-muted/50 border-border/40 pr-10 text-sm py-2.5 px-4"
            rows={1}
          />
        </div>

        <Button 
          size="icon" 
          variant="ghost"
          className="rounded-full h-9 w-9 shrink-0" 
          onClick={onToggleVoice}
        >
          {isVoiceEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        
        <Button 
          size="icon" 
          className="rounded-full h-9 w-9 shrink-0" 
          onClick={onSend}
          disabled={!inputText.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
