import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SymmetricWave } from './components/Loader';

// ==========================================
// MODULAR COMPONENTS
// ==========================================
function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 z-[-2] bg-zinc-950 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-dot-matrix opacity-20 mask-image-radial" />
      <div className="ambient-shape w-[600px] h-[600px] bg-cyan-900/20 rounded-full top-[-10%] left-[-10%]" />
      <div className="ambient-shape w-[400px] h-[400px] bg-blue-900/20 rounded-full bottom-[10%] right-[10%]" style={{ animationDelay: '-5s' }} />
    </div>
  );
}

function Header() {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-between items-center mb-8 border-b border-white/10 pb-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-md">
          <span className="text-black text-xl font-bold">C</span>
        </div>
        <h1 className="text-xl tracking-widest text-zinc-200">CLEV // SYSTEM_OS</h1>
      </div>
      <div className="flex gap-4 text-xs tracking-wider text-zinc-500">
        <span className="px-3 py-1 bg-white/5 rounded border border-white/10">SYS: ONLINE</span>
        <span className="px-3 py-1 bg-white/5 rounded border border-white/10">MEM: STABLE</span>
      </div>
    </motion.header>
  );
}

function AiTerminal() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-2 border border-white/10 bg-black/40 backdrop-blur-xl rounded-xl p-6 flex flex-col h-[500px] shadow-2xl relative"
    >
      <div className="text-xs text-zinc-500 mb-4 tracking-widest border-b border-white/10 pb-2">NEURAL_LINK_TERMINAL</div>
      <div className="flex-1 overflow-y-auto space-y-3 text-sm text-zinc-300">
        <p className="text-cyan-500">>> Establishing secure connection...</p>
        <p className="text-cyan-500">>> CLEV AI Online. Awaiting parameters.</p>
      </div>
      <div className="mt-4 flex gap-3 items-center bg-white/5 rounded-lg p-3 border border-white/10 transition-colors focus-within:border-white/30">
        <span className="text-zinc-500 animate-pulse">■</span>
        <input 
          type="text" 
          className="bg-transparent outline-none flex-1 text-zinc-200 placeholder-zinc-700"
          placeholder="Execute directive..."
        />
      </div>
    </motion.div>
  );
}

function MediaCard({ mediaData }: { mediaData: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
      className="border border-white/10 bg-black/40 backdrop-blur-xl rounded-xl p-6 flex flex-col shadow-2xl"
    >
      <div className="text-xs text-zinc-500 mb-4 tracking-widest">NOW_PLAYING</div>
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-2">
        <div className="w-24 h-24 rounded-full border-2 border-white/10 border-t-cyan-500 animate-[spin_4s_linear_infinite]" />
        <h3 className="mt-4 text-lg text-zinc-200 font-bold tracking-wide">{mediaData?.title || 'Awaiting Signal...'}</h3>
        <p className="text-sm text-zinc-500">{mediaData?.artist || 'Unknown Source'}</p>
      </div>
      <div className="h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-white/50 w-1/3 rounded-full" />
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN APP ENGINE
// ==========================================
export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [mediaData, setMediaData] = useState({ title: "Subwoofer Lullaby", artist: "C418", isPlaying: true });

  useEffect(() => {
    // Web HUD Boot Sequence
    const timer = setTimeout(() => setIsBooting(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col text-zinc-200">
      <BackgroundCanvas />
      
      <AnimatePresence mode="wait">
        {isBooting ? (
          <motion.div 
            key="loader"
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-50"
          >
            <img src="/logo-placeholder.png" alt="CLEV" className="w-16 h-16 opacity-80" onError={(e) => e.currentTarget.style.display='none'} />
            <SymmetricWave className="text-cyan-500 scale-150" />
            <div className="text-zinc-600 text-xs tracking-[0.3em] uppercase">Initializing Subsystems</div>
          </motion.div>
        ) : (
          <motion.div 
            key="hud"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            className="flex flex-col h-full max-w-6xl w-full mx-auto p-8 z-10"
          >
            <Header />
            <div className="grid grid-cols-3 gap-6 flex-1">
              <AiTerminal />
              <MediaCard mediaData={mediaData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
