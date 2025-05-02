
import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";
import { Memory } from "@/components/Memory";
import Settings from "@/pages/Settings";
import { PersonaSelector } from "@/components/PersonaSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChatState } from "@/hooks/useChatState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const [activeMode, setActiveMode] = useState("chat");
  const [showWelcome, setShowWelcome] = useState(true);
  const { handleSendMessage } = useChatState(true); // Initialize chat state
  
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

  const handleQuickAction = (action: string) => {
    switch(action) {
      case "today":
        handleSendMessage("What's the date today?");
        handleModeChange("chat");
        break;
      case "weather":
        handleSendMessage("What's the weather like?");
        handleModeChange("chat");
        break;
      case "help":
        handleSendMessage("What can you help me with?");
        handleModeChange("chat");
        break;
      case "joke":
        handleSendMessage("Tell me a joke");
        handleModeChange("chat");
        break;
      default:
        break;
    }
    
    toast.success(`Quick action: ${action} activated`);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-mesh">
      <Sidebar onModeChange={handleModeChange} activeMode={activeMode} />
      
      <div className="flex-1 flex flex-col">
        {showWelcome && (
          <div className="p-4">
            <Alert className="border-accent/30 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                onClick={dismissWelcome}
              >
                &times;
              </Button>
              <AlertTitle className="text-accent">
                Welcome to Aurora AI Assistant
              </AlertTitle>
              <AlertDescription className="text-sm">
                This is a demo version of Aurora. Explore different personas, try voice commands, 
                and check out the dashboard. Click the microphone to speak with Aurora.
              </AlertDescription>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleQuickAction("today")}>
                  What's today?
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction("weather")}>
                  Check weather
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction("help")}>
                  Help me
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction("joke")}>
                  Tell a joke
                </Button>
              </div>
            </Alert>
          </div>
        )}
        
        {activeMode === "chat" && (
          <>
            <div className="border-b p-2">
              <PersonaSelector onSelectPersona={(persona) => {
                // The actual state change happens inside PersonaSelector 
                // which stores the selection in localStorage
                console.log(`Index: Persona changed to: ${persona}`);
              }} />
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
