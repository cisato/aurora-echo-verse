import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Onboarding } from "@/components/welcome/Onboarding";
import { useChatState } from "@/hooks/useChatState";
import { ModeContent } from "@/components/mode-content/ModeContent";
import { useQuickActions } from "@/hooks/useQuickActions";

const Index = () => {
  const [activeMode, setActiveMode] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const dummySpeakText = (text: string) => console.log("Speaking:", text);
  const { handleSendMessage } = useChatState(true, dummySpeakText);
  const { handleActionRequest } = useQuickActions({ handleSendMessage });

  useEffect(() => {
    const visited = localStorage.getItem("aurora_has_visited");
    if (!visited) setShowOnboarding(true);

    const lastMode = localStorage.getItem("aurora_last_mode");
    if (lastMode) setActiveMode(lastMode);

    const handleQuickAction = (e: CustomEvent) => handleActionRequest(e.detail.action);
    const handleSetMode = (e: CustomEvent) => handleModeChange(e.detail.mode);

    window.addEventListener("quickAction", handleQuickAction as EventListener);
    window.addEventListener("setMode", handleSetMode as EventListener);
    return () => {
      window.removeEventListener("quickAction", handleQuickAction as EventListener);
      window.removeEventListener("setMode", handleSetMode as EventListener);
    };
  }, []);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    localStorage.setItem("aurora_last_mode", mode);
  };

  const completeOnboarding = (data: { name: string; focus: string; mode: string }) => {
    localStorage.setItem("aurora_has_visited", "true");
    localStorage.setItem("aurora_user_name", data.name);
    localStorage.setItem("aurora_focus", data.focus);
    setShowOnboarding(false);
    handleModeChange("chat");
    if (data.mode === "voice") {
      setTimeout(() => window.dispatchEvent(new CustomEvent("quickAction", { detail: { action: "voice" } })), 300);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Sidebar onModeChange={handleModeChange} activeMode={activeMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav onModeChange={handleModeChange} activeMode={activeMode} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <ModeContent activeMode={activeMode} />
        </main>
      </div>
    </div>
  );
};

export default Index;
