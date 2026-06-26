
## 1. Fix Google Sign-In

The `handleGoogleSignIn` flow is correct in code, but Google OAuth fails when the provider isn't actually enabled in Cloud, or when the redirect drops the session because the user lands on `/` (Index) before `onAuthStateChange` resolves. Fix path:

- Call the social-auth configuration tool to enable Google (idempotent — confirms it's wired with Lovable's managed credentials, fixing the common "Unsupported provider" / silent-fail case).
- Keep `redirect_uri: window.location.origin` (correct per docs — not a protected route).
- Add a small `/auth/callback` handler that waits for `supabase.auth.getSession()` to hydrate before navigating, so users coming back from Google aren't bounced to `/auth` by `ProtectedRoute` during the brief loading window.
- Surface a clearer error toast and console log when `result.error` is returned so we can diagnose future failures from the user side.

## 2. Chat Interface Redesign

Replace the current bespoke chat with **AI Elements** primitives (per the chat-ui-composition contract) and a distinctive Aurora visual layer.

Composer (`ChatInput.tsx`):
- Rebuild on `PromptInput` + `PromptInputTextarea` + `PromptInputFooter` with mic, voice toggle, and submit in the footer (fixes the cramped 4-button pill on 423px viewports).
- Larger textarea, auto-grow up to ~200px, generous bottom padding so text doesn't sit under the submit button.
- Recording state becomes an inline shimmer ribbon above the composer with a live waveform.

Messages (`ChatMessage.tsx` + `Messages.tsx`):
- Assistant messages: **no background bubble** (per contract) — markdown rendered directly on the chat surface with a small Aurora avatar gutter, subtle hover actions (copy, regenerate, speak).
- User messages: filled `bg-primary text-primary-foreground` bubble (already correct), tightened radius, timestamp on hover only.
- Use `Shimmer` "Thinking…" for the loading state instead of bouncing dots.
- Empty state: keep the suggestion cards but redesign as a 2x2 editorial grid with the generated Aurora mark (not Sparkles) and a warmer headline.

Sidebar (`ConversationHistory.tsx`):
- Migrate to shadcn `Sidebar` (`SidebarProvider`, collapsible="icon") so it behaves correctly on mobile (offcanvas) and desktop (icon-rail).
- Group conversations by **Today / Yesterday / Last 7 days / Older** with `date-fns`.
- Inline rename (double-click title), hover-reveal delete with confirm, and a pinned "New chat" CTA at top.
- Move the Companion Mode dropdown into a dedicated footer section with the active mode color-dotted; current cramped header gets simpler.
- Add search box (filter by title) at the top.

Generate a small Aurora wordmark/logo (premium image) to replace the `Sparkles` placeholder in the auth card and empty state per the chat-ui-composition identity rule.

## 3. Investor Recommendation — Honest Take

**Would I recommend Aurora to an investor today? Not yet.** Here is why, with the fixes I'd ship:

| Concern | Why it blocks investment | Fix |
|---|---|---|
| **Undifferentiated positioning** | "AI companion with memory" is a crowded category (Pi, Replika, ChatGPT memory, Character.ai). No single sentence explains why Aurora wins. | Add a public landing page with a sharp wedge: e.g. "The reflective AI companion for African knowledge workers" — paired with Paystack/NGN pricing already in code. |
| **No real moat shown in product** | Memory + personas exist but aren't visible to a first-time visitor. | Build a public marketing route (`/`) with screenshots, the proactive-insights demo, growth timeline preview, and a clear "Try free" CTA — currently `/` is gated. |
| **Auth friction** | Google sign-in is broken (see fix #1); magic link + password + Google all visible at once feels noisy. | Fix Google, demote magic link to "More options". |
| **Monetization unverified** | Paystack functions exist but no analytics, no churn signal, no proof anyone has paid. | Add a Reports tab the founder can show investors: MAU, paid conversions, ritual streaks. Most edge functions exist; just need a `/admin/metrics` view. |
| **Trust & safety story missing** | Investors will ask: what happens to user memories? Where is data stored? | Add a public `/privacy` + `/security` page describing RLS, per-user isolation, memory deletion controls, and the existing has_role pattern. |
| **No demo without signup** | Investors won't create an account to evaluate. | Add a sandbox `/demo` route with a scripted Aurora conversation (read-only) so a VC can experience it in 30 seconds. |
| **Mobile polish gaps** | At 423px the chat composer crowds, sidebar covers content. | Covered by the redesign above. |

I will not implement the marketing/privacy/demo pages in this plan unless you approve them — they are large enough to be their own conversation. **This plan only ships fixes #1 and #2 plus this written investor brief.** I'll queue the investor-readiness items as a follow-up plan you can approve separately.

## Files Changed

- `src/pages/Auth.tsx` — clearer Google error handling, replace Sparkles with Aurora mark.
- `src/App.tsx` — add `/auth/callback` route.
- New `src/pages/AuthCallback.tsx` — hydrate session then navigate.
- Install AI Elements: `conversation`, `message`, `prompt-input`, `shimmer`.
- `src/components/ChatInput.tsx` — rebuilt on `PromptInput`.
- `src/components/ChatMessage.tsx` — assistant uses `MessageResponse`, no bg.
- `src/components/chat/Messages.tsx` — `Conversation`/`ConversationContent`, new empty state.
- `src/components/ConversationHistory.tsx` — shadcn `Sidebar`, grouped + searchable.
- `src/components/ChatWindow.tsx` — wire `SidebarProvider`, pass new props.
- `src/assets/aurora-mark.png` — new generated logo.
- Tool call: `configure_social_auth` providers=["google"] to confirm Google is enabled.

## Technical Notes

- AI Elements components live under `src/components/ai-elements/` after install; we compose, not replace.
- Sidebar uses `collapsible="offcanvas"` on mobile via the `useIsMobile` hook to avoid covering the chat at 423px.
- All colors via semantic tokens (`bg-card`, `text-foreground`, `bg-primary`); no hardcoded hex.
- `AuthCallback` listens via `onAuthStateChange` with a 5s timeout fallback to `/auth?error=callback_timeout`.
