# Aurora Evolution — Sequenced Plan

Executed one phase per turn. You approve each phase before I move to the next. Existing working functionality is preserved unless a step explicitly replaces it.

---

## Phase 1 — UI/UX + Chat Polish  *(starting now)*

**Design system refresh (`src/index.css`, `tailwind.config.ts`)**
- Keep cream-on-forest base; add layered tokens: `--ivory`, `--sage`, `--gold`, `--charcoal`, `--surface-raised`, `--surface-sunken`.
- Softer shadows (`--shadow-paper`, `--shadow-lift`), larger radius scale, generous spacing rhythm.
- Verify light/dark parity — dark theme uses warm charcoal, not pure black.
- Type scale tuned for reading: Fraunces display, Inter Tight body, comfortable line-height.

**Chat surface (`ChatWindow`, `ChatMessage`, `Messages`, `ChatInput`)**
- Assistant text renders directly on canvas (no bubble), user bubbles get refined forest→sage gradient with gold hairline.
- Timestamps become natural ("just now", "2m ago") and appear on hover.
- Message actions: Copy, Edit (user only), Bookmark, Regenerate (assistant only) — icon row on hover.
- Better markdown: refined code blocks with language chip + copy, blockquote styling, list rhythm.
- Loading state: replace three-dot pulse with a single breathing shimmer line ("Aurora is thinking…" removed on stream start).
- Smooth auto-scroll only when user is near bottom.

**Empty state & composer**
- Empty canvas: quiet greeting + 3 contextual suggestion cards (not 6), pulled from time-of-day + recent memories.
- Composer: single rounded surface, mic + send only, subtle focus ring, keyboard shortcuts hint.

**Out of scope this phase:** memory features, security, new AI behaviors.

---

## Phase 2 — Security & Trust Hardening
- Flip `verify_jwt = true` on user-context functions (`chat`, `memory-extract`, `emotion-analyze`, `proactive-insights`, `daily-summary`, `send-report-email`, `multimodal`, `transcribe`). Derive `userId` from `getClaims()`, stop trusting request-body IDs.
- Keep `verify_jwt = false` only for `paystack-webhook` (signature-verified) and `aurora-api` (API-key-verified).
- Reconcile pricing: single source in DB / shared constant, remove hardcoded 9500 vs 4500 drift.
- Audit localStorage: move anything sensitive (voice settings are fine; nothing user-identifying should live there).
- Add rate limits on `chat` and `transcribe`.

## Phase 3 — Human Conversation Engine
- Rewrite `chat` system prompt: contractions, variable rhythm, no repetitive openings, no "I looked that up" meta-talk, honest continuity ("Last time we were exploring…" not "I missed you").
- Emoji intelligence: track user's emoji-per-message ratio in `user_settings`, mirror it. Sensitive topics → restraint enforced in prompt.
- Response shaping: short answers stay short; no forced summaries.

## Phase 4 — Memory Intelligence (Relationship Layer)
- **Memory Confidence & Trust Levels:** each memory gets `confidence` (0-1) and `source` (explicit / inferred / observed). Surface in Memory Dashboard.
- **Memory Repair:** inline "that's not quite right" on any Aurora reference to a memory → opens edit sheet.
- **Private Vault:** locked memories excluded from retrieval unless user unlocks per session.
- **AI Receipts:** when Aurora references a memory, a small "why I remembered this" chip reveals the source memory.
- **Memory Map (light):** Memory Dashboard gets a graph view of related memories (no heavy viz lib; SVG force layout).

## Phase 5 — Companion Growth
- Relationship Timeline (visible history of milestones, not scores).
- Reflection Engine (weekly quiet prompt, opt-in).
- Decision Journal + Contradiction Detector (surfaces gently, never judgmental).
- Silent Pattern Discovery feeds Proactive Insights.

## Phase 6 — Companion Behaviors
- Curiosity Mode, Thinking Styles, Context Lens as sidebar toggles.
- Confidence Meter on answers (subtle).
- AI Undo (session-scoped, 5-minute window).
- Multi-version answers generated in background, revealed via "show another take".

## Phase 7 — Life Spaces
- Extend `conversations` with `space_id`; new `spaces` table with own memory/goals/settings.
- Space switcher in sidebar; memory retrieval scoped per space.

## Phase 8 — Honesty Pass
- Search / Weather / Code pages: either wire real providers (SerpAPI / OpenWeather / sandboxed exec) or replace with honest "coming soon" state. No fabricated results.

---

## Execution rules
- One phase per turn. I ship, you review, you approve next.
- No new duplicate systems — refactor existing files.
- Every change keeps the app running; no half-migrated states left between turns.
- After each phase I run typecheck and a quick Playwright smoke on the affected screens.

**Approve to start Phase 1, or tell me to reorder.**
