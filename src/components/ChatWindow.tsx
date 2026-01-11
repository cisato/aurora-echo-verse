import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { Messages } from "./chat/Messages";
import { ConversationHistory } from "./ConversationHistory";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useVoiceControls } from "@/hooks/useVoiceControls";
import { useAIChat } from "@/hooks/useAIChat";
import { useConversations } from "@/hooks/useConversations";
import { useProfile } from "@/hooks/useProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { ChatMessageProps } from "./ChatMessage";

export function ChatWindow() {
  const initialGreetingRef = useRef(false);
  const settingsInitializedRef = useRef(false);
  const [displayMessages, setDisplayMessages] = useState<ChatMessageProps[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { profile } = useProfile();
  const { settings } = useUserSettings();
  const {
    conversations,
    currentConversation,
    messages: dbMessages,
    createConversation,
    selectConversation,
    addMessage,
    deleteConversation
  } = useConversations();

  const { streamChat, isStreaming } = useAIChat(settings.active_persona);

  const { speak, cancel: cancelSpeech, refreshSettings } = useSpeechSynthesis({
    onStart: () => setIsTalking(true),
    onEnd: () => setIsTalking(false)
  });

  const speakText = (text: string) => {
    if (!settings.voice_enabled) return;
    
    try {
      let voice = null;
      let rate = 1;
      let pitch = 1;
      
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { selectedVoice, voiceRate, voicePitch } = JSON.parse(savedSettings);
        if (selectedVoice) {
          voice = selectedVoice.split('-')[2];
        }
        if (voiceRate) rate = voiceRate;
        if (voicePitch) pitch = voicePitch;
      }
      
      speak(text, { voice, rate, pitch });
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsTalking(false);
    }
  };

  const { startRecognition, stopRecognition } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputText(transcript);
      handleSendMessage(transcript);
    },
    onInterim: (transcript) => {
      setInputText(transcript);
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      toast.error("Speech recognition error. Please try again.");
      setIsRecording(false);
    }
  });

  const {
    isRecording,
    setIsRecording,
    setIsTalking,
    isTalking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    toggleRecording,
    toggleVoice
  } = useVoiceControls(startRecognition, stopRecognition, cancelSpeech);

  // Sync voice enabled with settings
  useEffect(() => {
    setIsVoiceEnabled(settings.voice_enabled);
  }, [settings.voice_enabled, setIsVoiceEnabled]);

  // Convert DB messages to display format
  useEffect(() => {
    if (dbMessages.length > 0) {
      const formatted: ChatMessageProps[] = dbMessages.map(msg => ({
        message: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: new Date(msg.created_at),
        emotion: msg.emotion as ChatMessageProps['emotion']
      }));
      setDisplayMessages(formatted);
      initialGreetingRef.current = true;
    } else if (!currentConversation) {
      // Show initial greeting for new/no conversation
      const initialGreeting: ChatMessageProps = {
        message: profile?.display_name 
          ? `Hello ${profile.display_name}! I'm Aurora, your AI assistant. How can I help you today?`
          : "Hello! I'm Aurora, your AI assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
        emotion: "happy"
      };
      setDisplayMessages([initialGreeting]);
    }
  }, [dbMessages, currentConversation, profile?.display_name]);

  // Speak initial greeting
  useEffect(() => {
    if (!initialGreetingRef.current && displayMessages.length > 0 && settings.voice_enabled) {
      const greeting = displayMessages[0].message;
      setTimeout(() => {
        speakText(greeting);
        initialGreetingRef.current = true;
      }, 500);
    }
  }, [displayMessages, settings.voice_enabled]);

  const handleNewConversation = async () => {
    await createConversation();
    initialGreetingRef.current = false;
  };

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputText;
    if (!messageText.trim()) return;

    // Create conversation if none exists
    let conversationId = currentConversation?.id;
    if (!conversationId) {
      const newConv = await createConversation(messageText.slice(0, 50));
      if (!newConv) return;
      conversationId = newConv.id;
    }

    const userMessage: ChatMessageProps = {
      message: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setDisplayMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Save user message to DB
    await addMessage('user', messageText);

    // Build messages for API
    const apiMessages = displayMessages
      .filter(m => m.message)
      .map(m => ({
        role: m.sender === "user" ? "user" as const : "assistant" as const,
        content: m.message
      }));
    
    apiMessages.push({ role: "user", content: messageText });

    let assistantContent = "";

    try {
      await streamChat({
        messages: apiMessages,
        userName: profile?.display_name || undefined,
        onDelta: (chunk) => {
          assistantContent += chunk;
          setDisplayMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.sender === "bot" && !last.isLoading) {
              return prev.map((m, i) => 
                i === prev.length - 1 
                  ? { ...m, message: assistantContent }
                  : m
              );
            }
            return [...prev, {
              message: assistantContent,
              sender: "bot" as const,
              timestamp: new Date(),
              emotion: "neutral" as const
            }];
          });
        },
        onDone: async () => {
          setIsLoading(false);
          // Save assistant message to DB
          if (assistantContent) {
            await addMessage('assistant', assistantContent, 'neutral');
            if (settings.voice_enabled) {
              speakText(assistantContent);
            }
          }
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error("Failed to get response. Please try again.");
          console.error("Chat error:", error);
        }
      });
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex h-full">
      <ConversationHistory
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex flex-col flex-1 min-w-0">
        <Messages messages={displayMessages} isLoading={isLoading && !isStreaming} />
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
    </div>
  );
}
