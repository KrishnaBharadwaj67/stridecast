import subprocess
import httpx
from fastapi import APIRouter
from app.models import HealthResponse
from app.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    # Check Ollama
    ollama_status = {"available": False, "model_found": False}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                ollama_status["available"] = True
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                target = settings.OLLAMA_MODEL
                # Match exact name or name without :latest suffix
                if any(
                    n == target or n == f"{target}:latest" or
                    n.startswith(f"{target}:") or target == n.split(":")[0]
                    for n in model_names
                ):
                    ollama_status["model_found"] = True
                    ollama_status["model"] = target
    except Exception:
        pass

    # Check TTS
    tts_status = {"available": False, "engine": settings.TTS_ENGINE}
    try:
        import kokoro
        tts_status["available"] = True
    except ImportError:
        pass

    # Check ffmpeg
    ffmpeg_status = {"available": False}
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        if result.returncode == 0:
            ffmpeg_status["available"] = True
    except FileNotFoundError:
        pass

    overall_status = "ok" if ollama_status["model_found"] and tts_status["available"] else "degraded"

    return HealthResponse(
        status=overall_status,
        ollama=ollama_status,
        tts=tts_status,
        ffmpeg=ffmpeg_status
    )
