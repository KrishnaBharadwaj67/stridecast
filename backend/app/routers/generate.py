import uuid
import datetime
import asyncio
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from app.models import GenerateRequest, ProgressEvent, SessionManifest, Segment, PaceNudges
from app.config import settings
from app.services.session_manager import create_session_dir, save_manifest, create_demo_session
from app.services.script_generator import generate_script
from app.services.tts import synthesize_segment

router = APIRouter()

@router.post("/generate")
async def generate_podcast(request: Request, body: GenerateRequest):
    async def event_generator():
        if settings.DEMO_MODE or body.demo_mode:
            yield ProgressEvent(status="generating_script", progress=20, message="Loading demo session audio...").model_dump_json()
            await asyncio.sleep(0.5)
            manifest = create_demo_session()
            yield ProgressEvent(
                status="complete",
                progress=100,
                message="Generation complete",
                session_id=manifest.session_id,
                manifest=manifest,
                title=manifest.title
            ).model_dump_json()
            return

        session_id = uuid.uuid4().hex[:12]
        session_dir = create_session_dir(session_id)
        
        yield ProgressEvent(status="generating_script", progress=10, message="Writing script...").model_dump_json()
        
        script = await generate_script(
            topic=body.topic,
            duration_minutes=body.duration_minutes,
            mood=body.mood,
            target_pace_min_km=body.target_pace_min_km
        )
        
        title = script.get("title", "Your Run")
        raw_segments = script.get("segments", [])
        total_segments = len(raw_segments)
        
        yield ProgressEvent(
            status="synthesizing", 
            progress=30, 
            message="Synthesizing audio...",
            session_id=session_id,
            total=total_segments,
            title=title
        ).model_dump_json()

        segments = []
        total_duration = 0.0

        for i, seg in enumerate(raw_segments):
            text = seg.get("text", "")
            filename = f"segment_{i}.wav"
            filepath = session_dir / filename
            
            # Progress update
            yield ProgressEvent(
                status="synthesizing",
                progress=30 + int(60 * (i / total_segments)),
                message=f"Synthesizing segment {i+1}/{total_segments}",
                session_id=session_id,
                segment=i+1,
                total=total_segments
            ).model_dump_json()
            
            # Synthesize (with retry)
            try:
                duration = synthesize_segment(text, body.voice, str(filepath))
            except Exception:
                try:
                    duration = synthesize_segment(text, body.voice, str(filepath))
                except Exception:
                    # Fallback to simple generic text if failure persists
                    fallback_text = "Keep going, you're doing great."
                    duration = synthesize_segment(fallback_text, body.voice, str(filepath))
                    text = fallback_text

            segments.append(Segment(
                index=i,
                filename=filename,
                duration_seconds=duration,
                text=text
            ))
            total_duration += duration

        yield ProgressEvent(status="synthesizing", progress=92, message="Recording pace nudges...").model_dump_json()

        # Pre-generate pace nudges for offline pace coaching
        nudge_files = {
            "ahead": ("nudge_ahead.wav", "You are ahead of your target pace. Settle in and smooth out your stride."),
            "on_pace": ("nudge_on_pace.wav", "Right on your target pace! Keep this steady rhythm."),
            "behind": ("nudge_behind.wav", "You are a bit behind your target pace. Pick up the cadence, you got this!")
        }
        for key, (filename, nudge_text) in nudge_files.items():
            nudge_path = session_dir / filename
            try:
                synthesize_segment(nudge_text, body.voice, str(nudge_path))
            except Exception:
                pass

        yield ProgressEvent(status="saving", progress=95, message="Saving manifest...").model_dump_json()

        manifest = SessionManifest(
            session_id=session_id,
            title=title,
            topic=body.topic,
            mood=body.mood,
            duration_minutes=body.duration_minutes,
            target_pace_min_km=body.target_pace_min_km,
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

        yield ProgressEvent(
            status="complete",
            progress=100,
            message="Generation complete",
            session_id=session_id,
            manifest=manifest,
            title=title
        ).model_dump_json()

    return EventSourceResponse(event_generator())
