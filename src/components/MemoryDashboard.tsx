import { useState, useEffect, useCallback } from "react";
import { useMemorySystem, MemoryFact, ConversationSummary, EmotionalPattern, IdentitySnapshot } from "@/hooks/useMemorySystem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain, Target, Heart, Flame, Sparkles, BookOpen,
  Trash2, Plus, TrendingUp, TrendingDown, Minus,
  Activity, User, Lightbulb, AlertTriangle, CalendarDays
} from "lucide-react";
import { GrowthTimeline } from "./GrowthTimeline";
import { BehavioralPatterns } from "./BehavioralPatterns";
import { RitualDashboard } from "./RitualDashboard";

const DIMENSION_LABELS: Record<string, string> = {
  openness: "Openness",
  conscientiousness: "Conscientiousness",
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  neuroticism: "Neuroticism",
};

const CATEGORY_CONFIG: Record<string, { icon: typeof Brain; color: string; label: string }> = {
  goal: { icon: Target, color: "text-green-500", label: "Goals" },
  interest: { icon: Sparkles, color: "text-purple-500", label: "Interests" },
  project: { icon: Flame, color: "text-orange-500", label: "Projects" },
  trigger: { icon: Activity, color: "text-red-500", label: "Stress Triggers" },
  motivator: { icon: Lightbulb, color: "text-yellow-500", label: "Motivators" },
  pattern: { icon: Brain, color: "text-blue-500", label: "Behavioral Patterns" },
  skill: { icon: TrendingUp, color: "text-cyan-500", label: "Skills" },
  value: { icon: Heart, color: "text-rose-500", label: "Core Values" },
  fact: { icon: BookOpen, color: "text-muted-foreground", label: "Personal Facts" },
  relationship: { icon: User, color: "text-indigo-500", label: "Relationships" },
};

const EMOTION_COLORS: Record<string, string> = {
  joy: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  excitement: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  pride: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  gratitude: "bg-green-500/10 text-green-600 border-green-500/20",
  stress: "bg-red-500/10 text-red-600 border-red-500/20",
  anxiety: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  burnout: "bg-orange-700/10 text-orange-700 border-orange-700/20",
  sadness: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function MemoryDashboard() {
  const {
    fetchMemoryFacts, addMemoryFact, deleteMemoryFact,
    fetchSummaries, fetchEmotionalPatterns, fetchIdentityEvolution
  } = useMemorySystem();

  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [patterns, setPatterns] = useState<EmotionalPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newCategory, setNewCategory] = useState("goal");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    const [f, s, p] = await Promise.all([
      fetchMemoryFacts(),
      fetchSummaries(10),
      fetchEmotionalPatterns(30),
    ]);
    setFacts(f);
    setSummaries(s);
    setPatterns(p);
    setIsLoading(false);
  }, [fetchMemoryFacts, fetchSummaries, fetchEmotionalPatterns]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAddFact = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error("Please fill in both key and value");
      return;
    }
    setIsAdding(true);
    try {
      await addMemoryFact(newCategory, newKey.trim(), newValue.trim());
      toast.success("Memory added");
      setNewKey("");
      setNewValue("");
      setShowAddForm(false);
      loadAll();
    } catch {
      toast.error("Failed to add memory");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMemoryFact(id);
      setFacts(prev => prev.filter(f => f.id !== id));
      toast.success("Memory removed");
    } catch {
      toast.error("Failed to remove memory");
    }
  };

  const factsByCategory = facts.reduce((acc, fact) => {
    if (!acc[fact.category]) acc[fact.category] = [];
    acc[fact.category].push(fact);
    return acc;
  }, {} as Record<string, MemoryFact[]>);

  const emotionFreq = patterns.reduce((acc, p) => {
    acc[p.emotion] = (acc[p.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topEmotions = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <Brain className="h-8 w-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Aurora's memory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aurora's Memory</h2>
          <p className="text-sm text-muted-foreground">What Aurora knows about you — powering deep personalization</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Memory
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <h3 className="font-medium mb-3 text-sm">Add a manual memory</h3>
          <div className="flex flex-wrap gap-3">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
                ))}</SelectContent>
            </Select>
            <Input placeholder="Label" className="h-8 text-xs flex-1 min-w-32" value={newKey} onChange={e => setNewKey(e.target.value)} />
            <Input placeholder="Value" className="h-8 text-xs flex-[2] min-w-48" value={newValue} onChange={e => setNewValue(e.target.value)} />
            <Button size="sm" className="h-8" onClick={handleAddFact} disabled={isAdding}>
              {isAdding ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="knowledge">
        <TabsList className="flex-wrap">
          <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="emotional">Emotional Patterns</TabsTrigger>
          <TabsTrigger value="growth">Growth Timeline</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Intel</TabsTrigger>
          <TabsTrigger value="rituals">Rituals</TabsTrigger>
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
        </TabsList>

        {/* Knowledge Graph */}
        <TabsContent value="knowledge" className="space-y-4 mt-4">
          {Object.keys(factsByCategory).length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No memories yet</p>
              <p className="text-sm text-muted-foreground mt-1">Aurora will learn about you as you chat.</p>
            </Card>
          ) : (
            Object.entries(factsByCategory).map(([category, catFacts]) => {
              const cfg = CATEGORY_CONFIG[category] || { icon: Brain, color: "text-muted-foreground", label: category };
              const Icon = cfg.icon;
              return (
                <Card key={category} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                    <h3 className="font-medium text-sm">{cfg.label}</h3>
                    <Badge variant="secondary" className="text-xs ml-auto">{catFacts.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {catFacts.map(fact => (
                      <div key={fact.id} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-muted/30 group">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">{fact.key}: </span>
                          <span className="text-sm">{fact.value}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete(fact.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Emotional Patterns */}
        <TabsContent value="emotional" className="space-y-4 mt-4">
          {topEmotions.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No emotional patterns yet</p>
            </Card>
          ) : (
            <>
              <Card className="p-4">
                <h3 className="font-medium mb-4 text-sm">Most Frequent Emotions</h3>
                <div className="space-y-3">
                  {topEmotions.map(([emotion, count]) => (
                    <div key={emotion} className="flex items-center gap-3">
                      <Badge className={`text-xs w-24 justify-center ${EMOTION_COLORS[emotion] || EMOTION_COLORS.neutral}`}>{emotion}</Badge>
                      <Progress value={(count / patterns.length) * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{count}x</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="font-medium mb-3 text-sm">Recent Events</h3>
                <div className="space-y-2">
                  {patterns.slice(0, 8).map(p => (
                    <div key={p.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                      <Badge className={`text-xs shrink-0 ${EMOTION_COLORS[p.emotion] || EMOTION_COLORS.neutral}`}>{p.emotion}</Badge>
                      <span className="text-xs text-muted-foreground flex-1">{p.context || "No context"}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Growth Timeline */}
        <TabsContent value="growth" className="mt-4">
          <GrowthTimeline />
        </TabsContent>

        {/* Behavioral Intelligence */}
        <TabsContent value="behavioral" className="mt-4">
          <BehavioralPatterns />
        </TabsContent>

        {/* Rituals */}
        <TabsContent value="rituals" className="mt-4">
          <RitualDashboard />
        </TabsContent>

        {/* Episodic Memory */}
        <TabsContent value="episodes" className="space-y-3 mt-4">
          {summaries.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No episode summaries yet</p>
            </Card>
          ) : (
            summaries.map(s => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`text-xs ${EMOTION_COLORS[s.emotional_tone] || EMOTION_COLORS.neutral}`}>{s.emotional_tone}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mb-3">{s.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.key_topics?.map(t => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
