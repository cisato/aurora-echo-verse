
import { useRef, useEffect } from 'react';
import { ChatMessage, ChatMessageProps } from '../ChatMessage';

interface MessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
}

export function Messages({ messages, isLoading }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
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
  );
}
