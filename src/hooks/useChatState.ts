import { useState, useEffect } from 'react';
import { ChatMessageProps } from '@/components/ChatMessage';
import { toast } from 'sonner';
import { generateResponse, detectEmotion } from '@/utils/messageUtils';

export const useChatState = (isVoiceEnabled: boolean, speakText: (text: string) => void) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    
    try {
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
      
      const botMessage: ChatMessageProps = {
        message: responseText,
        sender: "bot",
        timestamp: new Date(),
        emotion: detectEmotion(messageText)
      };
      
      setMessages(prev => [...prev, botMessage]);
      
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

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    handleSendMessage
  };
};
