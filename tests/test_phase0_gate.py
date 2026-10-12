import os
import sys
import json
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
from fastapi.testclient import TestClient
from api.main import app

def check_fixtures():
    print("[1/6] Checking fixtures...")
    assert os.path.exists("fixtures/fake_prediction.json"), "Missing fixtures/fake_prediction.json"
    assert os.path.exists("fixtures/fake_report.json"), "Missing fixtures/fake_report.json"
    with open("fixtures/fake_prediction.json", "r", encoding="utf-8") as f:
        p = json.load(f)
        assert p["risk_class"] in ["low", "medium", "high", "critical"]
    with open("fixtures/fake_report.json", "r", encoding="utf-8") as f:
        r = json.load(f)
        assert "trust_score" in r
    print("  -> Fixtures OK!")

def check_health_endpoint():
    print("[2/6] Checking API /health endpoint...")
    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200, f"Health check returned {res.status_code}"
    assert res.json()["status"] == "ok"
    print("  -> Health endpoint OK!")

def check_ml_libraries():
    print("[3/6] Checking ML & Geospatial imports...")
    import lightgbm
    import shap
    import mapie
    import geopandas
    import rasterio
    import osmnx
    print("  -> LightGBM, SHAP, MAPIE, GeoPandas, Rasterio, OSMnx imported successfully!")

def check_data_assets():
    print("[4/6] Checking downloaded raw data assets...")
    import rasterio
    import osmnx
    
    if os.path.exists("data/raw/pune_dem.tif"):
        with rasterio.open("data/raw/pune_dem.tif") as src:
            print(f"  -> DEM loaded: shape={src.shape}, crs={src.crs}")
    else:
        print("  -> WARNING: data/raw/pune_dem.tif not yet downloaded")

    if os.path.exists("data/raw/pune_hand.tif"):
        with rasterio.open("data/raw/pune_hand.tif") as src:
            print(f"  -> HAND loaded: shape={src.shape}, crs={src.crs}")
    else:
        print("  -> WARNING: data/raw/pune_hand.tif not yet downloaded")

    if os.path.exists("data/raw/pune_pilot_roads.graphml"):
        G = osmnx.load_graphml("data/raw/pune_pilot_roads.graphml")
        print(f"  -> OSM Roads loaded: {len(G.nodes)} nodes, {len(G.edges)} edges")
    else:
        print("  -> WARNING: data/raw/pune_pilot_roads.graphml not yet downloaded")

    if os.path.exists("data/raw/era5_pune_2018_2026.csv"):
        df = pd.read_csv("data/raw/era5_pune_2018_2026.csv")
        print(f"  -> ERA5 CSV loaded: {len(df)} rows")
        assert len(df) >= 1000, "ERA5 dataset has fewer than 1,000 rows"
    else:
        print("  -> WARNING: data/raw/era5_pune_2018_2026.csv not yet downloaded")

if __name__ == "__main__":
    print("=== JalDrishti Phase 0 Gate Verification ===")
    check_fixtures()
    check_health_endpoint()
    try:
        check_ml_libraries()
    except Exception as e:
        print(f"  -> Library check failed: {e}")
    try:
        check_data_assets()
    except Exception as e:
        print(f"  -> Data asset check failed: {e}")
    print("=== Verification Run Complete ===")
