// ============================================================
// CLEV — jolly AI desktop companion (Dynamic-Island style widget)
// Frameless / transparent / always-on-top Tauri overlay.
// Drag via CSS `-webkit-app-region: drag` header strip.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import ClevFace from "./components/ClevFace";
import YapBubbles from "./components/YapBubbles";
import TelemetryStrip from "./components/TelemetryStrip";
import EmberParticles from "./components/EmberParticles";
import useVibeWatcher, { VibeChip } from "./components/VibeWatcher";
import { askClev, speak, stopSpeaking, getKeys, setKeys, readMemory, getActiveVoiceEngine } from "./lib/brain";
import { detectEasterEgg } from "./lib/eastereggs";
import type { ChatMessage, Mood, YapBubble } from "./types";

let yapId = 0;

const IDLE_YAPS = [
  "yap yap! 💙", "I believe in you ✨", "hydrate check! 💧", "you're doing great 🌈",
  "ship it! 🚀", "stretch those shoulders 🧘", "ooh, pretty pixels 👀", "one more task, champion 🏆",
];

export default function App() {
  // ---------- core state ----------
  const [mood, setMood] = useState<Mood>("idle");
  const [speaking, setSpeaking] = useState(false);
  const [hackerMode, setHackerMode] = useState<boolean>(() => localStorage.getItem("CLEV_HACKER") === "1");
  const [emberMode, setEmberMode] = useState<boolean>(() => localStorage.getItem("CLEV_EMBER") === "1");
  const [expanded, setExpanded] = useState(false); // Dynamic Island collapse/expand
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<YapBubble[]>([]);
  const [crtShake, setCrtShake] = useState(false);
  const [glitchText, setGlitchText] = useState<string | null>(null);
  const [teaIcon, setTeaIcon] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const vibe = useVibeWatcher();

  // ---------- helpers ----------
  const pushYap = useCallback((text: string, kind: YapBubble["kind"] = "yap") => {
    const b: YapBubble = {
      id: ++yapId, text, kind,
      x: 8 + Math.random() * 55, y: 2 + Math.random() * 22,
    };
    setBubbles((prev) => [...prev.slice(-3), b]);
    setTimeout(() => setBubbles((prev) => prev.filter((x) => x.id !== b.id)), 3400);
  }, []);

  const flashMood = useCallback((m: Mood, ms: number) => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setMood(m);
    moodTimer.current = setTimeout(() => setMood("idle"), ms);
  }, []);

  /** Glitched typewriter for `1000... 993... 986...` */
  const glitchType = useCallback((full: string) => {
    let i = 0;
    setGlitchText("");
    const id = setInterval(() => {
      i += 1;
      const shown = full.slice(0, i);
      // random char corruption on the tail while typing
      const corrupted =
        i < full.length
          ? shown.slice(0, -1) + (Math.random() > 0.6 ? "▓▒░#%&"[Math.floor(Math.random() * 6)] : shown.slice(-1))
          : shown;
      setGlitchText(corrupted);
      if (i >= full.length) {
        clearInterval(id);
        setTimeout(() => setGlitchText(full), 2600);
      }
    }, 70);
  }, []);

  // ---------- vibe-driven mood (softens on sad, bounces on hype) ----------
  useEffect(() => {
    if (mood !== "idle" && mood !== "chill" && mood !== "excited") return; // don't fight eggs/chat
    if (vibe.vibe === "melancholic") setMood("chill");
    else if (vibe.vibe === "energetic") setMood("excited");
    else setMood((m) => (m === "chill" || m === "excited" ? "idle" : m));
  }, [vibe.vibe, mood]);

  // ---------- idle ambient yaps + gentle audio-level sim for EQ eyes ----------
  useEffect(() => {
    const yapTimer = setInterval(() => {
      if (!document.hasFocus() && Math.random() > 0.5) return;
      if (Math.random() > 0.55) pushYap(IDLE_YAPS[Math.floor(Math.random() * IDLE_YAPS.length)], "react");
    }, 14000);
    const eqTimer = setInterval(() => {
      // simulate a living level when equalizer mood is active (or energetic vibe)
      setAudioLevel((l) => {
        const target = mood === "equalizer" || vibe.vibe === "energetic" ? 0.35 + Math.random() * 0.65 : 0.15 + Math.random() * 0.2;
        return l + (target - l) * 0.5;
      });
    }, 110);
    return () => { clearInterval(yapTimer); clearInterval(eqTimer); };
  }, [mood, vibe.vibe, pushYap]);

  // ---------- reply pipeline (chat + voice + yap + mood) ----------
  const deliverReply = useCallback(async (text: string, opts?: { moodOverride?: Mood; moodMs?: number }) => {
    setLastReply(text);
    setExpanded(true);
    flashMood(opts?.moodOverride ?? "happy", opts?.moodMs ?? 4500);
    pushYap("yap! 🗣️", "yap");
    setSpeaking(true);
    try { await speak(text); } finally { setSpeaking(false); }
  }, [flashMood, pushYap]);

  // ---------- send ----------
  const send = useCallback(async () => {
    const raw = input.trim();
    if (!raw) return;
    setInput("");
    const userMsg: ChatMessage = { id: `${Date.now()}u`, role: "user", text: raw, ts: Date.now() };
    setHistory((h) => [...h.slice(-20), userMsg]);

    // 1) Local easter eggs first (instant, no key needed)
    const egg = detectEasterEgg(raw);
    if (egg) {
      if (egg.fx === "crt-shake") { setCrtShake(true); setTimeout(() => setCrtShake(false), 900); }
      if (egg.fx === "tea") { setTeaIcon(true); setTimeout(() => setTeaIcon(false), 8000); }
      if (typeof egg.hackerMode === "boolean") {
        setHackerMode(egg.hackerMode);
        localStorage.setItem("CLEV_HACKER", egg.hackerMode ? "1" : "0");
      }
      if (egg.emberMode) { setEmberMode(true); localStorage.setItem("CLEV_EMBER", "1"); }
      if (egg.glitchText) glitchType(egg.glitchText);
      await deliverReply(egg.reply, { moodOverride: egg.mood, moodMs: egg.moodMs });
      return;
    }
    if (/stop|shut up|quiet/.test(raw.toLowerCase())) {
      stopSpeaking(); setSpeaking(false);
      flashMood("observer", 2500);
      pushYap("*zips it* 🤐", "react");
      return;
    }
    if (/^(focus off|exit ember|end ember)/.test(raw.toLowerCase())) {
      setEmberMode(false);
      localStorage.setItem("CLEV_EMBER", "0");
      await deliverReply("Embers banked, focus mode off. Back to regular cheerful chaos! 🔥➡️🫧", { moodOverride: "happy", moodMs: 3000 });
      return;
    }

    // 2) Gemini brain
    if (!getKeys().gemini) {
      setShowSettings(true); setExpanded(true);
      flashMood("thinking", 2000);
      pushYap("Need my Gemini key first! ⚙️", "tip");
      return;
    }
    flashMood("thinking", 999999); // stays until reply lands
    try {
      const reply = await askClev(history, raw);
      setHistory((h) => [...h, { id: `${Date.now()}a`, role: "clev", text: reply, ts: Date.now() }]);
      await deliverReply(reply);
    } catch (err: any) {
      console.error("[CLEV]", err);
      const msg = String(err?.message ?? err);
      const friendly = msg.includes("NO_GEMINI_KEY")
        ? "My Gemini key is missing or looks wrong — open settings (⚙️) and paste it in!"
        : "Oof, my brain hiccupped talking to Gemini. Check your connection or key, I'll wait right here! 💙";
      setHistory((h) => [...h, { id: `${Date.now()}a`, role: "clev", text: friendly, ts: Date.now() }]);
      await deliverReply(friendly, { moodOverride: "empathic", moodMs: 4000 });
    }
  }, [input, history, deliverReply, flashMood, pushYap, glitchType]);

  // ---------- window controls ----------
  const minimizeToTray = () => getCurrentWindow().hide().catch(() => {});
  const closeWidget = () => getCurrentWindow().close().catch(() => {});

  const accent = hackerMode ? "#22c55e" : "#22d3ee";
  const warmBorder = emberMode ? "#f59e0b" : `${accent}55`;

  return (
    <div className="w-screen h-screen select-none" style={{ background: "transparent" }}>
      {/* CRT shake wrapper (kaneki easter egg) */}
      <motion.div
        className={crtShake ? "crt-shake" : ""}
        animate={crtShake ? { x: [0, -6, 5, -4, 3, 0], rotate: [0, -0.6, 0.5, -0.3, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          layout
          className={`glass-widget island relative mt-6 rounded-[32px] border-2 backdrop-blur-xl overflow-visible ${expanded ? "island-open" : ""}`}
          style={{
            borderColor: warmBorder,
            boxShadow: emberMode
              ? "0 0 40px rgba(245,158,11,0.35), inset 0 0 24px rgba(245,158,11,0.12)"
              : hackerMode
                ? "0 0 34px rgba(34,197,94,0.28), inset 0 0 20px rgba(34,197,94,0.08)"
                : "0 0 34px rgba(34,211,238,0.25), inset 0 0 20px rgba(34,211,238,0.08)",
            background: hackerMode
              ? "linear-gradient(165deg, rgba(2,20,8,0.88), rgba(0,6,2,0.94))"
              : "linear-gradient(165deg, rgba(10,40,55,0.55), rgba(3,8,20,0.88))",
            fontFamily: hackerMode ? "ui-monospace, 'Cascadia Mono', monospace" : "'Segoe UI', system-ui, sans-serif",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          {/* Enveloped Ember particles behind everything */}
          <EmberParticles active={emberMode} />

          {/* ---- Draggable header strip (-webkit-app-region: drag) ---- */}
          <div className="drag-region relative z-30 flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
              <span className="text-[11px] font-bold tracking-[0.2em]" style={{ color: accent }}>
                {hackerMode ? "CLEV.SYS" : "C L E V"}
              </span>
              {emberMode && (
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                  MANUSCRIPT PROTOCOL ACTIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 pointer-events-auto">
              <button title="Settings" onClick={() => setShowSettings((s) => !s)} className="icon-btn">⚙️</button>
              <button title="Shoo away (to tray)" onClick={minimizeToTray} className="icon-btn">🫥</button>
              <button title="Close widget" onClick={closeWidget} className="icon-btn">✕</button>
            </div>
          </div>

          {/* ---- Face zone: click to toggle island expansion ---- */}
          <div className="relative z-10 flex justify-center pt-1 pb-2 cursor-pointer pointer-events-auto"
            onClick={() => setExpanded((e) => !e)}>
            <div className="relative">
              <ClevFace mood={mood} speaking={speaking} hackerMode={hackerMode} audioLevel={audioLevel} />
              {/* Tea cup popup (Mentalist egg) */}
              <AnimatePresence>
                {teaIcon && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: -6, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -right-8 -top-4 text-2xl" style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }}>☕</motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Yap bubbles float around the face */}
          <YapBubbles bubbles={bubbles} />

          {/* Glitched countdown line (1000-7) */}
          <AnimatePresence>
            {glitchText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glitch-text relative z-20 text-center text-sm font-bold text-red-500 tracking-widest mb-1"
                data-text={glitchText}>{glitchText}</motion.div>
            )}
          </AnimatePresence>

          {/* Speaking engine badge + vibe chip row */}
          <div className="relative z-10 px-4 flex items-center gap-2 flex-wrap">
            {speaking && (
              <span className="text-[9px] px-2 py-0.5 rounded-full border animate-pulse" style={{ borderColor: `${accent}66`, color: accent }}>
                🔊 {getActiveVoiceEngine() === "elevenlabs" ? "ELEVENLABS" : "WEB SPEECH"}
              </span>
            )}
            <VibeChip v={vibe} hackerMode={hackerMode} />
          </div>

          {/* ---- Expanded panel ---- */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 space-y-3">
                  {/* Last reply transcript */}
                  {lastReply && (
                    <p className="text-[12px] leading-relaxed text-white/90 max-h-28 overflow-y-auto clev-scroll no-drag">
                      {lastReply}
                    </p>
                  )}

                  {/* Real hardware telemetry (sysinfo via Tauri) */}
                  <TelemetryStrip hackerMode={hackerMode} />

                  {/* Memory matrix peek */}
                  {readMemory().length > 0 && (
                    <details className="text-[10px] text-white/60 no-drag">
                      <summary className="cursor-pointer select-none">🧠 Memory Matrix ({readMemory().length})</summary>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside max-h-20 overflow-y-auto clev-scroll">
                        {readMemory().slice(-8).reverse().map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </details>
                  )}

                  {/* Input bar */}
                  <div className="flex gap-2 no-drag">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder={hackerMode ? "> ./clev --query" : "Talk to Clev… (try \"kaneki\" 😉)"}
                      className="flex-1 text-[12px] px-3 py-2 rounded-xl bg-black/40 border outline-none text-white placeholder:text-white/35 focus:border-current"
                      style={{ borderColor: `${accent}44`, color: hackerMode ? "#4ade80" : "#e0f2fe" }}
                    />
                    <button onClick={send} className="px-3 py-2 rounded-xl text-black text-xs font-bold transition-transform hover:scale-105 active:scale-95"
                      style={{ background: accent, boxShadow: `0 0 14px ${accent}88` }}>
                      ➤
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- Settings popover (API keys) ---- */}
          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute inset-x-4 top-12 z-50 rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur-xl p-3 space-y-2 no-drag">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Companion Keys</p>
                <input id="gk" defaultValue={getKeys().gemini} placeholder="Gemini API key (AIza…)"
                  className="w-full text-[11px] px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white" />
                <input id="ek" defaultValue={getKeys().eleven} placeholder="ElevenLabs key (sk_…) — optional, Web Speech fallback"
                  className="w-full text-[11px] px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white" />
                <div className="flex justify-between">
                  <button onClick={() => { localStorage.removeItem("CLEV_MEMORY_MATRIX"); pushYap("Memory wiped! 🧹", "tip"); }}
                    className="text-[10px] text-red-300/80 hover:text-red-200">Wipe memory</button>
                  <button onClick={() => {
                    const g = (document.getElementById("gk") as HTMLInputElement)?.value ?? "";
                    const e = (document.getElementById("ek") as HTMLInputElement)?.value ?? "";
                    setKeys(g, e); setShowSettings(false);
                    pushYap("Keys saved 🔑", "tip");
                  }} className="text-[11px] font-bold px-3 py-1 rounded-lg" style={{ background: accent, color: "#000" }}>Save</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ember protocol footer banner */}
        {emberMode && (
          <div className="mx-auto mt-2 w-[240px] text-center text-[9px] tracking-[0.15em] text-amber-400/90 animate-pulse">
            [MANUSCRIPT PROTOCOL ACTIVE // ENVELOPED EMBER LINKED]
          </div>
        )}
      </motion.div>
    </div>
  );
}
