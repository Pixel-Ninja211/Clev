// ============================================================
// Easter eggs & local commands — no API key needed for these.
// Each returns: reply text, mood swap, optional FX flags & timers.
// ============================================================
import type { Mood } from "../types";
import { readMemory, writeMemory } from "./brain";

export interface EggResult {
  reply: string;
  mood: Mood;
  moodMs?: number; // revert to idle after this
  fx?: "crt-shake" | "ember" | "tea" | "glitch-type" | null;
  glitchText?: string; // typed with glitched FX (1000-7 countdown)
  emberMode?: boolean; // toggles Author/Focus mode
  hackerMode?: boolean | null; // true=on false=off null=unchanged
}

const JANE_QUOTES = [
  "The world doesn't owe you an explanation — but I'll give you one anyway. ☕",
  "People show you who they are in the first three keystrokes. You just showed me yours.",
  "Tea calms the mind. Observation frees it. I've been sipping and watching all day.",
  "When you eliminate the obvious, what remains is... a really good question.",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Countdown text like typing `1000 - 7` → "1000... 993... 986... 979..." */
export function sevenCountdown(start = 1000, steps = 6): string {
  const nums: number[] = [];
  let v = start;
  for (let i = 0; i < steps; i++) {
    nums.push(v);
    v -= 7;
  }
  return nums.join("... ") + "...";
}

export function detectEasterEgg(raw: string): EggResult | null {
  const t = raw.toLowerCase().trim();

  // ---- Tokyo Ghoul: 1000-7 / kaneki ----
  if (/(^|\s)(1000\s*-\s*7|1000-7|kaneki)/.test(t)) {
    return {
      reply: "Ooh, that counts backwards *painfully*. Kagune engaged — don't worry, I only eat stress, not people. 🥀",
      mood: "kagune",
      moodMs: 6000,
      fx: "crt-shake",
      glitchText: sevenCountdown(),
    };
  }

  // ---- The Mentalist: mentalist / red john / tea ----
  if (/(mentalist|red\s*john|\btea\b)/.test(t)) {
    return {
      reply: pick(JANE_QUOTES),
      mood: "observer",
      moodMs: 8000,
      fx: "tea",
    };
  }

  // ---- Enveloped Ember Manuscript Protocol ----
  if (/ember|manuscript/.test(t)) {
    return {
      reply: "[MANUSCRIPT PROTOCOL ACTIVE // ENVELOPED EMBER LINKED] ✍️🔥 Focus mode on — I'll keep the embers warm while you write. Distractions? Not today.",
      mood: "thinking",
      moodMs: 2500,
      fx: "ember",
      emberMode: true,
    };
  }

  // ---- Omniview / vinyl: EQ eyes ----
  if (/(omniview|vinyl|equalizer|\beq\b)/.test(t)) {
    return {
      reply: "Omniview online 👂 — my eyes are now bouncing to your system audio. Drop a track and watch me vibe literally.",
      mood: "equalizer",
      moodMs: 15000,
    };
  }

  // ---- Hacker mode toggle ----
  if (/(hacker\s*mode|^hack\b|^matrix$)/.test(t)) {
    return {
      reply: "Access granted. Cyan glass → terminal green. Remember me when you're famous, neo. 🟩",
      mood: "matrix",
      moodMs: 2000,
      hackerMode: true,
    };
  }
  if (/^exit(\s+(hacker|matrix|mode))?s?$/.test(t)) {
    return {
      reply: "Logging out of the mainframe. Back to shiny glass and good vibes! ✨",
      mood: "happy",
      moodMs: 2500,
      hackerMode: false,
    };
  }

  // ---- Jolly built-ins ----
  if (/(who are you|your name|what are you)/.test(t)) {
    return {
      reply: "I'm Clev! Your jolly little desk gremlin — part copilot, part hype-friend, fully invested in your good mood. 💙",
      mood: "happy",
      moodMs: 4000,
    };
  }
  if (/(help|commands|what can you do)/.test(t)) {
    return {
      reply: 'Ask me anything (code, ideas, pep talks)! Secret words: "1000-7", "kaneki", "mentalist", "tea", "ember", "omniview", "vinyl", "hacker mode", "exit". Say "remember X" and I will. 🗂️',
      mood: "thinking",
      moodMs: 3000,
    };
  }

  // Explicit remember directive — persists even without Gemini configured
  const rem = raw.match(/^remember\s+(.+)$/i);
  if (rem) {
    const fact = rem[1].trim();
    const mem = readMemory();
    if (!mem.some((x) => x.toLowerCase() === fact.toLowerCase())) writeMemory([...mem, fact]);
    return { reply: `Noted and pinned to my memory matrix: "${fact}" 🧠✨`, mood: "happy", moodMs: 3000 };
  }

  return null;
}
