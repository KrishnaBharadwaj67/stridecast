# 🏃 StrideCast

**Your run, your story, no signal needed.**

StrideCast is a mobile-first PWA running companion that generates a personalized podcast for your run using open-source AI — then plays it offline while tracking your pace and route.

Built for the [DEV Hacktoberfest Open-Source AI Challenge: Week 1](https://dev.to/) (theme: "Touch Grass").

## ✨ How It Works

1. **Set up** (~30 seconds): Pick your duration, pace, mood, and a podcast topic
2. **Generate**: AI writes a podcast script and narrates it with a natural voice
3. **Cache**: Audio downloads to your phone for offline playback
4. **Run**: Go outside! Audio plays while GPS tracks your route and pace
5. **Review**: See your run summary with stats and route

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React + TypeScript + Tailwind CSS |
| PWA | vite-plugin-pwa (service worker, offline cache) |
| State | Zustand + IndexedDB (idb) |
| Backend | Python FastAPI |
| LLM | Ollama (Gemma 2B, configurable) |
| TTS | Kokoro (open-source, local) |
| Audio | ffmpeg (optional, for mixing) |
| GPS | Browser Geolocation API + Haversine |

**All AI runs locally. No cloud APIs. No accounts. Your data never leaves your device.**

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Ollama** running locally ([install](https://ollama.ai))
- **ffmpeg** (optional, for audio normalization)

### 1. Clone and install

```bash
git clone <repo-url> stridecast
cd stridecast
```

Install backend:
```bash
cd backend
pip install -r requirements.txt
```

Install frontend:
```bash
cd frontend
npm install
```

### 2. Set up Ollama

```bash
ollama pull gemma2:2b
```

### 3. Configure

```bash
cd backend
cp .env.example .env
# Edit .env if needed (model name, TTS engine, etc.)
```

### 4. Check setup

```bash
cd backend
python scripts/check_setup.py
```

### 5. Run

Start backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Start frontend (in another terminal):
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Open http://localhost:5173 in your browser.

## 📱 Testing on Your Phone

### The HTTPS Problem
Geolocation and Service Workers require HTTPS (except on localhost). To test on your phone over Wi-Fi:

**Option A: mkcert (recommended)**
```bash
# Install mkcert
# Windows: choco install mkcert  OR  scoop install mkcert
mkcert -install
mkcert localhost 192.168.x.x  # your laptop's local IP

# Use the generated certs with Vite:
# In vite.config.ts, add:
# server: { https: { key: './192.168.x.x-key.pem', cert: './192.168.x.x.pem' } }
```

**Option B: Vite's built-in HTTPS**
```bash
npm install -D @vitejs/plugin-basic-ssl
# Add to vite.config.ts plugins
```
Then accept the self-signed cert on your phone.

**Option C: ngrok tunnel**
```bash
ngrok http 5173
# Open the ngrok URL on your phone
```

### Steps
1. Find your laptop's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start both backend and frontend with `--host 0.0.0.0`
3. On your phone, open `https://<laptop-ip>:5173`
4. Accept any certificate warnings
5. Add to Home Screen for the full PWA experience

## 🎮 Demo Mode

If AI generation is slow or unavailable, toggle Demo Mode in the setup screen. This uses pre-generated sample audio so you can test the full run experience.

Set `DEMO_MODE=true` in `.env` or toggle in the UI.

## 📁 Project Structure

```
├── frontend/          # React + TypeScript PWA
│   ├── src/
│   │   ├── pages/     # SetupPage, GeneratingPage, RunPage, SummaryPage, HistoryPage
│   │   ├── components/# Reusable UI
│   │   ├── stores/    # Zustand state management
│   │   ├── hooks/     # useGeolocation, useAudioPlayer, useWakeLock
│   │   ├── utils/     # haversine, gps, formatters, db, audio
│   │   └── types/     # TypeScript interfaces
│   └── public/
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Ollama, TTS, audio processing
│   │   ├── config.py  # Settings from .env
│   │   └── models.py  # Pydantic models
│   ├── scripts/       # Setup checker
│   └── tests/
├── README.md
├── BUILD_LOG.md
└── Makefile
```

## ⚙️ Configuration

All settings via `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma2:2b` | LLM model for script generation |
| `TTS_ENGINE` | `kokoro` | TTS engine: `kokoro` or `demo` |
| `TTS_VOICE` | `af_heart` | Voice name for TTS |
| `ENABLE_MUSIC` | `false` | Enable background music (feature flag) |
| `DEMO_MODE` | `false` | Use pre-generated audio |

## 🧪 Tests

```bash
cd backend
pytest tests/
```

## 📝 License

MIT

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) — Local LLM inference
- [Kokoro](https://github.com/hexgrad/kokoro) — Open-source TTS
- [Piper](https://github.com/rhasspy/piper) — Alternative open-source TTS
- Built for [DEV Hacktoberfest](https://dev.to/) Open-Source AI Challenge
