// Tool-using research pass. Runs before the conversational reply: the model
// decides which tools to call (up to 6 rounds), we execute them for real, and
// the verified results are handed to the reply as facts with sources.
import { TOOL_DEFS, runTool, type ToolCtx, type Envelope } from "./registry.ts";
import { currentTime } from "./time.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";
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
  const input: Any[] = [...history.slice(-6).map((m: Any) => ({ role: m.role, content: String(m.content) })), { role: "user", content: userText }];
  const tools = TOOL_DEFS.map((t) => ({ type: "function", name: t.name, description: t.description, parameters: t.parameters, strict: false }));
  const log: string[] = []; const sources: ResearchResult["sources"] = [];
  let used = false, summary = "";
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch", "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, stream: true, store: false, reasoning: { effort: "low" }, include: ["reasoning.encrypted_content"],
        instructions: SYSTEM(ctx.tz), input, tools, tool_choice: "auto" }),
    });
    if (!res.ok || !res.body) { console.error("research gateway", res.status, (await res.text()).slice(0, 200)); break; }
    const items: Any[] = []; let text = "", buf = "";
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      buf += value; const lines = buf.split("\n"); buf = lines.pop() ?? "";
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        try { const e = JSON.parse(l.slice(5)); if (e.type === "response.output_text.delta") text += e.delta; else if (e.type === "response.output_item.done") items.push(e.item); } catch { /* */ }
      }
    }
    const calls = items.filter((i) => i.type === "function_call");
    if (!calls.length) { summary = text.trim(); break; }
    used = true;
    input.push(...items.filter((i) => i.type === "reasoning" || i.type === "function_call"));
    const outs = await Promise.all(calls.map(async (c: Any, idx: number) => {
      if (idx >= 4) return { type: "function_call_output", call_id: c.call_id, output: JSON.stringify({ success: false, error: "skipped: max 4 parallel calls" }) };
      let args: Any = {}; try { args = JSON.parse(c.arguments || "{}"); } catch { /* */ }
      const out: Envelope = await runTool(c.name, args, ctx);
      log.push(`${c.name}(${JSON.stringify(args).slice(0, 160)}) → ${out.success ? "OK" : `FAILED [${out.error_category}] ${out.error}`}${out.url ? ` ${out.url}` : ""} @ ${out.retrieved_at}${out.stale ? " (cached)" : ""}${out.truncated ? " (truncated)" : ""}`);
      if (out.success && out.url) sources.push({ title: (out.data as Any)?.title, url: out.url, retrieved_at: out.retrieved_at });
      if (out.success && c.name === "web_search") for (const r of ((out.data as Any[]) || []).slice(0, 3)) sources.push({ title: r.title, url: r.url, retrieved_at: out.retrieved_at });
      return { type: "function_call_output", call_id: c.call_id, output: JSON.stringify(out).slice(0, 12000) };
    }));
    input.push(...outs);
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
