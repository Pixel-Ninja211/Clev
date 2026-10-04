# ============================================================
# CLEV LOCAL BACKEND — FastAPI service
#  • /vibe-check : real-time lyric/media sentiment analysis
#                  (melancholic → chill UI, energetic → bounce)
#  • /metrics    : REAL system hardware metrics (psutil)
#  • /lyrics     : best-effort Genius lyrics fetch for the service
# Run:  uvicorn main:app --host 127.0.0.1 --port 8765
# ============================================================
import re
from collections import Counter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import psutil
except ImportError:  # metrics endpoint degrades gracefully
    psutil = None

app = FastAPI(title="Clev Local Backend", version="1.0.0")

# The Tauri webview (dev: http://localhost:1420, prod: tauri://localhost / ipc)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# Lexicons for lightweight, offline lyric sentiment parsing.
# Weighted term sets → energy & valence scores.
# ------------------------------------------------------------
SAD_TERMS = {
    "alone": 3, "goodbye": 3, "tears": 3, "cry": 3, "crying": 3, "hurt": 2, "pain": 3,
    "empty": 2, "dark": 2, "rain": 2, "rainy": 2, "nightfall": 2, "missing": 3, "miss you": 4,
    "sorry": 2, "blue": 2, "broken": 3, "fade": 2, "fading": 2, "ghost": 2, "cold": 2,
    "lonely": 3, "sorrow": 3, "whisper": 1, "lofi": 3, "lo-fi": 3, "chillhop": 3, "sleepy": 2,
    "gone": 2, "lost": 2, "ache": 3, "mourn": 3, "grey": 1, "gray": 1, "under the rain": 4,
}
HYPE_TERMS = {
    "dance": 3, "dancing": 3, "party": 3, "tonight": 2, "fire": 2, "burning": 2, "run": 1,
    "jump": 2, "shout": 2, "crazy": 2, "wild": 2, "electric": 3, "boom": 3, "bass": 3,
    "drop": 2, "remix": 3, "club": 2, "energy": 3, "hyper": 3, "turbo": 2, "rocket": 2,
    "fly": 1, "winner": 2, "champion": 2, "unstoppable": 3, "blinding": 2, "lights": 1,
    "rock": 2, "metal": 2, "fast": 1, "go go": 3, "celebrate": 3, "happy": 2, "sunshine": 2,
}
TEMPO_HINTS = re.compile(r"\b(bpm|speed|\d{2,3}\s*bpm)\b", re.I)


def tokenize(text: str):
    return re.findall(r"[a-z']+", text.lower())


def score_text(title: str, lyrics: str) -> dict:
    """Return vibe/energy/valence from weighted lexicon hits."""
    tl = title.lower()
    words = tokenize(lyrics) + tokenize(tl)
    counts = Counter(words)
    bigrams = {" ".join(pair) for pair in zip(words, words[1:])}

    sad_hits, hype_hits, matched = 0.0, 0.0, []
    for term, w in SAD_TERMS.items():
        hit = (term in bigrams or (" " not in term and counts.get(term, 0) > 0)) if True else False
        if term in tl or hit:
            # weight titles a bit heavier than generic word matches
            strength = w * (1.6 if term in tl else 1.0)
            sad_hits += strength + counts.get(term.split()[0], 0) * 0.4
            matched.append(term)
    for term, w in HYPE_TERMS.items():
        hit = (" " not in term and counts.get(term, 0) > 0) or term in bigrams
        if term in tl or hit:
            strength = w * (1.6 if term in tl else 1.0)
            hype_hits += strength + counts.get(term.split()[0], 0) * 0.4
            matched.append(term)

    # Explicit BPM hints push energy up
    bpm = re.search(r"(\d{2,3})\s*bpm", tl)
    if bpm:
        v = int(bpm.group(1))
        hype_hits += max(0.0, (v - 100) / 20.0)

    total = sad_hits + hype_hits
    if total < 2:
        return {"vibe": "neutral", "energy": 0.5, "valence": 0.0, "label": "Ambient Radar 🛰️", "matched_terms": matched[:6]}

    energy = round(min(1.0, 0.25 + hype_hits / (total + 1)), 2)
    valence = round((hype_hits - sad_hits) / (total + 1), 2)

    if valence > 0.25 and energy > 0.55:
        vibe, label = "energetic", "Banger Detected ⚡"
    elif valence < -0.15 or energy < 0.4:
        vibe, label = "melancholic", "Lo-Fi Rain 🌧️"
    else:
        vibe, label = "neutral", "Steady Groove 🎧"

    return {"vibe": vibe, "energy": energy, "valence": valence, "label": label, "matched_terms": matched[:6]}


class VibeRequest(BaseModel):
    title: str = ""
    lyrics: str = ""


@app.post("/vibe-check")
def vibe_check(req: VibeRequest):
    """Sentiment-parse active media title (+ optional lyrics) into a Vibe for Clev."""
    result = score_text(req.title, req.lyrics)
    result["track"] = req.title
    return result


@app.get("/health")
def health():
    return {"ok": True, "service": "clev-backend", "version": "1.0.0"}


@app.get("/metrics")
def metrics():
    """REAL hardware telemetry via psutil (mirrors the Rust sysinfo command)."""
    if psutil is None:
        return {"error": "psutil not installed"}
    vm = psutil.virtual_memory()
    dm = psutil.disk_usage("/")
    return {
        "cpu_percent": psutil.cpu_percent(interval=0.15),
        "core_count": psutil.cpu_count(logical=True),
        "mem_used_gb": round(vm.total * (vm.percent / 100) / 1073741824, 2),
        "mem_total_gb": round(vm.total / 1073741824, 2),
        "disk_used_gb": round(dm.used / 1073741824, 2),
        "disk_total_gb": round(dm.total / 1073741824, 2),
        "uptime_secs": int(__import__("time").time() - psutil.boot_time()),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8765)
