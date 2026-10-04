# 🫧 Clev — Your Jolly AI Desktop Companion

<p align="center">
  <em>A cheerful, witty AI gremlin that lives as a floating Dynamic-Island widget on your monitor.</em><br>
  Part copilot · part hype-friend · fully invested in your good mood 💙
</p>

<p align="center">
  <img alt="Tauri v2" src="https://img.shields.io/badge/Tauri-v2-ffc61d?logo=tauri&logoColor=black">
  <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black">
  <img alt="Gemini 2.5 Flash" src="https://img.shields.io/badge/Gemini-2.5_Flash-4285f4?logo=googlegemini&logoColor=white">
  <img alt="ElevenLabs" src="https://img.shields.io/badge/Voice-ElevenLabs_+_WebSpeech-000?labelColor=9C6ADE">
  <img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white">
  <img alt="Platform" src="https://img.shields.io/badge/Builds-Windows_.exe_/_msi-0078d4?logo=windows&logoColor=white">
</p>

---

## ✨ What is Clev?

**Clev** is a lightweight, always-on-top desktop companion (à la Coucou / Dynamic Island).
He blinks, bounces, yaps, vibe-checks your music, remembers things about you, and hides
a handful of delightfully nerdy easter eggs.

> **Refactor note:** this replaces the old full-screen web HUD (`WEB/`). Removed: speed-dial
> bookmarks, Google search bar, CRT scanline hero clock, simulated telemetry panels, and the
> separate NEOMO pet entity — NEOMO's animated face states now live **directly inside Clev's
> widget body**. Simulated telemetry was replaced with **real OS calls** (Rust `sysinfo` + Python `psutil`).

### Feature matrix

| Area | What it does | Where |
|---|---|---|
| 🧑‍🎤 Unified animated face | idle blinking, happy bounce, thinking swirls, excited sparkles, softened chill lids, empathic eyes — one body, many moods | `src/components/ClevFace.tsx` |
| 🗣️ "Yap" speech bubbles | pop out around the face on every reply/tip/idle chatter | `src/components/YapBubbles.tsx` |
| 🎵 Vibe-checking | polls the real foreground window title (Win32), sentiment-parses media/lyrics via FastAPI; sad/lo-fi → soft eyes & dimmed UI, pop/rock → beat-bounce & glow | `src/components/VibeWatcher.tsx` + `clev-backend/main.py` |
| 🖥️ Real telemetry | CPU / RAM / disk / uptime from actual OS APIs | Rust `get_hardware_metrics` (`sysinfo`) |
| 🧠 Memory Matrix | Gemini emits `[REMEMBER: …]`, harvested into `localStorage` and re-injected into every prompt | `src/lib/brain.ts` |
| 🔊 Voice | ElevenLabs **streaming** TTS (fixed) with automatic Web Speech fallback | `src/lib/brain.ts` |
| 🥚 Easter eggs | see table below | `src/lib/eastereggs.ts` |
| 🪟 Overlay UX | frameless · transparent · always-on-top · `-webkit-app-region: drag` header · tray-minimising · `Ctrl+Alt+C` global summon | `src-tauri/` |

### 🥚 Easter eggs

| Trigger | Effect |
|---|---|
| `1000-7` / `kaneki` | Kagune-red flashing eyes, CRT screen shake + scanlines, glitched typewriter `1000... 993... 986...` |
| `mentalist` / `red john` / `tea` | Sharp observant eyes, subtle red-mark graphic, ☕ popup, random Patrick Jane observation quote |
| `ember` | Enveloped Ember Manuscript Protocol: rising amber particles, warm borders, `[MANUSCRIPT PROTOCOL ACTIVE // ENVELOPED EMBER LINKED]` Author/Focus mode (exit with `focus off`) |
| `omniview` / `vinyl` | Eyes become bouncing audio-equalizer bars |
| `hacker mode` / `matrix` | Whole UI flips Cyan Glass → Matrix Terminal Green with binary-glyph eyes (persisted) |
| `exit` | Back to glass & good vibes |
| `remember <fact>` | Writes straight into the Memory Matrix |
| `stop` / `quiet` | Interrupts voice instantly |

---

## 🗂 Project layout

```
clev-desktop/            # Tauri v2 + React overlay app
├─ src/
│  ├─ App.tsx            # Dynamic-Island widget, yap pipeline, egg routing, settings
│  ├─ styles.css         # glass CSS, -webkit-app-region drag, CRT/glitch FX
│  ├─ types.ts           # Mood / Vibe / metrics contracts
│  ├─ lib/
│  │  ├─ brain.ts        # Gemini 2.5 Flash + Memory Matrix + ElevenLabs/WebSpeech voice
│  │  └─ eastereggs.ts   # local instant-response eggs
│  └─ components/
│     ├─ ClevFace.tsx    # unified animated face (ex-NEOMO states)
│     ├─ YapBubbles.tsx  # "yap" popups
│     ├─ TelemetryStrip.tsx  # REAL sysinfo metrics
│     ├─ VibeWatcher.tsx     # active-media sentiment hook
│     └─ EmberParticles.tsx  # ember protocol FX
└─ src-tauri/            # Rust: tray, global shortcut, Win32 window title, sysinfo
clev-backend/            # Python FastAPI: /vibe-check lyric sentiment + /metrics
WEB/                     # legacy web HUD (kept for reference; superseded by clev-desktop)
```

---

## 🚀 Quick start (development)

**Prereqs:** [Node 18+](https://nodejs.org), [Rust stable](https://rustup.rs), [Python 3.10+](https://python.org), and on Windows the [MSVC Build Tools + WebView2 Runtime](https://learn.microsoft.com/en-us/microsoft-edge/webview2/). Tauri's official prerequisite checker helps:

```bash
npx @tauri-apps/cli doctor   # or: pnpm tauri doctor
```

```bash
# 1) Local sentiment backend (optional but recommended)
cd clev-backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8765

# 2) The companion itself
cd ../clev-desktop
npm install
npm run tauri dev
```

On first launch click **⚙️** in Clev's header and paste:
* **Gemini API key** (`AIza…`) — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
* **ElevenLabs key** (`sk_…`) — optional; without it Clev auto-falls back to Web Speech TTS.

Keys persist in the app's own `localStorage` (nothing ships in git). Try typing `kaneki` 🙂

---

## 📦 Building a standalone Windows `.exe` / `.msi` installer

Run everything from **`clev-desktop/` on a Windows machine** (or Windows CI):

```powershell
# 0) One-time prerequisites
winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools"
winget install Rustlang.Rustup
winget install OpenJS.NodeJS.LTS
winget install Git.Git
# WebView2 Runtime ships with Windows 10 21H2+/Windows 11; installer bootstraps it otherwise.

# 1) Verify toolchain
rustc --version && cargo --version && node --version && npm --version

# 2) Install frontend deps & (first build only) let Cargo fetch crates
npm install

# 3) Release build + bundle (NSIS .exe installer AND WiX .msi)
npm run tauri build
#   equivalently: npx tauri build --bundles nsis,msi
```

**Output artifacts** (paths printed by the builder):

```
src-tauri\target\release\Clev.exe                          ← portable executable
src-tauri\target\release\bundle\nsis\Clev_1.0.0_x64-setup.exe  ← NSIS installer
src-tauri\target\release\bundle\msi\Clev_1.0.0_x64_en-US.msi    ← MSI installer
```

Distribution notes:
* `tauri.conf.json → bundle.windows.webviewInstallMode = downloadBootstrapper` makes the
  installer fetch the WebView2 runtime if the target PC lacks it.
* Unsigned builds trigger SmartScreen "More info → Run anyway". For public distribution add
  an Authenticode certificate (`signIdentity` in `bundle.windows`) and notarize-free MSIs work fine.
* Ship `clev-backend` alongside (PyInstaller: `pyinstaller --onefile main.py`) or just rely on
  Clev's built-in offline title-heuristic when the backend is down — he degrades gracefully.
* CI option: GitHub Actions on `windows-latest` with `tauri-apps/tauri-action` produces both
  installers on every tag — see `.github/workflows/` for a starting point.

---

## 🔒 Privacy & keys

* All AI traffic goes directly from your PC to Google/ElevenLabs — no middleman server.
* Chat history, memory matrix, theme state and API keys live only in the app's local storage.
* Hardware telemetry and window titles are read locally; nothing is uploaded.

## 🧭 Roadmap ideas

Voice input (STT) · per-app personality profiles · Spotify Web API deep integration ·
idle animation sprite sets · Linux/macOS tray parity · plugin egg system.

---

Made with 💙 and an unreasonable amount of blinking. **Type `help` to Clev anytime.**
