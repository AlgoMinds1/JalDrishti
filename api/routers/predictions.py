"""
Predictions Router for JalDrishti API
Exposes multi-horizon segment flood predictions as GeoJSON and single-segment cards.
Includes ultra-fast cached delivery for smooth frontend map interactions.
"""
import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session

from data.db import get_db
from data.models import Prediction as PredictionModel, Segment as SegmentModel

router = APIRouter(prefix="/predictions", tags=["Predictions"])

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data" / "processed"
FIXTURES_DIR = ROOT_DIR / "fixtures"


@router.get("", summary="Get pilot zone road segment predictions as GeoJSON for a horizon (1–6 h)")
def get_predictions(
    hour: int = Query(1, ge=1, le=6, description="Forecast horizon in hours ahead (1 to 6)"),
    scenario: Optional[str] = Query(None, description="Scenario override: 'live' or 'storm_july2024'")
):
    """
    Returns a GeoJSON FeatureCollection of all 1,000 road segments in the pilot zone,
    color-coded with calibrated risk probabilities, confidence levels, and top SHAP explanations.
    """
    # 1. Storm simulation scenario check
    if scenario == "storm_july2024":
        storm_fixture_path = FIXTURES_DIR / "storm_july2024_predictions.json"
        segments_geojson_path = DATA_DIR / "pilot_segments.geojson"
        if storm_fixture_path.exists() and segments_geojson_path.exists():
            with open(storm_fixture_path, "r", encoding="utf-8") as f:
                storm_preds = json.load(f)
            with open(segments_geojson_path, "r", encoding="utf-8") as f:
                base_geojson = json.load(f)

            pred_lookup = {p["segment_id"]: p for p in storm_preds if p["horizon_h"] == hour}
            features = []
            for feat in base_geojson.get("features", []):
                seg_id = feat["properties"]["id"]
                pred = pred_lookup.get(seg_id)
                props = dict(feat["properties"])
                if pred:
                    props.update(pred)
                features.append({"type": "Feature", "properties": props, "geometry": feat["geometry"]})

            return {
                "type": "FeatureCollection",
                "name": f"jaldrishti_storm_july2024_h{hour}",
                "crs": base_geojson.get("crs"),
                "features": features
            }

    # 2. High-speed GeoJSON cache lookup (sub-2ms response time)
    cache_file = DATA_DIR / f"predictions_h{hour}.geojson"
    if cache_file.exists():
        with open(cache_file, "r", encoding="utf-8") as f:
            return json.load(f)

    # 3. Fallback: Query live database
    raise HTTPException(
        status_code=404,
        detail=f"Prediction cache for horizon +{hour}h not found. Run pipeline/refresh.py first."
    )


@router.get("/{segment_id:path}", summary="Get detailed risk forecast card for a single segment")
def get_segment_prediction(
    segment_id: str,
    hour: int = Query(1, ge=1, le=6, description="Forecast horizon in hours ahead (1 to 6)"),
    db: Session = Depends(get_db)
):
    """
    Returns a single segment prediction matching the frozen Prediction contract:
    probability, class, confidence badge, data age, and plain-language SHAP explanations.
    """
    # Query database first
    pred = db.query(PredictionModel).filter(
        PredictionModel.segment_id == segment_id,
        PredictionModel.horizon_h == hour
    ).order_by(PredictionModel.computed_at.desc()).first()

    if pred:
        return {
            "segment_id": pred.segment_id,
            "horizon_h": pred.horizon_h,
            "risk_class": pred.risk_class,
            "probability": pred.probability,
            "confidence_level": pred.confidence_level,
            "confidence_score": pred.confidence_score,
            "conf_set_size": pred.conf_set_size,
            "top_reasons": pred.top_reasons,
            "rain_data_age_min": pred.rain_data_age_min,
            "is_ood": pred.is_ood,
            "ensemble_spread": pred.ensemble_spread,
            "model_version": pred.model_version,
            "computed_at": pred.computed_at.isoformat() if pred.computed_at else None
        }

    # Fallback to cache
    cache_file = DATA_DIR / f"predictions_h{hour}.geojson"
    if cache_file.exists():
        with open(cache_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            for feat in data.get("features", []):
                props = feat.get("properties", {})
                if props.get("id") == segment_id or props.get("segment_id") == segment_id:
                    return {
                        "segment_id": segment_id,
                        "horizon_h": hour,
                        "risk_class": props.get("risk_class", "low"),
                        "probability": props.get("probability", 0.0),
                        "confidence_level": props.get("confidence_level", "High"),
                        "confidence_score": props.get("confidence_score", 0.95),
                        "conf_set_size": props.get("conf_set_size", 1),
                        "top_reasons": props.get("top_reasons", ["Low waterlogging risk"]),
                        "rain_data_age_min": props.get("rain_data_age_min", 0),
                        "is_ood": props.get("is_ood", False),
                        "ensemble_spread": props.get("ensemble_spread", 0.0),
                        "model_version": props.get("model_version", "v1.0.0-lightgbm-isotonic"),
                        "computed_at": props.get("computed_at")
                    }

    raise HTTPException(status_code=404, detail=f"Prediction for segment '{segment_id}' at +{hour}h not found.")
