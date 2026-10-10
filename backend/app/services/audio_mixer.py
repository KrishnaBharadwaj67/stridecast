import subprocess
import logging

logger = logging.getLogger(__name__)

def _ffmpeg_available() -> bool:
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except FileNotFoundError:
        return False

def normalize_audio(input_path: str, output_path: str) -> bool:
    if not _ffmpeg_available():
        logger.warning("ffmpeg not available. Falling back to copy for normalization.")
        import shutil
        shutil.copy(input_path, output_path)
        return False

    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path, 
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", 
            output_path
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error normalizing audio: {e}")
        return False

def concat_audio_files(input_paths: list[str], output_path: str) -> bool:
    if not _ffmpeg_available():
        logger.warning("ffmpeg not available for concatenation.")
        return False

    # Create a temporary file listing all inputs
    import tempfile
    import os
    
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as list_file:
        for p in input_paths:
            # Escape path for ffmpeg concat demuxer
            safe_path = os.path.abspath(p).replace('\\\\', '/')
            list_file.write(f"file '{safe_path}'\\n")
        list_file_path = list_file.name

    try:
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", 
            "-i", list_file_path, "-c", "copy", output_path
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error concatenating audio: {e}")
        return False
    finally:
        if os.path.exists(list_file_path):
            os.remove(list_file_path)

def get_audio_duration(file_path: str) -> float:
    if not _ffmpeg_available():
        try:
            import soundfile as sf
            info = sf.info(file_path)
            return info.duration
        except Exception:
            return 0.0

    try:
        result = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", file_path
        ], capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError) as e:
        logger.error(f"Error getting duration: {e}")
        return 0.0
