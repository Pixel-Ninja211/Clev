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

// --- Initial Website Boot Splash Screen ---
const BootLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    'INITIALIZING NEURAL CORE...',
    'ALLOCATING MEMORY MATRIX BUFFERS...',
    'ESTABLISHING OMNIVIEW TELEMETRY LINK...',
    'SYNCHRONIZING SPEECH SYNTHESIS ENGINE...',
    'SYSTEM BOOT COMPLETE. ENGAGING CLEV AI...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    const logTimer = setInterval(() => {
      setLogIndex(prev => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  const filledBars = Math.floor(progress / 5);
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(20 - filledBars);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-cyan-400 p-6 selection:bg-cyan-500/30">
      <div className="max-w-md w-full space-y-4 text-xs">
        <div className="border border-cyan-500/40 p-4 rounded bg-cyan-950/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <p className="font-bold text-sm tracking-widest text-white mb-2">CLEV AI // SYSTEM BOOT</p>
          <p className="text-zinc-400">BUILD: v2.0.4-NEURAL</p>
          <div className="my-4 h-12 flex flex-col justify-end text-cyan-300">
            <p className="animate-pulse">{'>'} {logs[logIndex]}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>BOOT_SEQUENCE</span>
              <span>{progress}%</span>
            </div>
            <p className="tracking-wider text-cyan-400 font-bold">[{progressBar}]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Multi-Colored Background Shapes FX ---
const BackgroundFX = ({ isHackerMode }: { isHackerMode: boolean }) => {
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

      {/* Glowing Indigo Rectangle */}
      <motion.div
        className="absolute top-1/2 left-12 w-64 h-28 border-2 border-indigo-500/30 rounded-lg shadow-[0_0_25px_rgba(99,102,241,0.15)]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pink/Magenta Triangle */}
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

// --- Braille Query Processing Loader ---
const BrailleQueryLoader = ({ accentText }: { accentText: string }) => {
  const [frame, setFrame] = useState(0);
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % spinnerFrames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${accentText} my-2 p-3 bg-black/60 border border-white/10 rounded-lg font-mono text-xs animate-pulse`}>
      <span className="text-base font-bold">{spinnerFrames[frame]}</span>
      <span className="tracking-wider">NEURAL LINK PROCESSING DIRECTIVE...</span>
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
  const [isBooting, setIsBooting] = useState(true);
  const [mode, setMode] = useState<'home' | 'clev'>('home');
  const [isHackerMode, setIsHackerMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [clevInput, setClevInput] = useState('');
  const [history, setHistory] = useState([
    { role: 'system', text: '>> CLEV AI v2.0 initialized.' },
    { role: 'system', text: '>> Neural memory loaded. Voice synthesis ready. Type "help" for directives.' }
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

  // JARVIS-inspired Voice Engine (Text to Speech)
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean text for natural speech
    const cleanSpeech = text
      .replace(/^>>\s*/, '')
      .replace(/[\[\]\(\)\/\\#\*\-_>]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 0.95; // Deep/Calm tone

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.includes('en') && (v.name.includes('UK') || v.name.includes('Daniel') || v.name.includes('Male') || v.name.includes('Google UK English Male'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
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

  // Keyboard Navigation (Arrow Keys)
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

    const systemInstruction = `You are CLEV, a sharp, intelligent, JARVIS-inspired AI assistant.
${memoryContext}

Rules:
1. Speak clearly, politely yet direct, smart, and with calm confidence.
2. Do NOT use markdown symbols like asterisks (**bold**) or hashes (###). Output clean CLI terminal text.
3. Keep responses concise and focused.
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

  // --- Terminal Command Dispatcher ---
  const handleClevSubmit = async () => {
    if (!clevInput.trim() || isLoading) return;

    const userCommand = clevInput.trim();
    const cleanCmd = userCommand.toLowerCase();

    setHistory(prev => [...prev, { role: 'user', text: `> ${userCommand}` }]);
    setClevInput('');

    // EASTER EGG 1: JARVIS Reference
    if (cleanCmd.includes('jarvis') || cleanCmd.includes('stark') || cleanCmd === 'sir') {
      const jarvisText = '>> At your service, Sir. While I am CLEV, I hold high respect for Mr. Stark\'s architecture. All core systems operational.';
      setHistory(prev => [...prev, { role: 'system', text: jarvisText }]);
      speakText(jarvisText);
      return;
    }

    // EASTER EGG 2: Mentalist Reference (Patrick Jane & Red John)
    if (cleanCmd.includes('mentalist') || cleanCmd.includes('patrick jane') || cleanCmd.includes('red john') || cleanCmd.includes('tea')) {
      const mentalistText = '>> "There is no such thing as magic. Only observation, manipulation, and a warm cup of Lapsang souchong tea." -- Mentalist Protocol Engaged.';
      setHistory(prev => [...prev, { role: 'system', text: mentalistText }]);
      speakText(mentalistText);
      return;
    }

    // EASTER EGG 3: Help Directive
    if (cleanCmd === 'help' || cleanCmd === 'commands') {
      const helpText = '>> CLEV AI DIRECTIVE CATALOG:\n   - jarvis / mentalist (Special protocols)\n   - hacker mode / exit\n   - memory list / clear / add <fact>\n   - omniview (Hardware HUD Link)\n   - vinyl (Audio Player Node)\n   - ember (Manuscript Protocol)\n   - 1000-7 / matrix / sudo';
      setHistory(prev => [...prev, { role: 'system', text: helpText }]);
      speakText('Catalog printed to terminal window.');
      return;
    }

    // EASTER EGG 4: OmniView Hardware Link
    if (cleanCmd === 'omniview') {
      const omniText = '>> [OMNIVIEW HARDWARE LINK]\n   Microcontroller: ESP32-S3\n   Voice Assistant: CLEV_LINKED\n   BLE Telemetry: SYNCED\n   Status: Smart glass HUD overlay operational.';
      setHistory(prev => [...prev, { role: 'system', text: omniText }]);
      speakText(omniText);
      return;
    }

    // EASTER EGG 5: Vinyl Music Player
    if (cleanCmd === 'vinyl') {
      const vinylText = '>> [VINYL PLAYER NODE]\n   Audio Engine: Active\n   Current Rotation: C418 and Radiohead tracklists loaded.';
      setHistory(prev => [...prev, { role: 'system', text: vinylText }]);
      speakText(vinylText);
      return;
    }

    // EASTER EGG 6: Enveloped Ember
    if (cleanCmd === 'ember' || cleanCmd === 'enveloped ember') {
      const emberText = '>> [ENVELOPED EMBER PROTOCOL]\n   "In the cold hush of the dying ash, the ember still burns inside..."';
      setHistory(prev => [...prev, { role: 'system', text: emberText }]);
      speakText(emberText);
      return;
    }

    // EASTER EGG 7: Tokyo Ghoul
    if (cleanCmd === '1000-7' || cleanCmd === '1000 - 7' || cleanCmd === 'kaneki') {
      const ghoulText = '>> 993... 986... 979... Anteiku override engaged.';
      setHistory(prev => [...prev, { role: 'system', text: ghoulText }]);
      speakText(ghoulText);
      return;
    }

    // Local Commands
    if (cleanCmd === 'hacker mode') {
      setIsHackerMode(true);
      setPanelOpen(true);
      const msg = '>> INITIATING HACKER MODE. GREEN THEME ENGAGED.';
      setHistory(prev => [...prev, { role: 'system', text: msg }]);
      speakText(msg);
      return;
    }

    if (cleanCmd === 'exit hacker mode' || cleanCmd === 'exit' || cleanCmd === 'reset') {
      setIsHackerMode(false);
      setPanelOpen(false);
      const msg = '>> DEACTIVATING HACKER MODE. RESTORING STANDARD PARAMETERS.';
      setHistory(prev => [...prev, { role: 'system', text: msg }]);
      speakText(msg);
      return;
    }

    if (cleanCmd === 'clear' || cleanCmd === 'cls') {
      setHistory([{ role: 'system', text: '>> Terminal buffer flushed.' }]);
      return;
    }

    if (cleanCmd === 'memory list' || cleanCmd === 'memories') {
      const memList = memories.length > 0
        ? memories.map((m, i) => `   [${i + 1}] ${m}`).join('\n')
        : '   No stored memories.';
      setHistory(prev => [...prev, { role: 'system', text: `>> ACTIVE MEMORY MATRIX:\n${memList}` }]);
      speakText(`Active memory matrix loaded. You have ${memories.length} stored memories.`);
      return;
    }

    // --- AI Query Execution ---
    setIsLoading(true);
    const minLoaderDelay = new Promise(resolve => setTimeout(resolve, 3000));
    
    const [aiResponse] = await Promise.all([
      queryAI(userCommand),
      minLoaderDelay
    ]);

    setIsLoading(false);
    setHistory(prev => [...prev, { role: 'system', text: aiResponse }]);
    speakText(aiResponse);
  };

  const accentText = isHackerMode ? 'text-green-400' : 'text-cyan-400';
  const accentBorder = isHackerMode ? 'border-green-500/40' : 'border-cyan-500/40';
  const accentGlow = isHackerMode ? 'focus-within:border-green-400/80 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'focus-within:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]';

  if (isBooting) {
    return <BootLoader onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative selection:bg-white/20">
      <BackgroundFX isHackerMode={isHackerMode} />
      <LiveFeedPanel isOpen={panelOpen} toggle={() => setPanelOpen(!panelOpen)} isHackerMode={isHackerMode} />

      <main className="relative z-10 max-w-4xl mx-auto h-screen flex flex-col p-6">
        
        {/* TOP BAR SWITCHER & VOICE TOGGLE */}
        <div className="flex flex-col items-center justify-center mt-2 mb-6 gap-3">
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

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`text-[10px] tracking-widest px-3 py-1 border rounded-full bg-black/60 backdrop-blur-md cursor-pointer transition-all ${
              speechEnabled ? `${accentBorder} ${accentText}` : 'border-zinc-800 text-zinc-600'
            }`}
          >
            🔊 AUDIO: {speechEnabled ? 'ACTIVE (JARVIS VOICE)' : 'MUTED'}
          </button>
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
                  SYSTEM_AI // OPERATIONAL
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
                    CLEV // SYSTEM_AI
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

                {isLoading && <BrailleQueryLoader accentText={accentText} />}
                <div ref={endOfHistoryRef} />
              </div>

              <div className={`flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-lg p-3 border transition-colors ${accentBorder} ${accentGlow}`}>
                <div className={`w-2.5 h-2.5 ${isHackerMode ? 'bg-green-400' : 'bg-cyan-400'} animate-pulse rounded-sm`} />
                <input
                  type="text"
                  value={clevInput}
                  onChange={(e) => setClevInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClevSubmit()}
                  placeholder={isLoading ? "Neural processing..." : "Execute directive... (Try 'jarvis', 'mentalist', or 'help')"}
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
