
import React from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { PersonaSelector } from "@/components/PersonaSelector";
import { CompanionModeSelector } from "@/components/CompanionModeSelector";

const Chat = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b px-3 py-1.5 flex items-center justify-between gap-2">
        <PersonaSelector onSelectPersona={(persona) => {
          console.log(`Chat page: Persona changed to: ${persona}`);
        }} />
        <CompanionModeSelector />
      </div>
      <ChatWindow />
    </div>
  );
};

export default Chat;
