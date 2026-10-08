// Turn raw web responses into compact, useful text/data for the model.

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
    if (e[0] === "#") { const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export interface HtmlExtract { title: string; description: string; published?: string; text: string; links: { text: string; url: string }[] }

export function extractHtml(html: string, baseUrl: string): HtmlExtract {
  const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim());
  const meta = (name: string) => html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1]
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i"))?.[1];
  const description = decodeEntities(meta("description") || meta("og:description") || "");
  const published = meta("article:published_time") || meta("date") || html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1];

  let body = html.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|iframe|template|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer|header|aside)[\s\S]*?<\/\1>/gi, " ");
  const main = body.match(/<(main|article)[\s\S]*?<\/\1>/i)?.[0];
  if (main && main.length > 500) body = main;

  const links: { text: string; url: string }[] = [];
  for (const m of body.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    try { const url = new URL(m[1], baseUrl).toString(); if (text && /^https?:/.test(url)) links.push({ text: text.slice(0, 100), url }); } catch { /* skip */ }
    if (links.length >= 60) break;
  }

  const text = decodeEntities(
    body.replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, "\n").replace(/<(li)[^>]*>/gi, "• ")
      .replace(/<\/t[dh]>/gi, " | ").replace(/<[^>]+>/g, " "),
  ).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  return { title, description, published, text, links };
}

export function parseCsv(src: string, maxRows = 200): { headers: string[]; rows: string[][]; totalRows: number } {
  const rows: string[][] = []; let row: string[] = []; let field = ""; let q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; continue; }
    if (c === '"') q = true; else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && src[i + 1] === "\n") i++; row.push(field); field = ""; if (row.some((x) => x !== "")) rows.push(row); row = []; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers = [], ...data] = rows;
  return { headers, rows: data.slice(0, maxRows), totalRows: data.length };
}

/** Minimal XML → JSON (elements, attributes as @attr, text as #text). Good for RSS/Atom/APIs. */
export function parseXml(src: string): unknown {
  const s = src.replace(/<\?[\s\S]*?\?>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_m, t) => t.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  const stack: { name: string; node: Record<string, unknown> }[] = [{ name: "#root", node: {} }];
  const re = /<(\/?)([\w:.-]+)([^>]*?)(\/?)>|([^<]+)/g; let m: RegExpExecArray | null;
  const add = (parent: Record<string, unknown>, k: string, v: unknown) => {
    if (k in parent) { const cur = parent[k]; parent[k] = Array.isArray(cur) ? [...cur, v] : [cur, v]; } else parent[k] = v;
  };
  while ((m = re.exec(s))) {
    if (m[5] !== undefined) { const t = decodeEntities(m[5]).trim(); if (t) { const top = stack[stack.length - 1].node; top["#text"] = ((top["#text"] as string) || "") + t; } continue; }
    const [, close, name, attrs, selfClose] = m;
    if (close) {
      const done = stack.pop()!; const parent = stack[stack.length - 1]?.node; if (!parent) break;
      const keys = Object.keys(done.node); add(parent, done.name, keys.length === 1 && keys[0] === "#text" ? done.node["#text"] : done.node);
      continue;
    }
    const node: Record<string, unknown> = {};
    for (const a of attrs.matchAll(/([\w:.-]+)=["']([^"']*)["']/g)) node[`@${a[1]}`] = decodeEntities(a[2]);
    if (selfClose) add(stack[stack.length - 1].node, name, node); else stack.push({ name, node });
  }
  return stack[0].node;
}

/** Dot/bracket path: "data.items[0].price", "items[*].name". */
export function jsonPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.replace(/^\$\.?/, "").match(/[^.[\]]+|\[(\d+|\*)\]/g) || [];
  let cur: unknown[] = [obj];
  for (const raw of parts) {
    const p = raw.replace(/^\[|\]$/g, ""); const next: unknown[] = [];
    for (const c of cur) {
      if (c == null) continue;
      if (p === "*") { if (Array.isArray(c)) next.push(...c); else if (typeof c === "object") next.push(...Object.values(c as object)); }
      else next.push((c as Record<string, unknown>)[p]);
    }
    cur = next;
  }
  return path.includes("*") ? cur : cur[0];
}

/** Keep the parts of long text most relevant to a focus query, preserving order. */
export function focusText(text: string, focus: string | undefined, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  if (!focus) return { text: text.slice(0, maxChars), truncated: true };
  const terms = focus.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const chunks = text.split(/\n+/).reduce<string[]>((acc, line) => {
    const last = acc[acc.length - 1]; if (last && last.length < 600) acc[acc.length - 1] = `${last}\n${line}`; else acc.push(line); return acc;
  }, []);
  const scored = chunks.map((c, i) => ({ i, c, s: terms.reduce((n, t) => n + (c.toLowerCase().split(t).length - 1), 0) }));
  const picked = new Set<number>([0]); let size = chunks[0]?.length || 0;
  for (const x of [...scored].sort((a, b) => b.s - a.s)) { if (x.s === 0 || size + x.c.length > maxChars) continue; picked.add(x.i); size += x.c.length; }
  return { text: [...picked].sort((a, b) => a - b).map((i) => chunks[i]).join("\n…\n").slice(0, maxChars), truncated: true };
}

/** Safe arithmetic: numbers, + - * / % ^, parentheses, and a few functions. No eval. */
export function calculate(expr: string): number {
  const toks = expr.replace(/,/g, "").match(/\d+\.?\d*(e[+-]?\d+)?|[a-z]+|[-+*/%^()]/gi);
  if (!toks || toks.join("") !== expr.replace(/,/g, "").replace(/\s+/g, "")) throw new Error("Unsupported characters in expression.");
  const FN: Record<string, (x: number) => number> = { abs: Math.abs, sqrt: Math.sqrt, round: Math.round, floor: Math.floor, ceil: Math.ceil, log: Math.log10, ln: Math.log, exp: Math.exp };
  let i = 0;
  const peek = () => toks[i]; const eat = () => toks[i++];
  const primary = (): number => {
    const t = eat();
    if (t === "(") { const v = add(); if (eat() !== ")") throw new Error("Missing )"); return v; }
    if (t === "-") return -primary();
    if (t === "+") return primary();
    if (t && FN[t.toLowerCase()]) { if (eat() !== "(") throw new Error("Expected ("); const v = add(); if (eat() !== ")") throw new Error("Missing )"); return FN[t.toLowerCase()](v); }
    const n = Number(t); if (!Number.isFinite(n)) throw new Error(`Unexpected '${t}'`); return n;
  };
  const pow = (): number => { const b = primary(); if (peek() === "^") { eat(); return b ** pow(); } return b; };
  const mul = (): number => { let v = pow(); while (["*", "/", "%"].includes(peek())) { const o = eat(); const r = pow(); v = o === "*" ? v * r : o === "/" ? v / r : v % r; } return v; };
  const add = (): number => { let v = mul(); while (["+", "-"].includes(peek())) { const o = eat(); const r = mul(); v = o === "+" ? v + r : v - r; } return v; };
  const v = add(); if (i < toks.length) throw new Error(`Unexpected '${toks[i]}'`);
  return v;
}
