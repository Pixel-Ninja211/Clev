// ============================================================
// EmberParticles — Enveloped Ember Manuscript Protocol FX.
// Glowing amber embers drift up behind Clev while Focus mode is on,
// and the widget gets warm borders + protocol banner.
// Pure CSS/canvas-free: ~24 absolutely-positioned motion dots.
// ============================================================
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function EmberParticles({ active }: { active: boolean }) {
  const embers = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 2.2 + Math.random() * 2.6,
        size: 2 + Math.random() * 4,
        hue: 25 + Math.random() * 25, // amber → fire orange
      })),
    []
  );

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[32px] transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}>
      {embers.map((e) => (
        <motion.div
          key={e.id}
          className="absolute rounded-full"
          style={{
            left: `${e.x}%`,
            bottom: -10,
            width: e.size,
            height: e.size,
            background: `hsl(${e.hue} 100% 60%)`,
            boxShadow: `0 0 ${e.size * 3}px hsl(${e.hue} 100% 55%)`,
          }}
          animate={{ y: [-10, -260], opacity: [0, 1, 1, 0], x: [0, (e.id % 2 ? 14 : -14)] }}
          transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: "easeOut" }}
        />
      ))}
      {/* Warm vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 85%, rgba(245,158,11,0.22), transparent 65%)" }} />
    </div>
  );
}
