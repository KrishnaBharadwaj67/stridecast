import json
import os
import uuid
import datetime
from pathlib import Path
from typing import Optional

from app.config import settings
from app.models import SessionManifest, Segment, PaceNudges
from app.services.tts import synthesize_segment

def get_generated_dir() -> Path:
    return Path(settings.GENERATED_DIR)

def create_session_dir(session_id: str) -> Path:
    session_dir = get_generated_dir() / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    return session_dir

def save_manifest(session_id: str, manifest: SessionManifest) -> Path:
    session_dir = create_session_dir(session_id)
    manifest_path = session_dir / "manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))
    return manifest_path

def get_manifest(session_id: str) -> Optional[SessionManifest]:
    manifest_path = get_generated_dir() / session_id / "manifest.json"
    if not manifest_path.exists():
        return None
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return SessionManifest(**data)
    except Exception:
        return None

def get_audio_path(session_id: str, filename: str) -> Optional[Path]:
    file_path = get_generated_dir() / session_id / filename
    if file_path.exists() and file_path.is_file():
        return file_path
    return None

def create_demo_session() -> SessionManifest:
    session_id = f"demo_{uuid.uuid4().hex[:8]}"
    session_dir = create_session_dir(session_id)
    
    segments = []
    total_duration = 0.0
    
    demo_texts = [
        "Welcome to your StrideCast demo run. Let's get warmed up.",
        "You're doing great, maintaining a solid pace.",
        "Almost halfway there, keep breathing steady.",
        "Final stretch now, push through!",
        "Great run. Time to cool down and stretch."
    ]
    
    for i, text in enumerate(demo_texts):
        filename = f"segment_{i}.wav"
        filepath = session_dir / filename
        
        duration = synthesize_segment(text, settings.TTS_VOICE, str(filepath))
        segments.append(Segment(
            index=i,
            filename=filename,
            duration_seconds=duration,
            text=text
        ))
        total_duration += duration
    # Generate pace nudges
    nudge_files = {
        "ahead": ("nudge_ahead.wav", "You're running faster than your target pace. Settle into your stride."),
        "on_pace": ("nudge_on_pace.wav", "You are right on your target pace. Keep up this smooth rhythm."),
        "behind": ("nudge_behind.wav", "You're a bit behind your target pace. Pick up your cadence!")
    }
    for key, (filename, nudge_txt) in nudge_files.items():
        nudge_path = session_dir / filename
        synthesize_segment(nudge_txt, settings.TTS_VOICE, str(nudge_path))

    manifest = SessionManifest(
        session_id=session_id,
        title="Demo Run",
        topic="Demo Mode Experience",
        mood="chill",
        duration_minutes=len(demo_texts) * 2, # Demo duration
        segments=segments,
        pace_nudges=PaceNudges(
            ahead="nudge_ahead.wav",
            on_pace="nudge_on_pace.wav",
            behind="nudge_behind.wav"
        ),
        total_duration_seconds=total_duration,
        created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
    
    save_manifest(session_id, manifest)
    return manifest
