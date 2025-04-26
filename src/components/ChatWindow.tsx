
import { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, XCircle, Volume, VolumeX } from "lucide-react";
import { toast } from "sonner";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
  
  // Initialize Web Speech API
  useEffect(() => {
    // Initialize speech synthesis
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }

    // Initialize speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        
        // Auto-send if confidence is high
        if (event.results[0][0].confidence > 0.7) {
          handleSendMessage(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        toast.error("Could not understand audio. Please try again.");
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      toast.error("Speech recognition is not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial greeting on component mount
  useEffect(() => {
    const initialGreeting: ChatMessageProps = {
      message: "Hello! I'm Aurora, your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      emotion: "happy"
    };
    
    setTimeout(() => {
      setMessages([initialGreeting]);
      // Speak the greeting
      if (isVoiceEnabled) {
        speakText(initialGreeting.message);
      }
    }, 500);
  }, []);

  const speakText = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    try {
      // Get saved voice settings
      let voice = null;
      let rate = 1;
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const { selectedVoice, voiceRate } = JSON.parse(savedSettings);
          if (selectedVoice) {
            const voices = synthRef.current.getVoices();
            voice = voices.find(v => v.name.includes(selectedVoice.split('-')[2]));
          }
          if (voiceRate) {
            rate = voiceRate;
          }
        }
      } catch (error) {
        console.error("Failed to load voice settings:", error);
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = rate;
      utterance.onstart = () => setIsTalking(true);
      utterance.onend = () => setIsTalking(false);
      utterance.onerror = () => setIsTalking(false);
      
      synthRef.current.speak(utterance);
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
      // Check if we have an API key and preference set
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
      
      let responseMessage = "";
      
      if (modelToUse !== "local" && apiKey) {
        // Try to use OpenAI API if key is available
        try {
          // This would be a real API call in a production app
          console.log(`Using model: ${modelToUse} with API key`);
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          responseMessage = generateResponse(messageText);
        } catch (error) {
          console.error("API error:", error);
          responseMessage = "I'm having trouble connecting to my neural networks. Let me try my local processing...";
          responseMessage += " " + generateResponse(messageText);
        }
      } else {
        // Use local model simulation
        console.log("Using local model simulation");
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        responseMessage = generateResponse(messageText);
      }
      
      // Add bot response
      const botMessage: ChatMessageProps = {
        message: responseMessage,
        sender: "bot",
        timestamp: new Date(),
        emotion: detectEmotion(messageText)
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if voice is enabled
      if (isVoiceEnabled) {
        speakText(responseMessage);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("An error occurred while processing your message");
      
      // Fallback response
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
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
    
    // Update settings
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
    
    // If currently speaking, stop it
    if (isTalking && synthRef.current) {
      synthRef.current.cancel();
      setIsTalking(false);
    }
    
    toast.success(isVoiceEnabled ? "Voice disabled" : "Voice enabled");
  };

  // Detect emotion from text (simple version)
  const detectEmotion = (input: string): ChatMessageProps["emotion"] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("sad") || lowerInput.includes("unhappy") || lowerInput.includes("disappointed")) {
      return "sad";
    } else if (lowerInput.includes("wow") || lowerInput.includes("amazing") || lowerInput.includes("cool")) {
      return "excited";
    } else if (lowerInput.includes("why") || lowerInput.includes("how") || lowerInput.includes("explain")) {
      return "thoughtful";
    } else if (lowerInput.includes("happy") || lowerInput.includes("great") || lowerInput.includes("thanks")) {
      return "happy";
    }
    
    return "neutral";
  };

  // Simple response generation logic (enhanced version)
  const generateResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Check for persona-related commands
    if (lowerInput.includes("switch to") || lowerInput.includes("activate")) {
      if (lowerInput.includes("teacher") || lowerInput.includes("educator")) {
        return "I've switched to Teacher mode. I'll explain concepts clearly and provide educational resources. What would you like to learn about?";
      } else if (lowerInput.includes("friend") || lowerInput.includes("casual")) {
        return "Friend mode activated! Let's chat casually. How's your day going?";
      } else if (lowerInput.includes("professional") || lowerInput.includes("work")) {
        return "I've switched to Professional mode. I'll keep responses concise and business-appropriate. How can I assist with your work?";
      } else if (lowerInput.includes("creative") || lowerInput.includes("artist")) {
        return "Creative mode engaged! Let's explore ideas, art, music, or writing together. What creative project are you working on?";
      }
    }
    
    // Check for common questions
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (lowerInput.includes("your name")) {
      return "I'm Aurora, your AI assistant designed to help with a variety of tasks!";
    } else if (lowerInput.includes("weather")) {
      return "I don't have access to real-time weather data in this demo. In a full implementation, I would connect to a weather API to provide current conditions and forecasts for your location.";
    } else if (lowerInput.includes("news")) {
      return "I don't have access to current news in this demo. In the full version, I would connect to news APIs to provide you with the latest headlines and stories based on your interests.";
    } else if (lowerInput.includes("reminder") || lowerInput.includes("remind me")) {
      return "I've noted that you want to set a reminder. In the full implementation, I would ask for details like time and description, then set up a notification system to remind you at the specified time.";
    } else if (lowerInput.includes("joke")) {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the AI go to art school? To learn how to draw conclusions!",
        "What do you call fake spaghetti? An impasta!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised!",
        "How does a computer get drunk? It takes screenshots!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    } else if (lowerInput.includes("help")) {
      return "I can help with answering questions, providing information, setting reminders, and much more. Try asking about weather, news, or say 'tell me a joke'! You can also switch to different personas by saying 'Switch to Teacher mode' or 'Activate Creative mode'.";
    } else if (lowerInput.includes("time") || lowerInput.includes("date")) {
      return `The current time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}.`;
    } else if (lowerInput.includes("thank")) {
      return "You're welcome! Is there anything else I can help with?";
    } else {
      // Generate a more contextual response
      if (lowerInput.includes("music")) {
        return "Music is a wonderful topic! I could help you discover new artists, create playlists, or learn about music theory. In a full implementation, I could even play music through integrated services.";
      } else if (lowerInput.includes("movie") || lowerInput.includes("film") || lowerInput.includes("watch")) {
        return "I'd be happy to discuss movies or recommend films based on your preferences. In the full version, I could search databases for showtimes, streaming availability, and reviews.";
      } else if (lowerInput.includes("book") || lowerInput.includes("read")) {
        return "Books are great! I could recommend titles based on your interests or discuss literature. In a complete implementation, I could even provide summaries or connect to e-book services.";
      } else {
        // Default response for other queries
        return "That's an interesting topic! In the full version of Aurora, I would use my comprehensive knowledge base and specialized tools to provide you with detailed information and assistance for this request.";
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
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
      
      {/* Input area */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4">
        <div className="flex space-x-2">
          <Button 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"} 
            className={`rounded-full ${isRecording ? "animate-pulse" : ""}`} 
            onClick={toggleRecording}
          >
            {isRecording ? <XCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Aurora anything..."
            className="rounded-full bg-secondary/50"
          />
          
          <Button 
            size="icon" 
            variant="outline"
            className="rounded-full" 
            onClick={toggleVoice}
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
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
