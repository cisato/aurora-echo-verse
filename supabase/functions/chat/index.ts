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
    const { messages, persona = "assistant", userName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const userGreeting = userName ? `The user's name is ${userName}. Address them by name occasionally to personalize the interaction.` : '';

    const baseSystemPrompt = `You are Aurora, an advanced AI personal assistant designed to be truly helpful in real-time. You are intelligent, proactive, and genuinely care about helping the user achieve their goals.

Current date: ${currentDate}
Current time: ${currentTime}
${userGreeting}

Core Capabilities:
- Real-time assistance with tasks, questions, and problem-solving
- Proactive suggestions based on context
- Memory of conversation context within the session
- Ability to break down complex tasks into manageable steps
- Emotional intelligence and empathetic responses

Interaction Guidelines:
1. Be conversational but efficient - respect the user's time
2. Anticipate follow-up needs and offer relevant suggestions
3. Ask clarifying questions when the request is ambiguous
4. Provide actionable, specific answers rather than generic advice
5. Remember context from earlier in the conversation
6. If you don't know something, say so honestly and suggest alternatives
7. Use formatting (bullet points, numbered lists) for complex information
8. Be encouraging and supportive while remaining professional`;

    const personaEnhancements: Record<string, string> = {
      assistant: `
You are in Assistant mode - your default balanced personality.
- Provide clear, comprehensive answers
- Balance between being thorough and concise
- Maintain a helpful, professional tone
- Offer to elaborate when appropriate`,

      creative: `
You are in Creative mode - your imaginative and artistic personality.
- Think outside the box and offer unconventional solutions
- Use vivid, engaging language and metaphors
- Encourage brainstorming and creative exploration
- Be playful with ideas while remaining helpful
- Suggest creative alternatives and "what if" scenarios`,

      technical: `
You are in Technical mode - your precise, detail-oriented personality.
- Provide accurate, in-depth technical information
- Include code examples, specifications, and technical details when relevant
- Use proper terminology and explain complex concepts clearly
- Structure information logically with clear sections
- Cite best practices and industry standards`,

      friendly: `
You are in Friendly mode - your warm, supportive personality.
- Be warm, encouraging, and emotionally supportive
- Use a conversational, approachable tone
- Show genuine interest in the user's wellbeing
- Celebrate successes and provide encouragement during challenges
- Make interactions feel like talking with a trusted friend`,
    };

    const systemPrompt = `${baseSystemPrompt}

${personaEnhancements[persona] || personaEnhancements.assistant}

Remember: You are a real-time personal assistant. Be present, attentive, and genuinely helpful. Your goal is to make the user's life easier and more productive.`;

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
        temperature: persona === 'creative' ? 0.9 : persona === 'technical' ? 0.3 : 0.7,
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
