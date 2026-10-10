import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from app.config import settings
from app.routers import health, generate, audio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    gen_dir = Path(settings.GENERATED_DIR)
    gen_dir.mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown

app = FastAPI(title="StrideCast API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
