import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app = FastAPI(
    title="JalDrishti API",
    description="Hyperlocal Urban Waterlogging Early-Warning & Crowd-Sourced Verification Platform",
    version="0.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "JalDrishti API",
        "version": "0.1.0",
        "phase": "Phase 0 Scaffold Ready"
    }

@app.get("/api/fixtures/prediction", tags=["Fixtures"])
def get_fake_prediction():
    fixture_path = FIXTURES_DIR / "fake_prediction.json"
    if fixture_path.exists():
        with open(fixture_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Fixture fake_prediction.json not found"}

@app.get("/api/fixtures/report", tags=["Fixtures"])
def get_fake_report():
    fixture_path = FIXTURES_DIR / "fake_report.json"
    if fixture_path.exists():
        with open(fixture_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Fixture fake_report.json not found"}
