
import { AuroraAvatar } from "@/components/AuroraAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brain, Home, MessageSquare, Settings, User } from "lucide-react";

interface SidebarProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export function Sidebar({ activeMode, onModeChange }: SidebarProps) {
  return (
    <div className="w-[70px] md:w-[240px] h-full flex flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Logo area */}
      <div className="flex items-center gap-2 p-4 h-[60px]">
        <AuroraAvatar size="sm" isActive={true} />
        <span className="font-bold text-lg hidden md:block">Aurora</span>
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 py-4">
        <nav className="space-y-2 px-2">
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />}
            title="Chat"
            active={activeMode === "chat"}
            onClick={() => onModeChange("chat")}
          />
          
          <SidebarItem 
            icon={<Home className="w-5 h-5" />}
            title="Dashboard"
            active={activeMode === "dashboard"}
            onClick={() => onModeChange("dashboard")}
          />

          <SidebarItem 
            icon={<Brain className="w-5 h-5" />}
            title="Memory"
            active={activeMode === "memory"}
            onClick={() => onModeChange("memory")}
          />
          
          <SidebarItem 
            icon={<Settings className="w-5 h-5" />}
            title="Settings"
            active={activeMode === "settings"}
            onClick={() => onModeChange("settings")}
          />
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <span className="text-xs text-sidebar-foreground/60 hidden md:inline-block">v2.0.0</span>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, title, active, onClick }: SidebarItemProps) {
  return (
    <button
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md transition-colors ${
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
      }`}
      onClick={onClick}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="hidden md:block">{title}</span>
    </button>
  );
}
