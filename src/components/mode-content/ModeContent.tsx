
import { ChatWindow } from "@/components/ChatWindow";
import { Dashboard } from "@/components/Dashboard";
import { MemoryDashboard } from "@/components/MemoryDashboard";
import { AgentFramework } from "@/components/AgentFramework";
import { Multimodal } from "@/components/Multimodal";
import { PersonaSelector } from "@/components/PersonaSelector";
import { CompanionModeSelector } from "@/components/CompanionModeSelector";
import Personas from "@/pages/Personas";
import VirtualReality from "@/pages/VirtualReality";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";

interface ModeContentProps {
  activeMode: string;
}

export function ModeContent({ activeMode }: ModeContentProps) {
  if (activeMode === "chat") {
    return (
      <>
        <div className="border-b px-3 py-1.5 flex items-center justify-between gap-2">
          <PersonaSelector onSelectPersona={(persona) => {
            console.log(`Index: Persona changed to: ${persona}`);
          }} />
          <CompanionModeSelector />
        </div>
        <ChatWindow />
      </>
    );
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
  
  if (activeMode === "agents") {
    return <AgentFramework />;
  }
  
  if (activeMode === "multimodal") {
    return <Multimodal />;
  }
  
  if (activeMode === "personas") {
    return <Personas />;
  }
  
  if (activeMode === "vr") {
    return <VirtualReality />;
  }
  
  if (activeMode === "reports") {
    return <Reports />;
  }
  
  if (activeMode === "settings") {
    return <Settings />;
  }
  
  // Default fallback
  return <Dashboard />;
}
