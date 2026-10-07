// Spots timed things in a message: reminders the person explicitly asked for,
// and dated events worth a gentle follow-up afterwards. Writes real rows to
// scheduled_messages so Aurora only ever says "I'll remind you" when a row exists.

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export interface TimedItems {
  reminder?: { at: string; text: string };
  followup?: { at: string; about: string };
}

function localNow(tz: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, dateStyle: "full", timeStyle: "short", hour12: false,
    }).format(new Date());
  } catch { return new Date().toUTCString(); }
}

export async function detectTimed(text: string, tz: string): Promise<TimedItems> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key || !text || text.trim().length < 4) return {};
  const system = `Current moment: ${new Date().toISOString()} (UTC). Their local time: ${localNow(tz)} in ${tz}.
Read one message and return ONLY JSON: {"reminder":null|{"at":"ISO-8601 UTC","text":"..."},"followup":null|{"at":"ISO-8601 UTC","about":"..."}}
- reminder: ONLY when they explicitly ask to be reminded / pinged / told at a time ("remind me in 15 minutes to...", "ping me at 6"). text = what to remind them of, in second person ("call your mum"). Convert local times using their timezone. Must be in the future.
- followup: when they mention a specific upcoming event with a knowable date/time (exam tomorrow, interview Friday 10am, flight on the 12th). at = a sensible moment shortly AFTER it ends (same evening or next morning local, never 22:00-08:00 local). about = short neutral description ("their exam"). Not for vague plans.
- Otherwise null. Be conservative.`;
  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, { role: "user", content: text.slice(0, 2000) }],
        temperature: 0,
      }),
    });
    if (!res.ok) { console.error("timed detect failed", res.status); return {}; }
    const raw = (await res.json())?.choices?.[0]?.message?.content ?? "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return {};
    const p = JSON.parse(m[0]);
    const out: TimedItems = {};
    const valid = (s: string) => { const t = Date.parse(s); return !isNaN(t) && t > Date.now() - 60e3 && t < Date.now() + 366 * 86400e3; };
    if (p.reminder?.at && p.reminder?.text && valid(p.reminder.at)) out.reminder = { at: new Date(p.reminder.at).toISOString(), text: String(p.reminder.text).slice(0, 300) };
    if (p.followup?.at && p.followup?.about && valid(p.followup.at)) out.followup = { at: new Date(p.followup.at).toISOString(), about: String(p.followup.about).slice(0, 200) };
    return out;
  } catch (e) {
    console.error("timed detect error", e);
    return {};
  }
}

/** Store what was found. Returns factual notes for the conversational model. */
export async function scheduleTimed(supabase: Any, userId: string, items: TimedItems, tz: string, checkinsOn: boolean): Promise<string[]> {
  const notes: string[] = [];
  const fmt = (iso: string) => {
    try { return new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(iso)); }
    catch { return iso; }
  };
  if (items.reminder) {
    const { error } = await supabase.from("scheduled_messages").insert({
      user_id: userId, kind: "reminder", send_at: items.reminder.at, body: items.reminder.text,
    });
    notes.push(error
      ? `ACTION: they asked for a reminder but saving it FAILED. Tell them plainly it didn't get set.`
      : `ACTION: a real reminder is now scheduled for ${fmt(items.reminder.at)} (${tz}): "${items.reminder.text}". You may confirm the time briefly. It will arrive as a Telegram message.`);
  }
  if (items.followup && checkinsOn) {
    const { data: dup } = await supabase.from("scheduled_messages").select("id")
      .eq("user_id", userId).eq("kind", "followup").eq("status", "pending").ilike("body", items.followup.about).maybeSingle();
    if (!dup) {
      await supabase.from("scheduled_messages").insert({
        user_id: userId, kind: "followup", send_at: items.followup.at, body: items.followup.about,
      });
    }
  }
  return notes;
}
