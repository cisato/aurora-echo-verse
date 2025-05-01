
import { ChatMessageProps } from "@/components/ChatMessage";

// Enhanced emotion detection with more nuanced understanding
export const detectEmotion = (input: string): ChatMessageProps["emotion"] => {
  const lowerInput = input.toLowerCase();
  
  // Analyze for emotional content
  if (lowerInput.includes("sad") || lowerInput.includes("unhappy") || 
      lowerInput.includes("disappointed") || lowerInput.includes("depressed") || 
      lowerInput.includes("upset") || lowerInput.includes("miss")) {
    return "sad";
  } else if (lowerInput.includes("wow") || lowerInput.includes("amazing") || 
             lowerInput.includes("cool") || lowerInput.includes("awesome") || 
             lowerInput.includes("incredible") || lowerInput.includes("excited")) {
    return "excited";
  } else if (lowerInput.includes("why") || lowerInput.includes("how") || 
             lowerInput.includes("explain") || lowerInput.includes("curious") || 
             lowerInput.includes("wonder") || lowerInput.includes("understand")) {
    return "thoughtful";
  } else if (lowerInput.includes("happy") || lowerInput.includes("great") || 
             lowerInput.includes("thanks") || lowerInput.includes("good") || 
             lowerInput.includes("love") || lowerInput.includes("appreciate")) {
    return "happy";
  } else if (lowerInput.includes("help") || lowerInput.includes("urgent") || 
             lowerInput.includes("need") || lowerInput.includes("emergency") ||
             lowerInput.includes("asap") || lowerInput.includes("important")) {
    return "urgent";
  }
  
  return "neutral";
};

// Topic detection for better context awareness
export const detectTopic = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes("weather") || lowerInput.includes("temperature") || 
      lowerInput.includes("forecast") || lowerInput.includes("rain") || 
      lowerInput.includes("sunny")) {
    return "weather";
  } else if (lowerInput.includes("news") || lowerInput.includes("headline") || 
             lowerInput.includes("current events") || lowerInput.includes("politics")) {
    return "news";
  } else if (lowerInput.includes("music") || lowerInput.includes("song") || 
             lowerInput.includes("artist") || lowerInput.includes("playlist")) {
    return "music";
  } else if (lowerInput.includes("recipe") || lowerInput.includes("cook") || 
             lowerInput.includes("food") || lowerInput.includes("meal") || 
             lowerInput.includes("dinner")) {
    return "cooking";
  } else if (lowerInput.includes("joke") || lowerInput.includes("funny") || 
             lowerInput.includes("laugh") || lowerInput.includes("humor")) {
    return "humor";
  } else if (lowerInput.includes("time") || lowerInput.includes("date") || 
             lowerInput.includes("schedule") || lowerInput.includes("calendar") || 
             lowerInput.includes("appointment")) {
    return "time";
  } else if (lowerInput.includes("define") || lowerInput.includes("meaning") || 
             lowerInput.includes("dictionary") || lowerInput.includes("what is")) {
    return "definition";
  }
  
  return "general";
};

// Enhanced response generation with persona support
export const generateResponse = (input: string, persona: string = "assistant"): string => {
  const lowerInput = input.toLowerCase();
  const topic = detectTopic(input);
  
  // Handle persona switching commands
  if (lowerInput.includes("switch to") || lowerInput.includes("activate") || lowerInput.includes("change to")) {
    if (lowerInput.includes("teacher") || lowerInput.includes("educator")) {
      return "I've switched to Teacher mode. I'll explain concepts clearly and provide educational resources. What would you like to learn about?";
    } else if (lowerInput.includes("friend") || lowerInput.includes("casual")) {
      return "Friend mode activated! Let's chat casually. How's your day going?";
    } else if (lowerInput.includes("professional") || lowerInput.includes("work")) {
      return "I've switched to Professional mode. I'll keep responses concise and business-appropriate. How can I assist with your work?";
    } else if (lowerInput.includes("creative") || lowerInput.includes("artist")) {
      return "Creative mode engaged! Let's explore ideas, art, music, or writing together. What creative project are you working on?";
    } else if (lowerInput.includes("scientist")) {
      return "Scientist mode activated. I'll provide detailed, evidence-based information and analytical perspectives. What would you like to explore?";
    }
  }
  
  // Basic greeting responses
  if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
    switch(persona) {
      case "teacher":
        return "Hello there! Ready for today's learning adventure? What topic shall we explore?";
      case "friend":
        return "Hey! How's it going? What's new with you today?";
      case "professional":
        return "Good day. How may I assist you with your professional needs today?";
      case "creative":
        return "Hello creative mind! Got any inspiring ideas you want to explore today?";
      case "scientist":
        return "Greetings. What hypothesis or scientific concept would you like to discuss today?";
      default:
        return "Hello! How can I assist you today?";
    }
  }
  
  // How are you responses
  if (lowerInput.includes("how are you")) {
    switch(persona) {
      case "teacher":
        return "I'm excellent, thank you for asking! Always ready to help you learn. What subject interests you today?";
      case "friend":
        return "I'm doing great! Thanks for asking. How about you? Anything exciting happening in your world?";
      case "professional":
        return "I'm operational and ready to assist with your tasks. What project are we focusing on today?";
      case "creative":
        return "Feeling inspired and full of ideas! Ready to brainstorm or create something amazing with you.";
      case "scientist":
        return "Functioning optimally and processing information efficiently. How may I assist with your inquiry?";
      default:
        return "I'm doing well, thank you! How can I help you today?";
    }
  }
  
  // Topic-based responses
  switch(topic) {
    case "weather":
      return "I'd be happy to discuss the weather with you! For accurate weather information, I'd need to access real-time data. In a full implementation, I could connect to a weather API for this.";
    
    case "news":
      return "You're interested in current events! In a complete implementation, I could connect to news APIs to provide the latest headlines and stories that matter to you.";
    
    case "music":
      return "Music is a wonderful topic! While I can't play songs directly, in a full implementation, I could provide information about artists, recommend playlists, or even integrate with music streaming services.";
    
    case "cooking":
      return "Are you looking for cooking inspiration? In a complete version, I could suggest recipes based on ingredients you have, dietary preferences, or cuisine types you enjoy.";
    
    case "humor":
      return "Could always use a good laugh! Here's a joke: Why don't scientists trust atoms? Because they make up everything!";
    
    case "time":
      return `The current time is ${new Date().toLocaleTimeString()} and today's date is ${new Date().toLocaleDateString()}.`;
    
    case "definition":
      return "I'd be happy to define terms for you! In a complete implementation, I could connect to dictionary APIs or knowledge bases to provide accurate definitions.";
    
    default:
      switch(persona) {
        case "teacher":
          return "That's an interesting topic to learn about. I'd be happy to explain it step by step. In a full implementation, I would have access to educational resources to provide detailed information.";
        case "friend":
          return "That's cool! I'd love to chat more about that. Tell me more about what's on your mind?";
        case "professional":
          return "I understand your inquiry. In a complete implementation, I would provide a concise, business-appropriate response to address your professional needs.";
        case "creative":
          return "What an interesting creative direction! I'd love to explore this idea further with you and see where it leads.";
        case "scientist":
          return "That's a fascinating subject. In a full implementation, I would provide evidence-based information and analytical insights on this topic.";
        default:
          return "I understand you're asking about that. In a full implementation, I would have more detailed responses for various topics and questions.";
      }
  }
};

// Function to get relevant memory for context
export const getRelevantMemory = (input: string): string | null => {
  try {
    const memories = localStorage.getItem("aurora_memories");
    if (!memories) return null;
    
    const parsedMemories = JSON.parse(memories);
    // In a real implementation, this would use vector similarity search
    // For now, just basic keyword matching
    
    const lowerInput = input.toLowerCase();
    const relevantMemory = parsedMemories.find((memory: any) => 
      lowerInput.includes(memory.content.toLowerCase().split(' ').slice(0, 3).join(' '))
    );
    
    return relevantMemory ? relevantMemory.content : null;
  } catch (error) {
    console.error("Failed to retrieve memory:", error);
    return null;
  }
};

// Function to save conversation to memory
export const saveToMemory = (message: string, isFromUser: boolean): void => {
  try {
    // Only save significant user messages
    if (!isFromUser || message.length < 10) return;
    
    const memories = localStorage.getItem("aurora_memories");
    const existingMemories = memories ? JSON.parse(memories) : [];
    
    const newMemory = {
      id: Date.now().toString(),
      type: "conversation",
      content: message,
      timestamp: new Date()
    };
    
    const updatedMemories = [...existingMemories, newMemory].slice(-50); // Keep last 50 memories
    localStorage.setItem("aurora_memories", JSON.stringify(updatedMemories));
  } catch (error) {
    console.error("Failed to save memory:", error);
  }
};
