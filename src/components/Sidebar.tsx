
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuroraAvatar } from "./AuroraAvatar";
import { MessageCircle, LayoutDashboard, Brain, Settings2, Image, User, FileText, Key, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  onModeChange: (mode: string) => void;
  activeMode: string;
}

export function Sidebar({ onModeChange, activeMode }: SidebarProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { voiceEnabled } = JSON.parse(savedSettings);
        if (voiceEnabled !== undefined) setIsVoiceEnabled(voiceEnabled);
      }
      const savedCollapsed = localStorage.getItem("aurora_sidebar_collapsed");
      if (savedCollapsed) setCollapsed(JSON.parse(savedCollapsed));
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    
    const handleStorageChange = () => {
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const { voiceEnabled } = JSON.parse(savedSettings);
          if (voiceEnabled !== undefined) setIsVoiceEnabled(voiceEnabled);
        }
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("aurora_sidebar_collapsed", JSON.stringify(next));
  };
  
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, mode: "dashboard" },
    { name: "Chat", icon: MessageCircle, mode: "chat" },
    { name: "Memory", icon: Brain, mode: "memory" },
    { name: "Multimodal", icon: Image, mode: "multimodal" },
    { name: "Personas", icon: User, mode: "personas" },
    { name: "Reports", icon: FileText, mode: "reports" },
    { name: "API Keys", icon: Key, mode: "api-keys" },
    { name: "API Analytics", icon: BarChart3, mode: "api-analytics" },
    { name: "Settings", icon: Settings2, mode: "settings" }
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-16 sm:w-48'} h-full border-r flex flex-col items-center justify-between py-4 bg-background/60 backdrop-blur-lg transition-all duration-300`}>
      <div className={`flex flex-col ${collapsed ? 'items-center' : 'items-center sm:items-stretch sm:px-3'} w-full`}>
        <div className={`mb-6 flex ${collapsed ? 'justify-center' : 'justify-center sm:justify-between sm:items-center'}`}>
          <AuroraAvatar isActive={isVoiceEnabled} size="md" />
          {!collapsed && (
            <span className="hidden sm:inline text-sm font-bold text-primary ml-2">Aurora</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex mb-4 mx-auto h-7 w-7 rounded-full"
          onClick={toggleCollapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        <div className="space-y-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.mode;
            
            return (
              <Tooltip key={item.mode} delayDuration={collapsed ? 100 : 1000}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "default"}
                    className={`relative w-full ${collapsed ? 'justify-center' : 'justify-center sm:justify-start'} rounded-xl ${
                      isActive ? "bg-primary/10 text-primary" : ""
                    }`}
                    onClick={() => onModeChange(item.mode)}
                  >
                    {isActive && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                    )}
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {!collapsed && (
                      <span className="hidden sm:inline ml-3 text-sm">{item.name}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
