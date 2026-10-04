<div align="center">

# ⚡ CLEV AI // SYSTEM HUD

**A neon-cyberpunk terminal homepage & JARVIS-style AI assistant that lives in your browser.**

Gemini-powered chat · ElevenLabs voice · live system telemetry · speed-dial bookmarks · and a waddling desktop pet named **NEOMO**.

*Boots with a retro CRT startup sequence. Runs on Vite + React + Tailwind + Framer Motion. Deploys itself to GitHub Pages.*

[![Deploy](https://img.shields.io/github/actions/workflow/status/<user>/<repo>/deploy.yml?label=deploy&style=for-the-badge&logo=github&color=06b6d4)](../../actions/workflows/deploy.yml)
![Build](https://img.shields.io/badge/build-vite%20%7C%20react%2018-61dafb?style=for-the-badge&logo=vite&logoColor=white)
![AI](https://img.shields.io/badge/AI-gemini--2.5--flash-8a2be2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Voice](https://img.shields.io/badge/voice-elevenlabs-fbbf24?style=for-the-badge&logo=elevenlabs&logoColor=black)
![Pet](https://img.shields.io/badge/pet-NEOMO%20%E2%97%AF%20%E2%97%BF-4ade80?style=for-the-badge)

```
╔══════════════════════════════════════════════════════╗
║  INITIALIZING NEURAL CORE...              ████████░░ ║
║  ESTABLISHING OMNIVIEW TELEMETRY LINK...  100% READY ║
║  > _                                                 ║
╚══════════════════════════════════════════════════════╝
```

</div>

---

## 🧭 Table of Contents

- [What is this?](#-what-is-this)
- [Features](#-features)
- [🐾 Meet NEOMO, the desktop pet](#-meet-neomo-the-desktop-pet)
- [🔊 Voice engine (fixed!)](#-voice-engine-fixed)
- [Terminal commands & easter eggs](#-terminal-commands--easter-eggs)
- [Quick start](#-quick-start)
- [Environment variables](#-environment-variables)
- [Project structure](#-project-structure)
- [Auto-deploy to GitHub Pages](#-auto-deploy-to-github-pages)
- [Tech stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)

---

## 🌐 What is this?

**CLEV** is a personal mission-control homepage. Instead of a blank new-tab page you get a booting sci-fi HUD: a giant clock, a Google-directive search bar, editable speed-dial "nodes", a slide-out live feed of CPU/RAM/network telemetry, and a full terminal where an AI (Google **Gemini 2.5 Flash**) answers with a smooth British voice courtesy of **ElevenLabs** — and remembers things about you across sessions.

Everything is static — no backend required. It deploys straight to GitHub Pages.

---

## ✨ Features

| | |
|---|---|
| 🤖 **CLEV AI terminal** | Gemini-backed assistant with a persistent **memory matrix** (`[REMEMBER: ...]` facts stored in `localStorage` and injected into every prompt). |
| 🗣️ **Spoken responses** | Every reply is read aloud by ElevenLabs *George* (British JARVIS vibes), with automatic browser-voice fallback. |
| 🐾 **NEOMO the desktop pet** | A Grok-style companion that waddles along the bottom of the screen, blinks, reacts to events, and can be dragged / petted. |
| 🏠 **Speed-dial nodes** | Editable bookmark grid with hover-lift glass cards. |
| 🔍 **Directive search** | One command-line-style bar wired to Google. |
| 📡 **Live Feed HUD** | Slide-out panel faking ESP32 smart-glass telemetry: CPU load, RAM pressure, pings, packet loss, uplink bars. |
| 🟩 **Hacker Mode** | Type `hacker mode` → the entire theme flips green (pet included). `exit` restores cyan. |
| ⌨️ **Keyboard-first** | `←` / `→` switch between HOME and CLEV_AI views; Enter executes. |
| 💾 **Boot sequence** | Retro CRT scanline startup loader with progress bar and log lines. |
| 🌌 **Ambient FX** | Drifting aurora blobs, perspective neon grid floor, floating shapes, vignette, subtle CRT flicker. |

---

## 🐾 Meet NEOMO, the desktop pet

Because every good website should have something alive in it — inspired by the little Grok companion bot:

- **Waddles** across the bottom of the viewport and turns around at screen edges.
- **Blinks**, breathes, squash-and-stretches, and has a pulsing antenna light.
- **Draggable anywhere** — drop it mid-air and it falls with gravity and a small bounce.
- **Click to pet** — it gets happy, purrs, and speeds up its waddle.
- **Reacts to CLEV**: enters a thinking face while Gemini processes, cheers when CLEV speaks, and goes terminal-green in Hacker Mode.
- **Random chatter bubbles** ("Boop!", "psst... try typing 'help' in CLEV").

Source: [`WEB/src/components/DesktopPet.tsx`](WEB/src/components/DesktopPet.tsx) — zero dependencies beyond framer-motion + inline SVG.

---

## 🔊 Voice engine (fixed!)

The previous ElevenLabs implementation failed silently whenever anything went wrong. The rewritten engine in `WEB/src/App.tsx` fixes the whole class of issues:

1. **Streaming endpoint** — `POST /v1/text-to-speech/{voice_id}/stream?output_format=mp3_44100_128` for faster first byte and no hangs.
2. **Correct headers** — sends the required `Accept: audio/mpeg` header (its absence caused silent 4xx failures) plus `xi-api-key`.
3. **Key validation up front** — a missing or placeholder key short-circuits to the fallback voice instead of firing doomed requests.
4. **Real error surfacing** — non-OK responses are parsed and logged (quota, invalid key, unknown voice…) instead of a bare status code.
5. **No overlapping speech** — every new utterance aborts the in-flight request/audio first (`AbortController` + pause).
6. **Autoplay-policy safe** — if the browser blocks playback, it retries on the next click/keypress.
7. **Memory-leak free** — blob object URLs are revoked after playback.
8. **Guaranteed voice** — any failure falls back to `window.speechSynthesis` with a preferred English male voice, so CLEV *always* talks.

Toggle it anytime with the `🔊 ELEVENLABS VOICE` pill (it also shows a live `SPEAKING...` state).

---

## ⌨️ Terminal commands & easter eggs

Type these into the **CLEV_AI** terminal:

| Command | Effect |
|---|---|
| `help` / `commands` | Print the directive catalog. |
| `hacker mode` / `exit` | Flip the whole HUD green / restore cyan. |
| `clear` / `cls` | Flush the terminal buffer. |
| `memory list` / `memories` | Show stored facts (ask CLEV to *remember* things!). |
| `omniview` | ESP32 smart-glass hardware link status. |
| `vinyl` | Audio player node info. |
| `ember` | Manuscript protocol… |
| `jarvis` / `stark` / `sir` | 🥩 At your service, Sir. |
| `mentalist` / `red john` / `tea` | 👁️ There is no such thing as magic. |
| `1000-7` / `kaneki` | 🍱 993… 986… 979… |

Anything else is sent to Gemini as a real question.

---

## 🚀 Quick start

```bash
# 1. Clone
git clone https://github.com/<user>/<repo>.git
cd <repo>/WEB

# 2. Install
npm install

# 3. Configure keys (optional but recommended)
cp .env.example .env
#    -> paste your Gemini + ElevenLabs keys

# 4. Run the HUD
npm run dev
```

Open http://localhost:5173 — watch it boot, then say `hello` to CLEV and go pet the robot. 🤖

> No keys? No problem. Search, bookmarks, Hacker Mode, the Live Feed and NEOMO all work fully offline; the AI simply reports a missing-key directive and the voice falls back to the browser.

---

## 🔑 Environment variables

| Variable | Purpose | Where to get it |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Powers the CLEV AI brain (`gemini-2.5-flash`). | [Google AI Studio](https://aistudio.google.com/apikey) |
| `VITE_ELEVENLABS_API_KEY` | Realistic spoken output (voice: *George*). | [ElevenLabs settings](https://elevenlabs.io/app/settings/api-keys) |

⚠️ These are **build-time** variables baked into the static bundle — only use them on a personal project you control, never commit real keys (use GitHub Secrets for CI).

---

## 📂 Project structure

```
.
├── .github/workflows/deploy.yml   # Push-to-main → GitHub Pages pipeline
├── HARDWARE/                      # ESP32-S3 smart-glass firmware sources (.ino)
│   ├── Omniview_v1..v3/
│   └── vinyl_music_player/
└── WEB/                           # The HUD web app (this repo's main event)
    ├── index.html                 # CRT overlay, fonts, Tailwind CDN config
    ├── vite.config.ts             # base:'./' for Pages compatibility
    ├── .env.example               # API key template
    └── src/
        ├── App.tsx                # Boot loader, FX, home view, CLEV terminal,
        │                          #   Gemini client, memory matrix, voice engine
        └── components/
            └── DesktopPet.tsx     # NEOMO 🐾 — drag/waddle/gravity/chat pet
```

---

## 🚢 Auto-deploy to GitHub Pages

Every push to `main` runs **[Deploy CLEV AI HUD](../../actions/workflows/deploy.yml)**:

1. Installs deps and builds `WEB/` with secrets injected.
2. Publishes `WEB/dist` via GitHub Pages.

**Setup:** Repo → *Settings → Secrets and variables → Actions* → add `VITE_GEMINI_API_KEY` and `VITE_ELEVENLABS_API_KEY`, then enable *Pages → Source: GitHub Actions*. Your site lands at `https://<user>.github.io/<repo>/`.

---

## 🧰 Tech stack

![React](https://img.shields.io/badge/react-18-61dafb?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/tailwindcss-3-06b6d4?style=flat-square&logo=tailwindcss&logoColor=black)
![Framer Motion](https://img.shields.io/badge/framer--motion-11-hotpink?style=flat-square)
![Gemini](https://img.shields.io/badge/google-gemini%202.5%20flash-8a2be2?style=flat-square&logo=googlegemini&logoColor=white)
![ElevenLabs](https://img.shields.io/badge/elevenlabs-tts-fbbf24?style=flat-square&logo=elevenlabs&logoColor=black)

No backend, no database — `localStorage` holds memories, bookmarks and preferences.

---

## 🛠️ Troubleshooting

| Symptom | Fix |
|---|---|
| CLEV replies *"VITE_GEMINI_API_KEY missing"* | Add the key to `.env` (dev) or repo Secrets (CI), then rebuild/restart `npm run dev`. |
| No ElevenLabs voice, but a robotic one plays | That's the intentional fallback — check the console for `[CLEV VOICE]` logs (bad key, quota, etc.). |
| First utterance is silent | Browser autoplay policy — click anywhere once; playback retries automatically. |
| Assets 404 on GitHub Pages | Keep `base: './'` in `vite.config.ts` (already set). |
| Pet stuck off-screen after resize | Resize handled automatically; refresh if you teleport windows mid-waddle. |

---

<div align="center">

**Made with ☕ late nights and too many neon box-shadows.**

If NEOMO waddles past while you read this, he says hi. 👋

[⬆ back to top](#-clev-ai--system-hud)

</div>
