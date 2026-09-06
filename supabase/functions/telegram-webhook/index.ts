// Aurora on Telegram. Same brain, same memory, same account — reachable from
// a chat thread. Telegram calls this endpoint for every incoming update.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  botToken, webhookSecret, safeEqual,
  sendMessage, sendChatAction, downloadFile, sendVoiceReply,
} from "../_shared/telegram.ts";
import {
  buildCognitiveState, buildContextBlock, buildSystemPrompt,
  emojiGuidanceFor, retrieveRelevantMemories, temperatureFor,
} from "../_shared/brain.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "google/gemini-3-flash-preview";
const VISION_MODEL = "google/gemini-2.5-flash";

const MODES = ["assistant", "growth_partner", "therapist_lite", "strategic", "casual", "creative", "technical"];

const SURFACE_NOTES = `**You are talking through Telegram**
- Plain text only. No markdown headers, no tables, no code fences unless sharing actual code.
- Keep replies chat-sized: a few sentences. Long essays don't belong in a messaging thread.
- Bullets are fine sparingly, using "•".`;

function admin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

const HELP = [
  "Here's what I can do here:",
  "",
  "• Just talk — I remember everything from your Aurora account.",
  "• Send a voice note and I'll listen, and answer out loud.",
  "• Send a photo and I'll tell you what I see or read the text in it.",
  "",
  "Commands:",
  "/mode — see or change how I show up (e.g. /mode casual)",
  "/remember <something> — save it to your memory",
  "/memory — what I currently remember about you",
  "/voice on|off — whether I reply with audio to voice notes",
  "/quiet on|off — my check-ins and daily rituals here",
  "/new — start a fresh thread",
  "/unlink — disconnect this chat from your account",
].join("\n");

/* ---------------------------------------------------------------- linking */

async function findLink(supabase: Any, chatId: number) {
  const { data } = await supabase
    .from("bot_channel_links")
    .select("*")
    .eq("platform", "telegram")
    .eq("external_id", String(chatId))
    .maybeSingle();
  return data;
}

async function consumeCode(supabase: Any, code: string, chatId: number, displayName: string) {
  const { data: row } = await supabase
    .from("bot_link_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("platform", "telegram")
    .is("consumed_at", null)
    .maybeSingle();

  if (!row) return { error: "That code isn't valid. Generate a fresh one in Aurora under Settings → Connected Accounts." };
  if (new Date(row.expires_at) < new Date()) {
    return { error: "That code expired. Grab a new one in Aurora under Settings → Connected Accounts." };
  }

  const { error } = await supabase.from("bot_channel_links").upsert({
    user_id: row.user_id,
    platform: "telegram",
    external_id: String(chatId),
    display_name: displayName,
    metadata: { voice_replies: true },
    last_message_at: new Date().toISOString(),
  }, { onConflict: "platform,external_id" });
  if (error) {
    console.error("Link upsert failed:", error);
    return { error: "Something went wrong connecting this chat. Try again in a moment." };
  }

  await supabase.from("bot_link_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
  return { userId: row.user_id };
}

/* ------------------------------------------------------------ persistence */

async function ensureConversation(supabase: Any, link: Any): Promise<string | null> {
  if (link.conversation_id) return link.conversation_id;
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: link.user_id, title: "Telegram" })
    .select("id")
    .single();
  if (error) {
    console.error("Conversation create failed:", error);
    return null;
  }
  await supabase.from("bot_channel_links").update({ conversation_id: data.id }).eq("id", link.id);
  link.conversation_id = data.id;
  return data.id;
}

async function loadHistory(supabase: Any, conversationId: string) {
  const { data } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).reverse().map((m: Any) => ({ role: m.role, content: m.content }));
}

async function saveMessage(supabase: Any, link: Any, conversationId: string, role: string, content: string) {
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: link.user_id,
    role,
    content,
  });
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}

/* -------------------------------------------------------------------- ai */

async function aiKey(): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

async function think(supabase: Any, link: Any, history: Any[], userText: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles").select("display_name").eq("user_id", link.user_id).maybeSingle();
  const { data: settings } = await supabase
    .from("user_settings").select("companion_mode").eq("user_id", link.user_id).maybeSingle();

  const mode = link.metadata?.companion_mode || settings?.companion_mode || "assistant";
  const messages = [...history, { role: "user", content: userText }];
  const { guidance, lastUserText } = emojiGuidanceFor(messages);

  const state = await buildCognitiveState(link.user_id, supabase, profile?.display_name || "", mode);
  let context = buildContextBlock(state);
  const recalled = await retrieveRelevantMemories(link.user_id, supabase, lastUserText);
  if (recalled) context = `${context}\n\n${recalled}`;

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await aiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({
            userName: profile?.display_name || undefined,
            cognitiveContext: context,
            companionMode: mode,
            emojiGuidance: guidance,
            surfaceNotes: SURFACE_NOTES,
          }),
        },
        ...messages,
      ],
      temperature: temperatureFor(mode),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`AI gateway error [${res.status}]:`, detail.slice(0, 400));
    if (res.status === 429) return "I'm getting a lot of requests right now — give me a minute and say that again.";
    if (res.status === 402) return "My usage credits ran out. Top them up in Aurora and I'll be right back.";
    return "Something went wrong on my end. Try me again in a moment.";
  }

  const body = await res.json();
  return body?.choices?.[0]?.message?.content?.trim() || "I didn't quite catch that — say it again?";
}

async function transcribe(bytes: Uint8Array, filename: string): Promise<string> {
  const form = new FormData();
  form.append("model", "openai/gpt-4o-mini-transcribe");
  form.append("file", new Blob([bytes], { type: "audio/ogg" }), filename);
  const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await aiKey()}` },
    body: form,
  });
  if (!res.ok) {
    console.error("STT failed:", res.status, (await res.text()).slice(0, 300));
    return "";
  }
  const body = await res.json().catch(() => ({}));
  return body?.text?.trim?.() || "";
}

async function speak(text: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`${GATEWAY}/audio/speech`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await aiKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        voice: "alloy",
        input: text.slice(0, 1800),
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      console.error("TTS failed:", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    return new Uint8Array(await res.arrayBuffer());
  } catch (e) {
    console.error("TTS crashed:", e);
    return null;
  }
}

async function describeImage(bytes: Uint8Array, mime: string, caption: string): Promise<string> {
  const b64 = btoa(String.fromCharCode(...bytes));
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await aiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: caption
              ? `${caption}\n\n(Answer conversationally, plain text, no markdown headers.)`
              : "Tell me what's in this image, conversationally and briefly. If it's mostly text, read the text out for me instead.",
          },
          { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
        ],
      }],
    }),
  });
  if (!res.ok) {
    console.error("Vision failed:", res.status, (await res.text()).slice(0, 300));
    return "I couldn't open that image — try sending it again?";
  }
  const body = await res.json();
  return body?.choices?.[0]?.message?.content?.trim() || "I couldn't make anything out in that one.";
}

/* -------------------------------------------------------------- commands */

async function handleCommand(supabase: Any, link: Any, chatId: number, text: string): Promise<boolean> {
  const [raw, ...rest] = text.trim().split(/\s+/);
  const cmd = raw.split("@")[0].toLowerCase();
  const arg = rest.join(" ").trim();

  switch (cmd) {
    case "/help":
    case "/start":
      await sendMessage(chatId, HELP);
      return true;

    case "/mode": {
      if (!arg) {
        const current = link.metadata?.companion_mode || "assistant";
        await sendMessage(chatId, `Right now I'm in ${current} mode.\n\nOptions: ${MODES.join(", ")}\nSwitch with e.g. /mode casual`);
        return true;
      }
      const wanted = arg.toLowerCase().replace(/[\s-]/g, "_");
      if (!MODES.includes(wanted)) {
        await sendMessage(chatId, `I don't have a "${arg}" mode. Try: ${MODES.join(", ")}`);
        return true;
      }
      await supabase.from("bot_channel_links")
        .update({ metadata: { ...(link.metadata || {}), companion_mode: wanted } })
        .eq("id", link.id);
      await sendMessage(chatId, `Done — ${wanted} mode from here on.`);
      return true;
    }

    case "/remember": {
      if (!arg) {
        await sendMessage(chatId, "Tell me what to hold onto: /remember I take my coffee black");
        return true;
      }
      const { error } = await supabase.from("user_memory").insert({
        user_id: link.user_id,
        category: "personal",
        key: arg.slice(0, 60),
        value: arg,
        source: "telegram",
        confidence: 1,
      });
      await sendMessage(chatId, error ? "That didn't save — try again?" : "Got it. I'll remember that.");
      return true;
    }

    case "/memory": {
      const { data } = await supabase
        .from("user_memory")
        .select("category, key, value")
        .eq("user_id", link.user_id)
        .order("last_reinforced_at", { ascending: false })
        .limit(15);
      if (!data?.length) {
        await sendMessage(chatId, "Nothing saved yet. Talk to me a while, or use /remember.");
        return true;
      }
      const lines = data.map((m: Any) => `• ${m.key}: ${m.value}`).join("\n");
      await sendMessage(chatId, `Here's what I'm holding:\n\n${lines}\n\nYou can manage all of it in the Memory screen in Aurora.`);
      return true;
    }

    case "/voice": {
      const on = arg.toLowerCase() !== "off";
      await supabase.from("bot_channel_links")
        .update({ metadata: { ...(link.metadata || {}), voice_replies: on } })
        .eq("id", link.id);
      await sendMessage(chatId, on ? "I'll answer voice notes out loud." : "Text replies only from now on.");
      return true;
    }

    case "/quiet": {
      const quiet = arg.toLowerCase() !== "off";
      await supabase.from("user_settings")
        .update({ telegram_proactive: !quiet })
        .eq("user_id", link.user_id);
      await sendMessage(chatId, quiet ? "I'll keep my check-ins to myself here." : "I'll send my check-ins and rituals here again.");
      return true;
    }

    case "/new": {
      await supabase.from("bot_channel_links").update({ conversation_id: null }).eq("id", link.id);
      await sendMessage(chatId, "Fresh thread. What's on your mind?");
      return true;
    }

    case "/unlink":
      await supabase.from("bot_channel_links").delete().eq("id", link.id);
      await sendMessage(chatId, "This chat is disconnected from your Aurora account. Link it again any time from Settings → Connected Accounts.");
      return true;

    default:
      return false;
  }
}

/* ------------------------------------------------------------------ main */

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let token: string;
  try {
    token = botToken();
  } catch {
    return new Response("Not configured", { status: 503 });
  }

  const expected = await webhookSecret(token);
  if (!safeEqual(req.headers.get("X-Telegram-Bot-Api-Secret-Token"), expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const update = await req.json().catch(() => null);
  if (!update || typeof update.update_id !== "number") return new Response(JSON.stringify({ ok: true }));

  const supabase = admin();

  // Telegram retries deliveries — answer each update exactly once.
  const { error: dupeError } = await supabase.from("telegram_updates").insert({ update_id: update.update_id });
  if (dupeError) return new Response(JSON.stringify({ ok: true, duplicate: true }));

  const message = update.message ?? update.edited_message;
  const chatId: number | undefined = message?.chat?.id;
  if (!chatId) return new Response(JSON.stringify({ ok: true }));

  try {
    const displayName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ")
      || message.from?.username || "Telegram user";
    const text: string = (message.text || "").trim();
    let link = await findLink(supabase, chatId);

    /* ---- not linked yet: only /start CODE gets you in ---- */
    if (!link) {
      const code = text.startsWith("/start") ? text.replace("/start", "").trim() : text;
      if (!code || code.startsWith("/")) {
        await sendMessage(chatId,
          "Hi — I'm Aurora.\n\nTo talk to me here I need to know which account you are. Open Aurora, go to Settings → Connected Accounts, tap Connect Telegram, and send me the code you get.");
        return new Response(JSON.stringify({ ok: true }));
      }
      const result = await consumeCode(supabase, code, chatId, displayName);
      if ("error" in result) {
        await sendMessage(chatId, result.error!);
        return new Response(JSON.stringify({ ok: true }));
      }
      link = await findLink(supabase, chatId);
      await sendMessage(chatId, `We're connected. Everything you've told me in Aurora, I have here too.\n\n${HELP}`);
      return new Response(JSON.stringify({ ok: true }));
    }

    /* ---- respect the master switch ---- */
    const { data: settings } = await supabase
      .from("user_settings").select("telegram_enabled").eq("user_id", link.user_id).maybeSingle();
    if (settings?.telegram_enabled === false) {
      await sendMessage(chatId, "Telegram is switched off for your account. Turn it back on in Aurora under Settings → Connected Accounts.");
      return new Response(JSON.stringify({ ok: true }));
    }

    await supabase.from("bot_channel_links")
      .update({ last_message_at: new Date().toISOString(), display_name: displayName })
      .eq("id", link.id);

    if (text.startsWith("/") && await handleCommand(supabase, link, chatId, text)) {
      return new Response(JSON.stringify({ ok: true }));
    }

    await sendChatAction(chatId, "typing");

    const conversationId = await ensureConversation(supabase, link);
    if (!conversationId) {
      await sendMessage(chatId, "I couldn't open our thread just now. Try again in a moment.");
      return new Response(JSON.stringify({ ok: true }));
    }

    let userText = text;
    let cameFromVoice = false;

    /* ---- voice notes ---- */
    const voice = message.voice ?? message.audio;
    if (voice?.file_id) {
      const file = await downloadFile(voice.file_id);
      if (!file) {
        await sendMessage(chatId, "That voice note didn't come through. Send it again?");
        return new Response(JSON.stringify({ ok: true }));
      }
      userText = await transcribe(file.bytes, file.path.split("/").pop() || "voice.ogg");
      cameFromVoice = true;
      if (!userText) {
        await sendMessage(chatId, "I couldn't make out any words in that one.");
        return new Response(JSON.stringify({ ok: true }));
      }
    }

    /* ---- photos and image documents ---- */
    const photo = Array.isArray(message.photo) ? message.photo[message.photo.length - 1] : null;
    const imageDoc = message.document?.mime_type?.startsWith("image/") ? message.document : null;
    if (photo || imageDoc) {
      const fileId = photo?.file_id ?? imageDoc.file_id;
      const file = await downloadFile(fileId);
      if (!file) {
        await sendMessage(chatId, "That image didn't come through. Try again?");
        return new Response(JSON.stringify({ ok: true }));
      }
      const caption = (message.caption || "").trim();
      const answer = await describeImage(file.bytes, imageDoc?.mime_type || "image/jpeg", caption);
      await saveMessage(supabase, link, conversationId, "user", caption ? `[photo] ${caption}` : "[photo]");
      await saveMessage(supabase, link, conversationId, "assistant", answer);
      await sendMessage(chatId, answer);
      return new Response(JSON.stringify({ ok: true }));
    }

    if (!userText) {
      await sendMessage(chatId, "I can handle text, voice notes and photos here.");
      return new Response(JSON.stringify({ ok: true }));
    }

    const history = await loadHistory(supabase, conversationId);
    const answer = await think(supabase, link, history, userText);

    await saveMessage(supabase, link, conversationId, "user", userText);
    await saveMessage(supabase, link, conversationId, "assistant", answer);

    await sendMessage(chatId, answer);
    if (cameFromVoice && link.metadata?.voice_replies !== false) {
      const audio = await speak(answer);
      if (audio) await sendVoiceReply(chatId, audio);
    }

    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error("telegram-webhook error:", e);
    try { await sendMessage(chatId, "Something broke on my side. Try me again in a moment."); } catch { /* ignore */ }
    return new Response(JSON.stringify({ ok: true }));
  }
});
