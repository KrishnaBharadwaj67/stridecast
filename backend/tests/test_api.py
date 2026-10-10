from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "ollama" in data
    assert "tts" in data
    assert "ffmpeg" in data

def test_generate_endpoint_demo():
    payload = {
        "duration_minutes": 15,
        "target_pace_min_km": 5.5,
        "mood": "energetic",
        "topic": "History of Space Travel",
        "voice": "af_heart",
        "enable_music": False,
        "demo_mode": True
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 200
    # Response is an SSE stream
    content = response.text
    assert "data: " in content
    assert "complete" in content
