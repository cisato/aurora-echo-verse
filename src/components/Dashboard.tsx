
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Clock, 
  CloudSun, 
  Code, 
  Database, 
  Globe, 
  Heart, 
  MessageCircle,
  Mic,
  Search,
  Settings as SettingsIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { AuroraAvatar } from "./AuroraAvatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Dashboard() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(66);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handler for quick actions
  const handleQuickAction = (action: string) => {
    // Navigate to specific page or trigger action based on button name
    switch(action) {
      case "chat":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      case "voice":
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
        break;
      case "search":
      case "weather":
      case "code":
      case "web":
      case "joke":
      case "help":
      case "today":
        // These actions navigate to chat and then send a specific message
        window.dispatchEvent(new CustomEvent('quickAction', { detail: { action } }));
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-4">
            <AuroraAvatar isActive={true} />
            <div>
              <h3 className="font-bold text-xl">Aurora</h3>
              <p className="text-sm text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">System Status</span>
              <span className="text-xs px-2 py-1 rounded-full bg-aurora-green/20 text-aurora-green">Online</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>System Resources</span>
              <span>{progress}% Optimized</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-orange/10">
              <Brain className="h-5 w-5 text-aurora-orange" />
            </div>
            <h3 className="font-medium">AI Models</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aurora-blue"></span>
                <span className="text-sm">GPT-4o</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10">Active</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aurora-purple"></span>
                <span className="text-sm">Whisper</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10">Active</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aurora-pink"></span>
                <span className="text-sm">Local LLM</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted/50">Standby</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-purple/10">
              <MessageCircle className="h-5 w-5 text-aurora-purple" />
            </div>
            <h3 className="font-medium">Recent Activity</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">10:23 AM</span>
              <span className="text-sm">Weather information requested</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Yesterday</span>
              <span className="text-sm">Calendar appointment added</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Yesterday</span>
              <span className="text-sm">Code explanation generated</span>
            </div>
          </div>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {[
          { name: "Chat", icon: MessageCircle, color: "bg-aurora-blue", action: "chat" },
          { name: "Voice", icon: Mic, color: "bg-aurora-pink", action: "voice" },
          { name: "Search", icon: Search, color: "bg-aurora-purple", action: "search" },
          { name: "Weather", icon: CloudSun, color: "bg-aurora-orange", action: "weather" },
          { name: "Code", icon: Code, color: "bg-aurora-green", action: "code" },
          { name: "Web", icon: Globe, color: "bg-aurora-cyan", action: "web" },
          { name: "Memory", icon: Brain, color: "bg-aurora-purple", action: "memory" },
          { name: "Settings", icon: SettingsIcon, color: "bg-gray-500", action: "settings" },
        ].map((item, i) => {
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
      
      <h2 className="text-xl font-bold mb-4">System Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-blue/10">
              <Database className="h-5 w-5 text-aurora-blue" />
            </div>
            <h3 className="font-medium">Memory System</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Conversation History</span>
                <span className="text-sm font-medium">43 entries</span>
              </div>
              <Progress value={43} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Personal Facts</span>
                <span className="text-sm font-medium">12 entries</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Learning Sessions</span>
                <span className="text-sm font-medium">5 entries</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-aurora-cyan/10">
              <Clock className="h-5 w-5 text-aurora-cyan" />
            </div>
            <h3 className="font-medium">Upcoming Reminders</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-aurora-pink" />
                <span className="text-sm">Health check-in</span>
              </div>
              <span className="text-xs">Tomorrow, 9:00 AM</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-aurora-blue" />
                <span className="text-sm">News briefing</span>
              </div>
              <span className="text-xs">Daily, 8:00 AM</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-aurora-purple" />
                <span className="text-sm">Learning session</span>
              </div>
              <span className="text-xs">Friday, 7:00 PM</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4 bg-background/30"
            onClick={() => handleQuickAction("reminders")}
          >
            View All Reminders
          </Button>
        </Card>
      </div>
    </div>
  );
}
