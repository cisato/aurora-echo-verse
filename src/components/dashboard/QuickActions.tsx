
import { Brain, CloudSun, Code, Globe, MessageCircle, Mic, Search, Settings as SettingsIcon, Image, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface QuickActionProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionProps) {
  const quickActions = [
    { name: "Chat", icon: MessageCircle, color: "bg-aurora-blue", action: "chat" },
    { name: "Voice", icon: Mic, color: "bg-aurora-pink", action: "voice" },
    { name: "Search", icon: Search, color: "bg-aurora-purple", action: "search" },
    { name: "Weather", icon: CloudSun, color: "bg-aurora-orange", action: "weather" },
    { name: "Code", icon: Code, color: "bg-aurora-green", action: "code" },
    { name: "Web", icon: Globe, color: "bg-aurora-cyan", action: "web" },
    { name: "Memory", icon: Brain, color: "bg-aurora-purple", action: "memory" },
    { name: "Multimodal", icon: Image, color: "bg-aurora-blue", action: "multimodal" },
    { name: "Personas", icon: User, color: "bg-aurora-orange", action: "personas" },
    { name: "Reports", icon: FileText, color: "bg-aurora-pink", action: "reports" },
  ];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {quickActions.map((item, i) => {
        const Icon = item.icon;
        return (
          <Button 
            key={i} 
            variant="ghost" 
            className="flex-col h-20 rounded-xl bg-card/50 hover:bg-card border border-border/40 hover:border-border hover:shadow-md transition-all duration-200 group"
            onClick={() => onAction(item.action)}
          >
            <div className={`p-2 rounded-lg ${item.color}/10 mb-1.5 group-hover:${item.color}/20 transition-colors`}>
              <Icon className="h-4 w-4 text-foreground/70 group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
