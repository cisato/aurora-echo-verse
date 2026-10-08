// Authoritative server clock. Never trust the model's sense of "now".

export function validTimezone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return tz; } catch { return "UTC"; }
}

/** Offset (minutes) of tz from UTC at a given instant. */
export function tzOffsetMinutes(tz: string, at = new Date()): number {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - at.getTime()) / 60000);
}

export function currentTime(tzIn?: string | null) {
  const tz = validTimezone(tzIn); const now = new Date();
  const off = tzOffsetMinutes(tz, now);
  const sign = off >= 0 ? "+" : "-"; const a = Math.abs(off);
  return {
    utc: now.toISOString(),
    timezone: tz,
    utc_offset: `${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`,
    local: new Intl.DateTimeFormat("en-GB", { timeZone: tz, dateStyle: "full", timeStyle: "long" }).format(now),
    local_date: new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now),
    local_time: new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now),
    day_of_week: new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" }).format(now),
    unix: Math.floor(now.getTime() / 1000),
  };
}

/** Convert a wall-clock local time in tz to a UTC Date. */
export function localToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string): Date {
  const guess = new Date(Date.UTC(y, mo - 1, d, h, mi));
  const off1 = tzOffsetMinutes(tz, guess);
  const first = new Date(guess.getTime() - off1 * 60000);
  const off2 = tzOffsetMinutes(tz, first);
  return off2 === off1 ? first : new Date(guess.getTime() - off2 * 60000);
}

function localParts(tz: string, at = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short" })
    .formatToParts(at).map((x) => [x.type, x.value]));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, dow };
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const UNIT_MS: Record<string, number> = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5 };

export interface ResolvedTime { utc: string; local: string; recurrence?: string; interpretation: string }

/**
 * Deterministic parser for common relative phrases. Returns null when unsure
 * (the model must then ask rather than guess).
 */
export function resolveTime(phraseIn: string, tzIn?: string | null, now = new Date()): ResolvedTime | null {
  const tz = validTimezone(tzIn); const phrase = phraseIn.toLowerCase().trim();
  const L = localParts(tz, now);
  const fmt = (dt: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(dt);
  const out = (dt: Date, interp: string, recurrence?: string): ResolvedTime => ({ utc: dt.toISOString(), local: fmt(dt), interpretation: interp, recurrence });

  const clock = (s: string): { h: number; mi: number } | null => {
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/); if (!m) return null;
    let h = +m[1]; const mi = +(m[2] || 0);
    if (m[3] === "pm" && h < 12) h += 12; if (m[3] === "am" && h === 12) h = 0;
    if (h > 23 || mi > 59) return null; return { h, mi };
  };
  const at = (dayOffset: number, h: number, mi: number) => {
    const base = new Date(Date.UTC(L.y, L.mo - 1, L.d + dayOffset));
    return localToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), h, mi, tz);
  };

  // "in 2 hours", "10 minutes ago"
  let m = phrase.match(/^in\s+(a|an|\d+(?:\.\d+)?)\s+(second|minute|hour|day|week)s?$/) || phrase.match(/^(a|an|\d+(?:\.\d+)?)\s+(second|minute|hour|day|week)s?\s+(ago|from now)$/);
  if (m) {
    const n = m[1] === "a" || m[1] === "an" ? 1 : +m[1]; const sign = m[3] === "ago" ? -1 : 1;
    return out(new Date(now.getTime() + sign * n * UNIT_MS[m[2]]), `${sign > 0 ? "+" : "-"}${n} ${m[2]}(s) from now`);
  }
  if (phrase === "now") return out(now, "now");

  const timeIn = (s: string) => { const c = s.match(/(?:at|by|before)\s+([\d:]+\s*(?:am|pm)?)/); return c ? clock(c[1]) : null; };
  const named: Record<string, { h: number; mi: number }> = { morning: { h: 9, mi: 0 }, "this morning": { h: 9, mi: 0 }, noon: { h: 12, mi: 0 }, afternoon: { h: 15, mi: 0 }, evening: { h: 18, mi: 0 }, tonight: { h: 20, mi: 0 }, midnight: { h: 0, mi: 0 } };

  // "every monday at 9am", "every day at 7", "every morning"
  m = phrase.match(/^every\s+(day|morning|evening|weekday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|hour)(.*)$/);
  if (m) {
    if (m[1] === "hour") return out(new Date(now.getTime() + 36e5), "every hour", "hourly");
    const c = timeIn(m[2]) || named[m[1]] || { h: 9, mi: 0 };
    const hh = `${String(c.h).padStart(2, "0")}:${String(c.mi).padStart(2, "0")}`;
    const wd = WEEKDAYS.indexOf(m[1]);
    if (wd >= 0) {
      let add = (wd - L.dow + 7) % 7; if (add === 0 && (L.h * 60 + L.mi) >= c.h * 60 + c.mi) add = 7;
      return out(at(add, c.h, c.mi), `every ${m[1]} at ${hh} ${tz}`, `weekly:${wd}@${hh}`);
    }
    let add = (L.h * 60 + L.mi) >= c.h * 60 + c.mi ? 1 : 0;
    if (m[1] === "weekday") { while ([0, 6].includes((L.dow + add) % 7)) add++; return out(at(add, c.h, c.mi), `every weekday at ${hh} ${tz}`, `weekdays@${hh}`); }
    return out(at(add, c.h, c.mi), `every day at ${hh} ${tz}`, `daily@${hh}`);
  }

  // today / tonight / tomorrow / yesterday / this morning / next week / weekday names
  const dayWord = phrase.match(/^(today|tonight|tomorrow|yesterday|this morning|this evening|this afternoon|next week|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b(.*)$/);
  if (dayWord) {
    const w = dayWord[1]; const rest = dayWord[4] || "";
    let off = 0; let def = { h: 9, mi: 0 };
    if (w === "tonight") def = named.tonight; else if (w === "this morning") def = named.morning;
    else if (w === "this evening") def = named.evening; else if (w === "this afternoon") def = named.afternoon;
    else if (w === "tomorrow") off = 1; else if (w === "yesterday") off = -1;
    else if (w === "next week") off = ((1 - L.dow + 7) % 7) || 7;
    else { const name = dayWord[2] || dayWord[3]; const wd = WEEKDAYS.indexOf(name); off = (wd - L.dow + 7) % 7; if (off === 0 || w.startsWith("next")) off = off || 7; }
    const c = timeIn(rest) || (/morning/.test(rest) ? named.morning : /evening/.test(rest) ? named.evening : /night/.test(rest) ? named.tonight : def);
    return out(at(off, c.h, c.mi), `${w}${rest} → ${tz}`);
  }

  // "by 6 pm", "at 18:30", "before 5"
  m = phrase.match(/^(?:by|at|before)\s+([\d:]+\s*(?:am|pm)?)$/);
  if (m) { const c = clock(m[1]); if (c) { const passed = (L.h * 60 + L.mi) >= c.h * 60 + c.mi; return out(at(passed ? 1 : 0, c.h, c.mi), `${phrase} (${passed ? "tomorrow" : "today"}) ${tz}`); } }

  // ISO date / datetime
  const iso = Date.parse(phraseIn);
  if (!Number.isNaN(iso) && /\d{4}-\d{2}-\d{2}/.test(phraseIn)) {
    if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(phraseIn)) return out(new Date(iso), "explicit timestamp");
    const dm = phraseIn.match(/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/)!;
    return out(localToUtc(+dm[1], +dm[2], +dm[3], +(dm[4] || 9), +(dm[5] || 0), tz), `date in ${tz}`);
  }
  return null;
}

/** Next occurrence after `from` for a recurrence string produced by resolveTime. */
export function nextOccurrence(recurrence: string, tzIn: string, from = new Date()): Date | null {
  const tz = validTimezone(tzIn);
  if (recurrence === "hourly") return new Date(from.getTime() + 36e5);
  const m = recurrence.match(/^(daily|weekdays|weekly:(\d))@(\d{2}):(\d{2})$/); if (!m) return null;
  const h = +m[3], mi = +m[4]; const L = localParts(tz, from);
  for (let add = 0; add < 9; add++) {
    const base = new Date(Date.UTC(L.y, L.mo - 1, L.d + add));
    const dow = base.getUTCDay();
    if (m[1] === "weekdays" && (dow === 0 || dow === 6)) continue;
    if (m[2] !== undefined && dow !== +m[2]) continue;
    const t = localToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), h, mi, tz);
    if (t.getTime() > from.getTime() + 30_000) return t;
  }
  return null;
}
