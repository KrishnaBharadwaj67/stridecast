from pydantic import BaseModel, Field
from typing import Literal, Optional, List

class GenerateRequest(BaseModel):
    duration_minutes: int = Field(ge=10, le=120)
    target_pace_min_km: float = Field(ge=3.0, le=10.0)
    mood: Literal['chill', 'energetic', 'focused', 'storytelling']
    topic: str = Field(min_length=1, max_length=500)
    voice: str = 'af_heart'
    enable_music: bool = False
    demo_mode: bool = False

class Segment(BaseModel):
    index: int
    filename: str
    duration_seconds: float
    text: str

class PaceNudges(BaseModel):
    ahead: str
    on_pace: str
    behind: str

class SessionManifest(BaseModel):
    session_id: str
    title: str
    topic: str
    mood: str
    duration_minutes: int
    target_pace_min_km: float = 5.5
    segments: List[Segment]
    pace_nudges: Optional[PaceNudges] = None
    total_duration_seconds: float
    created_at: str

class HealthResponse(BaseModel):
    status: str
    ollama: dict
    tts: dict
    ffmpeg: dict

class ProgressEvent(BaseModel):
    status: str
    progress: int
    message: str
    session_id: Optional[str] = None
    manifest: Optional[SessionManifest] = None
    segment: Optional[int] = None
    total: Optional[int] = None
    title: Optional[str] = None
