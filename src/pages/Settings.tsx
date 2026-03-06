import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { LocalAISettings } from "@/components/LocalAISettings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { user } = useAuth();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("en-US-AriaNeural");
  const [voiceRate, setVoiceRate] = useState(0.92);
  const [voicePitch, setVoicePitch] = useState(1.05);
  const [modelPreference, setModelPreference] = useState("auto");
  const [offlineMode, setOfflineMode] = useState(false);
  const [saveMemory, setSaveMemory] = useState(true);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.voiceEnabled !== undefined) setVoiceEnabled(settings.voiceEnabled);
        if (settings.selectedVoice) setSelectedVoice(settings.selectedVoice);
        if (settings.voiceRate) setVoiceRate(settings.voiceRate);
        if (settings.voicePitch) setVoicePitch(settings.voicePitch);
        if (settings.modelPreference) setModelPreference(settings.modelPreference);
        if (settings.offlineMode !== undefined) setOfflineMode(settings.offlineMode);
        if (settings.saveMemory !== undefined) setSaveMemory(settings.saveMemory);
        if (settings.webSearchEnabled !== undefined) setWebSearchEnabled(settings.webSearchEnabled);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const handleSaveSettings = async () => {
    localStorage.setItem("settings", JSON.stringify({
      voiceEnabled,
      selectedVoice,
      voiceRate,
      voicePitch,
      modelPreference,
      offlineMode,
      saveMemory,
      webSearchEnabled,
    }));

    if (user) {
      await supabase.from("user_settings").upsert({
        user_id: user.id,
        voice_enabled: voiceEnabled,
        web_search_enabled: webSearchEnabled,
        preferred_model: modelPreference === "auto" ? "google/gemini-3-flash-preview" : modelPreference,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    window.dispatchEvent(new Event('storage'));
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="localai">Local AI</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        {/* General tab */}
        <TabsContent value="general">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">AI Model Settings</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="modelPreference">Model Preference</Label>
                <Select value={modelPreference} onValueChange={setModelPreference}>
                  <SelectTrigger id="modelPreference">
                    <SelectValue placeholder="Select model preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Best Available)</SelectItem>
                    <SelectItem value="google/gemini-3-flash-preview">Gemini 3 Flash</SelectItem>
                    <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                    <SelectItem value="local">Local Models Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offlineMode">Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">Use only locally available AI models</p>
                </div>
                <Switch id="offlineMode" checked={offlineMode} onCheckedChange={setOfflineMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="webSearchEnabled">Enable Web Search</Label>
                  <p className="text-xs text-muted-foreground">Allow AI to search the web for information</p>
                </div>
                <Switch id="webSearchEnabled" checked={webSearchEnabled} onCheckedChange={setWebSearchEnabled} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Voice tab */}
        <TabsContent value="voice">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">Voice Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voiceEnabled">Enable Voice</Label>
                  <p className="text-xs text-muted-foreground">Text-to-speech for Aurora's responses</p>
                </div>
                <Switch id="voiceEnabled" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="selectedVoice">Voice Style</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={!voiceEnabled}>
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
                  <span className="text-sm text-muted-foreground">{voiceRate}x</span>
                </div>
                <Slider
                  id="voiceRate"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={[voiceRate]}
                  onValueChange={([value]) => setVoiceRate(value)}
                  disabled={!voiceEnabled}
                />
                <p className="text-xs text-muted-foreground">Lower values sound more natural and conversational</p>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="voicePitch">Voice Pitch</Label>
                  <span className="text-sm text-muted-foreground">{voicePitch}</span>
                </div>
                <Slider
                  id="voicePitch"
                  min={0.8}
                  max={1.3}
                  step={0.05}
                  value={[voicePitch]}
                  onValueChange={([value]) => setVoicePitch(value)}
                  disabled={!voiceEnabled}
                />
                <p className="text-xs text-muted-foreground">Slightly above 1.0 gives a warmer, friendlier tone</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* LocalAI tab */}
        <TabsContent value="localai">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">Local AI Models</h2>
            <LocalAISettings />
          </Card>
        </TabsContent>

        {/* Memory tab */}
        <TabsContent value="memory">
          <Card className="p-5 border-none bg-gradient-to-br from-primary/5 to-accent/5 glass-panel">
            <h2 className="text-xl font-bold mb-4">Memory & Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="saveMemory">Save Conversation History</Label>
                  <p className="text-xs text-muted-foreground">Retain memory of past interactions</p>
                </div>
                <Switch id="saveMemory" checked={saveMemory} onCheckedChange={setSaveMemory} />
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  localStorage.removeItem('aurora_memories');
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
