
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MemoryItem {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
}

export function Memory() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [newFact, setNewFact] = useState<string>("");
  
  // Load memories on component mount
  useEffect(() => {
    const loadedMemories = localStorage.getItem("aurora_memories");
    const loadedName = localStorage.getItem("aurora_user_name");
    
    if (loadedMemories) {
      try {
        const parsedMemories = JSON.parse(loadedMemories);
        setMemories(parsedMemories.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (error) {
        console.error("Failed to parse memories:", error);
      }
    } else {
      // Set some example memories if none exist
      const exampleMemories: MemoryItem[] = [
        {
          id: "1",
          type: "preference",
          content: "User prefers dark mode",
          timestamp: new Date()
        },
        {
          id: "2",
          type: "fact",
          content: "User is interested in artificial intelligence",
          timestamp: new Date()
        }
      ];
      setMemories(exampleMemories);
      localStorage.setItem("aurora_memories", JSON.stringify(exampleMemories));
    }
    
    if (loadedName) {
      setUserName(loadedName);
    }
  }, []);
  
  const saveUserName = () => {
    if (!userName.trim()) return;
    
    localStorage.setItem("aurora_user_name", userName);
    
    // Add to memories
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      type: "name",
      content: `User's name is ${userName}`,
      timestamp: new Date()
    };
    
    const updatedMemories = [...memories, newMemory];
    setMemories(updatedMemories);
    localStorage.setItem("aurora_memories", JSON.stringify(updatedMemories));
    
    toast.success("Name saved to memory");
  };
  
  const addNewFact = () => {
    if (!newFact.trim()) return;
    
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      type: "fact",
      content: newFact,
      timestamp: new Date()
    };
    
    const updatedMemories = [...memories, newMemory];
    setMemories(updatedMemories);
    localStorage.setItem("aurora_memories", JSON.stringify(updatedMemories));
    
    setNewFact("");
    toast.success("New fact added to memory");
  };
  
  const deleteMemory = (id: string) => {
    const updatedMemories = memories.filter(m => m.id !== id);
    setMemories(updatedMemories);
    localStorage.setItem("aurora_memories", JSON.stringify(updatedMemories));
    
    toast.success("Memory deleted");
  };
  
  const clearAllMemories = () => {
    setMemories([]);
    localStorage.removeItem("aurora_memories");
    toast.success("All memories cleared");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Memory Management</h1>
      
      <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
        <h2 className="text-xl font-bold mb-4">User Profile</h2>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="userName">Your Name</Label>
            <div className="flex space-x-2">
              <Input 
                id="userName" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                placeholder="Enter your name"
              />
              <Button onClick={saveUserName}>Save</Button>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Memory Database</h2>
          <Button variant="destructive" size="sm" onClick={clearAllMemories}>
            Clear All
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="newFact">Add New Memory</Label>
            <div className="flex space-x-2">
              <Input 
                id="newFact" 
                value={newFact} 
                onChange={(e) => setNewFact(e.target.value)} 
                placeholder="Enter a fact or preference to remember"
              />
              <Button onClick={addNewFact}>Add</Button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {memories.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No memories stored</p>
            ) : (
              memories.map(memory => (
                <div 
                  key={memory.id}
                  className="bg-secondary/30 p-3 rounded-md flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        {memory.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {memory.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{memory.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMemory(memory.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    &times;
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
