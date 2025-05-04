
import { Brain, CloudSun, Code, Globe, MessageCircle, Mic, Search, Settings as SettingsIcon, Bot, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuickActionProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionProps) {
  const navigate = useNavigate();
  
  const handleQuickAction = (action: string) => {
    onAction(action);
  };
  
  const quickActions = [
    { name: "Chat", icon: MessageCircle, color: "bg-aurora-blue", action: "chat" },
    { name: "Voice", icon: Mic, color: "bg-aurora-pink", action: "voice" },
    { name: "Search", icon: Search, color: "bg-aurora-purple", action: "search" },
    { name: "Weather", icon: CloudSun, color: "bg-aurora-orange", action: "weather" },
    { name: "Code", icon: Code, color: "bg-aurora-green", action: "code" },
    { name: "Web", icon: Globe, color: "bg-aurora-cyan", action: "web" },
    { name: "Memory", icon: Brain, color: "bg-aurora-purple", action: "memory" },
    { name: "Agents", icon: Bot, color: "bg-aurora-pink", action: "agents" },
    { name: "Multimodal", icon: Image, color: "bg-aurora-blue", action: "multimodal" },
    { name: "Settings", icon: SettingsIcon, color: "bg-gray-500", action: "settings" },
  ];
  
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {quickActions.map((item, i) => {
          const Icon = item.icon;
          return (
            <Button 
              key={i} 
              variant="outline" 
              className="flex-col h-24 border-none glass-panel hover:scale-105 transition-transform"
              onClick={() => handleQuickAction(item.action)}
            >
              <div className={`p-2 rounded-full ${item.color}/20 mb-2`}>
                <Icon className={`h-5 w-5 text-${item.color.replace('bg-', '')}`} />
              </div>
              <span>{item.name}</span>
            </Button>
          );
        })}
      </div>
    </>
  );
}
