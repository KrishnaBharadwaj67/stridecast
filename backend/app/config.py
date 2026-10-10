from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:2b"
    TTS_ENGINE: str = "kokoro"
    TTS_VOICE: str = "af_heart"
    ENABLE_MUSIC: bool = False
    GENERATED_DIR: str = "generated"
    DEMO_MODE: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
