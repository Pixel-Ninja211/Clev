import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bookmark {
  id: string;
  name: string;
  url: string;
  tag: string;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: '1', name: 'GitHub', url: 'https://github.com', tag: 'DEV' },
  { id: '2', name: 'YouTube', url: 'https://youtube.com', tag: 'MEDIA' },
  { id: '3', name: 'Spotify', url: 'https://open.spotify.com', tag: 'AUDIO' },
  { id: '4', name: 'Reddit', url: 'https://reddit.com', tag: 'COMM' },
];

// --- Multi-Colored Background Shapes FX ---
const BackgroundFX = ({ isHackerMode }: { isHackerMode: boolean }) => {
  const dotColor = isHackerMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(6, 182, 212, 0.25)';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {/* Dot Grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px'
        }}
      />
      
      {/* Neon Purple Circle */}
      <motion.div
        className="absolute top-1/6 left-10 w-56 h-56 border-2 rounded-full border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
        animate={{ y: [0, -35, 0], x: [0, 25, 0], rotate: [0, 360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />

      {/* Warm Amber Square */}
      <motion.div
        className="absolute bottom-1/6 right-12 w-44 h-44 border-2 border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
        animate={{ y: [0, 45, 0], x: [0, -35, 0], rotate: [0, -180] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {/* NEW: Glowing Indigo Rectangle */}
      <motion.div
        className="absolute top-1/2 left-12 w-64 h-28 border-2 border-indigo-500/30 rounded-lg shadow-[0_0_25px_rgba(99,102,241,0.15)]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pink/Magenta Triangle SVG */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute top-1/3 right-1/4 w-36 h-36 fill-transparent stroke-2 stroke-pink-500/30 drop-shadow-[0_0_10px_rgba(236,72,153,0.2)]"
        animate={{ y: [0, -50, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <polygon points="50,10 90,90 10,90" />
      </motion.svg>

      {/* Gold Plus Crosshair */}
      <motion.div
        className="absolute bottom-1/3 left-1/4 text-3xl font-mono text-yellow-400/40"
        animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 180] }}
        transition={{ duration: 16, repeat: Infinity }}
      >
        +
      </motion.div>
    </div>
  );
};

// --- Terminal Progress Bar & Spinner Loader ---
const TerminalLoader = ({ accentText }: { accentText: string }) => {
  const [frame, setFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % spinnerFrames.length);
      setProgress(p => (p >= 95 ? 95 : p + 5));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const filledBars = Math.floor(progress / 10);
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(10 - filledBars);

  return (
    <div className={`space-y-1.5 ${accentText} my-2 p-3 bg-black/60 border border-white/10 rounded-lg font-mono text-xs`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold animate-spin">{spinnerFrames[frame]}</span>
        <span className="font-bold tracking-wider">NEURAL LINK QUERYING...</span>
        <span className="ml-auto font-bold">{progress}%</span>
      </div>
      <div className="tracking-widest text-[10px] opacity-80">
        [{progressBar}] ALLOCATING BUFFERS & MEMORY MATRIX
      </div>
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

export default function App() {
  const [mode, setMode] = useState<'home' | 'clev'>('home');
  const [isHackerMode, setIsHackerMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [clevInput, setClevInput] = useState('');
  const [history, setHistory] = useState([
    { role: 'system', text: '>> CLEV OS v2.0 initialized.' },
    { role: 'system', text: '>> Neural memory matrix loaded. Type "help" for directives.' }
  ]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('CLEV_BOOKMARKS');
    return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
  });
  const [isEditingBookmarks, setIsEditingBookmarks] = useState(false);
  const [newBmName, setNewBmName] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');
  const [newBmTag, setNewBmTag] = useState('');

  // Memory Matrix State
  const [memories, setMemories] = useState<string[]>(() => {
    const saved = localStorage.getItem('CLEV_MEMORIES');
    return saved ? JSON.parse(saved) : [
      'User prefers concise, high-efficiency responses.',
      'User is engineering the CLEV Web HUD system.'
    ];
  });

  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'GOOD MORNING';
    if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
    if (hour >= 17 && hour < 22) return 'GOOD EVENING';
    return 'GOOD NIGHT';
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('CLEV_BOOKMARKS', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('CLEV_MEMORIES', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, mode, isLoading]);

  // Keyboard Navigation (Arrow Keys Switch Modes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (!isInputActive) {
        if (e.key === 'ArrowLeft') setMode('home');
        if (e.key === 'ArrowRight') setMode('clev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBmName || !newBmUrl) return;
    const formattedUrl = newBmUrl.startsWith('http') ? newBmUrl : `https://${newBmUrl}`;
    const newBm: Bookmark = {
      id: Date.now().toString(),
      name: newBmName,
      url: formattedUrl,
      tag: (newBmTag || 'LINK').toUpperCase()
    };
    setBookmarks([...bookmarks, newBm]);
    setNewBmName('');
    setNewBmUrl('');
    setNewBmTag('');
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  // --- Gemini AI Query Engine ---
  const queryAI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return '>> ERROR: VITE_GEMINI_API_KEY missing in environment variables.';
    }

    const memoryContext = memories.length > 0
      ? `KNOWN USER MEMORIES:\n${memories.map(m => `- ${m}`).join('\n')}`
      : 'NO MEMORIES STORED YET.';

    const systemInstruction = `You are CLEV, an intelligent, sharp, cyberpunk terminal AI assistant.
${memoryContext}

Rules:
1. Speak intelligently, clearly, and directly without AI boilerplate or filler.
2. Do NOT use markdown syntax like asterisks (bold) or hashes (headers). Clean text formatted for terminal screens only.
3. Keep responses smart, concise, and helpful.
4. If the user explicitly asks you to remember something, end your response with: [REMEMBER: <fact to store>]`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser input: ${prompt}` }] }
            ]
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        let text = data.candidates[0].content.parts[0].text;
        
        const rememberMatch = text.match(/\[REMEMBER:\s*(.*?)\]/);
        if (rememberMatch && rememberMatch[1]) {
          const newFact = rememberMatch[1].trim();
          setMemories(prev => [...prev, newFact]);
          text = text.replace(/\[REMEMBER:\s*.*?\]/g, '').trim();
        }

        const cleanText = text.replace(/\*\*/g, '').replace(/###/g, '').trim();
        return `>> ${cleanText}`;
      }
      return '>> ERROR: Neural link returned empty directive payload.';
    } catch (err) {
      return '>> ERROR: Gateway failure.';
    }
  };

  // --- Terminal Command Dispatcher (Includes Easter Eggs) ---
  const handleClevSubmit = async () => {
    if (!clevInput.trim() || isLoading) return;

    const userCommand = clevInput.trim();
    const cleanCmd = userCommand.toLowerCase();

    setHistory(prev => [...prev, { role: 'user', text: `> ${userCommand}` }]);
    setClevInput('');

    // EASTER EGG 1: Help Directive
    if (cleanCmd === 'help' || cleanCmd === 'commands') {
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> CLEV DIRECTIVE CATALOG:\n   - hacker mode / exit\n   - memory list / clear / add <fact>\n   - omniview (Hardware HUD Link)\n   - vinyl (Audio Player Status)\n   - ember (Manuscript Protocol)\n   - matrix / sudo / 1000-7' 
      }]);
      return;
    }

    // EASTER EGG 2: OmniView Hardware Link
    if (cleanCmd === 'omniview') {
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> [OMNIVIEW HUD NODE]\n   Microcontroller: ESP32-S3\n   Voice Link: ONLINE\n   BLE Telemetry: SYNCED\n   Status: Smart glass HUD overlay operational.' 
      }]);
      return;
    }

    // EASTER EGG 3: Vinyl Music Player
    if (cleanCmd === 'vinyl') {
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> [VINYL PLAYER NODE]\n   Audio Engine: Active\n   Current Rotation:\n   1. C418 - Subwoofer Lullaby\n   2. Radiohead - Motion Picture Soundtrack\n   3. Radiohead - Everything In Its Right Place' 
      }]);
      return;
    }

    // EASTER EGG 4: Enveloped Ember
    if (cleanCmd === 'ember' || cleanCmd === 'enveloped ember') {
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> [ENVELOPED EMBER PROTOCOL]\n   "In the cold hush of the dying ash, the ember still burns inside..."\n   Manuscript Status: In progress.' 
      }]);
      return;
    }

    // EASTER EGG 5: Tokyo Ghoul
    if (cleanCmd === '1000-7' || cleanCmd === '1000 - 7' || cleanCmd === 'kaneki') {
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> 993... 986... 979...\n   [ANTEIKU DIRECTIVE OVERRIDE: One-Eyed King recognized.]' 
      }]);
      return;
    }

    // EASTER EGG 6: Sudo Override
    if (cleanCmd.startsWith('sudo')) {
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> CRITICAL WARNING: ROOT ACCESS ATTEMPT DENIED.\n   This incident will be reported to the system administrator.' 
      }]);
      return;
    }

    // EASTER EGG 7: Matrix Mode
    if (cleanCmd === 'matrix') {
      setIsHackerMode(true);
      setPanelOpen(true);
      setHistory(prev => [...prev, { 
        role: 'system', 
        text: '>> [MATRIX OVERRIDE] Following the white rabbit...\n   01000011 01001100 01000101 01010110' 
      }]);
      return;
    }

    // Standard Commands: Hacker Mode
    if (cleanCmd === 'hacker mode' || cleanCmd === 'enable hacker mode') {
      setIsHackerMode(true);
      setPanelOpen(true);
      setHistory(prev => [...prev, { role: 'system', text: '>> INITIATING HACKER MODE. GREEN THEME ENGAGED. LIVE NETWORK FEED UNLOCKED.' }]);
      return;
    }

    if (cleanCmd === 'exit hacker mode' || cleanCmd === 'disable hacker mode' || cleanCmd === 'reset' || cleanCmd === 'exit') {
      setIsHackerMode(false);
      setPanelOpen(false);
      setHistory(prev => [...prev, { role: 'system', text: '>> DEACTIVATING HACKER MODE. RESTORING STANDARD PARAMETERS.' }]);
      return;
    }

    if (cleanCmd === 'clear' || cleanCmd === 'cls') {
      setHistory([{ role: 'system', text: '>> Terminal buffer flushed.' }]);
      return;
    }

    // Memory Commands
    if (cleanCmd === 'memory list' || cleanCmd === 'memories') {
      const memList = memories.length > 0
        ? memories.map((m, i) => `   [${i + 1}] ${m}`).join('\n')
        : '   No stored memories.';
      setHistory(prev => [...prev, { role: 'system', text: `>> ACTIVE MEMORY MATRIX:\n${memList}` }]);
      return;
    }

    if (cleanCmd === 'memory clear') {
      setMemories([]);
      setHistory(prev => [...prev, { role: 'system', text: '>> MEMORY MATRIX WIPED.' }]);
      return;
    }

    if (cleanCmd.startsWith('memory add ')) {
      const fact = userCommand.slice(11).trim();
      if (fact) {
        setMemories(prev => [...prev, fact]);
        setHistory(prev => [...prev, { role: 'system', text: `>> MEMORY STORED: "${fact}"` }]);
      }
      return;
    }

    // --- Execute AI Query with Mandatory 3s Loader ---
    setIsLoading(true);
    const minLoaderDelay = new Promise(resolve => setTimeout(resolve, 3000));
    
    const [aiResponse] = await Promise.all([
      queryAI(userCommand),
      minLoaderDelay
    ]);

    setIsLoading(false);
    setHistory(prev => [...prev, { role: 'system', text: aiResponse }]);
  };

  const accentText = isHackerMode ? 'text-green-400' : 'text-cyan-400';
  const accentBorder = isHackerMode ? 'border-green-500/40' : 'border-cyan-500/40';
  const accentGlow = isHackerMode ? 'focus-within:border-green-400/80 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'focus-within:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]';

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative selection:bg-white/20">
      <BackgroundFX isHackerMode={isHackerMode} />
      <LiveFeedPanel isOpen={panelOpen} toggle={() => setPanelOpen(!panelOpen)} isHackerMode={isHackerMode} />

      <main className="relative z-10 max-w-4xl mx-auto h-screen flex flex-col p-6">
        
        {/* MODE SWITCHER */}
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
            <span className="text-zinc-600 text-xs">← / →</span>
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

        {/* VIEW CONTENT */}
        <AnimatePresence mode="wait">
          {mode === 'home' ? (
            /* HOME PAGE */
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="text-center">
                <p className={`text-xs font-bold tracking-widest mb-1 ${accentText}`}>
                  {getGreeting()}
                </p>
                <h2 className="text-6xl font-extrabold tracking-widest text-white drop-shadow-md">
                  {currentTime.toLocaleTimeString()}
                </h2>
                <p className="text-xs mt-2 tracking-widest text-zinc-500">
                  SYSTEM_STATUS // OPERATIONAL
                </p>
              </div>

              {/* Search Bar */}
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

              {/* Bookmarks Bar */}
              <div className="w-full max-w-xl flex justify-between items-center px-1">
                <span className="text-xs text-zinc-500 tracking-wider">SPEED_DIAL_NODES</span>
                <button
                  onClick={() => setIsEditingBookmarks(!isEditingBookmarks)}
                  className={`text-xs underline ${accentText} hover:opacity-80 cursor-pointer`}
                >
                  {isEditingBookmarks ? '[ DONE ]' : '[ EDIT SITES ]'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl">
                {bookmarks.map((bm) => (
                  <div key={bm.id} className="relative group">
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-3 bg-black/50 backdrop-blur-md border rounded-lg transition-all hover:-translate-y-1 ${accentBorder} hover:border-white/40 flex flex-col justify-between h-20 block`}
                    >
                      <span className="text-xs text-zinc-500 font-semibold">{bm.tag}</span>
                      <span className="text-sm font-bold text-zinc-200 truncate">{bm.name}</span>
                    </a>
                    {isEditingBookmarks && (
                      <button
                        onClick={() => handleDeleteBookmark(bm.id)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditingBookmarks && (
                <form onSubmit={handleAddBookmark} className={`w-full max-w-xl p-4 border rounded-lg bg-black/80 backdrop-blur-md ${accentBorder} space-y-3`}>
                  <p className="text-xs font-bold text-zinc-400">ADD NEW DIRECTIVE LINK</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. GitHub)"
                      value={newBmName}
                      onChange={(e) => setNewBmName(e.target.value)}
                      className="bg-black/60 border border-zinc-700 rounded p-2 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. github.com)"
                      value={newBmUrl}
                      onChange={(e) => setNewBmUrl(e.target.value)}
                      className="bg-black/60 border border-zinc-700 rounded p-2 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Tag (e.g. DEV)"
                      value={newBmTag}
                      onChange={(e) => setNewBmTag(e.target.value)}
                      className="bg-black/60 border border-zinc-700 rounded p-2 text-xs text-white outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-1.5 text-xs font-bold border rounded ${accentBorder} ${accentText} hover:bg-white/10`}
                  >
                    + ADD SITE
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            /* CLEV TERMINAL */
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
                  MEMORIES: {memories.length} ACTIVE
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto mb-4 p-4 border bg-black/60 backdrop-blur-md rounded-lg ${accentBorder} space-y-3`}>
                <div className="text-xs text-zinc-500 mb-4 tracking-widest border-b border-white/10 pb-2">
                  NEURAL_LINK_TERMINAL // LOGS
                </div>
                
                {history.map((log, index) => (
                  <p key={index} className={`whitespace-pre-wrap ${log.role === 'user' ? 'text-zinc-200' : accentText}`}>
                    {log.text}
                  </p>
                ))}

                {isLoading && <TerminalLoader accentText={accentText} />}
                <div ref={endOfHistoryRef} />
              </div>

              <div className={`flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-lg p-3 border transition-colors ${accentBorder} ${accentGlow}`}>
                <div className={`w-2.5 h-2.5 ${isHackerMode ? 'bg-green-400' : 'bg-cyan-400'} animate-pulse rounded-sm`} />
                <input
                  type="text"
                  value={clevInput}
                  onChange={(e) => setClevInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClevSubmit()}
                  placeholder={isLoading ? "Neural network processing..." : "Execute directive... (Try 'help' or 'omniview')"}
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
