
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Glasses, Cpu, ArrowLeft, VolumeX, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const VirtualReality = () => {
  const [isImmersive, setIsImmersive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const environmentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulate loading VR environment
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success("VR environment loaded");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleImmersiveMode = () => {
    setIsImmersive(!isImmersive);
    toast.info(isImmersive ? "Exiting immersive mode" : "Entering immersive mode");
    
    // Apply a basic 3D effect to demonstrate VR mode
    if (environmentRef.current) {
      if (!isImmersive) {
        environmentRef.current.classList.add("vr-environment");
        document.body.style.overflow = "hidden"; // Lock scrolling in VR mode
      } else {
        environmentRef.current.classList.remove("vr-environment");
        document.body.style.overflow = "auto"; // Restore scrolling
      }
    }
  };
  
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toast.info(audioEnabled ? "Spatial audio disabled" : "Spatial audio enabled");
  };
  
  return (
    <div 
      ref={environmentRef}
      className={`min-h-full p-6 transition-all duration-700 ${isImmersive ? "vr-environment bg-gradient-mesh" : ""}`}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isImmersive ? "Aurora VR Experience" : "Virtual Reality"}
          </h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleAudio}
              className={`${isImmersive ? "bg-black/30 text-white" : ""}`}
            >
              {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant={isImmersive ? "destructive" : "default"}
              onClick={toggleImmersiveMode}
              className={isImmersive ? "bg-black/30 hover:bg-black/40" : ""}
            >
              {isImmersive ? (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Exit VR
                </>
              ) : (
                <>
                  <Glasses className="mr-2 h-4 w-4" />
                  Enter VR
                </>
              )}
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="vr-loading-animation mb-4">
              <div className="animate-spin h-12 w-12 border-4 border-aurora-blue border-t-transparent rounded-full"></div>
            </div>
            <p className="text-lg">Loading VR environment...</p>
          </div>
        ) : (
          <ScrollArea className={`${isImmersive ? "h-[calc(100vh-120px)]" : "h-auto"} overflow-visible`}>
            <div className="space-y-8">
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Glasses className="h-5 w-5 mr-2 text-aurora-purple" />
                  VR Experiences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Cosmic Journey", description: "Explore the stars and galaxies in this immersive space experience", color: "from-aurora-blue/20 to-aurora-purple/20" },
                    { name: "Deep Ocean", description: "Dive into the depths of the ocean and discover marine life", color: "from-aurora-cyan/20 to-aurora-blue/20" },
                    { name: "Mountain Expedition", description: "Climb the highest peaks without leaving your room", color: "from-aurora-green/20 to-aurora-cyan/20" }
                  ].map((experience, i) => (
                    <Card 
                      key={i} 
                      className={`p-6 border-none vr-card bg-gradient-to-br ${experience.color} overflow-hidden ${isImmersive ? "vr-object" : ""}`}
                      style={isImmersive ? {transform: `translateZ(${20 + i * 10}px)`} : {}}
                    >
                      <h3 className="text-lg font-medium mb-2">{experience.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{experience.description}</p>
                      <Button 
                        variant="outline" 
                        className="w-full bg-background/40"
                        onClick={() => toast.info(`Launching: ${experience.name}`)}
                      >
                        Launch Experience
                      </Button>
                    </Card>
                  ))}
                </div>
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-aurora-orange" />
                  AR Features
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "Object Recognition", description: "Point your camera at objects to get information about them", icon: "🔍" },
                    { name: "Smart Overlay", description: "Get contextual information about your surroundings", icon: "👓" },
                    { name: "3D Modeling", description: "Create and manipulate 3D models in your space", icon: "🧩" },
                    { name: "Interactive Maps", description: "Navigate with AR-enhanced mapping", icon: "🗺️" }
                  ].map((feature, i) => (
                    <Card 
                      key={i} 
                      className={`p-6 border-none glass-panel ${isImmersive ? "vr-object" : ""}`}
                      style={isImmersive ? {transform: `translateZ(${10 + i * 5}px)`} : {}}
                    >
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">{feature.icon}</span>
                        <h3 className="text-lg font-medium">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </Card>
                  ))}
                </div>
              </section>
              
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Technical Requirements</h2>
                
                <Card className={`p-6 border-none glass-panel ${isImmersive ? "vr-object" : ""}`}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Minimum Requirements</h3>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Modern web browser with WebXR support</li>
                        <li>GPU with WebGL 2.0 capabilities</li>
                        <li>8GB RAM recommended</li>
                        <li>Stable internet connection</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Supported Devices</h3>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Most modern VR headsets (Oculus, HTC Vive, Valve Index)</li>
                        <li>AR-capable smartphones and tablets</li>
                        <li>Desktop computers with necessary peripherals</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default VirtualReality;
