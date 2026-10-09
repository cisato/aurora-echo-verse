// Runs due web monitors: fetch, extract, compare with the last snapshot,
// notify on Telegram only when something actually changed.
import { safeFetch } from "./safeFetch.ts";
import { extractHtml, jsonPath } from "./parse.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
const STEP: Record<string, number> = { hourly: 3600e3, daily: 86400e3, weekly: 7 * 86400e3 };

async function sha(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function runDueMonitors(supabase: Any, notify: (userId: string, text: string) => Promise<boolean>) {
  const { data: due } = await supabase.from("web_monitors").select("*")
    .eq("status", "active").lte("next_run_at", new Date().toISOString()).order("next_run_at").limit(10);
  let checked = 0, changed = 0;
  for (const m of (due ?? []) as Any[]) {
    const next = new Date(Date.now() + (STEP[m.frequency] ?? STEP.daily)).toISOString();
    // Claim: push next_run_at forward first so overlapping runs skip it.
    const { data: claimed } = await supabase.from("web_monitors").update({ next_run_at: next })
      .eq("id", m.id).eq("next_run_at", m.next_run_at).select("id");
    if (!claimed?.length) continue;
    checked++;
    const r = await safeFetch({ url: m.url });
    const now = new Date().toISOString();
    if (!r.ok) {
      const fc = (m.failure_count ?? 0) + 1;
      await supabase.from("web_monitors").update({ failure_count: fc, last_checked_at: now, status: fc >= 5 ? "paused" : "active" }).eq("id", m.id);
      await supabase.from("monitor_snapshots").insert({ monitor_id: m.id, user_id: m.user_id, changed: false, http_status: r.status, error: r.error?.slice(0, 300) });
      if (fc === 5) await notify(m.user_id, `I've paused watching "${m.label}" — it failed 5 checks in a row (${r.error ?? "no response"}).`);
      continue;
    }
    const raw = new TextDecoder().decode(r.body);
    let value: string;
    if (m.json_path) { try { value = JSON.stringify(jsonPath(JSON.parse(raw), m.json_path)); } catch { value = raw.slice(0, 2000); } }
    else if (/html/i.test(r.contentType) || /^\s*</.test(raw)) value = extractHtml(raw, r.url).text;
    else value = raw;
    if (m.watch_text) {
      const present = value.toLowerCase().includes(String(m.watch_text).toLowerCase());
      value = present ? `"${m.watch_text}" is present` : `"${m.watch_text}" is absent`;
    }
    value = value.slice(0, 20000);
    const hash = await sha(value);
    const isChange = !!m.last_hash && m.last_hash !== hash;
    await supabase.from("web_monitors").update({ last_hash: hash, last_value: value.slice(0, 1000), last_checked_at: now, failure_count: 0 }).eq("id", m.id);
    await supabase.from("monitor_snapshots").insert({ monitor_id: m.id, user_id: m.user_id, value: value.slice(0, 2000), content_hash: hash, changed: isChange, http_status: r.status });
    if (isChange) {
      changed++;
      const before = String(m.last_value ?? "").slice(0, 200); const after = value.slice(0, 300);
      await notify(m.user_id, `Change spotted on "${m.label}" (${new URL(r.url).hostname}, checked ${now.slice(0, 16).replace("T", " ")} UTC).\n${m.json_path || m.watch_text ? `Before: ${before}\nNow: ${after}` : "The page content changed."}\n${m.url}`);
    }
  }
  return { checked, changed };
}
