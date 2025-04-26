
import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";

const Index = () => {
  const [activeMode, setActiveMode] = useState("chat");
  
  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-mesh">
      <Sidebar onModeChange={handleModeChange} activeMode={activeMode} />
      
      <div className="flex-1 flex flex-col">
        {activeMode === "chat" && <ChatWindow />}
        {activeMode === "dashboard" && <Dashboard />}
        {activeMode === "profile" && (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Profile</h2>
              <p className="text-muted-foreground">User profile section will be available in the full version.</p>
            </div>
          </div>
        )}
        {activeMode === "settings" && (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-muted-foreground">Settings panel will be available in the full version.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
