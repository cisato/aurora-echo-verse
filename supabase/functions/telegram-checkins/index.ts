// Scheduled proactive check-ins for Telegram. Opt-in, capped per day, quiet
// hours respected, cooled down per topic, and every message must reference a
// specific stored memory. Called hourly by the scheduler.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/auth.ts";
import { sendMessage } from "../_shared/telegram.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
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
    headers: { Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      instructions: SYSTEM,
      input: `${name ? `Their name: ${name}\n` : ""}Stored note: ${note}`,
    }),
  });
  if (!res.ok || !res.body) { console.error("draft failed", res.status); return null; }
  let text = "", buf = "";
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    const lines = buf.split("\n"); buf = lines.pop() ?? "";
    for (const l of lines) {
      if (!l.startsWith("data:")) continue;
      try { const e = JSON.parse(l.slice(5)); if (e.type === "response.output_text.delta") text += e.delta; } catch { /* skip */ }
    }
  }
  text = text.trim();
  if (!text || /^SKIP\b/i.test(text)) return null;
  return text.slice(0, 600);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));
  if (body?.mode === "due") return await sendDue(supabase);

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

/** Deliver reminders and follow-ups whose time has come. Bounded per run. */
async function sendDue(supabase: Any): Promise<Response> {
  const { data: due } = await supabase.from("scheduled_messages")
    .select("id, user_id, kind, body, attempts, send_at")
    .eq("status", "pending").lte("send_at", new Date().toISOString())
    .order("send_at").limit(25);
  let sent = 0;
  for (const m of (due ?? []) as Any[]) {
    // Claim the row first so overlapping runs never double-send.
    const { data: claimed } = await supabase.from("scheduled_messages")
      .update({ attempts: m.attempts + 1 }).eq("id", m.id).eq("attempts", m.attempts).eq("status", "pending").select("id");
    if (!claimed?.length) continue;
    const finish = (status: string, msg?: string) => supabase.from("scheduled_messages")
      .update({ status, sent_message: msg ?? null, sent_at: status === "sent" ? new Date().toISOString() : null }).eq("id", m.id);
    try {
      const { data: link } = await supabase.from("bot_channel_links")
        .select("external_id, display_name").eq("user_id", m.user_id).eq("platform", "telegram").maybeSingle();
      const { data: s } = await supabase.from("user_settings")
        .select("telegram_enabled, telegram_checkins_enabled, telegram_checkin_max_per_day, telegram_checkin_quiet_start, telegram_checkin_quiet_end")
        .eq("user_id", m.user_id).maybeSingle();
      if (!link?.external_id || s?.telegram_enabled === false) { await finish("skipped"); continue; }

      let text: string | null;
      if (m.kind === "reminder") {
        text = `Reminder: ${m.body.charAt(0).toUpperCase()}${m.body.slice(1)}`;
      } else {
        if (!s?.telegram_checkins_enabled) { await finish("skipped"); continue; }
        const { data: rp } = await supabase.from("ritual_preferences").select("timezone").eq("user_id", m.user_id).maybeSingle();
        if (inQuiet(hourIn(rp?.timezone || "Africa/Lagos"), s.telegram_checkin_quiet_start ?? 21, s.telegram_checkin_quiet_end ?? 8)) {
          // Push to the end of quiet hours instead of dropping it.
          await supabase.from("scheduled_messages").update({ send_at: new Date(Date.now() + 3600e3).toISOString() }).eq("id", m.id);
          continue;
        }
        const since = new Date(Date.now() - 86400e3).toISOString();
        const { count } = await supabase.from("proactive_checkins").select("id", { count: "exact", head: true }).eq("user_id", m.user_id).gte("created_at", since);
        if ((count ?? 0) >= (s.telegram_checkin_max_per_day ?? 2)) { await finish("skipped"); continue; }
        text = await draft(`(upcoming event they told you about, which should now be over — ask how it went) ${m.body}`, link.display_name ?? undefined);
        if (!text) { await finish("skipped"); continue; }
      }
      const ok = await sendMessage(link.external_id, text);
      if (m.kind === "followup") {
        await supabase.from("proactive_checkins").insert({ user_id: m.user_id, platform: "telegram", topic_key: `followup:${m.body}`.slice(0, 120), message: text });
      }
      await finish(ok === false ? "failed" : "sent", text);
      sent++;
    } catch (e) {
      console.error("scheduled send failed", m.id, e);
      await finish(m.attempts + 1 >= 3 ? "failed" : "pending");
    }
  }
  return new Response(JSON.stringify({ ok: true, due: due?.length ?? 0, sent }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
