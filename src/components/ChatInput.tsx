
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Volume, VolumeX, XCircle } from "lucide-react";

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
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-4">
      <div className="flex space-x-2">
        <Button 
          size="icon" 
          variant={isRecording ? "destructive" : "outline"} 
          className={`rounded-full ${isRecording ? "animate-pulse" : ""}`} 
          onClick={onToggleRecording}
        >
          {isRecording ? <XCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Input
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask Aurora anything..."
          className="rounded-full bg-secondary/50"
        />
        
        <Button 
          size="icon" 
          variant="outline"
          className="rounded-full" 
          onClick={onToggleVoice}
        >
          {isVoiceEnabled ? (
            isTalking ? <Volume className="h-5 w-5" /> : <Volume className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          size="icon" 
          className="rounded-full" 
          onClick={onSend}
          disabled={!inputText.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
