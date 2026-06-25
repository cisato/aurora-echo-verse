import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, MessageCircle, LayoutDashboard, Brain, Mic, MoreHorizontal } from "lucide-react";
import { AuroraAvatar } from "./AuroraAvatar";
import { NAV_ITEMS } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router-dom";

interface MobileNavProps {
  onModeChange: (mode: string) => void;
  activeMode: string;
}

const BOTTOM_TABS = [
  { name: "Chat", icon: MessageCircle, mode: "chat" },
  { name: "Home", icon: LayoutDashboard, mode: "dashboard" },
  { name: "Memory", icon: Brain, mode: "memory" },
  { name: "Voice", icon: Mic, mode: "voice" },
];

export function MobileNav({ onModeChange, activeMode }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleMode = (mode: string) => {
    if (mode === "voice") {
      window.dispatchEvent(new CustomEvent("quickAction", { detail: { action: "voice" } }));
      onModeChange("chat");
    } else {
      onModeChange(mode);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Top app bar (mobile only) */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 safe-pt">
        <div className="flex items-center gap-2">
          <AuroraAvatar isActive size="sm" />
          <span className="font-display text-lg font-semibold">Aurora</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-sidebar text-sidebar-foreground border-sidebar-border p-0">
              <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <AuroraAvatar isActive size="sm" />
                  <span className="font-display text-lg font-semibold">Aurora</span>
                </div>
              </div>
              <nav className="p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => handleMode(item.mode)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                        isActive ? "bg-sidebar-accent text-sidebar-primary" : "hover:bg-sidebar-accent/60"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => { navigate("/pricing"); setOpen(false); }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-sidebar-accent/60"
                >
                  <span>Pricing & Billing</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Bottom tab bar (mobile only) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background/90 backdrop-blur-xl border-t border-border safe-pb">
        <div className="grid grid-cols-5 h-16">
          {BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.mode;
            return (
              <button
                key={tab.mode}
                onClick={() => handleMode(tab.mode)}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] transition ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
