
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuroraAvatar } from "./AuroraAvatar";
import { MessageCircle, LayoutDashboard, Brain, Settings2, Bot, Image, User, Glasses, FileText, Key } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  onModeChange: (mode: string) => void;
  activeMode: string;
}

export function Sidebar({ onModeChange, activeMode }: SidebarProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  useEffect(() => {
    // Load voice enabled setting from localStorage
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const { voiceEnabled } = JSON.parse(savedSettings);
        if (voiceEnabled !== undefined) {
          setIsVoiceEnabled(voiceEnabled);
        }
      }
    } catch (error) {
      console.error("Failed to load voice settings:", error);
    }
    
    // Listen for storage changes to update voice setting
    const handleStorageChange = () => {
      try {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
          const { voiceEnabled } = JSON.parse(savedSettings);
          if (voiceEnabled !== undefined) {
            setIsVoiceEnabled(voiceEnabled);
          }
        }
      } catch (error) {
        console.error("Failed to update settings from storage event:", error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, mode: "dashboard" },
    { name: "Chat", icon: MessageCircle, mode: "chat" },
    { name: "Memory", icon: Brain, mode: "memory" },
    { name: "Agents", icon: Bot, mode: "agents" },
    { name: "Multimodal", icon: Image, mode: "multimodal" },
    { name: "Personas", icon: User, mode: "personas" },
    { name: "Virtual Reality", icon: Glasses, mode: "vr" },
    { name: "Reports", icon: FileText, mode: "reports" },
    { name: "API Keys", icon: Key, mode: "api-keys" },
    { name: "Settings", icon: Settings2, mode: "settings" }
  ];

  return (
    <div className="w-16 sm:w-20 h-full border-r flex flex-col items-center justify-between py-4 bg-background/60 backdrop-blur-lg">
      <div className="flex flex-col items-center">
        <div className="mb-8">
          <AuroraAvatar isActive={isVoiceEnabled} size="md" />
        </div>
        
        <div className="space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.mode;
            
            return (
              <Button
                key={item.mode}
                variant="ghost"
                size="icon"
                className={`rounded-xl relative ${
                  isActive ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => onModeChange(item.mode)}
              >
                {isActive && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                )}
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="sr-only">{item.name}</span>
              </Button>
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
