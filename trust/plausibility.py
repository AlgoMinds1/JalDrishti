"""
Phase 5 — Physical Plausibility & Road Snapping Verification
Validates citizen flood reports against physical ground truths:
1. Snaps report GPS coordinates to nearest OSM road segment within 300 meters.
2. Checks rainfall plausibility against live/cached precipitation data.
3. Checks terrain plausibility against HAND (Height Above Nearest Drainage) and slope.
"""
import json
from pathlib import Path
from typing import Tuple, Optional
import numpy as np
from shapely.geometry import Point, LineString

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data" / "processed"
SEGMENTS_GEOJSON = DATA_DIR / "pilot_segments.geojson"
FEATURES_CACHE = DATA_DIR / "segment_features.json"
RAINFALL_CACHE = DATA_DIR / "rainfall_cache.json"

_segments_cache = None
_features_by_id = None


def _load_spatial_index():
    global _segments_cache, _features_by_id
    if _segments_cache is None and SEGMENTS_GEOJSON.exists():
        with open(SEGMENTS_GEOJSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        _segments_cache = []
        for feat in data.get("features", []):
            coords = feat["geometry"]["coordinates"]
            line = LineString(coords)
            _segments_cache.append({
                "id": feat["properties"]["id"],
                "name": feat["properties"].get("name", "Arterial Road"),
                "road_class": feat["properties"].get("road_class", "secondary"),
                "is_underpass": feat["properties"].get("is_underpass", False),
                "geom": line
            })

    if _features_by_id is None and FEATURES_CACHE.exists():
        with open(FEATURES_CACHE, "r", encoding="utf-8") as f:
            feats = json.load(f)
        _features_by_id = {item["segment_id"]: item for item in feats}


def snap_to_segment(lat: float, lon: float, max_dist_m: float = 300.0) -> Tuple[Optional[str], float, Optional[dict]]:
    """
    Snaps a citizen GPS report (lat, lon) to the nearest pilot road segment.
    Returns: (segment_id, distance_meters, segment_info)
    """
    _load_spatial_index()
    if not _segments_cache:
        return None, 999.0, None

    # Point in (lon, lat) WGS84
    pt = Point(lon, lat)

    min_dist_deg = float("inf")
    best_seg = None

    for seg in _segments_cache:
        dist_deg = seg["geom"].distance(pt)
        if dist_deg < min_dist_deg:
            min_dist_deg = dist_deg
            best_seg = seg

    # Approximate 1 deg latitude ~ 111,000 meters in Pune
    dist_m = min_dist_deg * 111000.0

    if dist_m > max_dist_m or best_seg is None:
        return None, round(dist_m, 1), None

    return best_seg["id"], round(dist_m, 1), best_seg


def get_segment_terrain(segment_id: str) -> dict:
    """Returns static terrain properties for a segment."""
    _load_spatial_index()
    if _features_by_id and segment_id in _features_by_id:
        return _features_by_id[segment_id]
    return {
        "hand_mean": 3.5,
        "hand_min": 3.0,
        "slope_mean": 1.5,
        "is_underpass": 0,
        "drainage_coverage_pct": 50.0
    }


def check_terrain_plausibility(segment_id: str) -> Tuple[bool, bool, dict]:
    """
    Evaluates whether the terrain physically permits water accumulation.
    Returns: (is_low_lying, is_ridge_disqualified, terrain_dict)
    """
    terrain = get_segment_terrain(segment_id)
    hand = terrain.get("hand_mean", 3.5)
    slope = terrain.get("slope_mean", 1.5)
    is_underpass = bool(terrain.get("is_underpass", False))

    # A ridge or hilltop (HAND > 12m, slope > 8 deg) cannot naturally pool floodwater
    is_ridge = (hand > 12.0 and slope > 8.0) or (hand > 15.0)

    # Low-lying terrain prone to inundation
    is_low_lying = is_underpass or (hand < 5.0 and slope < 4.0)

    return is_low_lying, is_ridge, terrain


def get_recent_rainfall() -> float:
    """Fetches total recent / upcoming 3-hour rainfall in mm."""
    if RAINFALL_CACHE.exists():
        try:
            with open(RAINFALL_CACHE, "r", encoding="utf-8") as f:
                data = json.load(f)
            precip = data.get("hourly_precip", [0.0] * 3)
            return float(sum(precip[:3]))
        except Exception:
            pass
    return 0.0
