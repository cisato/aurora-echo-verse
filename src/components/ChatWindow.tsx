import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { Messages } from "./chat/Messages";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useVoiceControls } from "@/hooks/useVoiceControls";
import { useAIChat } from "@/hooks/useAIChat";
import { toast } from "sonner";
import { ChatMessageProps } from "./ChatMessage";

export function ChatWindow() {
  const initialGreetingRef = useRef(false);
  const settingsInitializedRef = useRef(false);
  const [currentPersona, setCurrentPersona] = useState("assistant");
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { streamChat, isStreaming, cancelStream } = useAIChat(currentPersona);

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
        if (voiceRate) rate = voiceRate;
        if (voicePitch) pitch = voicePitch;
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

  // Load initial greeting
  useEffect(() => {
    const initialGreeting: ChatMessageProps = {
      message: "Hello! I'm Aurora, your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      emotion: "happy"
    };
    
    setTimeout(() => {
      setMessages([initialGreeting]);
    }, 500);
  }, []);

  // Load settings and initialize voice settings
  useEffect(() => {
    if (settingsInitializedRef.current) return;
    
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { voiceEnabled, activePersona } = JSON.parse(savedSettings);
        if (voiceEnabled !== undefined) {
          setIsVoiceEnabled(voiceEnabled);
        }
        if (activePersona) {
          setCurrentPersona(activePersona);
        }
      }
      
      refreshSettings();
      settingsInitializedRef.current = true;
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    
    const handleStorageChange = () => {
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const { voiceEnabled } = JSON.parse(savedSettings);
          if (voiceEnabled !== undefined) {
            setIsVoiceEnabled(voiceEnabled);
          }
        }
        refreshSettings();
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setIsVoiceEnabled, refreshSettings]);

  // Speak initial greeting
  useEffect(() => {
    if (!initialGreetingRef.current && messages.length > 0 && isVoiceEnabled) {
      const greeting = messages[0].message;
      setTimeout(() => {
        speakText(greeting);
        initialGreetingRef.current = true;
      }, 500);
    }
  }, [messages, isVoiceEnabled]);

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputText;
    if (!messageText.trim()) return;

    const userMessage: ChatMessageProps = {
      message: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Build messages for API
    const apiMessages = messages
      .filter(m => m.message)
      .map(m => ({
        role: m.sender === "user" ? "user" as const : "assistant" as const,
        content: m.message
      }));
    
    apiMessages.push({ role: "user", content: messageText });

    let assistantContent = "";

    try {
      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.sender === "bot" && !last.isLoading) {
              return prev.map((m, i) => 
                i === prev.length - 1 
                  ? { ...m, message: assistantContent }
                  : m
              );
            }
            return [...prev, {
              message: assistantContent,
              sender: "bot" as const,
              timestamp: new Date(),
              emotion: "neutral" as const
            }];
          });
        },
        onDone: () => {
          setIsLoading(false);
          if (isVoiceEnabled && assistantContent) {
            speakText(assistantContent);
          }
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error("Failed to get response. Please try again.");
          console.error("Chat error:", error);
        }
      });
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Messages messages={messages} isLoading={isLoading && !isStreaming} />
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
