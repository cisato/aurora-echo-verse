// Passive memory extraction.
//
// Saving must never depend on the conversational model deciding to call a save
// function mid-chat — that was a single point of failure. Instead, after every
// exchange a separate, small extraction pass reads the turn and files
// structured, labelled facts. Nothing here writes prose transcripts: each row
// is a category + key + value that can be searched and surfaced later.

import { embedMany } from "./embed.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite";

/** Categories the memory store accepts. Anything else is rejected outright. */
const CATEGORIES = [
  "goal", "interest", "relationship", "project", "trigger",
  "motivator", "pattern", "skill", "value", "fact",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export interface ExtractedFact {
  category: string;
  key: string;
  value: string;
  tags: string[];
  confidence: number;
  followup_at?: string | null;
}

const SYSTEM = `You extract durable, structured facts about a person from one exchange with their assistant.

Return ONLY valid JSON:
{"facts":[{"category":"goal|interest|relationship|project|trigger|motivator|pattern|skill|value|fact","key":"short label","value":"the fact, written as a standalone sentence","tags":["lowercase-tag"],"confidence":0.0-1.0,"followup_at":"YYYY-MM-DD or null"}]}

Rules:
- Only what the PERSON stated or clearly implied about themselves. Never anything the assistant said about itself.
- Extract: their name, preferences, ongoing situations, commitments, deadlines, people in their life, projects, things they said they'd do.
- Do NOT extract: small talk, one-off questions, general knowledge, anything about the assistant.
- Never invent or complete identifying or financial details (addresses, phone numbers, bank codes, IDs). If a detail wasn't stated in full, skip the fact.
- "value" must be self-contained — readable months later with no chat history.
- Set followup_at only when they named or clearly implied a date/deadline; otherwise null.
- Max 5 facts. If nothing durable was said, return {"facts":[]}.`;

async function callModel(exchange: string): Promise<ExtractedFact[]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return [];
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: exchange },
      ],
      temperature: 0.1,
    }),
  });
  if (!res.ok) {
    console.error("passive extraction failed:", res.status, (await res.text()).slice(0, 300));
    return [];
  }
  const body = await res.json().catch(() => ({}));
  const raw = body?.choices?.[0]?.message?.content ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed?.facts) ? parsed.facts : [];
  } catch (e) {
    console.error("passive extraction parse error:", e);
    return [];
  }
}

export interface ExtractionResult {
  /** Facts actually written to the store, phrased for the model to reference. */
  stored: string[];
  /** Plausible but unconfirmed readings. Never stored — Aurora may ask about one. */
  uncertain: string[];
}

/** Below this, a reading is a guess and gets asked about instead of filed. */
const CONFIDENCE_FLOOR = 0.6;

/**
 * Read one exchange and quietly file what's durable about it.
 * Everything below the confidence floor comes back as a question to ask, not a
 * fact to claim. Returns exactly what was written — never assume success.
 */
export async function extractAndStore(
  supabase: Any,
  userId: string,
  userText: string,
  assistantText: string,
  _conversationId?: string | null,
): Promise<ExtractionResult> {
  const result: ExtractionResult = { stored: [], uncertain: [] };
  if (!userText || userText.trim().length < 3) return result;

  const exchange = `Person: ${userText}\nAssistant: ${assistantText}`.slice(0, 6000);
  const all = (await callModel(exchange))
    .filter((f) => f && CATEGORIES.includes(f.category) && f.key && f.value)
    .slice(0, 5);
  if (!all.length) return result;

  const facts = all.filter((f) => (f.confidence ?? 0.7) >= CONFIDENCE_FLOOR);
  for (const f of all) {
    if ((f.confidence ?? 0.7) < CONFIDENCE_FLOOR) result.uncertain.push(`${f.key}: ${f.value}`);
  }
  if (!facts.length) return result;

  const embeddings = await embedMany(facts.map((f) => `${f.category}: ${f.key} — ${f.value}`));

  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    const tags = Array.isArray(f.tags)
      ? f.tags.map((t) => String(t).toLowerCase().trim().replace(/\s+/g, "-")).filter(Boolean).slice(0, 6)
      : [];
    if (f.followup_at && /^\d{4}-\d{2}-\d{2}$/.test(f.followup_at)) tags.push(`followup:${f.followup_at}`);

    const { data: existing } = await supabase
      .from("user_memory")
      .select("id, confidence, tags")
      .eq("user_id", userId)
      .eq("category", f.category)
      .eq("key", f.key.slice(0, 60))
      .maybeSingle();

    const patch: Record<string, unknown> = {
      value: f.value,
      last_reinforced_at: new Date().toISOString(),
      tags: Array.from(new Set([...(existing?.tags ?? []), ...tags])),
    };
    if (embeddings[i]) patch.embedding = embeddings[i];

    if (existing) {
      patch.confidence = Math.max(existing.confidence ?? 0, f.confidence ?? 0.7);
      const { error } = await supabase.from("user_memory").update(patch).eq("id", existing.id);
      if (error) console.error("passive memory update failed:", error.message);
      else result.stored.push(`${f.key}: ${f.value}`);
    } else {
      const { error } = await supabase.from("user_memory").insert({
        user_id: userId,
        category: f.category,
        key: f.key.slice(0, 60),
        value: f.value,
        tags: patch.tags,
        confidence: f.confidence ?? 0.7,
        source: "observed",
        embedding: embeddings[i] ?? null,
      });
      if (error) console.error("passive memory insert failed:", error.message);
      else result.stored.push(`${f.key}: ${f.value}`);
    }
  }

  return result;
}

