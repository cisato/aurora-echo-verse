// One-shot bot configuration: registers the webhook and publishes Aurora's
// name, description and command list to Telegram. Safe to re-run.

import { botToken, webhookSecret } from "../_shared/telegram.ts";
import { corsHeaders } from "../_shared/auth.ts";

const API = "https://api.telegram.org";

const NAME = "Aurora";
const SHORT_DESCRIPTION = "Aurora — an AI companion that remembers what you tell her. Just talk.";
const DESCRIPTION = [
  "Aurora is an AI companion with real memory. No commands — just talk to her like a person.",
  "",
  "Tell her about yourself and she'll quietly remember the things that matter. Ask what she knows, or ask her to forget something, in plain words.",
  "Send a voice note and she can answer with one. Send a photo and she'll read it.",
  "",
  "Works on its own straight away. Already use the Aurora app? Send her your link code to connect them — optional.",
].join("\n");

// Aurora is conversational — no slash command menu.
const COMMANDS: { command: string; description: string }[] = [];

async function call(token: string, method: string, payload: Record<string, unknown> = {}) {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.ok === false) {
    console.error(`Telegram ${method} failed [${res.status}]:`, JSON.stringify(body).slice(0, 400));
  }
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let token: string;
  try {
    token = botToken();
  } catch {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN is not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;

  const me = await call(token, "getMe");
  const results: Record<string, unknown> = { username: me?.result?.username ?? null };

  results.webhook = await call(token, "setWebhook", {
    url: webhookUrl,
    secret_token: await webhookSecret(token),
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: true,
  });
  results.name = await call(token, "setMyName", { name: NAME });
  results.short_description = await call(token, "setMyShortDescription", { short_description: SHORT_DESCRIPTION });
  results.description = await call(token, "setMyDescription", { description: DESCRIPTION });
  results.commands = await call(token, "setMyCommands", { commands: COMMANDS });
  results.info = await call(token, "getWebhookInfo");

  return new Response(JSON.stringify({ ok: true, webhookUrl, ...results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
