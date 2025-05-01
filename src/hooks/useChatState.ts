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
    runInference,
    loadModel,
    downloadModel
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
      
      // Process the user's message
      let responseText = "";
      const lowerMessage = messageText.toLowerCase();
      
      // Check for math questions first (process these directly regardless of search settings)
      const mathPattern = /what\s+is\s+\d+(\s*[\+\-\*\/]\s*\d+)+/i;
      const calculatePattern = /calculate\s+\d+(\s*[\+\-\*\/]\s*\d+)+/i;
      const equationPattern = /\d+(\s*[\+\-\*\/]\s*\d+)+\s*=\s*\?/i;
      
      if (mathPattern.test(lowerMessage) || calculatePattern.test(lowerMessage) || equationPattern.test(lowerMessage)) {
        console.log("Processing math question");
        responseText = generateResponse(messageText, currentPersona);
      }
      // Check for time/date questions
      else if (lowerMessage.includes("what day is") || 
               lowerMessage.includes("what is the date") || 
               lowerMessage.includes("current time") ||
               lowerMessage.includes("what time")) {
        console.log("Processing time/date question");
        responseText = generateResponse(messageText, currentPersona);
      }
      // Check for model management commands
      else if (lowerMessage.includes('download model') || lowerMessage.includes('get model')) {
        
        const modelMatch = messageText.match(/model\s+(?:named|called)?\s+([a-zA-Z0-9-]+)/i);
        if (modelMatch && modelMatch[1]) {
          const modelName = modelMatch[1].trim();
          const matchedModel = models.find(m => 
            m.name.toLowerCase().includes(modelName.toLowerCase())
          );
          
          if (matchedModel) {
            if (matchedModel.isDownloaded) {
              responseText = `The model '${matchedModel.name}' is already downloaded. Would you like to load it?`;
            } else {
              responseText = `I'll download the ${matchedModel.name} model for you. This might take a moment...`;
              
              try {
                // Start download in background
                downloadModel(matchedModel.name).then(success => {
                  if (success) {
                    const successMessage: ChatMessageProps = {
                      message: `Successfully downloaded ${matchedModel.name}! Would you like me to load it now?`,
                      sender: "bot",
                      timestamp: new Date(),
                      emotion: "happy"
                    };
                    setMessages(prev => [...prev, successMessage]);
                    
                    // Speak the success message if voice is enabled
                    if (isVoiceEnabled) {
                      speakText(successMessage.message);
                    }
                  }
                });
              } catch (downloadError) {
                console.error("Failed to download model:", downloadError);
                responseText += " There was an issue starting the download. You can try again from the Local AI settings page.";
              }
            }
          } else {
            responseText = `I couldn't find a model matching '${modelName}'. Please check the available models in the Local AI settings.`;
          }
        } else {
          responseText = "I can download AI models for you. Please specify which model you'd like to download.";
        }
      }
      // Check if this is a load model command
      else if (lowerMessage.includes('load model') || 
               lowerMessage.includes('use model') || 
               lowerMessage.includes('activate model')) {
        
        const modelMatch = messageText.match(/model\s+(?:named|called)?\s+([a-zA-Z0-9-]+)/i);
        if (modelMatch && modelMatch[1]) {
          const modelName = modelMatch[1].trim();
          const matchedModel = models.find(m => 
            m.name.toLowerCase().includes(modelName.toLowerCase())
          );
          
          if (matchedModel) {
            if (!matchedModel.isDownloaded) {
              responseText = `The model '${matchedModel.name}' needs to be downloaded first. Would you like me to download it?`;
            } else if (matchedModel.isLoaded) {
              responseText = `The model '${matchedModel.name}' is already loaded and active.`;
            } else {
              responseText = `I'll load the ${matchedModel.name} model for you. This might take a moment...`;
              
              try {
                // Start loading in background
                loadModel(matchedModel.name).then(success => {
                  if (success) {
                    const successMessage: ChatMessageProps = {
                      message: `Successfully loaded ${matchedModel.name}! You can now use it for local inference.`,
                      sender: "bot",
                      timestamp: new Date(),
                      emotion: "happy"
                    };
                    setMessages(prev => [...prev, successMessage]);
                    
                    // Speak the success message if voice is enabled
                    if (isVoiceEnabled) {
                      speakText(successMessage.message);
                    }
                  }
                });
              } catch (loadError) {
                console.error("Failed to load model:", loadError);
                responseText += " There was an issue loading the model. You can try again from the Local AI settings page.";
              }
            }
          } else {
            responseText = `I couldn't find a model matching '${modelName}'. Please check the available models in the Local AI settings.`;
          }
        } else {
          responseText = "I can load AI models for you. Please specify which model you'd like to load.";
        }
      }
      // Check if this is a weather request
      else if (lowerMessage.includes('weather')) {
        const locationMatch = messageText.match(/weather\s+(?:in|for|at)?\s+([a-zA-Z\s]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : 'current location';
        
        console.log(`Getting weather for location: ${location}`);
        const weatherData = await getWeatherData(location);
        
        if (weatherData) {
          responseText = `The current weather in ${weatherData.location} is ${weatherData.condition} with a temperature of ${weatherData.temperature}°C, ${weatherData.humidity}% humidity, and wind speed of ${weatherData.windSpeed} km/h.`;
        } else {
          responseText = `I'm sorry, I couldn't get the weather information for ${location}. Please check if you've provided a weather API key in settings.`;
        }
      }
      // Check if this is a news request
      else if (lowerMessage.includes('news') || lowerMessage.includes('headlines')) {
        const categoryMatch = messageText.match(/news\s+(?:about|on|regarding)?\s+([a-zA-Z\s]+)/i);
        const category = categoryMatch ? categoryMatch[1].trim() : 'general';
        
        console.log(`Getting news for category: ${category}`);
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
      // Process web search for factual questions if enabled
      else if (webSearchEnabled && 
              (lowerMessage.startsWith('what is') || 
               lowerMessage.startsWith('who is') ||
               lowerMessage.startsWith('where is') ||
               lowerMessage.startsWith('when was') ||
               lowerMessage.startsWith('how many') ||
               lowerMessage.includes('search') || 
               lowerMessage.includes('find') ||
               lowerMessage.includes('look up'))) {
        
        console.log("Performing web search for factual question");
        const searchResults = await searchDuckDuckGo(messageText);
        
        if (searchResults && searchResults.length > 0) {
          responseText = `Here's what I found about "${messageText}":\n\n`;
          searchResults.forEach((result, index) => {
            if (index < 2) { // Limit to first 2 results for readability
              responseText += `${result.title}\n${result.snippet}\n\n`;
            }
          });
          responseText += "This information comes from my web search capabilities.";
        } else {
          responseText = `I searched the web but couldn't find relevant information. Let me try to answer based on what I know.`;
          // Fall back to regular response generation
          responseText += " " + generateResponse(messageText, currentPersona);
        }
      }
      // Use local AI if available and appropriate
      else if (isLocalAIAvailable && activeModel && (offlineMode || modelToUse === "local")) {
        try {
          console.log(`Using local model: ${activeModel} for inference`);
          responseText = await runInference(messageText);
        } catch (inferenceError) {
          console.error("Local inference error:", inferenceError);
          responseText = `I encountered an error with the local model. ${generateResponse(messageText, currentPersona)}`;
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
      if (lowerMessage.includes("switch to") || 
          lowerMessage.includes("activate") ||
          lowerMessage.includes("change to")) {
        
        if (lowerMessage.includes("teacher")) {
          setCurrentPersona("teacher");
          // Save to localStorage
          updatePersonaInSettings("teacher");
        } else if (lowerMessage.includes("friend")) {
          setCurrentPersona("friend");
          updatePersonaInSettings("friend");
        } else if (lowerMessage.includes("professional")) {
          setCurrentPersona("professional");
          updatePersonaInSettings("professional");
        } else if (lowerMessage.includes("creative")) {
          setCurrentPersona("creative");
          updatePersonaInSettings("creative");
        } else if (lowerMessage.includes("scientist")) {
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
        console.log("Speaking response with voice enabled");
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
