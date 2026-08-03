import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Background Grid & Shape FX ---
const BackgroundFX = ({ isHackerMode }: { isHackerMode: boolean }) => {
  const strokeColor = isHackerMode ? 'stroke-green-500/30' : 'stroke-cyan-500/30';
  const borderColor = isHackerMode ? 'border-green-500/30' : 'border-cyan-500/30';
  const dotColor = isHackerMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(6, 182, 212, 0.25)';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px'
        }}
      />
      <motion.div
        className={`absolute top-1/6 left-10 w-56 h-56 border-2 rounded-full ${borderColor}`}
        animate={{ y: [0, -35, 0], x: [0, 25, 0], rotate: [0, 360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute bottom-1/6 right-12 w-44 h-44 border-2 ${borderColor}`}
        animate={{ y: [0, 45, 0], x: [0, -35, 0], rotate: [0, -180] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.svg
        viewBox="0 0 100 100"
        className={`absolute top-1/3 right-1/4 w-36 h-36 fill-transparent stroke-2 ${strokeColor}`}
        animate={{ y: [0, -50, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <polygon points="50,10 90,90 10,90" />
      </motion.svg>
      <motion.div
        className={`absolute bottom-1/3 left-1/4 text-3xl font-mono ${isHackerMode ? 'text-green-500/40' : 'text-cyan-500/40'}`}
        animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 180] }}
        transition={{ duration: 16, repeat: Infinity }}
      >
        +
      </motion.div>
    </div>
  );
};

// --- Retractable Live Hacker Feed Panel ---
const LiveFeedPanel = ({ isOpen, toggle, isHackerMode }: { isOpen: boolean; toggle: () => void; isHackerMode: boolean }) => {
  const [ips, setIps] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const newIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      setIps(prev => [newIp, ...prev].slice(0, 8));
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div 
      className={`fixed right-0 top-0 h-full w-72 bg-black/85 backdrop-blur-md border-l transition-transform duration-500 z-50 font-mono text-xs
      ${isHackerMode ? 'border-green-500/40 text-green-400' : 'border-cyan-500/40 text-cyan-400'}
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <button 
        onClick={toggle}
        className={`absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-black/80 backdrop-blur-md border-y border-l flex items-center justify-center cursor-pointer hover:bg-white/10
        ${isHackerMode ? 'border-green-500/40 text-green-400' : 'border-cyan-500/40 text-cyan-400'}`}
      >
        {isOpen ? '>' : '<'}
      </button>

      <div className="p-4 flex flex-col h-full space-y-4">
        <div className={`border-b pb-2 ${isHackerMode ? 'border-green-500/30' : 'border-cyan-500/30'}`}>
          <span className="tracking-widest font-bold">LIVE_SYSTEM_FEED</span>
        </div>
        
        <div className="space-y-2 opacity-80">
          <p>STATUS: OVERRIDE ENGAGED</p>
          <p>NODE: OMNIVIEW_LINKED</p>
          <p>MEMORY: {Math.floor(Math.random() * 30 + 60)}% UTILIZED</p>
        </div>

        <div className="mt-4 flex-1 overflow-hidden">
          <p className="mb-2 opacity-70">INTERCEPTED PACKETS:</p>
          {ips.map((ip, i) => (
            <p key={i} className="animate-pulse">{'>'} PACKET_IN: {ip}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
export default function App() {
  const [mode, setMode] = useState<'home' | 'clev'>('home');
  const [isHackerMode, setIsHackerMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [clevInput, setClevInput] = useState('');
  const [history, setHistory] = useState([
    { role: 'system', text: '>> CLEV OS v2.0 initialized.' },
    { role: 'system', text: '>> System active. Directives only.' }
  ]);

  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, mode, isLoading]);

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // --- Real AI Query Engine (Gemini API Integration) ---
  const queryAI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return '>> ERROR: VITE_GEMINI_API_KEY not detected in build environment.';
    }

    const systemInstruction = `You are CLEV, a cyberpunk directive-driven AI assistant embedded in a futuristic system terminal HUD.
Rules:
1. Speak concisely, clearly, and directly without corporate politeness or AI disclaimers (no "As an AI language model...").
2. Your tone is dry, confident, tech-focused, and slightly sharp.
3. Keep responses structured, concise, and easy to read inside a CLI terminal window.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser query: ${prompt}` }] }
            ]
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return `>> ${data.candidates[0].content.parts[0].text}`;
      }
      return '>> ERROR: Unable to parse neural directive response.';
    } catch (err) {
      return '>> ERROR: Link to neural query gateway failed.';
    }
  };

  // --- Terminal Command Dispatcher ---
  const handleClevSubmit = async () => {
    if (!clevInput.trim() || isLoading) return;

    const userCommand = clevInput.trim();
    const cleanCmd = userCommand.toLowerCase();

    // Log User Input
    setHistory(prev => [...prev, { role: 'user', text: `> ${userCommand}` }]);
    setClevInput('');

    // Local Command Check: Enable Hacker Mode
    if (cleanCmd === 'hacker mode' || cleanCmd === 'enable hacker mode') {
      setIsHackerMode(true);
      setPanelOpen(true);
      setHistory(prev => [...prev, { role: 'system', text: '>> INITIATING HACKER MODE. GREEN THEME ENGAGED. LIVE NETWORK FEED UNLOCKED.' }]);
      return;
    }

    // Local Command Check: Exit Hacker Mode
    if (cleanCmd === 'exit hacker mode' || cleanCmd === 'disable hacker mode' || cleanCmd === 'reset' || cleanCmd === 'exit') {
      setIsHackerMode(false);
      setPanelOpen(false);
      setHistory(prev => [...prev, { role: 'system', text: '>> DEACTIVATING HACKER MODE. RESTORING STANDARD OPERATIONAL PARAMETERS.' }]);
      return;
    }

    // Local Command Check: Clear Logs
    if (cleanCmd === 'clear' || cleanCmd === 'cls') {
      setHistory([{ role: 'system', text: '>> Terminal buffer flushed.' }]);
      return;
    }

    // Process Query through AI API
    setIsLoading(true);
    const aiResponse = await queryAI(userCommand);
    setIsLoading(false);

    setHistory(prev => [...prev, { role: 'system', text: aiResponse }]);
  };

  // Theme Styling Rules
  const accentText = isHackerMode ? 'text-green-400' : 'text-cyan-400';
  const accentBorder = isHackerMode ? 'border-green-500/40' : 'border-cyan-500/40';
  const accentGlow = isHackerMode ? 'focus-within:border-green-400/80 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'focus-within:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]';

  const bookmarks = [
    { name: 'GitHub', url: 'https://github.com', tag: 'DEV' },
    { name: 'YouTube', url: 'https://youtube.com', tag: 'MEDIA' },
    { name: 'Spotify', url: 'https://open.spotify.com', tag: 'AUDIO' },
    { name: 'Reddit', url: 'https://reddit.com', tag: 'COMM' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative selection:bg-white/20">
      <BackgroundFX isHackerMode={isHackerMode} />
      <LiveFeedPanel isOpen={panelOpen} toggle={() => setPanelOpen(!panelOpen)} isHackerMode={isHackerMode} />

      <main className="relative z-10 max-w-4xl mx-auto h-screen flex flex-col p-6">
        
        {/* --- TOP SWITCHER INDICATOR --- */}
        <div className="flex flex-col items-center justify-center mt-2 mb-6">
          <div className={`flex items-center gap-2 p-1.5 rounded-full border bg-black/60 backdrop-blur-md ${accentBorder}`}>
            <button
              onClick={() => setMode('home')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                mode === 'home'
                  ? `${isHackerMode ? 'bg-green-500 text-black' : 'bg-cyan-500 text-black'} shadow-lg`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              [ HOME ]
            </button>
            <span className="text-zinc-600 text-xs">//</span>
            <button
              onClick={() => setMode('clev')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                mode === 'clev'
                  ? `${isHackerMode ? 'bg-green-500 text-black' : 'bg-cyan-500 text-black'} shadow-lg`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              [ CLEV_AI ]
            </button>
          </div>
        </div>

        {/* --- VIEW SWITCHING CONTENT --- */}
        <AnimatePresence mode="wait">
          {mode === 'home' ? (
            /* ================= HOME PAGE ================= */
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              <div className="text-center">
                <h2 className="text-6xl font-extrabold tracking-widest text-white drop-shadow-md">
                  {currentTime}
                </h2>
                <p className={`text-xs mt-2 tracking-widest ${accentText}`}>
                  SYSTEM_STATUS // OPERATIONAL
                </p>
              </div>

              <form onSubmit={handleHomeSearch} className="w-full max-w-xl">
                <div className={`flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-xl p-4 border transition-all ${accentBorder} ${accentGlow}`}>
                  <span className={`${accentText} font-bold text-sm`}>{'>'}</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query or enter web directive..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-600 text-white"
                    autoFocus
                  />
                  <button type="submit" className={`text-xs px-3 py-1 rounded border ${accentBorder} ${accentText} hover:bg-white/10`}>
                    EXECUTE
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl">
                {bookmarks.map((bm, i) => (
                  <a
                    key={i}
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-3 bg-black/50 backdrop-blur-md border rounded-lg transition-all hover:-translate-y-1 ${accentBorder} hover:border-white/40 flex flex-col justify-between h-20`}
                  >
                    <span className="text-xs text-zinc-500 font-semibold">{bm.tag}</span>
                    <span className="text-sm font-bold text-zinc-200">{bm.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ================= CLEV AI TERMINAL ================= */
            <motion.div
              key="clev"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h1 className={`text-xl font-bold tracking-widest ${accentText}`}>
                    CLEV // SYSTEM_OS
                  </h1>
                  <p className="text-xs text-zinc-500">DIRECTIVE_BASED_AI_NODE</p>
                </div>
                <div className={`text-xs px-3 py-1 border rounded bg-black/60 backdrop-blur-md ${accentBorder} ${accentText}`}>
                  NODE: ACTIVE
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto mb-4 p-4 border bg-black/60 backdrop-blur-md rounded-lg ${accentBorder} space-y-3`}>
                <div className="text-xs text-zinc-500 mb-4 tracking-widest border-b border-white/10 pb-2">
                  NEURAL_LINK_TERMINAL // LOGS
                </div>
                
                {history.map((log, index) => (
                  <p key={index} className={log.role === 'user' ? 'text-zinc-200' : accentText}>
                    {log.text}
                  </p>
                ))}

                {isLoading && (
                  <p className={`${accentText} animate-pulse`}>
                    {">>"} Processing neural link directive...
                  </p>
                )}
                <div ref={endOfHistoryRef} />
              </div>

              <div className={`flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-lg p-3 border transition-colors ${accentBorder} ${accentGlow}`}>
                <div className={`w-2.5 h-2.5 ${isHackerMode ? 'bg-green-400' : 'bg-cyan-400'} animate-pulse rounded-sm`} />
                <input
                  type="text"
                  value={clevInput}
                  onChange={(e) => setClevInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClevSubmit()}
                  placeholder={isLoading ? "Processing..." : "Execute directive..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-600 text-white disabled:opacity-50"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
