import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DesktopPet — a Grok-style little companion that lives on your HUD.
 * - Waddles along the bottom of the screen, turns around at the edges
 * - Draggable anywhere; if dropped mid-air it falls back down with gravity
 * - Blinking eyes, squash-and-stretch bounce, idle mood animations
 * - Speech bubbles with random chatter + reacts to CLEV events (speak/think/hack)
 */

export type PetMood = 'idle' | 'happy' | 'thinking' | 'hacker' | 'sleepy';

interface Bubble {
  id: number;
  text: string;
}

const CHATTER = [
  'Boop!',
  'I am NEOMO. I live here now.',
  'Did you know? I blink 400 times a day.',
  'Nice HUD. Very cyber. Much neon.',
  'psst... try typing "help" in CLEV',
  '*waddle waddle*',
  '1000 minus 7... hmm...',
  'I vouch for this website.',
  'Don\'t forget to hydrate, operator.',
  'ElevenLabs smells great today.',
  'I saw a packet go by. Cool.',
  'zzZ... just kidding, I\'m awake.',
];

const BODY_BY_MOOD: Record<PetMood, string> = {
  idle: '#22d3ee',
  happy: '#fbbf24',
  thinking: '#a78bfa',
  hacker: '#4ade80',
  sleepy: '#94a3b8',
};

export default function DesktopPet({
  isHackerMode,
  isThinking,
  isSpeaking,
}: {
  isHackerMode: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
}) {
  const [pos, setPos] = useState(() => ({ x: window.innerWidth - 160, y: window.innerHeight - 110 }));
  const [facing, setFacing] = useState<-1 | 1>(-1);
  const [blinking, setBlinking] = useState(false);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [dragging, setDragging] = useState(false);
  const [petted, setPetted] = useState(0);

  const posRef = useRef(pos);
  const velRef = useRef({ vx: 0.35, vy: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const bubbleTimer = useRef<number | undefined>(undefined);
  const bubbleId = useRef(0);

  const PET_SIZE = 72;
  const groundedY = () => window.innerHeight - PET_SIZE - 28;

  const say = (text: string, ms = 3800) => {
    setBubble({ id: ++bubbleId.current, text });
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), ms);
  };

  // --- Position helpers ---
  const clampX = (x: number) => Math.max(8, Math.min(window.innerWidth - PET_SIZE - 8, x));
  const clampY = (y: number) => Math.max(60, Math.min(groundedY(), y));

  const setXY = (x: number, y: number) => {
    const next = { x, y };
    posRef.current = next;
    setPos(next);
  };

  // --- Random idle chatter ---
  useEffect(() => {
    const t = window.setInterval(() => {
      if (!dragging && Math.random() < 0.35) {
        say(CHATTER[Math.floor(Math.random() * CHATTER.length)]);
      }
    }, 11000);
    return () => window.clearInterval(t);
  }, [dragging]);

  // --- React to CLEV events ---
  useEffect(() => {
    if (isThinking) say('Hmm... neural crunching in progress...', 999999);
  }, [isThinking]);

  useEffect(() => {
    if (isSpeaking) say('CLEV is talking! 🎙️', 2600);
  }, [isSpeaking]);

  useEffect(() => {
    if (isHackerMode) say('WHOA. Green mode. I feel dangerous.', 3500);
  }, [isHackerMode]);

  useEffect(() => {
    if (petted > 0 && petted % 5 === 0) say('*purrrr* ...okay that\'s enough', 2500);
    else if (petted > 0) say(['♥', 'hehe', '*wiggle*', 'boop!'][petted % 4], 1500);
  }, [petted]);

  // --- Blinking ---
  useEffect(() => {
    const loop = () => {
      const wait = 2200 + Math.random() * 3500;
      window.setTimeout(() => {
        setBlinking(true);
        window.setTimeout(() => setBlinking(false), 160);
        loop();
      }, wait);
    };
    loop();
  }, []);

  // --- Physics loop: waddle + gravity + edge turn ---
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const p = posRef.current;
      const v = velRef.current;
      const floor = groundedY();

      if (!dragging) {
        let { x, y } = p;
        let moved = false;

        // Gravity while airborne
        if (y < floor - 0.5 || Math.abs(v.vy) > 0.1) {
          v.vy += 0.55;
          y += v.vy;
          if (y >= floor) {
            y = floor;
            v.vy = Math.abs(v.vy) > 4 ? -v.vy * 0.3 : 0; // small bounce settles
          }
          moved = true;
        }

        // Horizontal waddle only when grounded
        if (Math.abs(v.vy) < 0.2 && y >= floor - 0.5) {
          const speed = 0.7 + (petted % 3) * 0.25;
          x += (v.vx > 0 ? 1 : -1) * speed;
          if (x <= 8) { x = 8; v.vx = Math.abs(v.vx); setFacing(1); }
          if (x >= window.innerWidth - PET_SIZE - 8) {
            x = window.innerWidth - PET_SIZE - 8;
            v.vx = -Math.abs(v.vx);
            setFacing(-1);
          }
          moved = true;
        }

        if (moved) setXY(clampX(x), clampY(y));
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dragging, petted]);

  // --- Window resize keeps pet on screen ---
  useEffect(() => {
    const onResize = () => setXY(clampX(posRef.current.x), clampY(posRef.current.y));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // --- Drag handlers (pointer events) ---
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    velRef.current.vy = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setXY(clampX(e.clientX - dragOffset.current.x), clampY(e.clientY - dragOffset.current.y));
  };

  const onPointerUp = () => {
    setDragging(false);
    velRef.current.vy = 0;
    say('Wheee! Gravity incoming.', 1800);
  };

  const mood: PetMood = isHackerMode
    ? 'hacker'
    : isThinking
    ? 'thinking'
    : isSpeaking
    ? 'happy'
    : petted > 0
    ? 'happy'
    : 'idle';

  const body = BODY_BY_MOOD[mood];

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] font-mono">
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            className="absolute"
            style={{ left: pos.x - 60, top: pos.y - 58, maxWidth: 220 }}
          >
            <div className={`relative px-3 py-2 rounded-xl border text-[11px] leading-tight bg-black/85 backdrop-blur-md shadow-[0_0_18px_rgba(6,182,212,0.2)] ${isHackerMode ? 'border-green-500/50 text-green-300' : 'border-cyan-500/50 text-cyan-200'}`}>
              {bubble.text}
              <span className="absolute -bottom-1.5 left-8 w-3 h-3 rotate-45 bg-black border-b border-r border-cyan-500/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        role="button"
        aria-label="Desktop pet NEOMO"
        title="Drag me around! Click to pet."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => setPetted((n) => n + 1)}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ left: pos.x, top: pos.y, width: PET_SIZE, height: PET_SIZE }}
        animate={{
          scaleY: dragging ? 1.05 : [1, 0.94, 1],
          scaleX: dragging ? 0.96 : [1, 1.05, 1],
          rotate: dragging ? 0 : [-3, 3, -3],
        }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Shadow */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 rounded-full bg-black/60 blur-[2px]"
          style={{ width: Math.max(24, PET_SIZE - Math.max(0, groundedY() - pos.y) / 6) }}
        />

        <svg viewBox="0 0 72 72" width={PET_SIZE} height={PET_SIZE} style={{ transform: `scaleX(${facing})` }}>
          {/* antenna */}
          <line x1="36" y1="8" x2="36" y2="2" stroke={body} strokeWidth="2" />
          <circle cx="36" cy="3" r="3" fill={body}>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
          </circle>

          {/* little feet */}
          <ellipse cx="26" cy="66" rx="7" ry="4" fill={body} opacity="0.85">
            <animate attributeName="cy" values="66;63;66" dur="0.6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="46" cy="66" rx="7" ry="4" fill={body} opacity="0.85">
            <animate attributeName="cy" values="63;66;63" dur="0.6s" repeatCount="indefinite" />
          </ellipse>

          {/* body blob */}
          <rect x="8" y="10" width="56" height="52" rx="20" fill="#0b0b0b" stroke={body} strokeWidth="2.5" />
          <rect x="8" y="10" width="56" height="52" rx="20" fill={body} opacity="0.12" />

          {/* face plate */}
          <rect x="16" y="22" width="40" height="22" rx="8" fill="#000" stroke={`${body}55`} strokeWidth="1" />

          {/* eyes rendered as text via foreignObject fallback → simple circles instead */}
          {blinking ? (
            <>
              <line x1="24" y1="33" x2="31" y2="33" stroke={body} strokeWidth="2" strokeLinecap="round" />
              <line x1="41" y1="33" x2="48" y2="33" stroke={body} strokeWidth="2" strokeLinecap="round" />
            </>
          ) : mood === 'thinking' ? (
            <>
              <circle cx="27.5" cy="31" r="3" fill={body}>
                <animate attributeName="cx" values="26;29;26" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="44.5" cy="31" r="3" fill={body}>
                <animate attributeName="cx" values="46;43;46" dur="1.4s" repeatCount="indefinite" />
              </circle>
            </>
          ) : mood === 'hacker' ? (
            <>
              <rect x="22" y="27" width="11" height="9" rx="1" fill="none" stroke={body} strokeWidth="2" />
              <rect x="39" y="27" width="11" height="9" rx="1" fill="none" stroke={body} strokeWidth="2" />
              <line x1="33" y1="31" x2="39" y2="31" stroke={body} strokeWidth="1.5" />
            </>
          ) : (
            <>
              <circle cx="27.5" cy="31" r="3.4" fill={body}>
                <animate attributeName="r" values="3.4;3.9;3.4" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="44.5" cy="31" r="3.4" fill={body} />
              {/* sparkle eye highlight */}
              <circle cx="28.8" cy="29.6" r="1" fill="#fff" opacity="0.9" />
            </>
          )}

          {/* mouth */}
          {mood === 'happy' || mood === 'idle' ? (
            <path d="M31 39 Q36 43 41 39" stroke={body} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          ) : mood === 'thinking' ? (
            <circle cx="36" cy="40" r="1.6" fill={body} />
          ) : (
            <line x1="31" y1="40" x2="41" y2="40" stroke={body} strokeWidth="1.8" strokeLinecap="round" />
          )}

          {/* cheek bolts */}
          <circle cx="18" cy="38" r="1.5" fill={body} opacity="0.5" />
          <circle cx="54" cy="38" r="1.5" fill={body} opacity="0.5" />
        </svg>
      </motion.div>
    </div>
  );
}
