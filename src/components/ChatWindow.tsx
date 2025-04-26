
import { useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { Messages } from "./chat/Messages";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useChatState } from "@/hooks/useChatState";
import { useVoiceControls } from "@/hooks/useVoiceControls";

export function ChatWindow() {
  // Initialize hooks
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis({
    onStart: () => setIsTalking(true),
    onEnd: () => setIsTalking(false)
  });

  const speakText = (text: string) => {
    if (!isVoiceEnabled) return;
    
    try {
      let voice = null;
      let rate = 1;
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { selectedVoice, voiceRate } = JSON.parse(savedSettings);
        if (selectedVoice) {
          voice = selectedVoice.split('-')[2];
        }
        if (voiceRate) {
          rate = voiceRate;
        }
      }
      
      speak(text, { voice, rate });
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsTalking(false);
    }
  };

  const { startRecognition, stopRecognition } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputText(transcript);
      handleSendMessage(transcript);
    }
  });

  const {
    isRecording,
    setIsTalking,
    isTalking,
    isVoiceEnabled,
    toggleRecording,
    toggleVoice
  } = useVoiceControls(startRecognition, stopRecognition, cancelSpeech);

  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    handleSendMessage
  } = useChatState(isVoiceEnabled, speakText);

  // Load settings
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { voiceEnabled } = JSON.parse(savedSettings);
        setIsVoiceEnabled(voiceEnabled);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Messages messages={messages} isLoading={isLoading} />
      <ChatInput
        inputText={inputText}
        onInputChange={setInputText}
        onSend={() => handleSendMessage()}
        onToggleRecording={toggleRecording}
        onToggleVoice={toggleVoice}
        isRecording={isRecording}
        isVoiceEnabled={isVoiceEnabled}
        isTalking={isTalking}
      />
    </div>
  );
}
