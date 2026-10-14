// Multi-provider chat with automatic fallback: Gemini → Groq → OpenRouter (free models).
// All three speak the OpenAI chat-completions format. A provider is skipped
// when its key is missing, it errors before streaming, or it streams nothing.
// Once tokens have reached the caller we never switch (no duplicated text).

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

interface Provider { name: string; url: string; key: string | undefined; models: string[]; headers?: Record<string, string> }

function providers(): Provider[] {
  return [
    { name: "gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: Deno.env.get("GEMINI_API_KEY"), models: ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"] },
    { name: "groq", url: "https://api.groq.com/openai/v1/chat/completions",
      key: Deno.env.get("GROQ_API_KEY"), models: ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"] },
    { name: "openrouter", url: "https://openrouter.ai/api/v1/chat/completions",
      key: Deno.env.get("OPENROUTER_API_KEY"),
      models: ["google/gemma-4-31b-it:free", "nvidia/nemotron-3-super-120b-a12b:free", "openrouter/free"],
      headers: { "HTTP-Referer": "https://aurora.app", "X-Title": "Aurora" } },
  ];
}

// Providers that recently failed with rate limits/outages are cooled down
// for this function instance so the next turn doesn't wait on them again.
const cooldown = new Map<string, number>();
const COOLDOWN_MS = 60_000;
const FIRST_TOKEN_TIMEOUT_MS = 15_000;

export interface ChatOpts { messages: Any[]; temperature?: number; onDelta?: (t: string) => void }
export interface ChatResult { text: string; provider: string | null; model: string | null; errors: string[] }

export function anyProviderConfigured(): boolean { return providers().some((p) => !!p.key); }

export async function chatWithFallback({ messages, temperature, onDelta }: ChatOpts): Promise<ChatResult> {
  const errors: string[] = [];
  const now = Date.now();
  for (const p of providers()) {
    if (!p.key) { errors.push(`${p.name}: no key`); continue; }
    for (const model of p.models) {
      const id = `${p.name}/${model}`;
      if ((cooldown.get(id) ?? 0) > now) { errors.push(`${id}: cooling down`); continue; }
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), FIRST_TOKEN_TIMEOUT_MS);
      let started = false, text = "";
      try {
        const res = await fetch(p.url, {
          method: "POST", signal: ctrl.signal,
          headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json", ...(p.headers ?? {}) },
          body: JSON.stringify({ model, messages, stream: true, ...(temperature != null ? { temperature } : {}) }),
        });
        if (!res.ok || !res.body) {
          const detail = (await res.text().catch(() => "")).slice(0, 200);
          errors.push(`${id}: HTTP ${res.status} ${detail}`);
          if (res.status === 429 || res.status >= 500) cooldown.set(id, Date.now() + COOLDOWN_MS);
          // Auth/billing problems apply to every model of this provider.
          if (res.status === 401 || res.status === 402 || res.status === 403) break;
          continue;
        }
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += value;
          const lines = buf.split("\n"); buf = lines.pop() ?? "";
          for (const l of lines) {
            if (!l.startsWith("data:")) continue;
            const d = l.slice(5).trim();
            if (!d || d === "[DONE]") continue;
            try {
              const j = JSON.parse(d);
              if (j.error) throw new Error(j.error.message || "stream error");
              const delta = j?.choices?.[0]?.delta?.content;
              if (delta) {
                if (!started) { started = true; clearTimeout(timer); }
                text += delta; onDelta?.(delta);
              }
            } catch (e) { if (e instanceof Error && e.message !== "Unexpected end of JSON input" && !(e instanceof SyntaxError)) throw e; }
          }
        }
        clearTimeout(timer);
        if (text.trim()) return { text, provider: p.name, model, errors };
        errors.push(`${id}: empty reply`);
      } catch (e) {
        clearTimeout(timer);
        errors.push(`${id}: ${e instanceof Error ? e.message : String(e)}`);
        cooldown.set(id, Date.now() + COOLDOWN_MS);
        if (started) return { text, provider: p.name, model, errors }; // keep partial; never duplicate
      }
    }
  }
  console.error("all LLM providers failed:", errors.join(" | "));
  return { text: "", provider: null, model: null, errors };
}
