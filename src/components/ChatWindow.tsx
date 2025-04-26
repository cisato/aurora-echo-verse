
import { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { detectEmotion, generateResponse } from "@/utils/messageUtils";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize hooks
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis({
    onStart: () => setIsTalking(true),
    onEnd: () => setIsTalking(false)
  });

  const { start: startRecognition, stop: stopRecognition } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputText(transcript);
      handleSendMessage(transcript);
    }
  });

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial greeting
  useEffect(() => {
    const initialGreeting: ChatMessageProps = {
      message: "Hello! I'm Aurora, your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      emotion: "happy"
    };
    
    setTimeout(() => {
      setMessages([initialGreeting]);
      if (isVoiceEnabled) {
        speakText(initialGreeting.message);
      }
    }, 500);
  }, []);

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

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputText;
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: ChatMessageProps = {
      message: messageText,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    try {
      // Check settings
      let modelToUse = "local";
      let apiKey = "";
      
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const { apiKey: savedKey, modelPreference, offlineMode } = JSON.parse(savedSettings);
          apiKey = savedKey;
          
          if (offlineMode) {
            modelToUse = "local";
          } else if (savedKey && modelPreference) {
            modelToUse = modelPreference;
          }
        }
      } catch (error) {
        console.error("Failed to load model settings:", error);
      }
      
      const responseText = generateResponse(messageText);
      
      // Add bot response
      const botMessage: ChatMessageProps = {
        message: responseText,
        sender: "bot",
        timestamp: new Date(),
        emotion: detectEmotion(messageText)
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if voice is enabled
      if (isVoiceEnabled) {
        speakText(responseText);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("An error occurred while processing your message");
      
      const errorMessage: ChatMessageProps = {
        message: "I'm sorry, I encountered an error processing your request. Can you try again?",
        sender: "bot",
        timestamp: new Date(),
        emotion: "sad"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecognition();
      setIsRecording(false);
    } else {
      try {
        startRecognition();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Could not start speech recognition");
        setIsRecording(false);
      }
    }
  };
  
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        settings.voiceEnabled = !isVoiceEnabled;
        localStorage.setItem("settings", JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Failed to update voice settings:", error);
    }
    
    if (isTalking) {
      cancelSpeech();
      setIsTalking(false);
    }
    
    toast.success(isVoiceEnabled ? "Voice disabled" : "Voice enabled");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} {...msg} />
        ))}
        
        {isLoading && (
          <ChatMessage 
            message="" 
            sender="bot" 
            timestamp={new Date()} 
            isLoading={true} 
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
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
