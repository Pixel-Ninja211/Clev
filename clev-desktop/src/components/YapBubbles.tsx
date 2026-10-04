// ============================================================
// YapBubbles — "yap" speech popups that burst around Clev's face
// whenever he responds, tips, or reacts.
// ============================================================
import { AnimatePresence, motion } from "framer-motion";
import type { YapBubble as Bubble } from "../types";

const KIND_STYLE: Record<Bubble["kind"], string> = {
  yap: "bg-cyan-400/15 border-cyan-300/50 text-cyan-50",
  tip: "bg-amber-400/15 border-amber-300/50 text-amber-50",
  react: "bg-fuchsia-400/15 border-fuchsia-300/50 text-fuchsia-50",
};

export default function YapBubbles({ bubbles }: { bubbles: Bubble[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 0.4, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: [12, -6, -14] }}
            exit={{ opacity: 0, scale: 0.7, y: -28 }}
            transition={{ duration: 0.45, ease: "backOut" }}
            className={`absolute max-w-[190px] rounded-2xl border px-3 py-1.5 text-[11px] font-semibold leading-snug backdrop-blur-md shadow-lg ${KIND_STYLE[b.kind]}`}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          >
            {/* Tail pointing at the face */}
            <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r backdrop-blur-md"
              style={{ borderColor: "inherit", background: "inherit" }} />
            {b.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
