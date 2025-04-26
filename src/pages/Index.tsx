
import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";
import { Memory } from "@/components/Memory";
import Settings from "@/pages/Settings";
import { PersonaSelector } from "@/components/PersonaSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [activeMode, setActiveMode] = useState("chat");
  const [currentPersona, setCurrentPersona] = useState("assistant");
  const [showWelcome, setShowWelcome] = useState(true);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("aurora_has_visited");
    if (hasVisited) {
      setShowWelcome(false);
    } else {
      // Set the flag for future visits
      localStorage.setItem("aurora_has_visited", "true");
    }
    
    // Load last active mode if available
    const lastMode = localStorage.getItem("aurora_last_mode");
    if (lastMode) {
      setActiveMode(lastMode);
    }
  }, []);
  
  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    localStorage.setItem("aurora_last_mode", mode);
  };
  
  const handlePersonaChange = (persona: string) => {
    setCurrentPersona(persona);
    // In a full implementation, this would update the chat context
    console.log(`Persona changed to: ${persona}`);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-mesh">
      <Sidebar onModeChange={handleModeChange} activeMode={activeMode} />
      
      <div className="flex-1 flex flex-col">
        {showWelcome && (
          <div className="p-4">
            <Alert className="border-accent/30">
              <AlertTitle className="text-accent">
                Welcome to Aurora AI Assistant
              </AlertTitle>
              <AlertDescription className="text-sm">
                This is a demo version of Aurora. Explore different personas, try voice commands, 
                and check out the dashboard. Click the microphone to speak with Aurora.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {activeMode === "chat" && (
          <>
            <div className="border-b p-2">
              <PersonaSelector onSelectPersona={handlePersonaChange} />
            </div>
            <ChatWindow />
          </>
        )}
        
        {activeMode === "dashboard" && <Dashboard />}
        
        {activeMode === "memory" && <Memory />}
        
        {activeMode === "settings" && <Settings />}
      </div>
    </div>
  );
};

export default Index;
