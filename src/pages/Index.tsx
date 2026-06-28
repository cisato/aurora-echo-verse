import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Onboarding } from "@/components/welcome/Onboarding";
import { useChatState } from "@/hooks/useChatState";
import { ModeContent } from "@/components/mode-content/ModeContent";
import { useQuickActions } from "@/hooks/useQuickActions";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const [activeMode, setActiveMode] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { profile, isLoading: profileLoading } = useProfile();

  const dummySpeakText = (text: string) => console.log("Speaking:", text);
  const { handleSendMessage } = useChatState(true, dummySpeakText);
  const { handleActionRequest } = useQuickActions({ handleSendMessage });

  // Onboarding shows only when: profile loaded AND no display_name AND no localStorage visited flag.
  // Once answered, both profile.display_name and localStorage persist — never shows again.
  useEffect(() => {
    if (profileLoading) return;
    const visited = localStorage.getItem("aurora_has_visited");
    const hasName = !!(profile?.display_name && profile.display_name.trim());
    if (!visited && !hasName) setShowOnboarding(true);
    else if (hasName && !visited) localStorage.setItem("aurora_has_visited", "true");
  }, [profile, profileLoading]);

  useEffect(() => {
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
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Sidebar onModeChange={handleModeChange} activeMode={activeMode} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav onModeChange={handleModeChange} activeMode={activeMode} />
        <main className="flex-1 overflow-auto">
          <ModeContent activeMode={activeMode} />
        </main>
      </div>
    </div>
  );
};

export default Index;
