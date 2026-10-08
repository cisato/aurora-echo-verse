# Aurora Web Intelligence Layer

## What exists today
- Chat (web) and Telegram both call the AI gateway directly; neither can use tools. The shared rules in `brain.ts` tell Aurora she has **no** live internet.
- `scheduler.ts` + `telegram-checkins` already run once a minute for reminders/follow-ups (`scheduled_messages`). This becomes the base for monitoring.
- `user_settings.timezone` exists (default UTC); Telegram uses it, web chat uses server time without a zone.
- No `external-tools.ts` and no web-search provider are connected.

## Dependency to settle first
Live web **search** needs a search provider. The plan uses the **Firecrawl** connector (search + page reading, key stays on the server). Page fetching, JSON/CSV/XML APIs and time tools work without it. If Firecrawl is not connected, `web_search` returns an honest "search unavailable" error rather than fake results.

## What gets built

### 1. Tool layer (`supabase/functions/_shared/tools/`)
Modular registry; each tool returns the same envelope:
`{ success, status, error_category, data, source, url, retrieved_at, content_type, stale, truncated, metadata }`
- `web_search` (Firecrawl), `web_fetch` (GET + readable-text extraction from HTML, follow links), `http_request` (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS, query, headers, JSON/form/multipart bodies, pagination up to a cap), `parse_data` (JSON path, CSV rows, XML), `calculate` (safe arithmetic on retrieved numbers), `get_current_time` / `resolve_time` (timezone-aware, relative phrases), `schedule_task`, `monitor_url`, `list_monitors` / `stop_monitor`.
- Named-credential support: `http_request` may reference a stored secret by name (e.g. `auth: "SOME_API_KEY"`) from an allowlist; values never reach the model or logs.

### 2. Safe outbound fetch (`safeFetch.ts`)
- https/http only, no credentials in URLs, DNS-resolve and block private/loopback/link-local/metadata ranges (IPv4+IPv6), re-check on every redirect (manual redirects, max 5).
- Timeouts (10s default, 25s max), 2 retries with exponential backoff + jitter on 429/5xx/network only, honours `Retry-After`, 2 MB body cap, per-domain circuit breaker, per-user rate limit (e.g. 60 tool calls / 10 min), concurrency cap of 4.
- Errors classified: `timeout | dns | blocked | http_4xx | http_5xx | rate_limited | too_large | parse | empty | network`.

### 3. Agent loop (`agent.ts`)
- Responses API with function tools (`openai/gpt-6-astra`), up to 6 tool rounds, streamed.
- System prompt gets an authoritative server clock (UTC + user zone + weekday) every turn and rules: use tools for anything current, cite source + retrieval time, label claims as *known / retrieved / calculated*, never present a failed tool as success.
- Wired into web `chat` (streams text back in the existing format, plus a sources block) and `telegram-webhook`.
- `brain.ts` capability notes updated: live web and API access are real now; still no phone calls, no purchases.

### 4. Monitoring + scheduling
- `web_monitors` table: url, selector/json path, frequency (cron-like: hourly/daily at HH:MM/weekly), last hash + extracted value, next_run_at, status, failure count (auto-pause after 5 failures).
- Existing minute-by-minute job also runs due monitors, compares with the previous snapshot, and notifies on Telegram only when something changed.
- Recurring reminders ("every Monday") added to `scheduled_messages` via an `rrule`-style field.

### 5. Storage, retention, logs
- `tool_executions` (tool, method, domain, status, ms, retries, bytes, error category, user) — no headers, bodies or secrets. 30-day cleanup.
- `web_cache` (url hash, extracted text, retrieved_at, expires_at) — 1-hour default TTL, 7-day purge.
- `monitor_snapshots` — keep last 20 per monitor.
- All tables RLS: users read their own rows; only the backend writes.
- Web chat sends the browser's timezone so `user_settings.timezone` is set automatically.

### 6. Tests
Deno tests for the URL guard (private IPs, metadata, redirects to internal), time parsing, envelope/error classification; plus live checks via the deployed function: real page fetch, JSON GET, POST/PUT/DELETE to httpbin, 404/500, timeout (httpbin delay), redirect, 429, large response, CSV/XML parse, bearer-auth endpoint (httpbin `/bearer`), a live search, and a full chat turn on web and Telegram asking a current-events + calculation question. Then a monitor created and run once by the scheduler.

## Out of scope / limitations
- No headless browser (JavaScript-only sites may extract poorly; Firecrawl helps).
- OAuth integrations: architecture supports named credentials; individual OAuth providers are added per service via connectors.
- No phone calls; no payments or purchases on the user's behalf.

Final report will cover all 12 sections you asked for.
