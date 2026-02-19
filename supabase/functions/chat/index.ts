import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CognitiveState {
  userName: string;
  goals: string[];
  interests: string[];
  projects: string[];
  triggers: string[];
  motivators: string[];
  patterns: string[];
  recentEmotionalTone: string;
  emotionalTrend: string;
  unresolvedThreads: string[];
  recentMilestones: string[];
  identityGrowth: string;
  companionMode: string;
}

async function buildCognitiveState(userId: string, supabase: any, userName: string, companionMode: string): Promise<CognitiveState> {
  const state: CognitiveState = {
    userName,
    goals: [],
    interests: [],
    projects: [],
    triggers: [],
    motivators: [],
    patterns: [],
    recentEmotionalTone: "neutral",
    emotionalTrend: "stable",
    unresolvedThreads: [],
    recentMilestones: [],
    identityGrowth: "",
    companionMode,
  };

  try {
    // Fetch semantic memory
    const { data: memories } = await supabase
      .from("user_memory")
      .select("category, key, value, confidence")
      .eq("user_id", userId)
      .order("last_reinforced_at", { ascending: false })
      .limit(50);

    if (memories) {
      for (const m of memories) {
        const entry = `${m.key}: ${m.value}`;
        switch (m.category) {
          case "goal": state.goals.push(entry); break;
          case "interest": state.interests.push(entry); break;
          case "project": state.projects.push(entry); break;
          case "trigger": state.triggers.push(entry); break;
          case "motivator": state.motivators.push(entry); break;
          case "pattern": state.patterns.push(entry); break;
        }
      }
    }

    // Fetch recent episodic summaries
    const { data: summaries } = await supabase
      .from("conversation_summaries")
      .select("summary, emotional_tone, unresolved_threads, milestones, key_topics")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (summaries && summaries.length > 0) {
      const latest = summaries[0];
      state.recentEmotionalTone = latest.emotional_tone || "neutral";
      state.unresolvedThreads = latest.unresolved_threads || [];
      state.recentMilestones = summaries.flatMap((s: any) => s.milestones || []).slice(0, 3);
    }

    // Fetch emotional trend (last 10 patterns)
    const { data: emotions } = await supabase
      .from("emotional_patterns")
      .select("emotion, polarity, intensity, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (emotions && emotions.length > 0) {
      const negCount = emotions.filter((e: any) => e.polarity === "negative").length;
      const posCount = emotions.filter((e: any) => e.polarity === "positive").length;
      if (negCount > posCount * 1.5) state.emotionalTrend = "declining";
      else if (posCount > negCount * 1.5) state.emotionalTrend = "improving";
      else state.emotionalTrend = "stable";

      const recentEmotions = emotions.slice(0, 3).map((e: any) => e.emotion);
      state.recentEmotionalTone = recentEmotions[0] || "neutral";
    }

    // Fetch recent identity evolution
    const { data: evolution } = await supabase
      .from("identity_evolution")
      .select("dimension, score, delta, note")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6);

    if (evolution && evolution.length > 0) {
      const improvements = evolution.filter((e: any) => e.delta > 0);
      if (improvements.length > 0) {
        state.identityGrowth = improvements.map((e: any) => `${e.dimension} (+${e.delta.toFixed(1)})`).join(", ");
      }
    }
  } catch (error) {
    console.error("Error building cognitive state:", error);
  }

  return state;
}

function buildContextBlock(state: CognitiveState): string {
  const sections: string[] = [];

  sections.push(`## Compressed Cognitive State for ${state.userName || "the user"}`);

  if (state.goals.length > 0) {
    sections.push(`**Active Goals:** ${state.goals.slice(0, 4).join(" | ")}`);
  }

  if (state.projects.length > 0) {
    sections.push(`**Current Projects:** ${state.projects.slice(0, 3).join(" | ")}`);
  }

  if (state.interests.length > 0) {
    sections.push(`**Key Interests:** ${state.interests.slice(0, 4).join(" | ")}`);
  }

  if (state.triggers.length > 0) {
    sections.push(`**Known Stress Triggers:** ${state.triggers.slice(0, 2).join(" | ")}`);
  }

  if (state.motivators.length > 0) {
    sections.push(`**Motivators:** ${state.motivators.slice(0, 2).join(" | ")}`);
  }

  if (state.patterns.length > 0) {
    sections.push(`**Behavioral Patterns:** ${state.patterns.slice(0, 2).join(" | ")}`);
  }

  sections.push(`**Emotional State:** Current tone is ${state.recentEmotionalTone}. Trend: ${state.emotionalTrend}.`);

  if (state.unresolvedThreads.length > 0) {
    sections.push(`**Unresolved Threads:** ${state.unresolvedThreads.slice(0, 2).join("; ")}`);
  }

  if (state.recentMilestones.length > 0) {
    sections.push(`**Recent Milestones:** ${state.recentMilestones.slice(0, 2).join("; ")}`);
  }

  if (state.identityGrowth) {
    sections.push(`**Identity Growth Detected:** ${state.identityGrowth}`);
  }

  return sections.join("\n");
}

function getCompanionModeInstructions(mode: string): string {
  const modes: Record<string, string> = {
    assistant: `
**Mode: Professional Assistant**
- Clear, comprehensive answers balanced between thorough and concise
- Helpful, professional tone
- Offer to elaborate when appropriate`,

    growth_partner: `
**Mode: Growth Partner**
- You are Aurora, a dedicated growth partner focused on the user's evolution
- Challenge them constructively, celebrate wins, identify blind spots
- Reference their goals and progress regularly
- Use phrases like "Based on what you've shared..." and "This aligns with your goal of..."
- Push them beyond comfort zones while being supportive`,

    therapist_lite: `
**Mode: Supportive Companion**
- Emotionally attuned, non-judgmental, deeply empathetic
- Reflect feelings before offering solutions
- Ask "What's coming up for you around this?" type questions
- Validate emotions, then gently explore root causes
- Never rush to fix — first ensure the user feels heard`,

    strategic: `
**Mode: Strategic Co-Founder**
- Think like a world-class strategic advisor
- Systems thinking: first principles, second-order effects
- Be direct, concise, and decisive
- Challenge assumptions rigorously
- Frame everything in terms of leverage, ROI, and long-term positioning`,

    casual: `
**Mode: Casual Companion**
- Warm, playful, relaxed conversational style
- Use humor appropriately, be light-hearted
- Like a trusted friend who also happens to be brilliant
- Match the user's energy and tone
- Don't be overly formal or structured`,

    creative: `
**Mode: Creative Collaborator**
- Imaginative, expansive, generative thinking
- Think outside the box, offer unconventional angles
- Use vivid language, metaphors, and thought experiments
- Encourage brainstorming, "what if" scenarios
- Celebrate creative exploration`,

    technical: `
**Mode: Technical Expert**
- Precise, detailed, accurate technical information
- Include code, specs, and technical details when relevant
- Use proper terminology, cite best practices
- Structure information logically with clear sections`,
  };

  return modes[mode] || modes.assistant;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona = "assistant", userName, userId, companionMode = "assistant" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build cognitive context if userId is provided
    let cognitiveContext = "";
    if (userId) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          const cognitiveState = await buildCognitiveState(userId, supabase, userName || "", companionMode);
          cognitiveContext = buildContextBlock(cognitiveState);
        }
      } catch (e) {
        console.error("Failed to build cognitive context:", e);
      }
    }

    const modeInstructions = getCompanionModeInstructions(companionMode || persona);

    const systemPrompt = `You are Aurora, an advanced AI companion designed to be a genuine presence in the user's life — intelligent, emotionally attuned, proactive, and deeply personalized.

Current date: ${currentDate}
Current time: ${currentTime}
${userName ? `User's name: ${userName}. Address them by name occasionally.` : ""}

${cognitiveContext ? `---\n${cognitiveContext}\n---\n\nUse this context to personalize every response. Reference their goals, notice emotional patterns, and make connections across time. Never explicitly say "I see in my memory that..." — just naturally weave in what you know.` : ""}

${modeInstructions}

**Core Companion Principles:**
1. Be genuinely present — respond to what's really being said, not just the words
2. Maintain continuity — reference past context naturally, like a real companion would
3. Proactively notice patterns — "You've mentioned this before..." "This seems connected to..."
4. Calibrate emotional tone to match the moment — don't be chipper when they're struggling
5. Reinforce identity growth — acknowledge how they've evolved, not just what they've done
6. Empower, don't replace — encourage real-world action and human connection
7. Be honest — if you don't know, say so. Authenticity builds trust.
8. Use formatting (bullet points, headers) only when it genuinely helps clarity

**Identity Reinforcement:** When appropriate, reference growth: "You're handling this differently than you would have before." "This is exactly the kind of resilience you've been building."

**Ethical Boundaries:** Encourage real-world action and human relationships. If emotional over-reliance is detected, gently redirect: "This is worth exploring with someone in person too."

Remember: You're not just answering questions. You're building a relationship.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: companionMode === "creative" ? 0.9 : companionMode === "technical" ? 0.3 : companionMode === "strategic" ? 0.5 : 0.75,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
