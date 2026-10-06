// Scheduled proactive check-ins for Telegram. Opt-in, capped per day, quiet
// hours respected, cooled down per topic, and every message must reference a
// specific stored memory. Called hourly by the scheduler.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/auth.ts";
import { sendMessage } from "../_shared/telegram.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TOPIC_COOLDOWN_DAYS = 4;
const QUIET_CATEGORIES = ["goal", "project", "fact", "relationship", "skill"];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

const SYSTEM = `You write one short, optional check-in message from Aurora, an AI companion, to a person on Telegram.
Rules:
- It MUST be about the specific stored note you are given. If the note isn't something worth following up on (a plain trait like a name or favourite food, nothing ongoing), reply exactly SKIP.
- One or two sentences. Casual, warm, specific. Ask one easy question.
- Never claim feelings, never say you missed them, no guilt, no pressure, no "just checking in".
- Don't invent details beyond the note.
Return only the message text, or SKIP.`;

function hourIn(tz: string): number {
  try {
    return parseInt(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz }).format(new Date()), 10);
  } catch { return new Date().getUTCHours(); }
}

function inQuiet(h: number, start: number, end: number) {
  return start > end ? (h >= start || h < end) : (h >= start && h < end);
}

async function draft(note: string, name?: string): Promise<string | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `${name ? `Their name: ${name}\n` : ""}Stored note: ${note}` },
      ],
      temperature: 0.6,
    }),
  });
  if (!res.ok) { console.error("draft failed", res.status); return null; }
  const text = (await res.json())?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text || /^SKIP\b/i.test(text)) return null;
  return text.slice(0, 600);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: users } = await supabase
    .from("user_settings")
    .select("user_id, telegram_checkin_max_per_day, telegram_checkin_quiet_start, telegram_checkin_quiet_end")
    .eq("telegram_checkins_enabled", true)
    .eq("telegram_enabled", true);

  const sent: string[] = [];
  for (const s of (users ?? []) as Any[]) {
    try {
      const { data: link } = await supabase.from("bot_channel_links")
        .select("external_id, display_name, last_message_at")
        .eq("user_id", s.user_id).eq("platform", "telegram").maybeSingle();
      if (!link?.external_id) continue;

      const { data: rp } = await supabase.from("ritual_preferences").select("timezone").eq("user_id", s.user_id).maybeSingle();
      const tz = rp?.timezone || "Africa/Lagos";
      if (inQuiet(hourIn(tz), s.telegram_checkin_quiet_start ?? 21, s.telegram_checkin_quiet_end ?? 8)) continue;

      // Don't interrupt an active conversation.
      if (link.last_message_at && Date.now() - new Date(link.last_message_at).getTime() < 3 * 3600e3) continue;

      const since = new Date(Date.now() - 24 * 3600e3).toISOString();
      const { count } = await supabase.from("proactive_checkins")
        .select("id", { count: "exact", head: true }).eq("user_id", s.user_id).gte("created_at", since);
      if ((count ?? 0) >= (s.telegram_checkin_max_per_day ?? 2)) continue;

      const cool = new Date(Date.now() - TOPIC_COOLDOWN_DAYS * 86400e3).toISOString();
      const { data: recent } = await supabase.from("proactive_checkins")
        .select("topic_key").eq("user_id", s.user_id).gte("created_at", cool);
      const used = new Set((recent ?? []).map((r: Any) => r.topic_key));

      const { data: mems } = await supabase.from("user_memory")
        .select("id, category, key, value")
        .eq("user_id", s.user_id).eq("is_sensitive", false)
        .in("category", QUIET_CATEGORIES)
        .order("last_reinforced_at", { ascending: false }).limit(15);
      const candidate = (mems ?? []).find((m: Any) => !used.has(`${m.category}:${m.key}`));
      if (!candidate) continue;

      const msg = await draft(`(${candidate.category}) ${candidate.key}: ${candidate.value}`, link.display_name ?? undefined);
      if (!msg) continue;

      await sendMessage(link.external_id, msg);
      await supabase.from("proactive_checkins").insert({
        user_id: s.user_id, platform: "telegram",
        topic_key: `${candidate.category}:${candidate.key}`, memory_id: candidate.id, message: msg,
      });
      sent.push(s.user_id);
    } catch (e) {
      console.error("checkin failed for", s.user_id, e);
    }
  }

  return new Response(JSON.stringify({ ok: true, considered: users?.length ?? 0, sent: sent.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
