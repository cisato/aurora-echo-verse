// Spots timed things in a message: reminders the person explicitly asked for,
// and dated events worth a gentle follow-up afterwards. Writes real rows to
// scheduled_messages so Aurora only ever says "I'll remind you" when a row exists.

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["reminder", "followup"],
  properties: {
    reminder: { type: ["object", "null"], additionalProperties: false, required: ["at", "text"], properties: { at: { type: "string" }, text: { type: "string" } } },
    followup: { type: ["object", "null"], additionalProperties: false, required: ["at", "about"], properties: { at: { type: "string" }, about: { type: "string" } } },
  },
};

async function streamText(res: Response): Promise<string> {
  let text = "", buf = "";
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
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
  return text;
}

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
      headers: { Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL, stream: true, store: false, reasoning: { effort: "low" },
        instructions: system, input: text.slice(0, 2000),
        text: { format: { type: "json_schema", name: "timed", strict: true, schema: SCHEMA } },
      }),
    });
    if (!res.ok || !res.body) { console.error("timed detect failed", res.status); return {}; }
    const raw = await streamText(res);
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
