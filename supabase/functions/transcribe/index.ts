// Speech-to-text via Lovable AI Gateway (openai/gpt-4o-mini-transcribe).
// Accepts multipart/form-data with an "audio" file field; returns { text }.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BYTES = 24 * 1024 * 1024; // 24 MiB

function extFromMime(mime: string): string {
  const base = (mime || "").split(";")[0].trim().toLowerCase();
  switch (base) {
    case "audio/webm": return "webm";
    case "audio/ogg": return "ogg";
    case "audio/mp4":
    case "audio/x-m4a":
    case "audio/m4a": return "m4a";
    case "audio/mpeg": return "mp3";
    case "audio/wav":
    case "audio/x-wav":
    case "audio/wave": return "wav";
    default: return "webm";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const audio = form.get("audio");
  if (!(audio instanceof File) && !(audio instanceof Blob)) {
    return new Response(JSON.stringify({ error: "Missing 'audio' file field" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (audio.size === 0) {
    return new Response(JSON.stringify({ error: "Empty recording" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (audio.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "Recording too large" }), {
      status: 413,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const language = (form.get("language") as string | null) || undefined;
  const filename = (audio as File).name || `recording.${extFromMime(audio.type)}`;

  const upstream = new FormData();
  upstream.append("model", "openai/gpt-4o-mini-transcribe");
  upstream.append("file", audio, filename);
  if (language) upstream.append("language", language);

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });

    const bodyText = await res.text();
    if (!res.ok) {
      console.error("Gateway STT error:", res.status, bodyText);
      return new Response(
        JSON.stringify({ error: "Transcription failed", status: res.status, detail: bodyText.slice(0, 500) }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let text = "";
    try {
      const json = JSON.parse(bodyText);
      text = json?.text ?? "";
    } catch {
      text = bodyText;
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Transcription request crashed", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
