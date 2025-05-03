
import React from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { PersonaSelector } from "@/components/PersonaSelector";

const Chat = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-2">
        <PersonaSelector onSelectPersona={(persona) => {
          console.log(`Chat page: Persona changed to: ${persona}`);
        }} />
      </div>
      <ChatWindow />
    </div>
  );
};

export default Chat;
