
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { LocalAISettings } from "@/components/LocalAISettings";
import { usePlatform } from "@/hooks/use-platform";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("en-US-AriaNeural");
  const [voiceRate, setVoiceRate] = useState(1);
  const [modelPreference, setModelPreference] = useState("auto");
  const [offlineMode, setOfflineMode] = useState(false);
  const [saveMemory, setSaveMemory] = useState(true);
  const { isMobile, isDesktop } = usePlatform();
  
  // Add ElevenLabs settings
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [elevenLabsEnabled, setElevenLabsEnabled] = useState(false);
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Load existing settings
        if (settings.apiKey) setApiKey(settings.apiKey);
        if (settings.voiceEnabled !== undefined) setVoiceEnabled(settings.voiceEnabled);
        if (settings.selectedVoice) setSelectedVoice(settings.selectedVoice);
        if (settings.voiceRate) setVoiceRate(settings.voiceRate);
        if (settings.modelPreference) setModelPreference(settings.modelPreference);
        if (settings.offlineMode !== undefined) setOfflineMode(settings.offlineMode);
        if (settings.saveMemory !== undefined) setSaveMemory(settings.saveMemory);
        
        // Load ElevenLabs settings
        if (settings.elevenLabsApiKey) setElevenLabsApiKey(settings.elevenLabsApiKey);
        if (settings.elevenLabsEnabled !== undefined) setElevenLabsEnabled(settings.elevenLabsEnabled);
        if (settings.elevenLabsVoiceId) setElevenLabsVoiceId(settings.elevenLabsVoiceId);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or a database
    localStorage.setItem("settings", JSON.stringify({
      apiKey,
      voiceEnabled,
      selectedVoice,
      voiceRate,
      modelPreference,
      offlineMode,
      saveMemory,
      elevenLabsApiKey,
      elevenLabsEnabled,
      elevenLabsVoiceId
    }));
    
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
          <TabsTrigger value="localai">Local AI</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">AI Model Settings</h2>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">OpenAI API Key (Optional)</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">
                  Provide your own API key to use OpenAI models
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="modelPreference">Model Preference</Label>
                <Select 
                  value={modelPreference} 
                  onValueChange={setModelPreference}
                >
                  <SelectTrigger id="modelPreference">
                    <SelectValue placeholder="Select model preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Best Available)</SelectItem>
                    <SelectItem value="gpt4">GPT-4 (Online Only)</SelectItem>
                    <SelectItem value="gpt3">GPT-3.5 (Online Only)</SelectItem>
                    <SelectItem value="local">Local Models Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offlineMode">Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use only locally available AI models
                  </p>
                </div>
                <Switch 
                  id="offlineMode" 
                  checked={offlineMode} 
                  onCheckedChange={setOfflineMode} 
                />
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="voice">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">Voice Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voiceEnabled">Enable Voice</Label>
                  <p className="text-xs text-muted-foreground">
                    Text-to-speech for Aurora's responses
                  </p>
                </div>
                <Switch 
                  id="voiceEnabled" 
                  checked={voiceEnabled} 
                  onCheckedChange={setVoiceEnabled} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="selectedVoice">Voice Style</Label>
                <Select 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice} 
                  disabled={!voiceEnabled}
                >
                  <SelectTrigger id="selectedVoice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US-AriaNeural">Aria (Female)</SelectItem>
                    <SelectItem value="en-US-GuyNeural">Guy (Male)</SelectItem>
                    <SelectItem value="en-US-JennyNeural">Jenny (Female)</SelectItem>
                    <SelectItem value="en-GB-RyanNeural">Ryan (British Male)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="voiceRate">Speech Rate</Label>
                  <span className="text-sm">{voiceRate}x</span>
                </div>
                <Slider 
                  id="voiceRate" 
                  min={0.5} 
                  max={2} 
                  step={0.1} 
                  value={[voiceRate]} 
                  onValueChange={([value]) => setVoiceRate(value)} 
                  disabled={!voiceEnabled}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="elevenlabs">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">ElevenLabs Voice Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="elevenLabsEnabled">Enable ElevenLabs</Label>
                  <p className="text-xs text-muted-foreground">
                    Use ElevenLabs for high-quality text-to-speech
                  </p>
                </div>
                <Switch 
                  id="elevenLabsEnabled" 
                  checked={elevenLabsEnabled} 
                  onCheckedChange={setElevenLabsEnabled} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="elevenLabsApiKey">ElevenLabs API Key</Label>
                <Input 
                  id="elevenLabsApiKey" 
                  type="password" 
                  value={elevenLabsApiKey} 
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  placeholder="..."
                />
                <p className="text-xs text-muted-foreground">
                  Required to use ElevenLabs voices
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="elevenLabsVoiceId">Voice Selection</Label>
                <Select 
                  value={elevenLabsVoiceId} 
                  onValueChange={setElevenLabsVoiceId} 
                  disabled={!elevenLabsEnabled}
                >
                  <SelectTrigger id="elevenLabsVoiceId">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21m00Tcm4TlvDq8ikWAM">Aria (Female)</SelectItem>
                    <SelectItem value="9BWtsMINqrJLrRacOk9x">Roger (Male)</SelectItem>
                    <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Female)</SelectItem>
                    <SelectItem value="FGY2WhTYpPnrIDTdsKH5">Laura (Female)</SelectItem>
                    <SelectItem value="IKne3meq5aSn9XLyUdCD">Charlie (Male)</SelectItem>
                    <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte (British Female)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={!elevenLabsEnabled || !elevenLabsApiKey}
                  onClick={() => {
                    toast.info("Testing ElevenLabs voice...");
                    // In a real implementation, this would test the voice
                  }}
                >
                  Test Voice
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="localai">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">Local AI Models</h2>
            <LocalAISettings />
          </Card>
        </TabsContent>
        
        <TabsContent value="memory">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">Memory & Privacy</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="saveMemory">Save Conversation History</Label>
                  <p className="text-xs text-muted-foreground">
                    Retain memory of past interactions
                  </p>
                </div>
                <Switch 
                  id="saveMemory" 
                  checked={saveMemory} 
                  onCheckedChange={setSaveMemory}
                />
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  // In a real app, this would clear conversation history
                  toast.success("Memory cleared successfully");
                }}
              >
                Clear All Memory
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSaveSettings} className="w-full mt-6">
        Save Settings
      </Button>
    </div>
  );
};

export default Settings;
