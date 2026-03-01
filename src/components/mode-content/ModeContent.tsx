
import { ChatWindow } from "@/components/ChatWindow";
import { Dashboard } from "@/components/Dashboard";
import { MemoryDashboard } from "@/components/MemoryDashboard";
import { Multimodal } from "@/components/Multimodal";
import Personas from "@/pages/Personas";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import ApiKeys from "@/pages/ApiKeys";
import ApiAnalytics from "@/pages/ApiAnalytics";

interface ModeContentProps {
  activeMode: string;
}

export function ModeContent({ activeMode }: ModeContentProps) {
  if (activeMode === "chat") {
    return <ChatWindow />;
  }
  
  if (activeMode === "dashboard") {
    return <Dashboard />;
  }
  
  if (activeMode === "memory") {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <MemoryDashboard />
      </div>
    );
  }
  
  if (activeMode === "multimodal") {
    return <Multimodal />;
  }
  
  if (activeMode === "personas") {
    return <Personas />;
  }
  
  if (activeMode === "reports") {
    return <Reports />;
  }
  
  if (activeMode === "api-keys") {
    return <ApiKeys />;
  }
  
  if (activeMode === "api-analytics") {
    return <ApiAnalytics />;
  }
  
  if (activeMode === "settings") {
    return <Settings />;
  }
  
  // Default fallback
  return <Dashboard />;
}
