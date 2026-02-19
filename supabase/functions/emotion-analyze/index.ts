import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ emotion: "neutral", intensity: 0.5, polarity: "neutral", responseMode: "default" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are an emotion analysis system. Analyze text and return ONLY valid JSON:
{
  "emotion": "joy|sadness|anger|fear|surprise|stress|pride|shame|burnout|excitement|anxiety|frustration|gratitude|neutral",
  "intensity": 0.0-1.0,
  "polarity": "positive|negative|neutral",
  "responseMode": "analyst|support|motivator|challenger|listener|default",
  "trigger": "brief trigger description or null"
}

responseMode selection:
- support: sadness, shame, burnout, grief, loneliness
- motivator: excitement, goal-sharing, achievement
- challenger: complacency, avoidance, procrastination
- listener: stress, anxiety, overwhelm (high intensity)
- analyst: neutral/technical questions, planning
- default: casual, joy, gratitude`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error("Analysis failed");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    let result = { emotion: "neutral", intensity: 0.5, polarity: "neutral", responseMode: "default", trigger: null };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = { ...result, ...JSON.parse(jsonMatch[0]) };
      }
    } catch (_) {
      // return defaults
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return new Response(JSON.stringify({ emotion: "neutral", intensity: 0.5, polarity: "neutral", responseMode: "default" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
