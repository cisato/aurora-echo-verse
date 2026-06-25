# Aurora Rebuild Plan

## Part 1 — Strategic Brainstorm

### What will make Aurora WIN
1. **Real companionship, not a chatbot** — time-aware greetings, remembers context across days, references past conversations naturally ("last Tuesday you mentioned…"). Replika's #1 retention driver.
2. **Voice-first on mobile** — one tap, hands-free, natural turn-taking. ChatGPT voice mode is the gold standard; match it.
3. **Proactive check-ins** — "You said you had a presentation today, how did it go?" Push notifications that feel like a friend texting, not a marketing blast.
4. **Rituals** — morning briefing, evening reflection, weekly review. Gives users a *reason* to open the app daily (Pi.ai's weakness — no habit loop).
5. **Privacy as a feature** — local AI option, memory you can audit/delete, no training on user data. A direct shot at Character.ai's trust problem.
6. **Distinctive personality** — Aurora has a *voice*, opinions, warmth. Generic assistants lose to ones with character.
7. **Naira-priced tiers via Paystack** — already shipped. Big moat in African markets where Stripe-only competitors can't accept cards.

### What will make Aurora FAIL
1. **Generic AI aesthetics** — purple gradients + Inter font = invisible. (Fixing this now.)
2. **Broken mobile UX** — sidebar that can't collapse, tiny tap targets, no bottom nav. Mobile is 70% of companion-app usage.
3. **Empty dashboard on first run** — too many widgets, no clear "what do I do?" path. Need a guided first conversation.
4. **No reason to come back tomorrow** — without proactive nudges + rituals, users churn in week 1.
5. **Slow voice latency** — >2s response kills the "companion" illusion.
6. **Feature sprawl** — Code, Weather, Web, Search, Multimodal, Personas, Reports, API Keys, Analytics all in the sidebar. Overwhelming. Hide power features behind a "More" drawer.
7. **No onboarding** — users land on a dashboard with no idea what Aurora can do.

## Part 2 — UI & Theme Rebuild

### New aesthetic: Cream on Forest Green
- **Background:** deep forest `hsl(155 35% 12%)` with subtle organic gradient
- **Surface/cards:** warm cream `hsl(40 30% 92%)` with soft shadow
- **Primary text on dark:** cream `hsl(40 30% 92%)`
- **Primary accent:** moss/sage `hsl(140 40% 55%)`
- **Secondary accent:** warm clay `hsl(20 50% 65%)` for highlights
- **Typography:** Fraunces (display, headings — organic serif) + Inter Tight (body)
- **Radius:** generous `1.25rem`, soft natural feel
- **Motion:** slow breathing animations, no sharp transitions

Tokens rewritten in `src/index.css` and `tailwind.config.ts`. Aurora gradient utility re-tuned to green/sage/cream range. Removes all purple/blue.

### Sidebar fix + mobile-first navigation
Replace `src/components/Sidebar.tsx` with a responsive shell:
- **Desktop (≥768px):** collapsible left rail using shadcn `Sidebar` + `SidebarProvider`. Trigger always visible in top header.
- **Mobile (<768px):** sidebar becomes an off-canvas `Sheet` opened from a hamburger in a new top app bar. Bottom nav bar with 5 primary tabs: Chat, Dashboard, Memory, Voice, More. Everything else (Personas, Reports, API Keys, Analytics, Settings) lives behind "More".
- Hamburger and bottom nav use 44px tap targets.
- The current "collapsed but stuck visible" bug is fixed because the new shell uses Sheet on mobile (fully hides) and proper `SidebarProvider` state on desktop.

### Mobile optimizations across the app
- `Dashboard.tsx`: grids collapse to single column <640px, headers shrink, widget cards get larger tap zones, settings gear moves into header.
- `Chat`: composer pinned to bottom above the new mobile bottom nav, safe-area padding for iOS notch.
- `Pricing` & `Billing`: stack vertically on mobile, full-width CTAs.
- All pages get `pb-20 md:pb-0` so bottom nav doesn't cover content.
- Set preview viewport to mobile during build so we design mobile-first.

### Onboarding (new)
First-visit users get a 3-step intro overlay instead of the current alert:
1. "Hi, I'm Aurora" + name capture
2. "What should I help with?" (companionship / productivity / learning) — seeds persona
3. "Talk or type?" — picks default input mode
Then drops them into Chat with a warm opener instead of the dashboard.

## Part 3 — Retention features to add (after the rebuild)
- Daily ritual cards on dashboard (morning briefing, evening reflection)
- Push notification scaffolding (Capacitor path, deferred until user requests)
- "Remember this" quick action in chat → writes to memory
- Streak counter (gentle, not gamified-anxiety)

## Technical scope

**Files rewritten**
- `src/index.css` — new color tokens, gradients, fonts
- `tailwind.config.ts` — forest/cream palette, Fraunces + Inter Tight, new radius
- `src/components/Sidebar.tsx` → replaced with `AppShell.tsx` + `MobileBottomNav.tsx` + `TopBar.tsx`
- `src/pages/Index.tsx` — uses new shell, removes WelcomeAlert in favor of Onboarding
- `src/components/Dashboard.tsx` — mobile grid, tighter spacing
- `src/components/welcome/Onboarding.tsx` — new 3-step flow
- `src/pages/Pricing.tsx`, `src/pages/Billing.tsx` — mobile pass
- `index.html` — load Fraunces + Inter Tight from Google Fonts, update theme-color meta
- `src/App.css` — purge stale Vite defaults

**Files NOT touched**: edge functions, Supabase migrations, Paystack flow, auth, types.

**Out of scope this round** (call out separately if you want them next):
- Push notifications wiring
- Capacitor native build
- New AI personality tuning in the chat edge function
- Streaks / ritual UI (scaffolding only)

## Order of work
1. Theme tokens + fonts (index.css, tailwind, index.html)
2. New AppShell + TopBar + MobileBottomNav, delete old Sidebar
3. Dashboard mobile pass
4. Onboarding flow replaces WelcomeAlert
5. Pricing/Billing mobile pass
6. Verify on mobile viewport via preview

Confirm the cream-on-forest direction and I'll build it.
