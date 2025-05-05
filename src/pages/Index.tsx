
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useChatState } from "@/hooks/useChatState";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { WelcomeAlert } from "@/components/welcome/WelcomeAlert";
import { ModeContent } from "@/components/mode-content/ModeContent";
import { useQuickActions } from "@/hooks/useQuickActions";

const Index = () => {
  const [activeMode, setActiveMode] = useState("dashboard"); // Default to dashboard view
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  
  // Create a dummy speakText function for the useChatState hook
  const dummySpeakText = (text: string) => {
    console.log("Speaking text:", text);
    // This is just a placeholder - the real speech functionality
    // is handled in the ChatWindow component
  };
  
  const { handleSendMessage } = useChatState(true, dummySpeakText); // Initialize chat state with both parameters
  const { handleActionRequest } = useQuickActions({ handleSendMessage });
  
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
    
    // Listen for quick action events from Dashboard
    const handleQuickAction = (event: CustomEvent) => {
      const { action } = event.detail;
      handleActionRequest(action);
    };
    
    // Listen for mode setting events from hook
    const handleSetMode = (event: CustomEvent) => {
      const { mode } = event.detail;
      handleModeChange(mode);
    };
    
    window.addEventListener('quickAction', handleQuickAction as EventListener);
    window.addEventListener('setMode', handleSetMode as EventListener);
    
    return () => {
      window.removeEventListener('quickAction', handleQuickAction as EventListener);
      window.removeEventListener('setMode', handleSetMode as EventListener);
    };
  }, []);
  
  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    localStorage.setItem("aurora_last_mode", mode);
  };

  const handleQuickAction = (action: string) => {
    handleActionRequest(action);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-mesh">
      <Sidebar onModeChange={handleModeChange} activeMode={activeMode} />
      
      <div className="flex-1 flex flex-col overflow-auto">
        {showWelcome && (
          <WelcomeAlert 
            onDismiss={dismissWelcome} 
            onQuickAction={handleQuickAction} 
          />
        )}
        
        <ModeContent activeMode={activeMode} />
      </div>
    </div>
  );
}

export default Index;
