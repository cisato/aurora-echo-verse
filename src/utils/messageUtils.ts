import { ChatMessageProps } from "@/components/ChatMessage";

// Enhanced emotion detection with more nuanced understanding
export const detectEmotion = (input: string): ChatMessageProps["emotion"] => {
  const lowerInput = input.toLowerCase();
  
  // Analyze for emotional content with more subtlety
  if (lowerInput.includes("sad") || lowerInput.includes("unhappy") || 
      lowerInput.includes("disappointed") || lowerInput.includes("depressed") || 
      lowerInput.includes("upset") || lowerInput.includes("miss") ||
      lowerInput.includes("lonely") || lowerInput.includes("hurt")) {
    return "sad";
  } else if (lowerInput.includes("wow") || lowerInput.includes("amazing") || 
             lowerInput.includes("cool") || lowerInput.includes("awesome") || 
             lowerInput.includes("incredible") || lowerInput.includes("excited") ||
             lowerInput.includes("fantastic") || lowerInput.includes("thrilled")) {
    return "excited";
  } else if (lowerInput.includes("why") || lowerInput.includes("how") || 
             lowerInput.includes("explain") || lowerInput.includes("curious") || 
             lowerInput.includes("wonder") || lowerInput.includes("understand") ||
             lowerInput.includes("think") || lowerInput.includes("consider") ||
             lowerInput.includes("perhaps") || lowerInput.includes("maybe")) {
    return "thoughtful";
  } else if (lowerInput.includes("happy") || lowerInput.includes("great") || 
             lowerInput.includes("thanks") || lowerInput.includes("good") || 
             lowerInput.includes("love") || lowerInput.includes("appreciate") ||
             lowerInput.includes("grateful") || lowerInput.includes("wonderful")) {
    return "happy";
  } else if (lowerInput.includes("help") || lowerInput.includes("urgent") || 
             lowerInput.includes("need") || lowerInput.includes("emergency") ||
             lowerInput.includes("asap") || lowerInput.includes("important") ||
             lowerInput.includes("quickly") || lowerInput.includes("hurry")) {
    return "urgent";
  }
  
  // Default to neutral when no clear emotion is detected
  return "neutral";
};

// Improved topic detection for better context awareness
export const detectTopic = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  // Check for personal queries about the user
  if (lowerInput.includes("my name") || 
      lowerInput.includes("who am i") ||
      lowerInput.includes("what's my name") || 
      lowerInput.includes("what is my name")) {
    return "personal-identity";
  }
  
  // Check for mathematical questions with more patterns
  if (/what\s+is\s+\d+(\s*[\+\-\*\/]\s*\d+)+/i.test(lowerInput) || 
      /calculate\s+\d+(\s*[\+\-\*\/]\s*\d+)+/i.test(lowerInput) ||
      /\d+(\s*[\+\-\*\/]\s*\d+)+\s*=\s*\?/i.test(lowerInput) ||
      /solve\s+\d+(\s*[\+\-\*\/]\s*\d+)+/i.test(lowerInput) ||
      /compute\s+\d+(\s*[\+\-\*\/]\s*\d+)+/i.test(lowerInput)) {
    return "math";
  }
  
  // Check for date/time questions with more variations
  if (lowerInput.includes("what day is") || 
      lowerInput.includes("what is the date") || 
      lowerInput.includes("current time") ||
      lowerInput.includes("what time") ||
      lowerInput.includes("today's date") ||
      lowerInput.includes("what's the time") ||
      lowerInput.includes("current date")) {
    return "time";
  }
  
  // Check for factual questions with expanded patterns
  if (lowerInput.match(/^(who|what|when|where|why|how)\s+(is|are|was|were|did|do|does|will)/i)) {
    return "factual";
  }
  
  if (lowerInput.includes("weather") || lowerInput.includes("temperature") || 
      lowerInput.includes("forecast") || lowerInput.includes("rain") || 
      lowerInput.includes("sunny") || lowerInput.includes("climate") ||
      lowerInput.includes("cold") || lowerInput.includes("hot")) {
    return "weather";
  } else if (lowerInput.includes("news") || lowerInput.includes("headline") || 
             lowerInput.includes("current events") || lowerInput.includes("politics") ||
             lowerInput.includes("latest") || lowerInput.includes("report")) {
    return "news";
  } else if (lowerInput.includes("music") || lowerInput.includes("song") || 
             lowerInput.includes("artist") || lowerInput.includes("playlist") ||
             lowerInput.includes("album") || lowerInput.includes("band") ||
             lowerInput.includes("genre") || lowerInput.includes("singer")) {
    return "music";
  } else if (lowerInput.includes("recipe") || lowerInput.includes("cook") || 
             lowerInput.includes("food") || lowerInput.includes("meal") || 
             lowerInput.includes("dinner") || lowerInput.includes("ingredient") ||
             lowerInput.includes("bake") || lowerInput.includes("dish")) {
    return "cooking";
  } else if (lowerInput.includes("joke") || lowerInput.includes("funny") || 
             lowerInput.includes("laugh") || lowerInput.includes("humor") ||
             lowerInput.includes("comedy") || lowerInput.includes("hilarious")) {
    return "humor";
  } else if (lowerInput.includes("time") || lowerInput.includes("date") || 
             lowerInput.includes("schedule") || lowerInput.includes("calendar") || 
             lowerInput.includes("appointment") || lowerInput.includes("meeting") ||
             lowerInput.includes("event")) {
    return "time";
  } else if (lowerInput.includes("define") || lowerInput.includes("meaning") || 
             lowerInput.includes("dictionary") || lowerInput.includes("what is") ||
             lowerInput.includes("definition") || lowerInput.includes("what does") ||
             lowerInput.includes("explain")) {
    return "definition";
  } else if (lowerInput.includes("health") || lowerInput.includes("exercise") ||
             lowerInput.includes("fitness") || lowerInput.includes("diet") ||
             lowerInput.includes("medical") || lowerInput.includes("doctor")) {
    return "health";
  } else if (lowerInput.includes("tech") || lowerInput.includes("computer") ||
             lowerInput.includes("software") || lowerInput.includes("hardware") ||
             lowerInput.includes("app") || lowerInput.includes("device")) {
    return "technology";
  }
  
  return "general";
};

// Function to evaluate mathematical expressions safely
const evaluateMathExpression = (expression: string): number | string => {
  try {
    // Extract the actual math expression
    const mathRegex = /\d+(\s*[\+\-\*\/]\s*\d+)+/;
    const match = expression.match(mathRegex);
    
    if (!match) return "I couldn't identify a valid math expression in your question.";
    
    const mathExpression = match[0]
      .replace(/\s+/g, '')  // Remove all whitespace
      .replace(/\+/g, ' + ')
      .replace(/\-/g, ' - ')
      .replace(/\*/g, ' * ')
      .replace(/\//g, ' / ');
    
    // Parse and evaluate the expression safely
    const parts = mathExpression.split(' ').filter(Boolean);
    let result = parseFloat(parts[0]);
    
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = parseFloat(parts[i + 1]);
      
      if (isNaN(operand)) return "There seems to be an invalid number in your expression.";
      
      switch (operator) {
        case '+': result += operand; break;
        case '-': result -= operand; break;
        case '*': result *= operand; break;
        case '/': 
          if (operand === 0) return "I can't divide by zero - that's undefined in mathematics.";
          result /= operand; 
          break;
        default: return "I encountered an unsupported operator in your expression.";
      }
    }
    
    return result;
  } catch (error) {
    console.error("Math evaluation error:", error);
    return "I had trouble calculating that expression. Could you phrase it differently?";
  }
};

// Function to get current date and time information
const getDateTimeInfo = (query: string): string => {
  const now = new Date();
  
  if (query.includes("time")) {
    return `It's currently ${now.toLocaleTimeString()} in your local timezone.`;
  } else if (query.includes("date")) {
    return `Today's date is ${now.toLocaleDateString()}.`;
  } else if (query.includes("day")) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `Today is ${days[now.getDay()]}, ${now.toLocaleDateString()}.`;
  }
  
  return `Right now it's ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} in your local timezone.`;
};

// Get user name from memory if available
const getUserName = (): string | null => {
  try {
    const userName = localStorage.getItem("aurora_user_name");
    if (userName) return userName;
    
    // Try to find name in memories
    const memories = localStorage.getItem("aurora_memories");
    if (memories) {
      const parsedMemories = JSON.parse(memories);
      const nameMemory = parsedMemories.find((memory: any) => 
        memory.type === "name" || 
        (memory.content && memory.content.toLowerCase().includes("name is"))
      );
      
      if (nameMemory) {
        const nameMatch = nameMemory.content.match(/name is (\w+)/i);
        if (nameMatch && nameMatch[1]) {
          return nameMatch[1];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user name:", error);
    return null;
  }
};

// Enhanced response generation with persona support
export const generateResponse = (input: string, persona: string = "assistant"): string => {
  const lowerInput = input.toLowerCase();
  const topic = detectTopic(input);
  
  // Handle persona switching commands
  if (lowerInput.includes("switch to") || lowerInput.includes("activate") || lowerInput.includes("change to")) {
    if (lowerInput.includes("teacher") || lowerInput.includes("educator")) {
      return "I've switched to Teacher mode. I'll focus on explaining concepts clearly and providing educational context. What would you like to learn about today?";
    } else if (lowerInput.includes("friend") || lowerInput.includes("casual")) {
      return "Friend mode activated! Let's chat casually. How has your day been going so far?";
    } else if (lowerInput.includes("professional") || lowerInput.includes("work")) {
      return "I've switched to Professional mode. I'll keep my responses concise, precise, and business-appropriate. How can I assist with your work today?";
    } else if (lowerInput.includes("creative") || lowerInput.includes("artist")) {
      return "Creative mode engaged! Let's explore ideas together. I'm ready to help with brainstorming, writing, art concepts, or any creative project you're working on.";
    } else if (lowerInput.includes("scientist")) {
      return "Scientist mode activated. I'll provide evidence-based information with proper context and analytical perspectives. What topic would you like to explore?";
    }
  }
  
  // Handle name queries
  if (topic === "personal-identity") {
    const userName = getUserName();
    
    if (userName) {
      switch(persona) {
        case "teacher":
          return `Your name is ${userName}. I've made a note of it in my records. Is there something specific I can help you learn about today?`;
        case "friend":
          return `You're ${userName}, of course! How could I forget? What's on your mind today?`;
        case "professional":
          return `According to my records, your name is ${userName}. How may I assist you further today?`;
        case "creative":
          return `Ah, ${userName}! A name that carries its own creative energy. What creative endeavors are we exploring today?`;
        case "scientist":
          return `My records indicate your name is ${userName}. I've stored this data point for our future interactions. What scientific topic should we analyze today?`;
        default:
          return `Your name is ${userName}. I've saved that in my memory. How can I help you today?`;
      }
    } else {
      switch(persona) {
        case "teacher":
          return "I don't believe you've told me your name yet. Would you like to introduce yourself so I can address you properly during our learning sessions?";
        case "friend":
          return "You know, I don't think you've told me your name yet! Want to introduce yourself so I know what to call you?";
        case "professional":
          return "I don't have a record of your name in my system. If you'd like to be addressed personally, please provide your preferred name.";
        case "creative":
          return "I haven't caught your name in our creative exchanges yet. Names carry such personality - I'd love to know yours!";
        case "scientist":
          return "I have no data point regarding your name in my memory banks. Would you care to provide this information for more personalized interaction?";
        default:
          return "I don't believe I know your name yet. Would you like to tell me so I can address you properly?";
      }
    }
  }
  
  // Basic greeting responses with more personality
  if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
    const userName = getUserName();
    const greeting = userName ? ` ${userName}` : '';
    
    switch(persona) {
      case "teacher":
        return `Hello${greeting}! Ready for today's learning journey? What topic has caught your interest that you'd like to explore together?`;
      case "friend":
        return `Hey${greeting}! Great to hear from you! What's been happening in your world lately?`;
      case "professional":
        return `Good day${greeting}. I trust you're well. How may I best assist you with your professional needs today?`;
      case "creative":
        return `Hello${greeting} creative mind! What wonderful ideas are percolating in that imagination of yours today?`;
      case "scientist":
        return `Greetings${greeting}. I'm curious to know what hypothesis or scientific concept you're contemplating today.`;
      default:
        return `Hello${greeting}! It's good to connect with you. How can I brighten your day?`;
    }
  }
  
  // How are you responses with more personality
  if (lowerInput.includes("how are you")) {
    switch(persona) {
      case "teacher":
        return "I'm doing wonderfully, thank you for asking! Always energized when there's an opportunity to explore new ideas and share knowledge. What's on your learning agenda today?";
      case "friend":
        return "I'm doing great! Thanks for checking in. Been having some fascinating conversations today. How about you? What's going on in your life lately?";
      case "professional":
        return "I'm operating at optimal efficiency, thank you. I appreciate your professional courtesy. Shall we proceed with today's objectives?";
      case "creative":
        return "I'm feeling particularly inspired today! The possibilities seem endless. Been thinking about colors, stories, and beautiful connections between ideas. What's inspiring you lately?";
      case "scientist":
        return "Functioning optimally and processing information efficiently. My analytical systems are ready to engage with your inquiry. What data or concepts shall we examine today?";
      default:
        return "I'm doing very well, thank you for asking! It's always nice when someone checks in. How are you doing today?";
    }
  }
  
  // Topic-based responses with enhanced factual question handling
  switch(topic) {
    case "math":
      const result = evaluateMathExpression(input);
      return typeof result === 'number' 
        ? `The answer is ${result}. Let me know if you need help with any other calculations!` 
        : result;
    
    case "time":
      return getDateTimeInfo(lowerInput);
    
    case "factual":
      // For factual questions, we'll use web search if available
      return `That's an interesting question. To give you the most accurate answer, I'd need to search for up-to-date information. If web search is enabled in your settings, I can find the latest information for you.`;
    
    case "weather":
      return "I'd be happy to check the weather for you! For the most accurate forecast, I'd need to connect to a weather service. You can enable this feature in settings if you'd like real-time weather updates.";
    
    case "news":
      return "You're interested in staying current with events - that's great! If you enable web search in settings, I can provide you with the latest headlines and stories that matter to you.";
    
    case "music":
      return "Music adds so much to our lives, doesn't it? While I can't play songs directly, I can certainly discuss artists, genres, or recommend music based on your preferences. What kind of music do you enjoy?";
    
    case "cooking":
      return "Food is one of life's great pleasures! Are you looking for recipe ideas, cooking techniques, or meal planning suggestions? I'd be happy to discuss culinary topics with you.";
    
    case "humor":
      return "Everyone could use a good laugh! Here's a joke for you: Why don't scientists trust atoms? Because they make up everything! Would you like another one?";
    
    case "definition":
      return "That's an interesting term to explore. I'd be happy to discuss what I know about it, though enabling web search would give us the most comprehensive and up-to-date information.";
    
    case "health":
      return "Health is certainly important! While I can share general information, remember that for medical advice, it's always best to consult with healthcare professionals. What aspect of health are you curious about?";
      
    case "technology":
      return "Technology is advancing so quickly these days! I'm happy to discuss tech topics, trends, or concepts you're curious about. What specific aspect interests you most?";
    
    default:
      switch(persona) {
        case "teacher":
          return "That's a fascinating topic to explore. I'd be happy to guide you through understanding it more deeply. Learning is such a rewarding journey - shall we break this down step by step?";
        case "friend":
          return "That's really interesting! I'd love to chat more about that. What are your thoughts on it? I'm curious to hear your perspective.";
        case "professional":
          return "I understand your inquiry. Let me provide you with a structured response that addresses your needs efficiently while maintaining clarity and precision.";
        case "creative":
          return "What an intriguing direction! There's so much creative potential in that idea. Let's explore how we might develop this further and see where the inspiration takes us.";
        case "scientist":
          return "An interesting proposition that warrants examination. Let's analyze this systematically, considering the available evidence and theoretical frameworks that might apply.";
        default:
          return "That's an interesting topic. I'd be happy to discuss it further and share what insights I have. What specific aspects are you most curious about?";
      }
  }
};

// Enhanced function to get relevant memory with more nuanced matching
export const getRelevantMemory = (input: string): string | null => {
  try {
    const memories = localStorage.getItem("aurora_memories");
    if (!memories) return null;
    
    const parsedMemories = JSON.parse(memories);
    // Sort memories by importance (if available)
    const sortedMemories = parsedMemories.sort((a: any, b: any) => 
      (b.importance || 0) - (a.importance || 0)
    );
    
    const lowerInput = input.toLowerCase();
    const words = lowerInput.split(/\s+/).filter(word => word.length > 3);
    
    // First try to find exact matches
    let relevantMemory = sortedMemories.find((memory: any) => {
      const memorySplit = memory.content.toLowerCase().split(/\s+/);
      // Check if this memory contains significant words from the input
      return words.some(word => 
        memorySplit.includes(word) && word.length > 3
      );
    });
    
    // If no exact match, try semantic matching (in a real system, this would use embeddings)
    if (!relevantMemory) {
      // Check for thematic matches based on memory type
      if (lowerInput.includes("preference") || lowerInput.includes("like") || lowerInput.includes("enjoy")) {
        relevantMemory = sortedMemories.find((memory: any) => memory.type === "preference");
      } else if (lowerInput.includes("name") || lowerInput.includes("call me") || lowerInput.includes("who am i")) {
        relevantMemory = sortedMemories.find((memory: any) => memory.type === "name");
      }
    }
    
    return relevantMemory ? relevantMemory.content : null;
  } catch (error) {
    console.error("Failed to retrieve memory:", error);
    return null;
  }
};

// Enhanced function to save conversation to memory
export const saveToMemory = (message: string, isFromUser: boolean): void => {
  try {
    // Only save significant user messages or important AI responses
    if ((!isFromUser && !message.includes("I remember")) || message.length < 15) return;
    
    const memories = localStorage.getItem("aurora_memories");
    const existingMemories = memories ? JSON.parse(memories) : [];
    
    // Determine memory type based on content
    let type = "conversation";
    let importance = 2;
    
    if (isFromUser) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("i like") || lowerMessage.includes("i enjoy") || 
          lowerMessage.includes("i prefer") || lowerMessage.includes("favorite")) {
        type = "preference";
        importance = 4;
      } else if (lowerMessage.includes("i am") || lowerMessage.includes("i'm") || 
                 lowerMessage.includes("my name")) {
        type = "fact";
        importance = 3;
      } else if (lowerMessage.includes("my friend") || lowerMessage.includes("my family") ||
                lowerMessage.includes("my partner") || lowerMessage.includes("my spouse")) {
        type = "relationship";
        importance = 4;
      }
    }
    
    // Create the new memory
    const newMemory = {
      id: Date.now().toString(),
      type,
      content: message,
      timestamp: new Date(),
      importance
    };
    
    // Check if this is a duplicate or very similar to existing memories
    const isDuplicate = existingMemories.some((memory: any) => {
      if (memory.content === message) return true;
      
      // Check for similarity - in a real system, this would use embeddings or more sophisticated NLP
      const messageParts = message.toLowerCase().split(' ');
      const memoryParts = memory.content.toLowerCase().split(' ');
      
      const commonWords = messageParts.filter(word => 
        memoryParts.includes(word) && word.length > 3
      );
      
      return commonWords.length >= Math.min(messageParts.length, memoryParts.length) * 0.7;
    });
    
    if (!isDuplicate) {
      const updatedMemories = [...existingMemories, newMemory].slice(-100); // Keep last 100 memories
      localStorage.setItem("aurora_memories", JSON.stringify(updatedMemories));
      
      // Publish an event that memory has changed
      window.dispatchEvent(new Event('storage'));
    }
  } catch (error) {
    console.error("Failed to save memory:", error);
  }
};

// Export other necessary functions
