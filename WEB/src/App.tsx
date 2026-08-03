import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Background Shapes Component ---
const BackgroundFX = ({ isHackerMode }: { isHackerMode: boolean }) => {
  const colorClass = isHackerMode ? 'text-green-500/10' : 'text-cyan-500/10';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      
      {/* Floating Circle */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-64 h-64 border rounded-full ${isHackerMode ? 'border-green-500/10' : 'border-cyan-500/10'}`}
        animate={{ y: [0, -40, 0], x: [0, 30, 0], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Floating Rectangle */}
      <motion.div
        className={`absolute bottom-1/4 right-1/4 w-48 h-48 border ${isHackerMode ? 'border-green-500/10' : 'border-cyan-500/10'}`}
        animate={{ y: [0, 50, 0], x: [0, -40, 0], rotate: [0, -45, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Triangle (SVG) */}
      <motion.svg
        viewBox="0 0 100 100"
        className={`absolute top-1/2 right-1/3 w-32 h-32 fill-transparent stroke-1 ${isHackerMode ? 'stroke-green-500/10' : 'stroke-cyan-500/10'}`}
        animate={{ y: [0, -60, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <polygon points="50,10 90,90 10,90" />
      </motion.svg>
    </div>
  );
};

// --- Live Hacker Panel Component ---
const LiveFeedPanel = ({ isOpen, toggle, isHackerMode }: { isOpen: boolean, toggle: () => void, isHackerMode: boolean }) => {
  const [ips, setIps] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const newIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      setIps(prev => [newIp, ...prev].slice(0, 8)); // Keep last 8 logs
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-72 bg-black/80 backdrop-blur-md border-l transition-transform duration-500 z-50 font-mono text-xs
      ${isHackerMode ? 'border-green-500/30 text-green-400' : 'border-cyan-500/30 text-cyan-400'}
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Toggle Tab */}
      <button 
        onClick={toggle}
        className={`absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-black/80 backdrop-blur-md border-y border-l flex items-center justify-center cursor-pointer hover:bg-white/5
        ${isHackerMode ? 'border-green-500/30 text-green-500' : 'border-cyan-500/30 text-cyan-500'}`}
      >
        {isOpen ? '>' : '<'}
      </button>

      <div className="p-4 flex flex-col h-full space-y-4">
        <div className={`border-b pb-2 ${isHackerMode ? 'border-green-500/30' : 'border-cyan-500/30'}`}>
          <span className="tracking-widest opacity-70">LIVE_SYSTEM_FEED</span>
        </div>
        
        <div className="space-y-2 opacity-80">
          <p>STATUS: OVERRIDE ENGAGED</p>
          <p>NODE: OMNIVIEW_ACTIVE</p>
          <p>MEMORY: {Math.floor(Math.random() * 40 + 60)}% UTILIZED</p>
        </div>

        <div className="mt-4">
          <p className="mb-2 opacity-70">NETWORK TRAFFIC:</p>
          {ips.map((ip, i) => (
            <p key={i} className="animate-pulse">> PACKET_INTERCEPT: {ip}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [input, setInput] = useState('');
  const [isHackerMode, setIsHackerMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  
  const [history, setHistory] = useState([
    { role: 'system', text: '>> Establishing secure connection...' },
    { role: 'system', text: '>> CLEV AI Online. Awaiting parameters.' }
  ]);

  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal when history updates
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommandSubmit = () => {
    if (!input.trim()) return;

    const newHistory = [...history, { role: 'user', text: `> ${input}` }];
    const lowerInput = input.trim().toLowerCase();

    // Hacker Mode Easter Egg Check
    if (lowerInput === 'hacker mode') {
      setIsHackerMode(true);
      setPanelOpen(true);
      newHistory.push({ role: 'system', text: '>> INITIATING HACKER MODE. GREEN THEME APPLIED. SIDE PANEL UNLOCKED.' });
    } else if (lowerInput === 'reset') {
      setIsHackerMode(false);
      setPanelOpen(false);
      newHistory.push({ role: 'system', text: '>> SYSTEM RESET. RESTORING DEFAULT PARAMETERS.' });
    } else {
      // Mock AI Response (until you hook up the Gemini API)
      newHistory.push({ role: 'system', text: `>> Processing directive: ${input}... (AI Hook Pending)` });
    }

    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandSubmit();
    }
  };

  // Dynamic Theme Colors
  const textColor = isHackerMode ? 'text-green-500' : 'text-cyan-500';
  const borderColor = isHackerMode ? 'border-green-500/30' : 'border-cyan-500/30';
  const focusBorderColor = isHackerMode ? 'focus-within:border-green-500/60' : 'focus-within:border-cyan-500/60';

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative selection:bg-white/20">
      <BackgroundFX isHackerMode={isHackerMode} />
      <LiveFeedPanel isOpen={panelOpen} toggle={() => setPanelOpen(!panelOpen)} isHackerMode={isHackerMode} />

      <main className="relative z-10 max-w-4xl mx-auto h-screen flex flex-col p-6">
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-bold tracking-widest ${textColor}`}>
              CLEV // SYSTEM_OS
            </h1>
            <p className="text-xs text-zinc-500 mt-1">SYS: ONLINEMEM: STABLE</p>
          </div>
          
          {/* Now Playing Widget styled from your previous screenshot */}
          <div className={`text-right text-xs p-2 border bg-black/50 backdrop-blur-md rounded ${borderColor}`}>
            <p className="text-zinc-500 mb-1">NOW_PLAYING</p>
            <p className={`${textColor} font-bold`}>Subwoofer Lullaby</p>
            <p className="opacity-70">C418</p>
          </div>
        </header>

        {/* Terminal Area */}
        <div className={`flex-1 overflow-y-auto mb-4 p-4 border bg-black/40 backdrop-blur-sm rounded-lg ${borderColor} space-y-3`}>
          <div className="text-xs text-zinc-500 mb-4 tracking-widest border-b border-white/10 pb-2">
            NEURAL_LINK_TERMINAL
          </div>
          
          {history.map((log, index) => (
            <p key={index} className={log.role === 'user' ? 'text-zinc-300' : textColor}>
              {log.text}
            </p>
          ))}
          <div ref={endOfHistoryRef} />
        </div>

        {/* Input Bar */}
        <div className={`flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-lg p-3 border transition-colors ${borderColor} ${focusBorderColor}`}>
          <div className={`w-3 h-3 ${isHackerMode ? 'bg-green-500' : 'bg-cyan-500'} animate-pulse rounded-sm`} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Execute directive... (Try 'Hacker mode')"
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-600"
            autoFocus
          />
        </div>
      </main>
    </div>
  );
}
