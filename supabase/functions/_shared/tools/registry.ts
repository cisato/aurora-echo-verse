// Aurora tool registry. Every tool returns the same envelope so the model can
// tell retrieved facts from failures. Secrets never enter arguments or logs.
import { safeFetch, type ErrorCategory } from "./safeFetch.ts";
import { extractHtml, parseCsv, parseXml, jsonPath, focusText, calculate } from "./parse.ts";
import { currentTime, resolveTime, nextOccurrence, validTimezone } from "./time.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export interface Envelope {
  success: boolean; status: number | null; error_category: ErrorCategory | null; error?: string;
  data: unknown; source: string | null; url: string | null; retrieved_at: string;
  content_type: string | null; stale: boolean; truncated: boolean; metadata: Record<string, unknown>;
}
export interface ToolCtx { supabase: Any; userId: string; tz: string }

const env = (o: Partial<Envelope>): Envelope => ({
  success: false, status: null, error_category: null, data: null, source: null, url: null,
  retrieved_at: new Date().toISOString(), content_type: null, stale: false, truncated: false, metadata: {}, ...o,
});
const fail = (cat: ErrorCategory, error: string, extra: Partial<Envelope> = {}) => env({ error_category: cat, error, ...extra });
const dec = new TextDecoder();

// Named credentials: the model may reference these by name; values stay server-side.
const CREDENTIAL_ALLOWLIST = (Deno.env.get("AURORA_TOOL_CREDENTIALS") || "").split(",").map((s) => s.trim()).filter(Boolean);

async function sha(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------------------------------------- definitions */
export const TOOL_DEFS = [
  { name: "web_search", description: "Search the live web. Use for anything current, recent, or that you aren't sure of.", parameters: { type: "object", properties: { query: { type: "string" }, limit: { type: "integer" } }, required: ["query"] } },
  { name: "web_fetch", description: "Open a web page or document by URL and return its readable text, title, publish date and links.", parameters: { type: "object", properties: { url: { type: "string" }, focus: { type: "string", description: "Optional words to centre the excerpt on" } }, required: ["url"] } },
  { name: "http_request", description: "Call a public HTTP/JSON API. Supports GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS, query params, headers and JSON or form bodies. Use 'credential' to name a stored key; never put secrets in the URL.", parameters: { type: "object", properties: {
    url: { type: "string" }, method: { type: "string" }, query: { type: "object" }, headers: { type: "object" },
    json: { description: "JSON body" }, form: { type: "object" }, credential: { type: "string" }, json_path: { type: "string" },
    paginate_next_path: { type: "string", description: "JSON path to next-page URL; follows up to 3 pages" } }, required: ["url"] } },
  { name: "parse_data", description: "Parse raw text as json, csv or xml, optionally selecting a JSON path.", parameters: { type: "object", properties: { format: { type: "string", enum: ["json", "csv", "xml"] }, text: { type: "string" }, path: { type: "string" } }, required: ["format", "text"] } },
  { name: "calculate", description: "Exact arithmetic (+-*/^%, parentheses, sqrt, round, min, max...). Use for any maths on retrieved numbers.", parameters: { type: "object", properties: { expression: { type: "string" } }, required: ["expression"] } },
  { name: "get_current_time", description: "Authoritative current date/time in a timezone (defaults to the user's).", parameters: { type: "object", properties: { timezone: { type: "string" } } } },
  { name: "resolve_time", description: "Turn a phrase like 'tomorrow 9am', 'in 2 hours', 'every Monday 8:00' into an exact UTC time in the user's zone.", parameters: { type: "object", properties: { phrase: { type: "string" } }, required: ["phrase"] } },
  { name: "schedule_task", description: "Schedule a real reminder message to the user (one-off or recurring). Only claim it's set if this succeeds.", parameters: { type: "object", properties: { when: { type: "string", description: "Natural phrase, e.g. 'every weekday 7:30' or 'in 20 minutes'" }, text: { type: "string" } }, required: ["when", "text"] } },
  { name: "monitor_url", description: "Watch a page or JSON API and notify the user on Telegram when it changes.", parameters: { type: "object", properties: { label: { type: "string" }, url: { type: "string" }, frequency: { type: "string", enum: ["hourly", "daily", "weekly"] }, json_path: { type: "string" }, watch_text: { type: "string" } }, required: ["label", "url", "frequency"] } },
  { name: "list_monitors", description: "List the user's active web monitors and scheduled reminders.", parameters: { type: "object", properties: {} } },
  { name: "stop_monitor", description: "Stop a web monitor or scheduled reminder by id or by label words.", parameters: { type: "object", properties: { id: { type: "string" }, match: { type: "string" } } } },
];

/* ------------------------------------------------------------ implementations */
async function webSearch(a: Any): Promise<Envelope> {
  const q = String(a.query || "").slice(0, 300); const limit = Math.min(Math.max(Number(a.limit) || 6, 1), 10);
  if (!q) return fail("parse", "Empty query.");
  const fc = Deno.env.get("FIRECRAWL_API_KEY");
  if (fc) {
    const r = await safeFetch({ url: "https://api.firecrawl.dev/v2/search", method: "POST", timeoutMs: 20000,
      headers: { Authorization: `Bearer ${fc}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q, limit }) });
    if (r.ok) {
      try {
        const j = JSON.parse(dec.decode(r.body)); const items = j?.data?.web ?? j?.data ?? [];
        const results = items.slice(0, limit).map((x: Any) => ({ title: x.title, url: x.url, snippet: x.description || x.snippet }));
        if (results.length) return env({ success: true, status: r.status, data: results, source: "firecrawl", url: null, metadata: { query: q } });
      } catch { /* fall through */ }
    }
  }
  // Keyless fallback: DuckDuckGo's HTML endpoint.
  const r = await safeFetch({ url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, timeoutMs: 12000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AuroraBot/1.0)", Accept: "text/html" } });
  if (!r.ok) return fail(r.errorCategory || "unavailable", `Search unavailable: ${r.error || "no response"}`, { status: r.status });
  const html = dec.decode(r.body); const results: Any[] = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();
  while ((m = re.exec(html)) && results.length < limit) {
    let url = m[1]; const u = url.match(/uddg=([^&]+)/); if (u) url = decodeURIComponent(u[1]);
    if (url.startsWith("//")) url = "https:" + url;
    results.push({ title: strip(m[2]), url, snippet: strip(m[3]) });
  }
  if (!results.length) return fail("empty", "Search returned no results (or the provider blocked the request).", { status: r.status });
  return env({ success: true, status: r.status, data: results, source: "duckduckgo", metadata: { query: q } });
}

async function webFetch(a: Any, ctx: ToolCtx): Promise<Envelope> {
  const url = String(a.url || "");
  const key = await sha(url);
  const { data: cached } = await ctx.supabase.from("web_cache").select("content, content_type, retrieved_at, expires_at").eq("url_hash", key).maybeSingle();
  let content: string, ctype: string, retrieved: string, status: number | null = 200, truncated = false, finalUrl = url, fromCache = false;
  if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
    content = cached.content; ctype = cached.content_type || ""; retrieved = cached.retrieved_at; fromCache = true;
  } else {
    const r = await safeFetch({ url, headers: { Accept: "text/html,application/json,text/plain,*/*;q=0.5" } });
    if (!r.ok) return fail(r.errorCategory || "network", r.error || "Fetch failed", { status: r.status, url });
    ctype = r.contentType; status = r.status; truncated = r.truncated; finalUrl = r.url; retrieved = new Date().toISOString();
    content = dec.decode(r.body);
    if (!content.trim()) return fail("empty", "The page was empty.", { status, url: finalUrl });
    await ctx.supabase.from("web_cache").upsert({ url_hash: key, url: finalUrl, content_type: ctype, content: content.slice(0, 1_500_000), retrieved_at: retrieved, expires_at: new Date(Date.now() + 3600e3).toISOString() });
  }
  let data: unknown;
  if (/json/i.test(ctype)) { try { const j = JSON.parse(content); data = { json: focusText(JSON.stringify(j), a.focus, 8000).text }; } catch { data = { text: content.slice(0, 8000) }; } }
  else if (/html/i.test(ctype) || /^\s*</.test(content)) {
    const x = extractHtml(content, finalUrl); const f = focusText(x.text, a.focus, 8000); truncated ||= f.truncated;
    data = { title: x.title, description: x.description, published: x.published, text: f.text, links: x.links.slice(0, 25) };
  } else { const f = focusText(content, a.focus, 8000); truncated ||= f.truncated; data = { text: f.text }; }
  return env({ success: true, status, data, source: new URL(finalUrl).hostname, url: finalUrl, retrieved_at: retrieved!, content_type: ctype, stale: fromCache, truncated });
}

async function httpRequest(a: Any): Promise<Envelope> {
  let u: URL; try { u = new URL(String(a.url)); } catch { return fail("invalid_url", "Not a valid URL."); }
  for (const [k, v] of Object.entries(a.query || {})) u.searchParams.set(k, String(v));
  const method = String(a.method || "GET").toUpperCase();
  if (!["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(method)) return fail("parse", `Unsupported method ${method}.`);
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(a.headers || {})) if (!/^(host|cookie|authorization)$/i.test(k)) headers[k] = String(v);
  if (a.credential) {
    const name = String(a.credential);
    if (!CREDENTIAL_ALLOWLIST.includes(name)) return fail("blocked", `Credential "${name}" is not configured for tool use.`);
    const val = Deno.env.get(name); if (!val) return fail("unavailable", `Credential "${name}" has no value.`);
    headers["Authorization"] = `Bearer ${val}`;
  }
  let body: BodyInit | undefined;
  if (a.json !== undefined) { body = JSON.stringify(a.json); headers["Content-Type"] = "application/json"; }
  else if (a.form) { body = new URLSearchParams(Object.entries(a.form).map(([k, v]) => [k, String(v)])); }
  const pages: unknown[] = []; let next: string | null = u.toString(); let last: Any = null;
  for (let i = 0; next && i < (a.paginate_next_path ? 3 : 1); i++) {
    const r = await safeFetch({ url: next, method, headers, body });
    last = r;
    if (!r.ok) return fail(r.errorCategory || "network", r.error || "Request failed", { status: r.status, url: r.url, data: dec.decode(r.body).slice(0, 1500) || null });
    const text = dec.decode(r.body); let parsed: unknown = text;
    if (/json/i.test(r.contentType)) { try { parsed = JSON.parse(text); } catch { /* keep text */ } }
    pages.push(a.json_path && typeof parsed === "object" ? jsonPath(parsed, a.json_path) : parsed);
    next = a.paginate_next_path && typeof parsed === "object" ? (jsonPath(parsed, a.paginate_next_path) as string) || null : null;
  }
  let data: unknown = pages.length === 1 ? pages[0] : pages;
  let s = typeof data === "string" ? data : JSON.stringify(data); let truncated = !!last?.truncated;
  if (s.length > 10000) { s = s.slice(0, 10000); truncated = true; data = s; }
  return env({ success: true, status: last.status, data, source: u.hostname, url: last.url, content_type: last.contentType, truncated, metadata: { method, pages: pages.length, retries: last.retries } });
}

function parseData(a: Any): Envelope {
  try {
    const t = String(a.text || "");
    let out: unknown = a.format === "csv" ? parseCsv(t) : a.format === "xml" ? parseXml(t) : JSON.parse(t);
    if (a.path) out = jsonPath(out, a.path);
    return env({ success: true, data: out, source: "parser" });
  } catch (e) { return fail("parse", `Could not parse ${a.format}: ${(e as Error).message}`); }
}

async function scheduleTask(a: Any, ctx: ToolCtx): Promise<Envelope> {
  const r = resolveTime(String(a.when || ""), ctx.tz);
  if (!r) return fail("parse", `Couldn't work out a time from "${a.when}". Ask them for a clearer time.`);
  if (Date.parse(r.utc) < Date.now() - 60e3) return fail("parse", "That time is in the past.");
  const { data, error } = await ctx.supabase.from("scheduled_messages").insert({
    user_id: ctx.userId, kind: "reminder", send_at: r.utc, body: String(a.text).slice(0, 300), recurrence: r.recurrence ?? null,
  }).select("id").single();
  if (error) return fail("unavailable", `Saving the reminder failed: ${error.message}`);
  return env({ success: true, data: { id: data.id, local: r.local, recurrence: r.recurrence ?? null, interpretation: r.interpretation, delivery: "Telegram message" }, source: "aurora-scheduler" });
}

function firstRun(freq: string): string {
  const h = freq === "hourly" ? 1 : freq === "weekly" ? 168 : 24;
  return new Date(Date.now() + Math.min(h, 1) * 60e3).toISOString(); // first check within a minute to set baseline
}

async function monitorUrl(a: Any, ctx: ToolCtx): Promise<Envelope> {
  const { count } = await ctx.supabase.from("web_monitors").select("id", { count: "exact", head: true }).eq("user_id", ctx.userId).eq("status", "active");
  if ((count ?? 0) >= 10) return fail("rate_limited", "They already have 10 active monitors; stop one first.");
  const freq = ["hourly", "daily", "weekly"].includes(a.frequency) ? a.frequency : "daily";
  const { data, error } = await ctx.supabase.from("web_monitors").insert({
    user_id: ctx.userId, label: String(a.label).slice(0, 120), url: String(a.url), frequency: freq,
    json_path: a.json_path || null, watch_text: a.watch_text || null, next_run_at: firstRun(freq), status: "active",
  }).select("id").single();
  if (error) return fail("unavailable", `Creating the monitor failed: ${error.message}`);
  return env({ success: true, data: { id: data.id, frequency: freq, notify: "Telegram, only when something changes" }, source: "aurora-monitor" });
}

async function listMonitors(ctx: ToolCtx): Promise<Envelope> {
  const [{ data: mons }, { data: rem }] = await Promise.all([
    ctx.supabase.from("web_monitors").select("id,label,url,frequency,status,last_value,last_checked_at").eq("user_id", ctx.userId).neq("status", "stopped").limit(20),
    ctx.supabase.from("scheduled_messages").select("id,body,send_at,recurrence").eq("user_id", ctx.userId).eq("status", "pending").eq("kind", "reminder").order("send_at").limit(20),
  ]);
  return env({ success: true, data: { monitors: mons ?? [], reminders: rem ?? [] }, source: "aurora" });
}

async function stopMonitor(a: Any, ctx: ToolCtx): Promise<Envelope> {
  const stopped: string[] = [];
  const m = a.match ? String(a.match) : null;
  const q1 = ctx.supabase.from("web_monitors").update({ status: "stopped" }).eq("user_id", ctx.userId).neq("status", "stopped");
  const { data: a1 } = await (a.id ? q1.eq("id", a.id) : m ? q1.ilike("label", `%${m}%`) : q1.eq("id", "00000000-0000-0000-0000-000000000000")).select("label");
  (a1 ?? []).forEach((r: Any) => stopped.push(`monitor: ${r.label}`));
  const q2 = ctx.supabase.from("scheduled_messages").update({ status: "cancelled" }).eq("user_id", ctx.userId).eq("status", "pending");
  const { data: a2 } = await (a.id ? q2.eq("id", a.id) : m ? q2.ilike("body", `%${m}%`) : q2.eq("id", "00000000-0000-0000-0000-000000000000")).select("body");
  (a2 ?? []).forEach((r: Any) => stopped.push(`reminder: ${r.body}`));
  if (!stopped.length) return fail("empty", "Nothing matched, so nothing was stopped.");
  return env({ success: true, data: { stopped }, source: "aurora" });
}

/* ------------------------------------------------------------ dispatcher */
const recent = new Map<string, number[]>();
function rateOk(userId: string) {
  const now = Date.now(); const arr = (recent.get(userId) || []).filter((t) => now - t < 600e3);
  if (arr.length >= 60) return false; arr.push(now); recent.set(userId, arr); return true;
}

export async function runTool(name: string, args: Any, ctx: ToolCtx): Promise<Envelope> {
  const started = Date.now(); let out: Envelope;
  if (!rateOk(ctx.userId)) out = fail("rate_limited", "Too many tool calls in the last 10 minutes.");
  else {
    try {
      switch (name) {
        case "web_search": out = await webSearch(args); break;
        case "web_fetch": out = await webFetch(args, ctx); break;
        case "http_request": out = await httpRequest(args); break;
        case "parse_data": out = parseData(args); break;
        case "calculate": try { out = env({ success: true, data: { result: calculate(String(args.expression)) }, source: "calculator" }); } catch (e) { out = fail("parse", (e as Error).message); } break;
        case "get_current_time": out = env({ success: true, data: currentTime(validTimezone(args.timezone || ctx.tz)), source: "server-clock" }); break;
        case "resolve_time": { const r = resolveTime(String(args.phrase || ""), ctx.tz); out = r ? env({ success: true, data: r, source: "server-clock" }) : fail("parse", "Couldn't interpret that time."); break; }
        case "schedule_task": out = await scheduleTask(args, ctx); break;
        case "monitor_url": out = await monitorUrl(args, ctx); break;
        case "list_monitors": out = await listMonitors(ctx); break;
        case "stop_monitor": out = await stopMonitor(args, ctx); break;
        default: out = fail("parse", `Unknown tool ${name}.`);
      }
    } catch (e) { out = fail("network", `Tool crashed: ${(e as Error).message}`.slice(0, 200)); }
  }
  let domain: string | null = null; try { if (args?.url) domain = new URL(args.url).hostname; } catch { /* */ }
  ctx.supabase.from("tool_executions").insert({
    user_id: ctx.userId, tool: name, method: args?.method ?? null, domain, http_status: out.status,
    success: out.success, error_category: out.error_category, duration_ms: Date.now() - started,
    retries: Number((out.metadata as Any)?.retries) || 0, bytes: JSON.stringify(out.data ?? "").length,
  }).then(() => {}, () => {});
  return out;
}

export { nextOccurrence };
