import pytest
from pydantic import ValidationError
from app.models import SessionManifest

def test_valid_manifest():
    data = {
        "session_id": "test_123",
        "title": "Test Run",
        "topic": "Testing",
        "mood": "energetic",
        "duration_minutes": 30,
        "segments": [],
        "total_duration_seconds": 0.0,
        "created_at": "2026-10-10T12:00:00Z"
    }
    manifest = SessionManifest(**data)
    assert manifest.session_id == "test_123"
    assert manifest.segments == []

def test_missing_required_fields():
    data = {
        "session_id": "test_123",
        "title": "Test Run",
        # Missing topic, mood, etc.
    }
    with pytest.raises(ValidationError):
        SessionManifest(**data)
