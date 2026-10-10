from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import mimetypes

from app.services.session_manager import get_audio_path, get_manifest

router = APIRouter()

@router.get("/audio/{session_id}/{filename}")
async def get_audio(session_id: str, filename: str):
    file_path = get_audio_path(session_id, filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="Audio file not found")
        
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if not mime_type:
        mime_type = "audio/wav" if filename.endswith(".wav") else "audio/mpeg"
        
    return FileResponse(file_path, media_type=mime_type)

@router.get("/sessions/{session_id}/manifest.json")
async def get_session_manifest(session_id: str):
    manifest = get_manifest(session_id)
    if not manifest:
        raise HTTPException(status_code=404, detail="Manifest not found")
        
    return manifest
