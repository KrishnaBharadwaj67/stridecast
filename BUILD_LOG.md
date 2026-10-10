# StrideCast Build Log

## 2026-10-10

### Initial Setup & Decisions
- **Monorepo Architecture**: Clean separation between `/frontend` (Vite + React 19 + TypeScript + Tailwind CSS v4 + PWA) and `/backend` (Python FastAPI + Uvicorn).
- **Local AI Pipeline**:
  - Script generation: Ollama with Gemma 2B (configurable via `OLLAMA_MODEL` in `.env`). Structured JSON output formatted into paced 2-3 minute segments.
  - Text-to-Speech: Kokoro TTS pipeline with lazy initialization and module caching; fallback to automatic WAV silence synthesis for machines without heavy neural models installed.
  - Pace Nudges: Pre-synthesized offline audio variants ("ahead of pace", "on pace", "falling behind") generated during setup so real-time pacing coaching works 100% offline.
- **Audio Delivery & Offline Guarantee**:
  - Generation progress streamed over Server-Sent Events (`sse-starlette`).
  - Frontend auto-caches all segment audio and pace nudges into browser Cache API (`stridecast-audio-v1`) before starting run.
  - Once cached, runner can turn on Airplane mode and head outside.
- **Run Tracking & Privacy**:
  - Geolocation API (`watchPosition`) smoothed with accuracy thresholding (<30m) and max velocity cutoff (<12 m/s).
  - Distance computed via Haversine formula.
  - Wake Lock API keeps screen active to prevent mobile OS browser background throttling.
  - Media Session API wires lock-screen playback controls (play/pause/next).
  - 100% zero cloud databases: all runs, routes, and history stored locally in IndexedDB (`idb`).
- **Visual Design**:
  - Forest trail & dusk aesthetic: Base `#0f1419`, Surface `#1a2332`, Card `#243447`, Accent `#f59e0b` (Amber), Success `#10b981`.
  - High contrast for sunlight readability, min 48px touch targets, glanceable HUD.

### Features Completed

#### P0 Core Pipeline
- [x] **Setup Screen**: Duration quick-pick (15/20/30/45/60m), target pace selector (min:sec/km), mood grid (Chill, Energetic, Focused, Storytelling), topic prompt with one-tap suggestions, voice selector (Heart, Bella, Adam, Michael), demo mode toggle, and live backend connection badge.
- [x] **Backend Generation Pipeline**:
  - Word count pacing (~150 words/min).
  - Segment breakdown with running motivation beats.
  - SSE streaming updates: script writing → per-segment audio synthesis → pace nudge generation → manifest creation.
  - Resilient TTS with retry and generic filler fallback to prevent session crashes.
- [x] **Offline Caching**: Automatic Cache API download and verification before run commencement ("Ready for offline ✓").
- [x] **Glanceable Run Screen**:
  - Giant START button (triggers user gesture for iOS AudioContext).
  - Distance (km), Current Pace (min/km), Elapsed Time.
  - Thin audio progress bar with coaching nudge indicator.
  - Pause/Resume and Stop controls.
  - Wake Lock and Media Session API integration.
- [x] **Run Summary & History**:
  - Completed run stats (distance, time, average pace, segments played).
  - Offline route visualization drawn via SVG `RouteCanvas` (no external tile server needed).
  - IndexedDB storage and history list page.

#### P1 Enhancements
- [x] **Pace-Aware Offline Coaching**: Pre-generated audio nudges triggered at segment boundaries if current pace deviates from target pace.
- [x] **Demo Mode**: Instant pre-generated audio manifests for fast demo recording even if Ollama/Kokoro are not loaded.
- [x] **Setup Diagnostics**: `backend/scripts/check_setup.py` checks Python version, Ollama connection, Gemma model, Kokoro TTS, soundfile, and ffmpeg with Windows UTF-8 console support.
- [x] **Automated Test Suite**: Pytest suite covering word-count calculations, segment splitting, Haversine distance, GPS smoothing/noise filtering, and manifest validation.

### Problems Encountered & Resolutions
1. **Windows Console Unicode**: `check_setup.py` encountered `UnicodeEncodeError` with emojis on default cp1252 codepage. Resolved by configuring stdout encoding to UTF-8 and adding fallback ASCII status tags.
2. **Pace Nudges API Contract**: Backend initially placed raw text strings into `manifest.pace_nudges`, which would cause 404s when the frontend attempted to cache audio files. Resolved by synthesizing dedicated audio files (`nudge_ahead.wav`, `nudge_on_pace.wav`, `nudge_behind.wav`) and passing filenames in the manifest.
3. **Starlette Dependency Conflict**: `sse-starlette` bumped `starlette` past FastAPI 0.115's range. Upgraded `fastapi` to latest compatible release.
4. **Vite PWA Manifest Icons**: Configured SVG icon with `any` size maskable attributes to avoid 404s on missing png assets.
5. **Windows Python 3.13 Local AI Stack**:
   - Detected installed Ollama instance with `gemma3:latest` (4B) and configured `.env` to connect via `http://127.0.0.1:11434`.
   - Installed `soundfile` and `numpy`.
   - Added `pyttsx3` as a zero-compile, 100% offline local speech engine for Windows to generate real spoken narration WAV files without needing MSVC C++ build tools required by some Kokoro wheels on Python 3.13.
   - Updated `backend/scripts/check_setup.py` diagnostics: all core components now pass with ✅.
