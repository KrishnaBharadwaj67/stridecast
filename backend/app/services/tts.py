import math
import logging
import wave
import struct
import os

logger = logging.getLogger(__name__)

# Lazy initialized pipeline
_kokoro_pipeline = None

def get_kokoro_pipeline():
    global _kokoro_pipeline
    if _kokoro_pipeline is None:
        try:
            from kokoro import KPipeline
            _kokoro_pipeline = KPipeline(lang_code='a')
        except Exception:
            return None
    return _kokoro_pipeline

def synthesize_demo(text: str, output_path: str) -> float:
    """Generate a clean WAV file of calculated length based on text word count using stdlib wave."""
    word_count = len(text.split())
    # Estimate: ~150 words per minute -> 2.5 words per second
    duration = max(1.5, word_count / 2.5) 
    sample_rate = 24000
    n_frames = int(duration * sample_rate)

    try:
        # Check if numpy + soundfile are available for speed
        import numpy as np
        import soundfile as sf
        silence = np.zeros(n_frames, dtype=np.float32)
        sf.write(output_path, silence, sample_rate)
        return duration
    except Exception:
        pass

    # Built-in standard library fallback (zero dependencies)
    try:
        with wave.open(output_path, 'wb') as wav_file:
            wav_file.setnchannels(1)        # Mono
            wav_file.setsampwidth(2)       # 16-bit
            wav_file.setframerate(sample_rate)
            chunk_size = sample_rate
            silent_chunk = b'\x00\x00' * chunk_size
            written = 0
            while written < n_frames:
                to_write = min(chunk_size, n_frames - written)
                if to_write == chunk_size:
                    wav_file.writeframes(silent_chunk)
                else:
                    wav_file.writeframes(b'\x00\x00' * to_write)
                written += to_write
        return duration
    except Exception as e:
        logger.error(f"Error creating demo audio: {e}")
        return 1.0

def synthesize_pyttsx3(text: str, voice: str, output_path: str) -> float:
    """Synthesize real spoken speech using local pyttsx3 engine."""
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty('rate', 165)
        
        # Select matching voice if available
        voices = engine.getProperty('voices')
        if voices:
            for v in voices:
                if any(k in v.name.lower() or k in v.id.lower() for k in [voice.lower(), "zira", "david", "mark"]):
                    engine.setProperty('voice', v.id)
                    break
                    
        engine.save_to_file(text, output_path)
        engine.runAndWait()

        # Read actual audio duration from the generated WAV
        if os.path.exists(output_path):
            with wave.open(output_path, 'r') as wf:
                frames = wf.getnframes()
                rate = wf.getframerate()
                if rate > 0:
                    return max(1.0, frames / float(rate))
                    
        return max(1.5, len(text.split()) / 2.5)
    except Exception as e:
        logger.warning(f"pyttsx3 failed, using demo synthesis: {e}")
        return synthesize_demo(text, output_path)

def synthesize_segment(text: str, voice: str, output_path: str) -> float:
    pipeline = get_kokoro_pipeline()
    
    if pipeline:
        try:
            import numpy as np
            import soundfile as sf
            
            generator = pipeline(text, voice=voice, speed=1.0)
            audio_chunks = []
            for graphemes, phonemes, audio in generator:
                if audio is not None:
                    audio_chunks.append(audio)
                    
            if audio_chunks:
                full_audio = np.concatenate(audio_chunks)
                sample_rate = 24000
                sf.write(output_path, full_audio, sample_rate)
                return len(full_audio) / sample_rate
        except Exception as e:
            logger.warning(f"Kokoro synthesis failed: {e}")

    # Fall back to pyttsx3 for real local speech
    try:
        import pyttsx3
        return synthesize_pyttsx3(text, voice, output_path)
    except Exception:
        pass

    # Final fallback to demo
    return synthesize_demo(text, output_path)
