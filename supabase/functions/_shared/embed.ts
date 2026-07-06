// Shared helper for turning text into embedding vectors via the Lovable AI Gateway.
// We use openai/text-embedding-3-small (1536 dims) because pgvector HNSW indexes cap
// at 2000 dims — the 3072-dim Gemini default would defeat the retrieval index.

const EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings";
const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_DIMS = 1536;

export const EMBEDDING_DIMS = EMBED_DIMS;

function requireKey(): string {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  return key;
}

/** Embed a single string. Returns null on failure so callers can no-op gracefully. */
export async function embedOne(text: string): Promise<number[] | null> {
  const clean = (text || "").trim();
  if (!clean) return null;
  try {
    const resp = await fetch(EMBED_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: clean.slice(0, 8000) }),
    });
    if (!resp.ok) {
      console.error("embedOne failed:", resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    return data?.data?.[0]?.embedding ?? null;
  } catch (e) {
    console.error("embedOne error:", e);
    return null;
  }
}

/** Embed many strings in one request (OpenAI supports array input). */
export async function embedMany(texts: string[]): Promise<Array<number[] | null>> {
  const inputs = texts.map((t) => (t || "").trim().slice(0, 8000));
  const nonEmpty = inputs.map((t, i) => ({ t, i })).filter((x) => x.t.length > 0);
  if (nonEmpty.length === 0) return texts.map(() => null);
  try {
    const resp = await fetch(EMBED_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: nonEmpty.map((x) => x.t) }),
    });
    if (!resp.ok) {
      console.error("embedMany failed:", resp.status, await resp.text());
      return texts.map(() => null);
    }
    const data = await resp.json();
    const out: Array<number[] | null> = texts.map(() => null);
    for (const row of data?.data ?? []) {
      const originalIdx = nonEmpty[row.index]?.i;
      if (typeof originalIdx === "number") out[originalIdx] = row.embedding;
    }
    return out;
  } catch (e) {
    console.error("embedMany error:", e);
    return texts.map(() => null);
  }
}

/** Turn a memory fact into the canonical string we embed. Consistent shape = better search. */
export function memoryFactText(fact: { category?: string; key?: string; value?: string; tags?: string[] }): string {
  const tags = (fact.tags && fact.tags.length ? ` [${fact.tags.join(", ")}]` : "");
  return `(${fact.category || "fact"}) ${fact.key || ""}: ${fact.value || ""}${tags}`.trim();
}
