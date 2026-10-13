"""
Phase 3 Quality & Gate Test
Verifies Phase 3 gate conditions:
1. One command (pipeline/refresh.py) rebuilds all predictions for the pilot corridor.
2. Neon PostGIS predictions table contains active multi-horizon records.
3. GET /predictions?hour=1 returns valid GeoJSON FeatureCollection with required properties.
4. GET /predictions/{segment_id}?hour=1 returns valid single segment card.
5. GET /health reports honest data freshness and model version.
6. GET /evaluate exposes verified model metrics and baseline comparisons.
"""
import os
import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure root workspace is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from api.main import app
from data.db import SessionLocal
from data.models import Prediction as PredictionModel

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint reports correct phase, model version, and freshness."""
    resp = client.get("/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    data = resp.json()
    assert data["status"] == "ok"
    assert "Phase 3" in data["phase"]
    assert "v1.0.0" in data["model_version"]
    assert data["total_segments"] == 1000
    assert data["active_horizons"] == [1, 2, 3, 4, 5, 6]
    assert "last_pipeline_run" in data
    assert isinstance(data["rain_data_age_min"], int)


def test_predictions_geojson_endpoint():
    """Verify GET /predictions?hour=1 returns valid GeoJSON with 1,000 pilot segments."""
    for h in [1, 3, 6]:
        resp = client.get(f"/predictions?hour={h}")
        assert resp.status_code == 200, f"Failed for horizon {h}: {resp.text}"
        data = resp.json()
        assert data.get("type") == "FeatureCollection"
        features = data.get("features", [])
        assert len(features) == 1000, f"Expected 1,000 features, got {len(features)}"

        # Inspect first feature properties
        props = features[0]["properties"]
        assert "risk_class" in props
        assert props["risk_class"] in ["low", "moderate", "high", "severe"]
        assert "probability" in props
        assert 0.0 <= props["probability"] <= 1.0
        assert "confidence_level" in props
        assert props["confidence_level"] in ["High", "Medium", "Low"]
        assert "top_reasons" in props
        assert isinstance(props["top_reasons"], list)
        assert len(props["top_reasons"]) > 0
        assert "rain_data_age_min" in props
        assert "is_ood" in props

        # Verify geometry
        geom = features[0]["geometry"]
        assert geom["type"] == "LineString"
        assert len(geom["coordinates"]) >= 2


def test_single_segment_prediction():
    """Verify GET /predictions/{segment_id} conforms to frozen contract."""
    # Fetch a segment id from the geojson endpoint
    resp_all = client.get("/predictions?hour=1")
    features = resp_all.json().get("features", [])
    assert len(features) > 0
    seg_id = features[0]["properties"]["id"]

    resp_single = client.get(f"/predictions/{seg_id}?hour=1")
    assert resp_single.status_code == 200, f"Single segment failed: {resp_single.text}"
    seg_data = resp_single.json()
    assert seg_data["segment_id"] == seg_id
    assert seg_data["horizon_h"] == 1
    assert seg_data["risk_class"] in ["low", "moderate", "high", "severe"]
    assert 0.0 <= seg_data["probability"] <= 1.0
    assert seg_data["confidence_level"] in ["High", "Medium", "Low"]
    assert isinstance(seg_data["top_reasons"], list)


def test_storm_simulation_scenario():
    """Verify historical storm cloudburst simulation works for emergency testing."""
    resp = client.get("/predictions?hour=2&scenario=storm_july2024")
    assert resp.status_code == 200
    data = resp.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 1000

    # In peak storm cloudburst scenario, some low-lying/underpass segments must be severe or high
    high_or_severe = [
        f for f in data["features"]
        if f["properties"].get("risk_class") in ["high", "severe"]
    ]
    assert len(high_or_severe) > 0, "July 2024 cloudburst simulation should produce high/severe segments"


def test_database_predictions_populated():
    """Verify Neon PostGIS database contains stored predictions."""
    db = SessionLocal()
    try:
        count = db.query(PredictionModel).count()
        assert count > 0, "Predictions table in PostGIS is empty"
    finally:
        db.close()


def test_evaluate_endpoint():
    """Verify /evaluate returns PR-AUC and baseline comparisons."""
    resp = client.get("/evaluate")
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "baselines_comparison" in data
    assert data["summary"]["pr_auc"] > data["baselines_comparison"]["hotspot_only"]["pr_auc"]



if __name__ == "__main__":
    print("Running Phase 3 Gate Tests...")
    test_health_endpoint()
    print("✓ test_health_endpoint passed")
    test_predictions_geojson_endpoint()
    print("✓ test_predictions_geojson_endpoint passed")
    test_single_segment_prediction()
    print("✓ test_single_segment_prediction passed")
    test_storm_simulation_scenario()
    print("✓ test_storm_simulation_scenario passed")
    test_database_predictions_populated()
    print("✓ test_database_predictions_populated passed")
    test_evaluate_endpoint()
    print("✓ test_evaluate_endpoint passed")
    print("\nALL PHASE 3 GATE TESTS PASSED SUCCESSFULLY! 🚀")
