import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuroraAvatar } from "./AuroraAvatar";
import {
  MessageCircle, LayoutDashboard, Brain, Settings2, Image, User,
  FileText, Key, BarChart3, ChevronLeft, ChevronRight, CreditCard
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  onModeChange: (mode: string) => void;
  activeMode: string;
}

export const NAV_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, mode: "dashboard" },
  { name: "Chat", icon: MessageCircle, mode: "chat" },
  { name: "Memory", icon: Brain, mode: "memory" },
  { name: "Multimodal", icon: Image, mode: "multimodal" },
  { name: "Personas", icon: User, mode: "personas" },
  { name: "Reports", icon: FileText, mode: "reports" },
  { name: "API Keys", icon: Key, mode: "api-keys" },
  { name: "Analytics", icon: BarChart3, mode: "api-analytics" },
  { name: "Settings", icon: Settings2, mode: "settings" },
];

export function Sidebar({ onModeChange, activeMode }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("aurora_sidebar_collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("aurora_sidebar_collapsed", JSON.stringify(next));
  };

  return (
    <aside
      className={`hidden md:flex ${collapsed ? "w-16" : "w-56"} h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col py-4 transition-all duration-300`}
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-4"} mb-4`}>
        <div className="flex items-center gap-2">
          <AuroraAvatar isActive size="sm" />
          {!collapsed && <span className="font-display text-lg font-semibold">Aurora</span>}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="mb-3 mx-auto h-7 w-7 rounded-full hover:bg-sidebar-accent"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.mode;
          return (
            <Tooltip key={item.mode} delayDuration={collapsed ? 100 : 1000}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModeChange(item.mode)}
                  className={`relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "hover:bg-sidebar-accent/60"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  {isActive && (
                    <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-full" />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="text-xs">{item.name}</TooltipContent>
              )}
            </Tooltip>
          );
        })}

        <button
          onClick={() => navigate("/pricing")}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent/60 ${collapsed ? "justify-center" : ""}`}
        >
          <CreditCard className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Pricing</span>}
        </button>
      </nav>

      <div className="mt-auto pt-3 px-2 border-t border-sidebar-border flex items-center justify-around">
        <ThemeToggle />
        <UserMenu />
      </div>
    </aside>
  );
}
