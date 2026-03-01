
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
import { useProfile } from "@/hooks/useProfile";
import { Activity, Cpu, Sparkles } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const { widgets } = useDashboardWidgets();
  const { profile } = useProfile();
  
  const handleQuickAction = (action: string) => {
    switch(action) {
      case "chat":
        navigate("/chat");
        break;
      case "voice":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      case "search":
        navigate("/search");
        break;
      case "weather":
        navigate("/weather");
        break;
      case "code":
        navigate("/code");
        break;
      case "web":
        navigate("/web");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "memory":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action: "memory" } }));
        break;
      case "multimodal":
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "multimodal" } }));
        break;
      case "personas":
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "personas" } }));
        break;
      case "reports":
        window.dispatchEvent(new CustomEvent('setMode', { detail: { mode: "reports" } }));
        break;
      case "reminders":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      default:
        toast.info(`Action '${action}' not implemented yet`);
        break;
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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
    <div className="p-6 overflow-auto max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Aurora AI</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your intelligent companion is ready to assist.</p>
        </div>
        <DashboardSettings />
      </header>

      {/* System Overview */}
      {statusCards.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusCards}
          </div>
        </section>
      )}
      
      {/* Quick Actions */}
      {widgets.quickActions && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
          </div>
          <QuickActions onAction={handleQuickAction} />
        </section>
      )}
      
      {/* Subsystems */}
      {systemCards.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Subsystems</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemCards}
          </div>
        </section>
      )}
    </div>
  );
}
