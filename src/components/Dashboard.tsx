
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatusCards } from "./dashboard/StatusCards";
import { QuickActions } from "./dashboard/QuickActions";
import { SystemStatus } from "./dashboard/SystemStatus";

export function Dashboard() {
  const navigate = useNavigate();
  
  // Handler for quick actions
  const handleQuickAction = (action: string) => {
    // Navigate to specific page or trigger action based on button name
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
        // These actions navigate to chat and then send a specific message
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      default:
        toast.info(`Action '${action}' not implemented yet`);
        break;
    }
  };
  
  return (
    <div className="p-6 overflow-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here's your AI assistant status and activity</p>
      </header>
      
      <StatusCards />
      <QuickActions onAction={handleQuickAction} />
      <SystemStatus onViewAllReminders={() => handleQuickAction("reminders")} />
    </div>
  );
}
