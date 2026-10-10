import json
import re
import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)

async def generate_script(topic: str, duration_minutes: int, mood: str, target_pace_min_km: float) -> dict:
    target_words = duration_minutes * 150
    segments_count = max(1, duration_minutes // 3)
    
    prompt = f"""You are an expert running coach and podcast host. Generate a running podcast script.
Topic: {topic}
Mood: {mood}
Target Pace: {target_pace_min_km} min/km
Total duration: {duration_minutes} minutes
Target word count: ~{target_words} words.

Split the script into exactly {segments_count} segments. Each segment should be around 2-3 minutes spoken (~300-450 words).
Include occasional running-awareness beats like 'You're a third of the way in' or 'Great job keeping pace'.

You MUST return ONLY valid JSON in this exact format:
{{
    "title": "Title of the podcast",
    "segments": [
        {{"text": "Text for segment 1..."}},
        {{"text": "Text for segment 2..."}}
    ]
}}
Do not include any markdown formatting, backticks, or other text outside the JSON object.
"""

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            response_text = data.get("response", "")
            
            # Try to parse directly
            try:
                result = json.loads(response_text)
                if "segments" in result and isinstance(result["segments"], list):
                    return result
            except json.JSONDecodeError:
                pass
                
            # Try to extract JSON using regex
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group(0))
                    if "segments" in result and isinstance(result["segments"], list):
                        return result
                except json.JSONDecodeError:
                    pass

    except Exception as e:
        logger.error(f"Error generating script from Ollama: {e}")

    # Fallback script if LLM call or parsing fails
    logger.warning("Using structured fallback script generator.")
    fallback_segments = []
    beats = [
        "Find your easy breathing rhythm as we get underway.",
        "You're a third of the way through, locked into your target pace.",
        "Halfway mark! Shake out your shoulders, hold steady form.",
        "Cruising into the final stretch, great cadence.",
        "Cooling down now. Excellent effort today!"
    ]
    for i in range(segments_count):
        beat = beats[min(i, len(beats) - 1)]
        fallback_segments.append({
            "text": f"Welcome to segment {i+1} of your run. Today we're exploring {topic}. Maintain your target pace of {target_pace_min_km} minutes per kilometer with a {mood} mindset. {beat}"
        })
        
    return {
        "title": f"Run Session: {topic}",
        "segments": fallback_segments
    }
