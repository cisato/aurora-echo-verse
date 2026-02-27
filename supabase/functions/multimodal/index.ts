import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const { action, image_data, prompt } = await req.json();

    if (action === "analyze" || action === "ocr") {
      if (!image_data) {
        return new Response(JSON.stringify({ error: "image_data is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = action === "ocr"
        ? "You are an OCR specialist. Extract ALL text visible in this image. Return the extracted text exactly as it appears, preserving formatting where possible. If no text is found, say 'No text detected in this image.'"
        : "You are an expert image analyst. Provide a detailed, structured analysis of this image including: what you see, key elements, colors, composition, context, and any notable details.";

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt || systemPrompt },
                { type: "image_url", image_url: { url: image_data } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI error:", response.status, errText);
        return new Response(JSON.stringify({ error: "AI processing failed" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await response.json();
      const text = result.choices?.[0]?.message?.content || "No analysis available.";

      return new Response(JSON.stringify({ result: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate") {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "prompt is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Image gen error:", response.status, errText);
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await response.json();
      const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const text = result.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ image_url: imageUrl, text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: analyze, generate, or ocr" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Multimodal error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
