
import { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatMessageProps } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, XCircle } from "lucide-react";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    }, 500);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: ChatMessageProps = {
      message: inputText,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    // Simulate AI thinking and response
    setTimeout(() => {
      const botMessage: ChatMessageProps = {
        message: generateResponse(inputText),
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulating voice recording
      setTimeout(() => {
        setIsRecording(false);
        setInputText("What can you help me with?");
      }, 2000);
    }
  };

  // Simple response generation logic (placeholder)
  const generateResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (lowerInput.includes("weather")) {
      return "I'm sorry, I don't have access to real-time weather data in this demo. In the full version, I would connect to a weather API to provide you with current conditions and forecasts.";
    } else if (lowerInput.includes("your name")) {
      return "I'm Aurora, your AI assistant designed to help with a variety of tasks!";
    } else if (lowerInput.includes("help")) {
      return "I can help with answering questions, providing information, setting reminders, and much more. This is just a demo, but the full version would have many more capabilities!";
    } else if (lowerInput.includes("time") || lowerInput.includes("date")) {
      return `The current time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}.`;
    } else {
      return "I understand you're asking about something important. In the full version of Aurora, I would be able to provide a more detailed and helpful response based on my integrated knowledge and capabilities.";
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
            className="rounded-full" 
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
