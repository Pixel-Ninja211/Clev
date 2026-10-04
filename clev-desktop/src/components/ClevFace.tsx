// ============================================================
// ClevFace — the unified animated companion body.
// NEOMO's pet face states are merged directly into the widget:
// blinking, bouncing, thinking swirls, kagune flash, EQ eyes,
// binary-glyph matrix eyes, softened empathic lids, etc.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mood } from "../types";

interface Props {
  mood: Mood;
  speaking: boolean;
  hackerMode: boolean;
  /** 0..1 live audio level for equalizer / vibe bounce */
  audioLevel?: number;
}

const ACCENT = (hacker: boolean, mood: Mood) => {
  if (mood === "kagune") return "#ef4444";
  if (mood === "observer") return hacker ? "#4ade80" : "#f59e0b";
  return hacker ? "#22c55e" : "#22d3ee";
};

/** One eye rendered per mood. */
function Eye({ side, mood, blink, accent, level }: { side: -1 | 1; mood: Mood; blink: boolean; accent: string; level: number }) {
  if (blink && mood !== "matrix" && mood !== "equalizer") {
    // Blink → a simple horizontal lid line
    return <div className="absolute rounded-full" style={{ [side < 0 ? "left" : "right"]: 26, top: 44, width: 30, height: 4, background: accent, boxShadow: `0 0 10px ${accent}` } as React.CSSProperties} />;
  }

  switch (mood) {
    case "happy": // ^‿^ happy arcs
      return (
        <div className="absolute" style={{ [side < 0 ? "left" : "right"]: 24, top: 34 } as React.CSSProperties}>
          <div style={{ width: 34, height: 17, borderBottom: `5px solid ${accent}`, borderRadius: "0 0 34px 34px", filter: `drop-shadow(0 0 6px ${accent})` }} />
        </div>
      );
    case "excited": // star sparkles
      return (
        <motion.div
          className="absolute text-2xl select-none"
          style={{ [side < 0 ? "left" : "right"]: 22, top: 30, color: accent, textShadow: `0 0 12px ${accent}` } as React.CSSProperties}
          animate={{ rotate: [0, 180, 360], scale: [1, 1.25, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        >✦</motion.div>
      );
    case "chill": // half-lidded soft eyes
      return (
        <div className="absolute" style={{ [side < 0 ? "left" : "right"]: 26, top: 42 } as React.CSSProperties}>
          <div style={{ width: 26, height: 12, background: accent, borderRadius: "12px 12px 6px 6px", opacity: 0.85, boxShadow: `0 0 10px ${accent}66` }} />
        </div>
      );
    case "empathic": // big caring ◕ with soft shine
      return (
        <div className="absolute" style={{ [side < 0 ? "left" : "right"]: 24, top: 32 } as React.CSSProperties}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${accent}33`, border: `3px solid ${accent}` }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: accent, margin: "6px auto 0" }} />
          </div>
        </div>
      );
    case "thinking": // scanning dots
      return (
        <motion.div className="absolute flex gap-1" style={{ [side < 0 ? "left" : "right"]: 26, top: 44 } as React.CSSProperties}
          animate={{ x: [-3, 3, -3] }} transition={{ duration: 1.1, repeat: Infinity }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: accent, animationDelay: `${i * 0.15}s` }} />)}
        </motion.div>
      );
    case "kagune": // red flashing sharp eyes
      return (
        <motion.div className="absolute" style={{ [side < 0 ? "left" : "right"]: 24, top: 36 } as React.CSSProperties}
          animate={{ opacity: [1, 0.35, 1], scale: [1, 1.15, 1] }} transition={{ duration: 0.35, repeat: Infinity }}>
          <div style={{ width: 32, height: 14, background: "#dc2626", clipPath: "polygon(0 50%, 100% 0, 100% 100%)", transform: side < 0 ? "none" : "scaleX(-1)", boxShadow: "0 0 16px #ef4444" }} />
        </motion.div>
      );
    case "observer": // sharp narrowed observant eyes
      return (
        <div className="absolute" style={{ [side < 0 ? "left" : "right"]: 24, top: 42 } as React.CSSProperties}>
          <div style={{ width: 34, height: 8, background: accent, borderRadius: 4, transform: `skewY(${side * -6}deg)`, boxShadow: `0 0 10px ${accent}` }} />
          <div style={{ width: 10, height: 3, background: "#dc2626", marginTop: 3, marginLeft: side < 0 ? 2 : undefined, marginRight: side < 0 ? undefined : 2, borderRadius: 2 }} />
        </div>
      );
    case "equalizer": // bouncing EQ bars driven by `level`
      return (
        <div className="absolute flex items-end gap-[3px]" style={{ [side < 0 ? "left" : "right"]: 22, top: 30, height: 38 } as React.CSSProperties}>
          {[0.55, 0.9, 0.7, 1].map((k, i) => (
            <div key={i} style={{ width: 6, borderRadius: 2, background: accent, boxShadow: `0 0 8px ${accent}`, height: `${Math.max(6, Math.min(38, 8 + level * 40 * k))}px`, transition: "height 90ms linear" }} />
          ))}
        </div>
      );
    case "matrix": // binary glyph columns
      return (
        <div className="absolute font-mono text-[11px] leading-[13px] text-center" style={{ [side < 0 ? "left" : "right"]: 22, top: 24, width: 34, color: "#22c55e", textShadow: "0 0 8px #22c55e" } as React.CSSProperties}>
          <BinaryGlyphs />
        </div>
      );
    default: // idle → round pupils that gently track nothing, very alive
      return (
        <motion.div className="absolute" style={{ [side < 0 ? "left" : "right"]: 26, top: 34 } as React.CSSProperties}
          animate={{ y: [0, -2, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: accent, boxShadow: `0 0 14px ${accent}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", margin: "5px 0 0 5px", opacity: 0.9 }} />
          </div>
        </motion.div>
      );
  }
}

function BinaryGlyphs() {
  const [glyphs, setGlyphs] = useState("011\n101\n010");
  useEffect(() => {
    const id = setInterval(() => {
      const rnd = () => Array.from({ length: 3 }, () => (Math.random() > 0.5 ? "1" : "0")).join("");
      setGlyphs(`${rnd()}\n${rnd()}\n${rnd()}`);
    }, 180);
    return () => clearInterval(id);
  }, []);
  return <pre style={{ whiteSpace: "pre-line", fontFamily: "inherit" }}>{glyphs}</pre>;
}

export default function ClevFace({ mood, speaking, hackerMode, audioLevel = 0 }: Props) {
  const [blink, setBlink] = useState(false);
  const accent = ACCENT(hackerMode, mood);

  // Natural random blinking every 2.5–6s (kept in all moods except matrix/eq)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (mood !== "matrix" && mood !== "equalizer") {
          setBlink(true);
          setTimeout(() => setBlink(false), 140);
        }
        loop();
      }, 2500 + Math.random() * 3500);
    };
    loop();
    return () => clearTimeout(t);
  }, [mood]);

  // Mouth shape per mood + talking wobble
  const mouth = (() => {
    switch (mood) {
      case "happy": return { w: 34, h: 16, r: "0 0 34px 34px", label: "big smile" };
      case "excited": return { w: 26, h: 22, r: "50%", label: "open cheer" };
      case "chill": return { w: 22, h: 5, r: 4, label: "content line" };
      case "empathic": return { w: 20, h: 8, r: "8px 8px 12px 12px", label: "soft comfort" };
      case "thinking": return { w: 14, h: 14, r: "50%", label: "hmm o" };
      case "kagune": return { w: 40, h: 12, r: "0 0 40px 40px", label: "hungry grin" };
      case "observer": return { w: 26, h: 4, r: 3, label: "knowing smirk" };
      case "matrix": return { w: 30, h: 6, r: 3, label: "terminal underscore" };
      default: return { w: 28, h: 13, r: "0 0 28px 28px", label: "gentle smile" };
    }
  })();

  // Bounce energy: excited/happy bounce harder; chill barely moves
  const bounce = mood === "excited" || mood === "happy" ? 7 : mood === "chill" || mood === "empathic" ? 2 : 4;
  const dur = mood === "excited" ? 0.45 : mood === "happy" ? 0.7 : 1.6;

  return (
    <motion.div
      className="relative"
      style={{ width: 120, height: 104 }}
      animate={{ y: [0, -bounce, 0], scaleY: speaking ? [1, 1.03, 0.99, 1] : [1, 1.01, 1] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow aura */}
      <div className="absolute -inset-4 rounded-[36px] blur-2xl opacity-60" style={{ background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)` }} />

      {/* Head shell (glass) */}
      <div
        className="absolute inset-0 rounded-[30px] border backdrop-blur-md"
        style={{
          background: hackerMode ? "linear-gradient(160deg, rgba(2,24,8,0.85), rgba(0,8,2,0.92))" : "linear-gradient(160deg, rgba(8,51,68,0.55), rgba(2,6,23,0.85))",
          borderColor: `${accent}88`,
          boxShadow: `0 0 24px ${accent}44, inset 0 0 18px ${accent}22`,
        }}
      />

      {/* Eyes */}
      <Eye side={-1} mood={mood} blink={blink} accent={accent} level={audioLevel} />
      <Eye side={1} mood={mood} blink={blink} accent={accent} level={audioLevel} />

      {/* Mouth — pulses while speaking */}
      <motion.div
        className="absolute left-1/2"
        style={{ top: 66, marginLeft: -mouth.w / 2, width: mouth.w, height: mouth.h, borderRadius: mouth.r, background: accent, boxShadow: `0 0 12px ${accent}` }}
        animate={speaking ? { scaleY: [1, 1.7, 0.8, 1.4, 1], scaleX: [1, 0.9, 1.05, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.32, repeat: speaking ? Infinity : 0 }}
      />

      {/* Cheek blush when jolly */}
      {(mood === "happy" || mood === "excited") && (
        <>
          <div className="absolute rounded-full" style={{ left: 12, top: 58, width: 14, height: 7, background: "#f472b666" }} />
          <div className="absolute rounded-full" style={{ right: 12, top: 58, width: 14, height: 7, background: "#f472b666" }} />
        </>
      )}

      {/* Red John subtle mark for observer mode */}
      <AnimatePresence>
        {mood === "observer" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
            className="absolute" style={{ right: 14, top: 12, width: 10, height: 10, borderRadius: "50%", border: "2px solid #dc2626", boxShadow: "0 0 8px #dc2626" }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
