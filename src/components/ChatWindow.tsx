
import { useEffect, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { Messages } from "./chat/Messages";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useChatState } from "@/hooks/useChatState";
import { useVoiceControls } from "@/hooks/useVoiceControls";
import { toast } from "sonner";

export function ChatWindow() {
  // Flag to track if initial greeting has been spoken
  const initialGreetingRef = useRef(false);
  const settingsInitializedRef = useRef(false);
  
  // Initialize hooks
  const { speak, cancel: cancelSpeech, usingElevenLabs, refreshSettings } = useSpeechSynthesis({
    onStart: () => setIsTalking(true),
    onEnd: () => setIsTalking(false)
  });

  const speakText = (text: string) => {
    if (!isVoiceEnabled) return;
    
    try {
      let voice = null;
      let rate = 1;
      let pitch = 1;
      
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { selectedVoice, voiceRate, voicePitch } = JSON.parse(savedSettings);
        if (selectedVoice) {
          voice = selectedVoice.split('-')[2];
        }
        if (voiceRate) {
          rate = voiceRate;
        }
        if (voicePitch) {
          pitch = voicePitch;
        }
      }
      
      speak(text, { voice, rate, pitch });
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsTalking(false);
    }
  };

  const { startRecognition, stopRecognition } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputText(transcript);
      handleSendMessage(transcript);
    },
    onInterim: (transcript) => {
      setInputText(transcript);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      toast.error("Speech recognition error. Please try again.");
      setIsRecording(false);
    }
  });

  const {
    isRecording,
    setIsRecording,
    setIsTalking,
    isTalking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    toggleRecording,
    toggleVoice
  } = useVoiceControls(startRecognition, stopRecognition, cancelSpeech);

  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    handleSendMessage,
    currentPersona,
    setPersona
  } = useChatState(isVoiceEnabled, speakText);

  // Load settings and initialize voice settings
  useEffect(() => {
    if (settingsInitializedRef.current) return;
    
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { voiceEnabled } = JSON.parse(savedSettings);
        if (voiceEnabled !== undefined) {
          setIsVoiceEnabled(voiceEnabled);
        }
      }
      
      // Refresh speech synthesis settings
      refreshSettings();
      
      settingsInitializedRef.current = true;
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    
    // Listen for storage changes to update voice settings
    const handleStorageChange = () => {
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const { voiceEnabled } = JSON.parse(savedSettings);
          if (voiceEnabled !== undefined) {
            setIsVoiceEnabled(voiceEnabled);
          }
        }
        
        // Refresh speech synthesis settings
        refreshSettings();
      } catch (error) {
        console.error("Failed to update settings from storage event:", error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setIsVoiceEnabled, refreshSettings]);

  // Speak initial greeting only once
  useEffect(() => {
    if (!initialGreetingRef.current && messages.length > 0 && isVoiceEnabled) {
      const greeting = messages[0].message;
      setTimeout(() => {
        speakText(greeting);
        initialGreetingRef.current = true; // Mark as spoken
      }, 500);
    }
  }, [messages, isVoiceEnabled]);
  
  // Log voice status for debugging
  useEffect(() => {
    console.log(`Voice enabled: ${isVoiceEnabled}, Using ElevenLabs: ${usingElevenLabs}`);
  }, [isVoiceEnabled, usingElevenLabs]);

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
