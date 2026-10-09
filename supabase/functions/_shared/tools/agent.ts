// Tool-using research pass. Runs before the conversational reply: the model
// decides which tools to call (up to 6 rounds), we execute them for real, and
// the verified results are handed to the reply as facts with sources.
import { TOOL_DEFS, runTool, type ToolCtx, type Envelope } from "./registry.ts";
import { currentTime } from "./time.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const MAX_ROUNDS = 6;

export function clockBlock(tz: string): string {
  const t = currentTime(tz) as Any;
  return `**Authoritative clock (server, trust this over anything else)**\nUTC now: ${new Date().toISOString()}\nUser timezone: ${tz}\nUser local time: ${t.local ?? t.formatted ?? JSON.stringify(t)}`;
}

const SYSTEM = (tz: string) => `You are the research step for Aurora, a companion assistant. Decide whether the user's latest message needs live data, an external API, maths, the current time, a scheduled reminder, or a web monitor. If it does, call the tools. If it's ordinary conversation, call no tools and reply exactly NONE.
Rules:
- Anything current (news, prices, weather, scores, exchange rates, "latest", "today", releases, people's current roles) → web_search, then web_fetch the 1-2 best sources if snippets aren't enough.
- A URL in the message → web_fetch it (or http_request if it's an API).
- Maths on numbers → calculate. Never do arithmetic in your head.
- "Remind me…" / recurring reminders → schedule_task. "Tell me when X changes" → monitor_url. "What am I watching / cancel that" → list_monitors / stop_monitor.
- Retry once with a different query or source if a tool fails; don't loop.
- When done, reply with a short plain summary of what was found, with source URLs. No chit-chat.
${clockBlock(tz)}`;

export interface ResearchResult { notes: string; sources: { title?: string; url: string; retrieved_at: string }[]; used: boolean }

export async function research(history: Any[], userText: string, ctx: ToolCtx): Promise<ResearchResult> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  const empty = { notes: "", sources: [], used: false };
  if (!key || !userText.trim()) return empty;
  const msgs: Any[] = [{ role: "system", content: SYSTEM(ctx.tz) }, ...history.slice(-6), { role: "user", content: userText }];
  const log: string[] = []; const sources: ResearchResult["sources"] = [];
  let used = false, summary = "";
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await fetch(GATEWAY, {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: msgs, tools: TOOL_DEFS.map((t) => ({ type: "function", function: t })), tool_choice: "auto", temperature: 0.1 }),
    });
    if (!res.ok) { console.error("research gateway", res.status, (await res.text()).slice(0, 200)); break; }
    const j = await res.json(); const msg = j?.choices?.[0]?.message;
    if (!msg) break;
    const calls = msg.tool_calls || [];
    if (!calls.length) { summary = String(msg.content || "").trim(); break; }
    used = true;
    msgs.push({ role: "assistant", content: msg.content ?? "", tool_calls: calls });
    const outs = await Promise.all(calls.slice(0, 4).map(async (c: Any) => {
      let args: Any = {}; try { args = JSON.parse(c.function?.arguments || "{}"); } catch { /* */ }
      const out: Envelope = await runTool(c.function?.name, args, ctx);
      log.push(`${c.function?.name}(${JSON.stringify(args).slice(0, 160)}) → ${out.success ? "OK" : `FAILED [${out.error_category}] ${out.error}`}${out.url ? ` ${out.url}` : ""} @ ${out.retrieved_at}${out.stale ? " (cached)" : ""}${out.truncated ? " (truncated)" : ""}`);
      if (out.success && out.url) sources.push({ title: (out.data as Any)?.title, url: out.url, retrieved_at: out.retrieved_at });
      if (out.success && c.function?.name === "web_search") for (const r of ((out.data as Any[]) || []).slice(0, 3)) sources.push({ title: r.title, url: r.url, retrieved_at: out.retrieved_at });
      return { role: "tool", tool_call_id: c.id, content: JSON.stringify(out).slice(0, 12000) };
    }));
    // Any calls past the concurrency cap get an explicit refusal so the transcript stays valid.
    for (const c of calls.slice(4)) outs.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify({ success: false, error: "skipped: max 4 parallel calls" }) });
    msgs.push(...outs);
  }
  if (!used || /^NONE\.?$/i.test(summary)) return empty;
  const notes = `LIVE TOOLS: these tools really ran this turn. Base current facts ONLY on the successful results below; for failures say plainly what couldn't be retrieved. Cite the source site and say when it was retrieved for anything time-sensitive. Label things as retrieved, calculated, or from your own knowledge.
Tool log:
${log.join("\n")}
Findings:
${summary || "(no summary — use the tool log)"}`;
  return { notes, sources: dedupe(sources).slice(0, 5), used };
}

function dedupe<T extends { url: string }>(a: T[]): T[] { const s = new Set<string>(); return a.filter((x) => !s.has(x.url) && s.add(x.url)); }
