// ---- Clev shared types ----

/** Unified face/mood states (NEOMO's pet states merged into the widget body). */
export type Mood =
  | "idle" // gentle blinking, soft smile
  | "happy" // bouncing ^‿^ eyes
  | "thinking" // processing swirls
  | "excited" // star/sparkle eyes (energetic music)
  | "chill" // softened half-lids (lo-fi / melancholic)
  | "empathic" // caring ◕‸◕ (sad lyrics)
  | "kagune" // Tokyo Ghoul red-flash eyes
  | "observer" // Mentalist sharp narrowed eyes
  | "equalizer" // bouncing EQ-bar eyes (omniview / vinyl)
  | "matrix"; // binary-glyph eyes (hacker mode)

export type Vibe = "neutral" | "energetic" | "melancholic";

export interface HardwareMetrics {
  cpu_percent: number;
  mem_used_gb: number;
  mem_total_gb: number;
  disk_used_gb: number;
  disk_total_gb: number;
  uptime_secs: number;
  core_count: number;
}

export interface SentimentResult {
  vibe: Vibe;
  energy: number; // 0..1
  valence: number; // -1..1
  label: string; // e.g. "Lo-Fi Rain", "Banger Detected"
  matched_terms: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "clev";
  text: string;
  ts: number;
}

export interface YapBubble {
  id: number;
  text: string;
  x: number; // % offset around the face
  y: number;
  kind: "yap" | "tip" | "react";
}
