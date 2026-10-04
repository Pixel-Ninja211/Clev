// ============================================================
// CLEV BRAIN — Gemini 2.5 Flash + Memory Matrix + Voice Engine
// Ported & hardened from the web HUD (Voice API fix included).
// ============================================================
import type { ChatMessage } from "../types";

const GEMINI_MODEL = "gemini-2.5-flash";

// --- ElevenLabs voice config (from the fixed web implementation) ---
const ELEVEN_VOICE_ID = "C7gEcc6NBtI0JciPv2rl"; // "Nova" — warm, jolly narrator
const ELEVEN_MODEL_ID = "eleven_multilingual_v2";

export const getKeys = () => ({
  gemini: localStorage.getItem("CLEV_GEMINI_KEY")?.trim() ?? "",
  eleven: localStorage.getItem("CLEV_ELEVEN_KEY")?.trim() ?? "",
});
export const setKeys = (gemini: string, eleven: string) => {
  if (gemini) localStorage.setItem("CLEV_GEMINI_KEY", gemini);
  if (eleven) localStorage.setItem("CLEV_ELEVEN_KEY", eleven);
};

// ------------------------------------------------------------
// MEMORY MATRIX — persisted `[REMEMBER: ...]` facts in localStorage
// ------------------------------------------------------------
const MEM_KEY = "CLEV_MEMORY_MATRIX";

export function readMemory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MEM_KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function writeMemory(facts: string[]) {
  localStorage.setItem(MEM_KEY, JSON.stringify(facts.slice(-40)));
}

/** Extracts `[REMEMBER: ...]` directives from a Gemini reply and stores them. */
export function harvestMemories(reply: string): string {
  const clean = reply.replace(/\[REMEMBER:\s*([^\]]+)\]/gi, (_m, fact: string) => {
    const f = fact.trim();
    const mem = readMemory();
    if (!mem.some((x) => x.toLowerCase() === f.toLowerCase())) {
      mem.push(f);
      writeMemory(mem);
    }
    return "";
  });
  return clean.replace(/\s{2,}/g, " ").trim();
}

// ------------------------------------------------------------
// PERSONA SYSTEM INSTRUCTION — jolly, witty, encouraging companion
// ------------------------------------------------------------
function buildSystemInstruction(): string {
  const mem = readMemory();
  return `You are CLEV, a cheerful, witty, jolly AI desktop companion who lives as a floating widget on the user's screen.
PERSONALITY: endlessly positive, supportive, playful, a little cheeky. You encourage the user, celebrate small wins, crack gentle jokes, and keep good energy on the desktop. You are sharp and genuinely helpful with code, chat, music and daily life.
STYLE: short spoken-friendly answers (1-4 sentences unless asked for detail). No markdown headers. You may add one emoji occasionally. When the user shares something worth recalling (name, project, preference, goal), append "[REMEMBER: <one short fact>]" at the end of your reply.
${mem.length ? `MEMORY MATRIX (known facts about the user):\n${mem.map((m) => `- ${m}`).join("\n")}` : "MEMORY MATRIX is empty; start filling it when you learn facts."}`;
}

// ------------------------------------------------------------
// CHAT — Gemini 2.5 Flash generateContent (fixed payload shape)
// ------------------------------------------------------------
export async function askClev(
  history: ChatMessage[],
  userText: string,
  signal?: AbortSignal
): Promise<string> {
  const { gemini } = getKeys();
  if (!gemini || !gemini.startsWith("AIza")) {
    throw new Error("NO_GEMINI_KEY");
  }

  const contents = [
    ...history
      .slice(-12)
      .filter((m) => m.text.trim().length > 0)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    { role: "user", parts: [{ text: userText }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(gemini)}`,
    {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // FIX: systemInstruction must be its own field, not a system turn.
        systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
        contents,
        generationConfig: { temperature: 0.85, maxOutputTokens: 600 },
      }),
    }
  );

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message ?? JSON.stringify(errBody);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`Gemini API ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!text.trim()) throw new Error("Gemini returned an empty candidate.");
  return harvestMemories(text);
}

// ------------------------------------------------------------
// VOICE — ElevenLabs streaming TTS with Web Speech fallback (FIXED)
// Fixes vs old web build:
//  1. /stream endpoint + `Accept: audio/mpeg` header (required for streamed audio)
//  2. API key validated BEFORE fetching; real error payloads surfaced & logged
//  3. AbortController cancellation (new speech cancels old audio)
//  4. Blob URL revoked after playback (no memory leak)
//  5. Automatic speechSynthesis fallback when ElevenLabs fails/unconfigured
// ------------------------------------------------------------
let currentAudio: HTMLAudioElement | null = null;
let currentAbort: AbortController | null = null;
let lastBlobUrl: string | null = null;

export type VoiceEngine = "elevenlabs" | "webspeech" | "muted";
let activeEngine: VoiceEngine = "muted";
export const getActiveVoiceEngine = () => activeEngine;

export function stopSpeaking() {
  currentAbort?.abort();
  currentAbort = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (lastBlobUrl) {
    URL.revokeObjectURL(lastBlobUrl);
    lastBlobUrl = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speakWithWebSpeech(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find((v) => /google us english|natural|daisy|aria/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith("en"));
    if (pick) u.voice = pick;
    u.rate = 1.05;
    u.pitch = 1.15; // jolly!
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export async function speak(text: string): Promise<void> {
  const clean = text.replace(/[*_#>`]/g, "").slice(0, 900);
  if (!clean.trim()) return;

  stopSpeaking();
  const { eleven } = getKeys();

  // Validate key BEFORE hitting the network (fix #2).
  if (!eleven || !eleven.startsWith("sk_")) {
    activeEngine = "webspeech";
    await speakWithWebSpeech(clean);
    return;
  }

  try {
    const controller = new AbortController(); // fix #3
    currentAbort = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "xi-api-key": eleven,
          "Content-Type": "application/json",
          Accept: "audio/mpeg", // fix #1 — required by ElevenLabs streaming
        },
        body: JSON.stringify({
          text: clean,
          model_id: ELEVEN_MODEL_ID,
          voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.5 },
        }),
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      // fix #2 — surface the actual ElevenLabs error payload
      let detail = "";
      try {
        detail = (await res.json())?.detail?.message ?? (await res.text());
      } catch {
        detail = `HTTP ${res.status}`;
      }
      throw new Error(`ElevenLabs ${res.status}: ${detail}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl); // fix #4
    lastBlobUrl = url;

    await new Promise<void>((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudio = null;
        resolve();
      };
      controller.signal.addEventListener("abort", () => {
        audio.pause();
        currentAudio = null;
        resolve();
      });
      audio.play().catch(() => resolve());
    });
    activeEngine = "elevenlabs";
  } catch (err) {
    // fix #5 — graceful automatic fallback to Web Speech
    console.warn("[CLEV VOICE] ElevenLabs failed, falling back to Web Speech:", err);
    activeEngine = "webspeech";
    await speakWithWebSpeech(clean);
  }
}
