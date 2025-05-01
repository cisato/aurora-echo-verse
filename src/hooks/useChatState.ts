import { useState, useEffect } from 'react';
import { ChatMessageProps } from '@/components/ChatMessage';
import { toast } from 'sonner';
import { generateResponse, detectEmotion, getRelevantMemory, saveToMemory } from '@/utils/messageUtils';
import { useLocalAI } from '@/hooks/useLocalAI';
import { searchDuckDuckGo, getWeatherData, getNewsHeadlines } from '@/utils/searchUtils';

export const useChatState = (isVoiceEnabled: boolean, speakText: (text: string) => void) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState("assistant");
  
  // Initialize local AI
  const { 
    isAvailable: isLocalAIAvailable, 
    activeModel, 
    models,
    runInference
  } = useLocalAI();

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
      let offlineMode = false;
      let webSearchEnabled = false;
      
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          apiKey = settings.apiKey;
          
          if (settings.offlineMode) {
            offlineMode = true;
            modelToUse = "local";
          } else if (apiKey && settings.modelPreference) {
            modelToUse = settings.modelPreference;
          }
          
          if (settings.webSearchEnabled !== undefined) {
            webSearchEnabled = settings.webSearchEnabled;
          }
        }
      } catch (error) {
        console.error("Failed to load model settings:", error);
      }
      
      // Check for special commands or information requests
      let responseText = "";
      
      // Check if this is a weather request
      if (messageText.toLowerCase().includes('weather')) {
        const locationMatch = messageText.match(/weather\s+(?:in|for|at)?\s+([a-zA-Z\s]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : 'current location';
        
        const weatherData = await getWeatherData(location);
        if (weatherData) {
          responseText = `The current weather in ${weatherData.location} is ${weatherData.condition} with a temperature of ${weatherData.temperature}°C, ${weatherData.humidity}% humidity, and wind speed of ${weatherData.windSpeed} km/h.`;
        } else {
          responseText = `I'm sorry, I couldn't get the weather information for ${location}. Please check if you've provided a weather API key in settings.`;
        }
      } 
      // Check if this is a news request
      else if (messageText.toLowerCase().includes('news') || messageText.toLowerCase().includes('headlines')) {
        const categoryMatch = messageText.match(/news\s+(?:about|on|regarding)?\s+([a-zA-Z\s]+)/i);
        const category = categoryMatch ? categoryMatch[1].trim() : 'general';
        
        const headlines = await getNewsHeadlines(category);
        if (headlines && headlines.length > 0) {
          responseText = `Here are some recent headlines:\n\n`;
          headlines.forEach((headline, index) => {
            responseText += `${index + 1}. ${headline.title} (${headline.source})\n`;
          });
        } else {
          responseText = `I'm sorry, I couldn't fetch the latest news. Please check if you've provided a news API key in settings.`;
        }
      }
      // Process web search if enabled and necessary
      else if (webSearchEnabled && 
              (messageText.toLowerCase().includes('search') || 
               messageText.toLowerCase().includes('find') ||
               messageText.toLowerCase().includes('look up'))) {
        
        const searchResults = await searchDuckDuckGo(messageText);
        if (searchResults && searchResults.length > 0) {
          responseText = `Here are some search results that might help:\n\n`;
          searchResults.forEach((result, index) => {
            responseText += `${index + 1}. ${result.title}\n${result.snippet}\n\n`;
          });
        } else {
          responseText = `I searched the web but couldn't find relevant information. Let me try to answer based on what I know.`;
          // Fall back to regular response generation
          responseText += " " + generateResponse(messageText, currentPersona);
        }
      }
      // Use local AI if available and appropriate
      else if (isLocalAIAvailable && activeModel && (offlineMode || modelToUse === "local")) {
        try {
          responseText = await runInference(messageText);
        } catch (inferenceError) {
          console.error("Local inference error:", inferenceError);
          responseText = generateResponse(messageText, currentPersona);
        }
      } 
      // Otherwise, use the default response generation
      else {
        responseText = generateResponse(messageText, currentPersona);
      }
      
      // Add relevant memory as context if available
      if (relevantMemory && !responseText.includes("I remember")) {
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
      
      // Save significant bot messages to memory
      saveToMemory(responseText, false);
      
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
