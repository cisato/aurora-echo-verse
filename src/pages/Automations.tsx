import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { RitualDashboard } from "@/components/RitualDashboard";
import { BehavioralPatterns } from "@/components/BehavioralPatterns";
import { SKILLS } from "@/lib/intent/skills";

/**
 * Automations — the things Aurora does without being asked, plus the full
 * catalogue of skills the intent engine can route to.
 */
export default function Automations() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 space-y-6">
      <header>
        <h1 className="font-display text-2xl tracking-tight">Automations</h1>
        <p className="text-sm text-muted-foreground">
          Routines, patterns, and everything Aurora knows how to do.
        </p>
      </header>

      <Tabs defaultValue="routines">
        <TabsList className="rounded-xl">
          <TabsTrigger value="routines">Routines</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="mt-4">
          <RitualDashboard />
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          <BehavioralPatterns />
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {SKILLS.map((skill) => (
              <Card key={skill.id} className="rounded-2xl border-border/60 bg-card/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{skill.name}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {skill.category}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{skill.description}</p>
                {skill.requiresDevice && (
                  <p className="mt-2 text-[11px] text-primary">Requires device permission</p>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
