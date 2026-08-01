import { useMemo, useState } from "react";
import { Sparkles, ArrowUp, Mic, Battery, Wifi, WifiOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useDeviceContext } from "@/hooks/useDeviceContext";
import { detectIntent, executeIntent } from "@/lib/intent/engine";
import type { ResolvedIntent } from "@/lib/intent/types";
import { DailyRitualCard } from "@/components/dashboard/DailyRitualCard";
import { EnhancedMemoryCard } from "@/components/dashboard/EnhancedMemoryCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { cn } from "@/lib/utils";

interface HomeProps {
  onNavigate: (surface: string) => void;
}

const SUGGESTIONS = [
  "Draft a follow-up email to my client",
  "Remember that I prefer mornings for deep work",
  "Summarise what I worked on this week",
  "Every weekday at 7am, give me a briefing",
];

export function Home({ onNavigate }: HomeProps) {
  const { profile } = useProfile();
  const device = useDeviceContext();
  const [input, setInput] = useState("");
  const [conversing, setConversing] = useState(false);
  const [preview, setPreview] = useState<ResolvedIntent | null>(null);
  const [pending, setPending] = useState<{
    intent: ResolvedIntent;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const openConversation = (prompt?: string, record = false) => {
    setConversing(true);
    setTimeout(() => {
      if (prompt) window.dispatchEvent(new CustomEvent("aurora:prompt", { detail: { prompt } }));
      if (record) window.dispatchEvent(new CustomEvent("aurora:record"));
    }, 220);
  };


  const greeting = useMemo(() => {
    const map = {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Still up",
    } as const;
    return map[device.timeOfDay];
  }, [device.timeOfDay]);

  const handleChange = (value: string) => {
    setInput(value);
    setPreview(value.trim().length > 3 ? detectIntent({ input: value, device }) : null);
  };

  const submit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;

    const intent = detectIntent({
      input: value,
      device,
      userName: profile?.display_name ?? undefined,
    });

    await executeIntent(intent, {
      converse: (prompt) => openConversation(prompt),
      navigate: (surface, prompt) => {
        onNavigate(surface);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("aurora:prompt", { detail: { prompt, surface } }));
        }, 220);
      },
      confirm: (i) => new Promise<boolean>((resolve) => setPending({ intent: i, resolve })),
      onUnavailable: (i) =>
        toast.info(`${i.skill.name} needs device access`, {
          description: "Grant the permission on your phone and Aurora will handle it directly.",
        }),
    });

    setInput("");
    setPreview(null);
  };

  if (conversing) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setConversing(false)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Home
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <ChatWindow />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12 space-y-8">

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Aurora</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
          {greeting}{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Tell me what you need. I'll figure out the rest.
        </p>
      </header>

      {/* Omnibox — every request enters through here */}
      <section className="space-y-3">
        <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-sm focus-within:border-primary/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ask, plan, remember, or automate…"
            className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] outline-none placeholder:text-muted-foreground/70"
          />
          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <div className="min-w-0 flex-1">
              {preview && (
                <div className="flex items-center gap-2 px-2 text-[11px] text-muted-foreground truncate">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {preview.skill.name}
                  </span>
                  <span className="truncate">{preview.plan.map((s) => s.label).join(" → ")}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Talk to Aurora"
              className="rounded-full"
              onClick={() => {
                onNavigate("home");
                window.dispatchEvent(new CustomEvent("aurora:record"));
              }}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              aria-label="Send"
              className="rounded-full"
              disabled={!input.trim()}
              onClick={() => submit()}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Ambient awareness */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1">
          {device.network?.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {device.network?.online ? device.network?.type ?? "Online" : "Offline"}
        </span>
        {device.battery && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1">
            <Battery className={cn("h-3 w-3", device.battery.level < 0.2 && "text-destructive")} />
            {Math.round(device.battery.level * 100)}%{device.battery.charging ? " · charging" : ""}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1">
          <ShieldCheck className="h-3 w-3" /> Nothing runs without your say-so
        </span>
      </div>

      {/* Daily briefing */}
      <section className="space-y-4">
        <DailyRitualCard />
        <div className="grid gap-4 md:grid-cols-2">
          <RecentActivityCard />
          <EnhancedMemoryCard />
        </div>
      </section>

      <Card className="rounded-2xl border-border/60 bg-card/50 p-4 text-xs text-muted-foreground">
        Aurora routes every request through intent detection, your memory, and a
        visible plan before acting. You can always see what it intends to do.
      </Card>

      <AlertDialog open={!!pending} onOpenChange={(open) => {
        if (!open && pending) { pending.resolve(false); setPending(null); }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.intent.skill.name}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Here's what I'd do:</p>
                <ol className="space-y-1 pl-4 list-decimal">
                  {pending?.intent.plan.map((step) => (
                    <li key={step.label} className={step.sensitive ? "text-foreground font-medium" : ""}>
                      {step.label}
                    </li>
                  ))}
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { pending?.resolve(false); setPending(null); }}>
              Not now
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => { pending?.resolve(true); setPending(null); }}>
              Go ahead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
