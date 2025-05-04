
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Calendar, Search, AlertCircle, FileText, Brain } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function AgentFramework() {
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [agentInput, setAgentInput] = useState("");
  const navigate = useNavigate();
  
  // Mock agents data
  const availableAgents = [
    { id: "research", name: "Research Assistant", icon: Search, description: "Searches the web and summarizes information" },
    { id: "scheduler", name: "Schedule Manager", icon: Calendar, description: "Manages calendar events and reminders" },
    { id: "analyst", name: "Data Analyst", icon: FileText, description: "Analyzes data and generates reports" },
    { id: "monitor", name: "System Monitor", icon: AlertCircle, description: "Monitors system metrics and sends alerts" }
  ];
  
  // Load active agents from localStorage
  useEffect(() => {
    try {
      const savedAgents = localStorage.getItem("aurora_active_agents");
      if (savedAgents) {
        setActiveAgents(JSON.parse(savedAgents));
      }
    } catch (error) {
      console.error("Failed to load active agents:", error);
    }
  }, []);
  
  // Save active agents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("aurora_active_agents", JSON.stringify(activeAgents));
    } catch (error) {
      console.error("Failed to save active agents:", error);
    }
  }, [activeAgents]);
  
  const toggleAgent = (agentId: string) => {
    if (activeAgents.includes(agentId)) {
      setActiveAgents(prev => prev.filter(id => id !== agentId));
      toast.info(`Agent ${agentId} deactivated`);
    } else {
      setActiveAgents(prev => [...prev, agentId]);
      toast.success(`Agent ${agentId} activated`);
    }
  };
  
  const handleAgentAction = (agentId: string) => {
    switch (agentId) {
      case "research":
        if (agentInput) {
          toast.loading(`Researching: ${agentInput}`);
          // In a real implementation, this would trigger an actual web search
          setTimeout(() => {
            toast.success("Research completed");
            navigate("/chat");
          }, 2000);
        } else {
          toast.info("Please enter a research topic");
        }
        break;
      case "scheduler":
        navigate("/calendar");
        break;
      case "analyst":
        toast.info("Data analysis feature coming soon");
        break;
      case "monitor":
        toast.info("System monitoring feature coming soon");
        break;
      default:
        toast.info(`Agent ${agentId} action not implemented yet`);
    }
  };
  
  return (
    <div className="p-6 container mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Framework</h1>
        <p className="text-muted-foreground">Manage autonomous AI agents to help with various tasks</p>
      </header>
      
      <Tabs defaultValue="agents">
        <TabsList className="mb-4">
          <TabsTrigger value="agents">Available Agents</TabsTrigger>
          <TabsTrigger value="active">Active Agents ({activeAgents.length})</TabsTrigger>
          <TabsTrigger value="create">Create Agent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAgents.map(agent => {
              const AgentIcon = agent.icon;
              const isActive = activeAgents.includes(agent.id);
              
              return (
                <Card key={agent.id} className={`p-4 transition-all ${isActive ? 'border-primary' : ''}`}>
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full ${isActive ? 'bg-primary/20' : 'bg-secondary/50'} mr-3`}>
                      <AgentIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Button 
                          variant={isActive ? "default" : "outline"} 
                          size="sm"
                          onClick={() => toggleAgent(agent.id)}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                        
                        {isActive && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAgentAction(agent.id)}
                          >
                            Run
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          {activeAgents.length > 0 ? (
            <div className="space-y-4">
              <Input
                placeholder="What would you like your agents to do?"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                className="mb-4"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableAgents
                  .filter(agent => activeAgents.includes(agent.id))
                  .map(agent => {
                    const AgentIcon = agent.icon;
                    
                    return (
                      <Card key={agent.id} className="p-4 border-primary">
                        <div className="flex items-start">
                          <div className="p-2 rounded-full bg-primary/20 mr-3">
                            <AgentIcon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleAgent(agent.id)}
                              >
                                Deactivate
                              </Button>
                              
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleAgentAction(agent.id)}
                              >
                                Run Agent
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                }
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="p-3 rounded-full bg-secondary/50 mb-3">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Active Agents</h3>
              <p className="text-muted-foreground mb-3">Activate agents to assist you with various tasks</p>
              <Button variant="outline" onClick={() => document.querySelector('[value="agents"]')?.dispatchEvent(new MouseEvent('click'))}>
                Explore Available Agents
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="p-3 rounded-full bg-accent/20 mb-3">
              <Brain className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-medium mb-1">Create Custom Agent</h3>
            <p className="text-muted-foreground mb-3">Design your own autonomous agent with specific tasks and behaviors</p>
            <Button variant="outline" onClick={() => toast.info("Custom agent creation coming in a future update")}>
              Coming Soon
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
