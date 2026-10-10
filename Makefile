.PHONY: dev backend frontend install check setup

# Start both backend and frontend for development
dev:
	@echo "Starting StrideCast..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	$(MAKE) -j2 backend frontend

backend:
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev -- --host 0.0.0.0

# Install all dependencies
install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

# Check setup (Ollama, TTS, ffmpeg)
check:
	cd backend && python scripts/check_setup.py

# First-time setup
setup: install check
	@echo ""
	@echo "Setup complete! Run 'make dev' to start."
