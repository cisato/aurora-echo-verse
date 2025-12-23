
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuroraStatusCard } from "./dashboard/AuroraStatusCard";
import { AiModelsCard } from "./dashboard/AiModelsCard";
import { RecentActivityCard } from "./dashboard/RecentActivityCard";
import { QuickActions } from "./dashboard/QuickActions";
import { EnhancedMemoryCard } from "./dashboard/EnhancedMemoryCard";
import { RemindersCard } from "./dashboard/RemindersCard";
import { AgentStatusCard } from "./dashboard/AgentStatusCard";
import { MultimodalCapabilitiesCard } from "./dashboard/MultimodalCapabilitiesCard";
import { DashboardSettings } from "./dashboard/DashboardSettings";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";

export function Dashboard() {
  const navigate = useNavigate();
  const { widgets } = useDashboardWidgets();
  
  const handleQuickAction = (action: string) => {
    switch(action) {
      case "chat":
        navigate("/chat");
        toast.success("Navigating to chat page");
        break;
      case "voice":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      case "search":
        navigate("/search");
        toast.success("Navigating to search page");
        break;
      case "weather":
        navigate("/weather");
        toast.success("Navigating to weather page");
        break;
      case "code":
        navigate("/code");
        toast.success("Navigating to code page");
        break;
      case "web":
        navigate("/web");
        toast.success("Navigating to web page");
        break;
      case "settings":
        navigate("/settings");
        toast.success("Navigating to settings page");
        break;
      case "memory":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action: "memory" } }));
        toast.success("Opening memory page");
        break;
      case "reminders":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      case "joke":
      case "help":
      case "today":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      default:
        toast.info(`Action '${action}' not implemented yet`);
        break;
    }
  };

  const statusCards = [
    widgets.auroraStatus && <AuroraStatusCard key="aurora" />,
    widgets.aiModels && <AiModelsCard key="models" />,
    widgets.recentActivity && <RecentActivityCard key="activity" />,
  ].filter(Boolean);

  const systemCards = [
    widgets.enhancedMemory && <EnhancedMemoryCard key="memory" />,
    widgets.reminders && <RemindersCard key="reminders" onViewAllReminders={() => handleQuickAction("reminders")} />,
    widgets.agentStatus && <AgentStatusCard key="agent" />,
    widgets.multimodal && <MultimodalCapabilitiesCard key="multimodal" />,
  ].filter(Boolean);
  
  return (
    <div className="p-6 overflow-auto">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Here's your AI assistant status and activity</p>
        </div>
        <DashboardSettings />
      </header>
      
      {statusCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statusCards}
        </div>
      )}
      
      {widgets.quickActions && <QuickActions onAction={handleQuickAction} />}
      
      {systemCards.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemCards}
          </div>
        </>
      )}
    </div>
  );
}
