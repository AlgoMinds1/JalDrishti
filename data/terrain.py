"""
Phase 1.3 — Terrain & Static Features Pipeline
Samples elevation, slope, HAND, built-up share, and proximity to waterways & drains.
"""
import os
import numpy as np
import rasterio
import geopandas as gpd
from shapely.geometry import Point
from data.db import SessionLocal
from data.models import Segment, SegmentFeature

SEGMENTS_PATH = "data/processed/pilot_segments.geojson"
DEM_PATH = "data/raw/pune_dem.tif"
HAND_PATH = "data/raw/pune_hand.tif"
WORLDCOVER_PATH = "data/raw/pune_worldcover.tif"
WATERWAYS_PATH = "data/raw/pune_pilot_waterways.geojson"
DRAINS_PATH = "data/raw/pmc/pmc_drains_pilot.geojson"

def compute_slope(dem_src, lon, lat, step=0.0003): # ~30m step
    """Compute terrain slope in degrees at a coordinate using central difference."""
    try:
        r, c = dem_src.index(lon, lat)
        w = dem_src.read(1, window=((max(0, r-1), min(dem_src.height, r+2)),
                                   (max(0, c-1), min(dem_src.width, c+2))))
        if w.shape == (3, 3):
            # 30m resolution in meters approx: 1 deg lat ~ 111,000m, lon ~ 105,000m
            dx = (float(w[1, 2]) - float(w[1, 0])) / 60.0
            dy = (float(w[2, 1]) - float(w[0, 1])) / 60.0
            slope_rad = np.arctan(np.sqrt(dx**2 + dy**2))
            return float(np.degrees(slope_rad))
    except Exception:
        pass
    return 1.5

def extract_terrain_features():
    print(f"Loading pilot segments from {SEGMENTS_PATH}...")
    gdf_segments = gpd.read_file(SEGMENTS_PATH)
    print(f"Loaded {len(gdf_segments)} segments.")

    # Project waterways to UTM 43N for meter distances
    print("Loading waterways and municipal drains...")
    gdf_waterways = gpd.read_file(WATERWAYS_PATH).to_crs("EPSG:32643")
    waterway_union = gdf_waterways.geometry.unary_union

    gdf_drains = None
    if os.path.exists(DRAINS_PATH):
        try:
            gdf_drains = gpd.read_file(DRAINS_PATH).to_crs("EPSG:32643")
            drain_union = gdf_drains.geometry.unary_union
            print(f"Loaded {len(gdf_drains)} municipal drainage features.")
        except Exception as e:
            print(f"Warning: could not process drains: {e}")
            drain_union = None
    else:
        drain_union = None

    gdf_utm = gdf_segments.to_crs("EPSG:32643")

    features_list = []

    print("Opening raster data (DEM, HAND, WorldCover)...")
    with rasterio.open(DEM_PATH) as dem_src, \
         rasterio.open(HAND_PATH) as hand_src, \
         rasterio.open(WORLDCOVER_PATH) as wc_src:

        for idx, row in gdf_segments.iterrows():
            geom = row.geometry
            # Sample coordinates along the segment (start, midpoint, end)
            coords = list(geom.coords)
            sample_points = [coords[0], coords[len(coords) // 2], coords[-1]]

            elevations = []
            hands = []
            builtup_samples = []
            slopes = []

            for lon, lat in sample_points:
                # Sample DEM
                for val in dem_src.sample([(lon, lat)]):
                    elev = float(val[0])
                    if elev > -100:
                        elevations.append(elev)

                # Sample HAND
                for val in hand_src.sample([(lon, lat)]):
                    h_val = float(val[0])
                    if h_val >= 0:
                        hands.append(h_val)

                # Sample WorldCover
                for val in wc_src.sample([(lon, lat)]):
                    # Class 50 = Built-up in ESA WorldCover
                    is_built = 1.0 if int(val[0]) == 50 else 0.0
                    builtup_samples.append(is_built)

                # Slope
                slopes.append(compute_slope(dem_src, lon, lat))

            elev_mean = float(np.mean(elevations)) if elevations else 560.0
            elev_min = float(np.min(elevations)) if elevations else elev_mean
            hand_mean = float(np.mean(hands)) if hands else 3.5
            hand_min = float(np.min(hands)) if hands else hand_mean
            slope_mean = float(np.mean(slopes)) if slopes else 1.5
            builtup_share = float(np.mean(builtup_samples)) if builtup_samples else 0.85

            # Distance to nearest waterway in meters
            seg_geom_utm = gdf_utm.geometry.iloc[idx]
            dist_waterway = float(seg_geom_utm.distance(waterway_union)) if waterway_union is not None else 500.0

            # Drainage coverage % (closer to municipal drains = higher coverage)
            if drain_union is not None:
                dist_drain = float(seg_geom_utm.distance(drain_union))
                # Coverage score: 100% within 20m, decaying to 10% beyond 200m
                drain_cov = float(max(10.0, min(100.0, 100.0 - (dist_drain / 2.0))))
            else:
                drain_cov = 50.0

            feat = {
                "segment_id": row["id"],
                "elevation_mean": round(elev_mean, 2),
                "elevation_min": round(elev_min, 2),
                "slope_mean": round(slope_mean, 2),
                "hand_mean": round(hand_mean, 2),
                "hand_min": round(hand_min, 2),
                "builtup_share": round(builtup_share, 2),
                "dist_to_waterway_m": round(dist_waterway, 1),
                "drainage_coverage_pct": round(drain_cov, 1),
                "road_class": row["road_class"],
                "is_underpass": row["is_underpass"],
                "is_bridge": row["is_bridge"],
                "is_tunnel": row["is_tunnel"]
            }
            features_list.append(feat)

    print(f"Computed static terrain features for {len(features_list)} segments.")

    # Ingest into PostGIS
    print("Ingesting features into Neon PostGIS...")
    db = SessionLocal()
    try:
        db.query(SegmentFeature).delete()
        db.commit()

        db_feats = [SegmentFeature(**f) for f in features_list]
        db.bulk_save_objects(db_feats)
        db.commit()
        print(f"Successfully committed {len(db_feats)} segment features to Neon.")
    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")
        raise
    finally:
        db.close()

    # Save to JSON cache for offline demo / ML training speed
    out_json = "data/processed/segment_features.json"
    import json
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(features_list, f, indent=2)
    print(f"Saved features cache to {out_json}")

    return features_list

if __name__ == "__main__":
    extract_terrain_features()
