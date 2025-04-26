
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { 
  Brain, 
  LayoutDashboard, 
  MessageCircle, 
  Settings, 
  User, 
  Bot, 
  Book, 
  Zap,
  Code, 
  HeartPulse,
  Briefcase,
  Lightbulb
} from "lucide-react";

interface SidebarProps {
  onModeChange: (mode: string) => void;
  activeMode: string;
}

export function Sidebar({ onModeChange, activeMode }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const modes = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  
  const personaModes = [
    { id: "default", label: "Default", icon: Bot },
    { id: "creative", label: "Creative", icon: Lightbulb },
    { id: "academic", label: "Academic", icon: Book },
    { id: "coding", label: "Developer", icon: Code },
    { id: "health", label: "Health", icon: HeartPulse },
    { id: "business", label: "Business", icon: Briefcase },
  ];

  return (
    <div 
      className={`h-full flex flex-col border-r transition-all duration-300 bg-muted/30 ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-aurora animate-gradient-shift">
          <Brain className="text-white h-5 w-5" />
        </div>
        
        {isExpanded && (
          <h2 className="font-bold aurora-text text-xl">AURORA</h2>
        )}
        
        <Button
          variant="ghost" 
          size="icon"
          className="ml-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
            <path d={isExpanded 
              ? "M6 3L2 7.5L6 12M13 3L9 7.5L13 12" 
              : "M9 3L13 7.5L9 12M2 3L6 7.5L2 12"
            } stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
      
      <div className="px-2 py-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant={activeMode === mode.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${!isExpanded ? "justify-center" : ""}`}
                onClick={() => onModeChange(mode.id)}
              >
                <Icon className="h-5 w-5 mr-2" />
                {isExpanded && <span>{mode.label}</span>}
              </Button>
            );
          })}
        </div>
        
        {isExpanded && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-3">PERSONAS</h4>
            <div className="space-y-1">
              {personaModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm h-8"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{mode.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        
        {isExpanded && (
          <div className="mt-6 mx-2">
            <div className="rounded-lg p-3 bg-accent/40 border border-accent/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-aurora opacity-5 animate-gradient-shift"></div>
              <div className="relative">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 text-aurora-pink mr-1" />
                  <span className="text-sm font-medium">Pro Plan</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Upgrade to unlock advanced features!</p>
                <Button size="sm" className="w-full bg-gradient-aurora hover:opacity-90">
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t flex items-center">
        <ThemeToggle />
        
        {isExpanded && (
          <div className="ml-2 flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate">Guest User</div>
            <div className="text-xs text-muted-foreground truncate">Free Plan</div>
          </div>
        )}
      </div>
    </div>
  );
}
