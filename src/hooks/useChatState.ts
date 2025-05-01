
import { useState, useEffect } from 'react';
import { ChatMessageProps } from '@/components/ChatMessage';
import { toast } from 'sonner';
import { generateResponse, detectEmotion, getRelevantMemory, saveToMemory } from '@/utils/messageUtils';

export const useChatState = (isVoiceEnabled: boolean, speakText: (text: string) => void) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState("assistant");

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

  // Load saved persona if available
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { activePersona } = JSON.parse(savedSettings);
        if (activePersona) {
          setCurrentPersona(activePersona);
        }
      }
    } catch (error) {
      console.error("Failed to load persona setting:", error);
    }
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
      // Save significant user messages to memory
      saveToMemory(messageText, true);
      
      // Get relevant memory for context
      const relevantMemory = getRelevantMemory(messageText);
      
      // Determine which model to use
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
      
      // In a full implementation, check if we should use an online API based on settings
      // For now, use our enhanced local response generation
      
      // Add relevant memory as context if available
      let responseText = generateResponse(messageText, currentPersona);
      if (relevantMemory) {
        responseText = `I remember that ${relevantMemory}. ${responseText}`;
      }
      
      // If a persona change was requested, update it
      if (messageText.toLowerCase().includes("switch to") || 
          messageText.toLowerCase().includes("activate") ||
          messageText.toLowerCase().includes("change to")) {
        
        if (messageText.toLowerCase().includes("teacher")) {
          setCurrentPersona("teacher");
          // Save to localStorage
          updatePersonaInSettings("teacher");
        } else if (messageText.toLowerCase().includes("friend")) {
          setCurrentPersona("friend");
          updatePersonaInSettings("friend");
        } else if (messageText.toLowerCase().includes("professional")) {
          setCurrentPersona("professional");
          updatePersonaInSettings("professional");
        } else if (messageText.toLowerCase().includes("creative")) {
          setCurrentPersona("creative");
          updatePersonaInSettings("creative");
        } else if (messageText.toLowerCase().includes("scientist")) {
          setCurrentPersona("scientist");
          updatePersonaInSettings("scientist");
        }
      }
      
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

  const updatePersonaInSettings = (persona: string) => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        settings.activePersona = persona;
        localStorage.setItem("settings", JSON.stringify(settings));
      } else {
        localStorage.setItem("settings", JSON.stringify({ activePersona: persona }));
      }
    } catch (error) {
      console.error("Failed to save persona setting:", error);
    }
  };

  const setPersona = (persona: string) => {
    setCurrentPersona(persona);
    updatePersonaInSettings(persona);
  };

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    handleSendMessage,
    currentPersona,
    setPersona
  };
};
