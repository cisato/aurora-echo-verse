# Aurora — "Real-Time Human Companion" Plan

## 1. Competitor Audit → What to Steal, What to Avoid


| Competitor                  | Their pros (steal, improve)                               | Their mistakes (avoid)                                                                             |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **ChatGPT**                 | Best general reasoning, voice mode, memory toggle, canvas | Sterile/corporate tone, memory feels shallow, no proactive reach-out, no emotional continuity      |
| **Claude**                  | Long context, thoughtful writing, projects                | No voice, no persistent identity, no proactivity, no mobile-native feel                            |
| **Pi (Inflection)**         | Warm voice, conversational pacing, empathy                | Weak memory, no tools, no utility beyond chat, shut down — proves "vibes only" fails               |
| **Character.ai**            | Persona depth, addictive engagement, fandom               | Roleplay drift, hallucinated facts, weak safety, teen-safety scandals                              |
| **Replika**                 | Daily ritual, relationship arc, customization             | Paywalled intimacy backlash, uncanny avatars, romantic-only positioning, ToS reversals broke trust |
| **Grok / Gemini / Copilot** | Real-time web, multimodal, Google/MS integration          | No personality, no memory of *you*, feel like search bars with a voice                             |
| **Friend.com / Tab AI**     | Always-listening ambient hardware                         | Privacy panic, no clear utility, no UI for review                                                  |


**Synthesis — Aurora's wedge:** *the only AI that remembers who you are, reaches out first, speaks like a friend, and stays useful as a tool* — without sliding into roleplay drift, paywalled affection, or always-on surveillance.

---

## 2. Why the Current Build Blocks That Vision

1. **Not real-time** — chat is request/response. No streaming voice conversation, no "Aurora speaks first," no presence indicator.
2. **Voice ceiling** — browser TTS is robotic; nothing close to Pi/ChatGPT voice mode.
3. **Memory is invisible** — users can't *see* Aurora remembering, so it feels like every other chatbot on turn one.
4. **No proactivity that reaches the user** — `proactive-insights` only shows in-app; no push, no email, no scheduled check-in.
5. **No identity continuity** — no avatar, no consistent voice, no rituals (morning brief, evening reflection).
6. **No mobile / install / notifications** — companion apps die without daily re-entry.
7. **No landing/pricing/onboarding** — gated dashboard, no "aha", no upgrade path (Paystack still pending).
8. **Placeholder pages** (Search/Weather/Code/Web) signal "demo".
9. **Trust gaps** — no visible privacy/memory controls, no export, no "forget this" button → blocks the deep-disclosure loop competitors got burned on.
10. **No safety rails** — needs crisis-detection + handoff (suicide/self-harm/abuse keywords → resources), or it'll hit the same headlines that hurt Replika/Character.ai.

---

## 3. What Makes Aurora Ahead of Its Time

Five pillars, each pulling from a competitor's strength and patching their weakness:

### A. Real-Time Voice Presence (beats Pi + ChatGPT voice)

- **Live voice mode**: full-duplex, interruptible, low-latency using OpenAI Realtime API or Gemini Live (via edge function). User taps a single "Talk" orb on Chat → Aurora is *present*, like a phone call.
- **Natural barge-in + VAD** (voice activity detection) so user can interrupt mid-sentence.
- **Emotional TTS** via ElevenLabs (already partially wired) — tier-gated: free = browser TTS, Pro = ElevenLabs.
- **Idle ambient sound** ("Aurora is here" subtle indicator).

### B. Visible, Editable Memory (beats ChatGPT memory)

- New `/memory` page upgrade: timeline of facts Aurora has learned, with **source message links**, confidence, and one-click "Edit", "Forget", "Pin as core".
- "Aurora's view of me" card on dashboard: top 5 facts she'd describe you with → builds trust + the "wow she really knows me" moment.
- Per-fact privacy: mark as "sensitive" → encrypted at rest, never sent to logs.

### C. Proactive Outreach (beats every competitor — none truly reaches out)

- **Scheduled rituals**: morning brief, midday nudge, evening reflection — user picks times.
- **Smart triggers** via the existing `daily-summary` + `proactive-insights` functions, surfaced through:
  - **Web push** (PWA Notification API)
  - **Email digests** via Resend (already configured)
  - **In-app "Aurora wants to talk"** banner with the actual opener message
- **Re-engagement intelligence**: if user is silent 3 days, Aurora sends a contextual check-in based on the last unresolved thread — not a generic "we miss you".

### D. Companion OS — Utility + Heart (beats Pi/Replika "vibes only")

- Keep utility surfaces (Reports, Multimodal, API) but reframe each as *something Aurora does for you*, not separate tools.
- "Aurora can…" command palette (⌘K): "summarize my week", "remind me to call mom", "draft a reply to this email" → routes to the right subsystem.
- **Real-time web** via tool calls in chat (no separate Search page) — fixes the "Search page is empty" problem and matches Grok/Gemini.

### E. Trust & Safety Layer (beats Replika/Character.ai scandals)

- **Crisis safety**: keyword + classifier on user input → empathic response + region-aware hotline + opt-in human-help mode. Never roleplay around self-harm.
- **Age + consent gate** on signup; no romantic/NSFW mode at all (deliberate differentiation).
- **Transparency dashboard**: what Aurora remembers, what she shares with model, full export (JSON), full delete.
- **Stable promises**: no paywall on emotional features ever; paywall is on *capacity, voice quality, and tools* — published as a written commitment in `/about/trust`.

---

## 4. Build Plan (Sequenced)

### Phase 1 — Foundation (revenue + survival)

1. **Paystack integration** (BYOK secret + `subscriptions` table + initialize/verify/webhook edge functions + `/pricing` + `/billing`). Tier-gates Pro features (voice, ElevenLabs, push, capacity).
2. **Landing page** at `/` (unauth) + move dashboard to `/app`. Hero: "The AI that actually knows you." + companion-mode showcase + pricing.
3. **Onboarding modal** on first login: pick mode → one fact about you → first memory seeded → tailored greeting.
4. **Mobile + PWA**: responsive pass on Dashboard/Chat/Sidebar; manifest + service worker; installable.

### Phase 2 — Differentiation Pillars

5. **Real-time voice mode**: edge function bridging OpenAI Realtime (requires user `OPENAI_REALTIME_API_KEY` or use Lovable Gateway equivalent if available); WebRTC client; "Talk to Aurora" orb in Chat.
6. **ElevenLabs Pro voice** (gated by subscription).
7. **Memory visibility upgrade**: rebuild `/memory` with timeline, edit/forget/pin, "Aurora's view of you" dashboard card.
8. **Proactive outreach**:
  - Web push subscription + storage
  - Resend email digest opt-in (Settings)
  - Cron edge function (Supabase pg_cron) hitting `daily-summary` + push/email dispatch
  - "Aurora wants to talk" in-app banner with real opener

### Phase 3 — Companion OS + Safety

9. **Command palette (⌘K)** routing to subsystems via natural language.
10. **Real-time web tool** inside chat (replaces empty `/search`, `/web`); remove or hide `/weather`, `/code` until ready.
11. **Crisis-safety classifier** edge function on every user message; safe-response template + hotline registry; opt-in human-help mode.
12. **Trust dashboard**: full data export endpoint, "Forget everything about me" with confirm, sensitive-fact flag.

### Phase 4 — Polish & Launch

13. Rename "AI agent framework status" → "Aurora Subsystems".
14. Wire remaining quick actions (Voice/Memory/Reminders).
15. SEO meta, sitemap, OG images for landing.
16. Publish.

---

## 5. Technical Notes

- **Real-time voice**: Lovable AI Gateway doesn't currently expose Realtime; fallback is OpenAI Realtime via user-supplied OPENAI_API_KEY (BYOK secret) OR Gemini Live equivalent. I'll confirm gateway support before building; if absent, request the key.  
  
Push: web-push library in edge function; store subscriptions in push_subscriptions table (RLS by user_id, GRANTed).  
  
Cron: Supabase pg_cron calling edge functions on schedule per user's chosen ritual times.  
  
Subscriptions table (Paystack) and push_subscriptions table — both follow CREATE → GRANT → RLS → POLICY rule.  
  
Crisis classifier: lightweight prompt to google/gemini-3-flash-preview returning {risk: none|moderate|high} + bypassing memory write on high.  
  
Realtime memory writes via Supabase Realtime so the memory dashboard updates as Aurora learns.  
  
6. Confirmations Before I Build  
  
  
Real-time voice provider: OK to use OpenAI Realtime API (you provide OPENAI_API_KEY) for the live voice mode? Alternative is text-only with high-quality TTS via ElevenLabs. I want the free one but only integrate the pse Realtime; fallback is OpenAI Realtime via user-supplied `OPENAI_API_KEY` (BYOK secret) OR Gemini Live equivalent. I'll confirm gateway support before building; if absent, request the key.
- **Push**: web-push library in edge function; store subscriptions in `push_subscriptions` table (RLS by user_id, GRANTed).
- **Cron**: Supabase `pg_cron` calling edge functions on schedule per user's chosen ritual times.
- **Subscriptions table** (Paystack) and **push_subscriptions** table — both follow CREATE → GRANT → RLS → POLICY rule.
- **Crisis classifier**: lightweight prompt to `google/gemini-3-flash-preview` returning `{risk: none|moderate|high}` + bypassing memory write on `high`.
- **Realtime memory writes** via Supabase Realtime so the memory dashboard updates as Aurora learns.

---

## 6. Confirmations Before I Build

1. **Real-time voice provider**: OK to use **OpenAI Realtime API** (you provide `OPENAI_API_KEY`) for the live voice mode? Alternative is text-only with high-quality TTS via ElevenLabs. I 
2. &nbsp;
3. **Paystack**: ready to share secret key when prompted, and what currency (NGN default)? Default 
4. **Pricing** (gates Pro voice + push + ElevenLabs + higher capacity): suggest Free / Pro ₦4,500/mo (~$3) / Enterprise ₦25,000/mo — adjust? Adjust it and make it a reasonable amount but higher than this. 
5. **Safety stance**: confirm Aurora is **non-romantic, no NSFW, with crisis handoff** — locked as a product principle? Pre your recommendation 
6. **Scope for first ship**: do all four phases, or ship Phase 1+2 first (revenue + real-time voice + memory) and queue 3+4? Do all 4 phases