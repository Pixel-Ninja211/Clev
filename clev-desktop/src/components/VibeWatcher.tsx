// ============================================================
// VibeWatcher — real-time media vibe-checking.
// 1) Polls the Rust `get_active_window_title` command (Spotify /
//    MusicBee / browser titles like "Song – Artist").
// 2) Sends parsed title + optional lyrics to the local FastAPI
//    sentiment service (http://127.0.0.1:8765).
// 3) Feeds back a Vibe so Clev softens (lo-fi/sad) or bounces
//    (pop/rock), plus drives EQ eyes via WebAudio mic-free loopback
//    approximation from the reported energy value.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { SentimentResult, Vibe } from "../types";

const BACKEND = "http://127.0.0.1:8765";
const MUSIC_HINTS = /(spotify|musicbee|foobar|itunes|apple music|youtube|soundcloud|bandcamp|now playing|—|-)/i;

export interface VibeState {
  vibe: Vibe;
  track: string | null;
  label: string | null;
  energy: number; // smoothed 0..1 — also used for EQ eyes & bounce
}

const FALLBACK: VibeState = { vibe: "neutral", track: null, label: null, energy: 0 };

export default function useVibeWatcher(): VibeState {
  const [state, setState] = useState<VibeState>(FALLBACK);
  const lastTitle = useRef<string>("");
  const energySmooth = useRef(0);

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      // --- Active window title via Tauri (Win32 GetForegroundWindow) ---
      let title = "";
      try {
        title = await invoke<string>("get_active_window_title");
      } catch {
        // Browser dev fallback: document title
        title = document.title;
      }
      if (!alive || !title || title === lastTitle.current) return;
      lastTitle.current = title;

      if (!MUSIC_HINTS.test(title)) {
        setState((s) => ({ ...s, track: null, label: null, vibe: "neutral" }));
        return;
      }

      // --- Ask the Python FastAPI lyric-sentiment service ---
      try {
        const res = await fetch(`${BACKEND}/vibe-check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, lyrics: "" }),
        });
        if (!res.ok) throw new Error(`backend ${res.status}`);
        const r: SentimentResult = await res.json();
        if (!alive) return;
        energySmooth.current = energySmooth.current * 0.6 + r.energy * 0.4;
        setState({ vibe: r.vibe, track: title, label: r.label, energy: energySmooth.current });
      } catch {
        // Backend offline → lightweight local heuristic on the title only
        if (!alive) return;
        const sad = /(sad|alone|goodbye|tears|nightfall|lofi|lo-fi|rain|blue|missing|sorry)/i.test(title);
        const hyped = /(remix|dance|party|run|dont stop|bad guy|blinding|boom|fire|turbo)/i.test(title);
        const vibe: Vibe = sad ? "melancholic" : hyped ? "energetic" : "neutral";
        const e = vibe === "energetic" ? 0.85 : vibe === "melancholic" ? 0.2 : 0.5;
        energySmooth.current = energySmooth.current * 0.6 + e * 0.4;
        setState({ vibe, track: title, label: vibe === "melancholic" ? "Mellow radar 🌧️" : vibe === "energetic" ? "Banger radar ⚡" : null, energy: energySmooth.current });
      }
    };

    poll();
    const id = setInterval(poll, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return state;
}

/** Small UI chip showing what Clev is currently vibe-checking. */
export function VibeChip({ v, hackerMode }: { v: VibeState; hackerMode: boolean }) {
  if (!v.track) return null;
  const color = v.vibe === "energetic" ? "#f59e0b" : v.vibe === "melancholic" ? "#818cf8" : hackerMode ? "#22c55e" : "#22d3ee";
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] max-w-full truncate backdrop-blur-md"
      style={{ borderColor: `${color}66`, color, background: `${color}14` }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      <span className="truncate">{v.label ? `${v.label} · ` : "♪ "}{v.track}</span>
    </div>
  );
}
