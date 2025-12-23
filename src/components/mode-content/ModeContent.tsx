
import { ChatWindow } from "@/components/ChatWindow";
import { Dashboard } from "@/components/Dashboard";
import { EnhancedMemory } from "@/components/EnhancedMemory";
import { AgentFramework } from "@/components/AgentFramework";
import { Multimodal } from "@/components/Multimodal";
import { PersonaSelector } from "@/components/PersonaSelector";
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
        <div className="border-b p-2">
          <PersonaSelector onSelectPersona={(persona) => {
            // The actual state change happens inside PersonaSelector 
            // which stores the selection in localStorage
            console.log(`Index: Persona changed to: ${persona}`);
          }} />
        </div>
        <ChatWindow />
      </>
    );
  }
  
  if (activeMode === "dashboard") {
    return <Dashboard />;
  }
  
  if (activeMode === "memory") {
    return <EnhancedMemory />;
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
