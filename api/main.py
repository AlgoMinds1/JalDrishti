import json
import os
import sys
from pathlib import Path
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Ensure root workspace is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from api.routers import predictions
from pipeline.refresh import refresh_predictions

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
app = FastAPI(
    title="JalDrishti API",
    description="Hyperlocal Urban Waterlogging Early-Warning & Crowd-Sourced Verification Platform for Pune",
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

# Mount Routers
app.include_router(predictions.router)

DATA_DIR = ROOT_DIR / "data" / "processed"
FIXTURES_DIR = ROOT_DIR / "fixtures"
ML_DIR = ROOT_DIR / "ml"
METADATA_PATH = DATA_DIR / "pipeline_metadata.json"
EVAL_RESULTS_PATH = ML_DIR / "evaluation_results.json"


@app.get("/health", tags=["System"])
def health_check():
    """
    Returns system status, active ML model version, and exact data freshness.
    """
    meta = {}
    if METADATA_PATH.exists():
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            pass

    return {
        "status": "ok",
        "service": "JalDrishti API",
        "version": "0.1.0",
        "phase": "Phase 3 Pipeline & Inference Engine Active",
        "model_version": meta.get("model_version", "v1.0.0-lightgbm-isotonic"),
        "last_pipeline_run": meta.get("last_run"),
        "rain_data_age_min": meta.get("rain_data_age_min", 0),
        "total_segments": meta.get("total_segments", 1000),
        "active_horizons": meta.get("horizons", [1, 2, 3, 4, 5, 6]),
        "source": meta.get("source", "open-meteo")
    }


@app.get("/evaluate", tags=["Evaluation"])
def get_evaluation_metrics():
    """
    Public transparency endpoint returning rigorous test-set evaluation metrics,
    baseline comparisons (Always-No vs Hotspot-Only vs JalDrishti), calibration Brier score,
    and MAPIE conformal coverage.
    """
    if EVAL_RESULTS_PATH.exists():
        with open(EVAL_RESULTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"error": "Evaluation results not found. Run ml/evaluate.py first."}


@app.post("/pipeline/refresh", tags=["Pipeline"])
def trigger_pipeline_refresh(background_tasks: BackgroundTasks):
    """
    Triggers feature refresh and inference pipeline.
    Executes in background and returns immediate status.
    """
    background_tasks.add_task(refresh_predictions)
    return {
        "status": "refresh_initiated",
        "message": "Feature refresh pipeline running in background for pilot corridor (1,000 segments, horizons +1h to +6h)."
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
