// Guarded outbound HTTP for every Aurora tool. Blocks SSRF targets, re-checks
// each redirect hop, enforces timeouts / size caps / retries, classifies errors.

export type ErrorCategory =
  | "timeout" | "dns" | "blocked" | "invalid_url" | "http_4xx" | "http_5xx"
  | "rate_limited" | "too_large" | "parse" | "empty" | "network" | "circuit_open" | "unavailable";

export interface FetchOutcome {
  ok: boolean;
  status: number | null;
  url: string;            // final URL after redirects
  headers: Record<string, string>;
  contentType: string;
  body: Uint8Array;
  truncated: boolean;
  retries: number;
  redirects: number;
  durationMs: number;
  errorCategory?: ErrorCategory;
  error?: string;
}

export const LIMITS = { maxBytes: 2_000_000, defaultTimeout: 10_000, maxTimeout: 25_000, maxRedirects: 5, maxRetries: 2 };

/* ------------------------------------------------------------ address guard */

function ipv4ToInt(ip: string): number | null {
  const p = ip.split(".");
  if (p.length !== 4) return null;
  let n = 0;
  for (const s of p) {
    if (!/^\d{1,3}$/.test(s)) return null;
    const v = Number(s); if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}
const V4_BLOCKS: [string, number][] = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
];
export function isBlockedIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip); if (n === null) return true;
  return V4_BLOCKS.some(([base, bits]) => {
    const b = ipv4ToInt(base)!; const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return ((n & mask) >>> 0) === ((b & mask) >>> 0);
  });
}
export function isBlockedIPv6(ip: string): boolean {
  const a = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (a === "::" || a === "::1") return true;
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); if (mapped) return isBlockedIPv4(mapped[1]);
  return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(a) || a.startsWith("64:ff9b:") || a.startsWith("2001:db8");
}
const BLOCKED_HOSTS = /(^|\.)(localhost|local|internal|intranet|lan|home|corp|metadata\.google\.internal)$/i;

export async function checkUrl(raw: string): Promise<{ ok: true; url: URL } | { ok: false; category: ErrorCategory; error: string }> {
  let u: URL;
  try { u = new URL(raw); } catch { return { ok: false, category: "invalid_url", error: "Not a valid URL." }; }
  if (!["http:", "https:"].includes(u.protocol)) return { ok: false, category: "invalid_url", error: "Only http and https URLs are allowed." };
  if (u.username || u.password) return { ok: false, category: "blocked", error: "Credentials in URLs are not allowed." };
  if (u.port && !["80", "443", "8080", "8443"].includes(u.port)) return { ok: false, category: "blocked", error: "Non-standard port blocked." };
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.test(host)) return { ok: false, category: "blocked", error: "Internal hostnames are blocked." };
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return isBlockedIPv4(host) ? { ok: false, category: "blocked", error: "Private or reserved address blocked." } : { ok: true, url: u };
  }
  if (host.includes(":")) return isBlockedIPv6(host) ? { ok: false, category: "blocked", error: "Private or reserved address blocked." } : { ok: true, url: u };
  if (/^\d+$/.test(host) || /^0x/i.test(host)) return { ok: false, category: "blocked", error: "Numeric host encodings are blocked." };
  // Resolve and check every address the name points to.
  const addrs: string[] = [];
  for (const t of ["A", "AAAA"] as const) {
    try { addrs.push(...(await Deno.resolveDns(host, t))); } catch { /* none of this type */ }
  }
  if (!addrs.length) return { ok: false, category: "dns", error: `Could not resolve ${host}.` };
  if (addrs.some((a) => (a.includes(":") ? isBlockedIPv6(a) : isBlockedIPv4(a)))) {
    return { ok: false, category: "blocked", error: `${host} resolves to a private or reserved address.` };
  }
  return { ok: true, url: u };
}

/* ------------------------------------------------- circuit breaker + limits */

const breaker = new Map<string, { fails: number; openUntil: number }>();
function breakerOpen(host: string) { const b = breaker.get(host); return !!b && b.openUntil > Date.now(); }
function recordResult(host: string, failed: boolean) {
  const b = breaker.get(host) ?? { fails: 0, openUntil: 0 };
  if (!failed) { breaker.delete(host); return; }
  b.fails++; if (b.fails >= 4) { b.openUntil = Date.now() + 60_000; b.fails = 0; }
  breaker.set(host, b);
}
let inFlight = 0; const waiters: (() => void)[] = [];
async function acquire() { if (inFlight < 4) { inFlight++; return; } await new Promise<void>((r) => waiters.push(r)); inFlight++; }
function release() { inFlight--; waiters.shift()?.(); }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------------------------------------------- fetch */

export interface SafeRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  timeoutMs?: number;
  maxBytes?: number;
  retry?: boolean;
  signal?: AbortSignal;
}

async function readCapped(res: Response, max: number): Promise<{ body: Uint8Array; truncated: boolean }> {
  if (!res.body) return { body: new Uint8Array(), truncated: false };
  const reader = res.body.getReader(); const chunks: Uint8Array[] = []; let size = 0, truncated = false;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    if (size + value.length > max) { chunks.push(value.slice(0, max - size)); size = max; truncated = true; await reader.cancel(); break; }
    chunks.push(value); size += value.length;
  }
  const out = new Uint8Array(size); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
  return { body: out, truncated };
}

export async function safeFetch(req: SafeRequest): Promise<FetchOutcome> {
  const started = Date.now();
  const method = (req.method || "GET").toUpperCase();
  const timeout = Math.min(req.timeoutMs ?? LIMITS.defaultTimeout, LIMITS.maxTimeout);
  const maxBytes = Math.min(req.maxBytes ?? LIMITS.maxBytes, LIMITS.maxBytes);
  const idempotent = ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"].includes(method);
  const base = (over: Partial<FetchOutcome>): FetchOutcome => ({
    ok: false, status: null, url: req.url, headers: {}, contentType: "", body: new Uint8Array(),
    truncated: false, retries: 0, redirects: 0, durationMs: Date.now() - started, ...over,
  });

  let current = req.url; let redirects = 0; let retries = 0;
  let curMethod = method; let curBody = req.body ?? null;

  await acquire();
  try {
    for (;;) {
      const chk = await checkUrl(current);
      if (!chk.ok) return base({ url: current, errorCategory: chk.category, error: chk.error, redirects, retries });
      const host = chk.url.hostname;
      if (breakerOpen(host)) return base({ url: current, errorCategory: "circuit_open", error: `${host} has been failing; pausing requests for a minute.` });

      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort("timeout"), timeout);
      req.signal?.addEventListener("abort", () => ctl.abort("cancelled"));
      let res: Response;
      try {
        res = await fetch(chk.url, {
          method: curMethod, redirect: "manual", signal: ctl.signal,
          headers: { "User-Agent": "AuroraBot/1.0 (+assistant web retrieval)", Accept: "*/*", ...(req.headers || {}) },
          body: ["GET", "HEAD"].includes(curMethod) ? undefined : curBody,
        });
      } catch (e) {
        clearTimeout(timer);
        const timedOut = ctl.signal.aborted && ctl.signal.reason === "timeout";
        recordResult(host, true);
        if ((req.retry ?? true) && idempotent && retries < LIMITS.maxRetries && !req.signal?.aborted) {
          retries++; await sleep(400 * 2 ** retries + Math.random() * 250); continue;
        }
        return base({ url: current, errorCategory: timedOut ? "timeout" : "network", error: timedOut ? `No response within ${timeout / 1000}s.` : `Network error: ${(e as Error).message}`.slice(0, 200), retries, redirects });
      }
      clearTimeout(timer);

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        await res.body?.cancel();
        const loc = res.headers.get("location");
        if (!loc || redirects >= LIMITS.maxRedirects) return base({ url: current, status: res.status, errorCategory: "http_4xx", error: "Too many redirects or missing Location.", redirects });
        current = new URL(loc, current).toString(); redirects++;
        if (res.status === 303 || ((res.status === 301 || res.status === 302) && curMethod === "POST")) { curMethod = "GET"; curBody = null; }
        continue;
      }

      if ((res.status === 429 || res.status >= 500) && (req.retry ?? true) && idempotent && retries < LIMITS.maxRetries) {
        const ra = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 8000) : 500 * 2 ** retries + Math.random() * 300;
        await res.body?.cancel(); retries++; recordResult(host, res.status >= 500);
        await sleep(wait); continue;
      }

      const { body, truncated } = curMethod === "HEAD" ? { body: new Uint8Array(), truncated: false } : await readCapped(res, maxBytes);
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { if (!/^(set-cookie|authorization)$/i.test(k)) headers[k] = v; });
      recordResult(host, res.status >= 500);
      const cat: ErrorCategory | undefined = res.status === 429 ? "rate_limited" : res.status >= 500 ? "http_5xx" : res.status >= 400 ? "http_4xx" : undefined;
      return {
        ok: res.ok, status: res.status, url: current, headers, contentType: res.headers.get("content-type") || "",
        body, truncated, retries, redirects, durationMs: Date.now() - started,
        errorCategory: cat, error: cat ? `HTTP ${res.status} ${res.statusText}`.trim() : undefined,
      };
    }
  } finally { release(); }
}
