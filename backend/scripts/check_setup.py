import sys
import subprocess
import urllib.request
import importlib
import json
import os
from pathlib import Path

# Enable UTF-8 console output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load settings from app.config or .env
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
try:
    from app.config import settings
    OLLAMA_URL = settings.OLLAMA_BASE_URL
    OLLAMA_MODEL = settings.OLLAMA_MODEL
except Exception:
    OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:latest")

def log(status: bool, msg: str):
    icon = "[OK]" if status else "[X]"
    try:
        symbol = "✅" if status else "❌"
        print(f"{symbol} {msg}")
    except UnicodeEncodeError:
        print(f"{icon} {msg}")

def check_python_version():
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        log(True, f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        log(False, f"Python version too low. Found {version.major}.{version.minor}, requires >= 3.10")
        return False

def check_ollama():
    urls = [OLLAMA_URL, "http://127.0.0.1:11434", "http://localhost:11434"]
    # Deduplicate while preserving order
    seen = set()
    test_urls = [u for u in urls if not (u in seen or seen.add(u))]

    data = None
    connected_url = None
    for u in test_urls:
        try:
            req = urllib.request.Request(f"{u}/api/tags")
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    connected_url = u
                    break
        except Exception:
            continue

    if not connected_url or data is None:
        log(False, f"Ollama not reachable at {OLLAMA_URL}. Ensure Ollama is running (`ollama serve`).")
        return False

    log(True, f"Ollama reachable at {connected_url}")
    models = [m.get("name", "") for m in data.get("models", [])]
    found = any(
        m == OLLAMA_MODEL or m == f"{OLLAMA_MODEL}:latest" or
        m.startswith(f"{OLLAMA_MODEL}:") or OLLAMA_MODEL == m.split(":")[0]
        for m in models
    )
    if found:
        log(True, f"Model '{OLLAMA_MODEL}' found in Ollama")
        return True
    else:
        available = ", ".join(models) if models else "None"
        log(False, f"Configured model '{OLLAMA_MODEL}' not found. Installed models: [{available}]. Run: ollama pull {OLLAMA_MODEL} or update .env")
        return False

def check_tts():
    has_kokoro = False
    has_pyttsx3 = False
    try:
        importlib.import_module("kokoro")
        has_kokoro = True
    except ImportError:
        pass

    try:
        importlib.import_module("pyttsx3")
        has_pyttsx3 = True
    except ImportError:
        pass

    if has_kokoro:
        log(True, "Kokoro TTS available")
        return True
    elif has_pyttsx3:
        log(True, "pyttsx3 offline speech engine available")
        return True
    else:
        log(False, "No local TTS engine found. Install pyttsx3 or kokoro (DemoTTS silence will be used)")
        return False

def check_soundfile():
    try:
        importlib.import_module("soundfile")
        log(True, "soundfile available")
        return True
    except ImportError:
        log(False, "soundfile not found. Run: pip install soundfile")
        return False

def check_ffmpeg():
    try:
        res = subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode == 0:
            log(True, "ffmpeg available for audio normalization/mixing")
            return True
        else:
            log(False, "ffmpeg returned error. Audio normalization will be bypassed.")
            return False
    except FileNotFoundError:
        log(False, "ffmpeg not found in PATH (Optional, StrideCast works without it)")
        return False

if __name__ == "__main__":
    print("StrideCast Setup Check")
    print("======================")
    
    p = check_python_version()
    o = check_ollama()
    t = check_tts()
    s = check_soundfile()
    f = check_ffmpeg()
    
    print("======================")
    if o and t and s:
        print("🎉 Full local AI pipeline ready! Run 'npm run dev' to start.")
    else:
        print("Notice: Missing components will fall back to local offline alternatives.")
