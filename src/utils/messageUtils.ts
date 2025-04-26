
import { ChatMessageProps } from "@/components/ChatMessage";

export const detectEmotion = (input: string): ChatMessageProps["emotion"] => {
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

export const generateResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
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
  
  if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
    return "Hello! How can I assist you today?";
  }
  // ... Add other response generation logic
  
  return "I understand you're asking about that. In a full implementation, I would have more detailed responses for this topic.";
};
