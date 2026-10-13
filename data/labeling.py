"""
Phase 1.4 — Label Engineering & Realistic Hydraulic Event Dataset Generation
Snaps incident hotspots to road segments, enriches with antecedent ERA5 rainfall,
and builds the training segment_events table using physical inundation criteria.
"""
import os
import json
from datetime import datetime, date, timedelta
import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point
from data.db import SessionLocal
from data.models import Segment, SegmentEvent

HOTSPOTS_PATH = "data/raw/incidents.csv"
SEGMENTS_PATH = "data/processed/pilot_segments.geojson"
FEATURES_PATH = "data/processed/segment_features.json"
ERA5_PATH = "data/raw/era5_pune_2018_2026.csv"
EVENTS_JSON_OUT = "data/processed/segment_events.json"

# Curated coordinates for the 26 Pune hotspots
HOTSPOT_COORDS = {
    "Baner Road near Balewadi Phata": (73.7842, 18.5615),
    "Bremen Chowk Aundh": (73.8124, 18.5583),
    "Pashan Circle - Sus Road": (73.7925, 18.5361),
    "Sinhagad Road near Pu La Deshpande Garden": (73.8341, 18.4925),
    "Alka Talkies Chowk": (73.8472, 18.5146),
    "Sancheti Hospital Chowk": (73.8515, 18.5312),
    "Pune Station Chowk": (73.8741, 18.5284),
    "Swargate Chowk": (73.8583, 18.5012),
    "Deccan Gymkhana Goodluck Chowk": (73.8415, 18.5173),
    "Chandani Chowk": (73.7845, 18.5085),
    "University Road near E-Square": (73.8341, 18.5385),
    "Pulgate Chowk": (73.8821, 18.5105),
    "Koregaon Park North Main Road": (73.8932, 18.5375),
    "Kalyani Nagar Nagar Road junction": (73.9035, 18.5492),
    "Hadapsar Gadital": (73.9215, 18.5025),
    "Viman Nagar Symbiosis Road": (73.9142, 18.5662),
    "Magarpatta South Gate": (73.9210, 18.5152),
    "Katraj Chowk": (73.8582, 18.4815),
    "Kothrud Karve Road near Karve Statue": (73.8195, 18.5035),
    "Paud Road near Vanaz": (73.8052, 18.5065),
    "Yerwada Golf Course Chowk": (73.8812, 18.5542),
    "Dhanori Tingre Nagar Road": (73.8895, 18.5771),
    "Warje Bridge Underpass": (73.7985, 18.4842),
    "Sinhagad Road Manikbaug": (73.8215, 18.4812),
    "Aundh DP Road near Medi-Point": (73.8085, 18.5645),
    "Pashan-Baner Link Road": (73.7952, 18.5495),
}

GRADE_SEVERITY = {
    "A+": (4, "severe"),
    "A": (3, "high"),
    "B+": (2, "moderate"),
    "B": (1, "moderate"),
}

def load_era5_rainfall():
    print(f"Loading ERA5 rainfall history from {ERA5_PATH}...")
    df = pd.read_csv(ERA5_PATH)
    df["time"] = pd.to_datetime(df["time"])
    df = df.sort_values(by="time").set_index("time")
    return df

def get_rainfall_window(df_era5, target_dt):
    """Compute antecedent rainfall in 1h, 3h, 6h, 24h, 72h windows."""
    try:
        idx = df_era5.index.get_indexer([target_dt], method="nearest")[0]
        actual_time = df_era5.index[idx]

        r1 = df_era5.loc[actual_time - timedelta(hours=1):actual_time, "precip_mm"].sum()
        r3 = df_era5.loc[actual_time - timedelta(hours=3):actual_time, "precip_mm"].sum()
        r6 = df_era5.loc[actual_time - timedelta(hours=6):actual_time, "precip_mm"].sum()
        r24 = df_era5.loc[actual_time - timedelta(hours=24):actual_time, "precip_mm"].sum()
        r72 = df_era5.loc[actual_time - timedelta(hours=72):actual_time, "precip_mm"].sum()
        sm = float(df_era5.loc[actual_time, "soil_moisture"])
        return float(r1), float(r3), float(r6), float(r24), float(r72), float(sm)
    except Exception:
        return 0.0, 0.0, 0.0, 0.0, 0.0, 0.25

def build_label_dataset():
    print("Loading incidents, features, and segments...")
    df_incidents = pd.read_csv(HOTSPOTS_PATH)
    gdf_segments = gpd.read_file(SEGMENTS_PATH)
    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        features_list = json.load(f)
    features_by_id = {f["segment_id"]: f for f in features_list}

    gdf_utm = gdf_segments.to_crs("EPSG:32643")
    df_era5 = load_era5_rainfall()

    print("Snapping hotspots to pilot segments...")
    snapped_hotspots = {}

    for _, row in df_incidents.iterrows():
        name = row["segment_name"]
        lon, lat = HOTSPOT_COORDS.get(name, (73.815, 18.530))
        pt_utm = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs("EPSG:32643").iloc[0]

        dists = gdf_utm.distance(pt_utm)
        nearest_idx = dists.idxmin()
        nearest_seg_id = gdf_segments.loc[nearest_idx, "id"]
        
        snapped_hotspots[nearest_seg_id] = {
            "name": name,
            "grade": str(row["grade"]).strip(),
            "source": row["source"],
            "ward": row["ward"]
        }

    print(f"Mapped {len(snapped_hotspots)} distinct segments to official hotspots.")

    # Historical storms and sample dry dates with hours aligned to actual ERA5 peak precipitation
    storm_dates = [
        ("2024-07-25", [3, 4, 5, 6, 7, 8], "July 2024 Cloudburst"),
        ("2024-08-04", [8, 9, 10, 11, 12, 13], "August 2024 Heavy Downpour"),
        ("2024-09-25", [7, 8, 9, 10, 11, 12], "September 2024 Monsoon Surge"),
        ("2019-09-24", [7, 8, 9, 10, 11, 12], "September 2019 Pune Floods"),
        ("2022-08-31", [8, 9, 10, 11, 12, 13], "August 2022 Flash Flooding"),
        ("2020-06-17", [5, 6, 7, 8, 9, 10], "June 2020 Monsoon Inundation")
    ]
    dry_dates = ["2023-01-15", "2023-04-10", "2023-11-20", "2024-02-14", "2024-05-18", "2024-06-05"]

    events_list = []
    seen_events = set()

    # Sample representative segments across corridor (hotspots + arterial connectors + low-lying roads + ridges)
    sampled_segments = list(snapped_hotspots.keys())
    remaining_segs = [s for s in gdf_segments["id"].tolist() if s not in snapped_hotspots]
    np.random.seed(42)
    sampled_segments.extend(list(np.random.choice(remaining_segs, size=min(180, len(remaining_segs)), replace=False)))

    # Process each storm date and hour
    for d_str, hours, storm_name in storm_dates:
        for h in hours:
            dt = datetime.strptime(f"{d_str} {h:02d}:00:00", "%Y-%m-%d %H:%M:%S")
            r1, r3, r6, r24, r72, sm = get_rainfall_window(df_era5, dt)

            for seg_id in sampled_segments:
                evt_key = (seg_id, d_str, h)
                if evt_key in seen_events:
                    continue
                seen_events.add(evt_key)

                feat = features_by_id.get(seg_id, {})
                hand = feat.get("hand_mean", 4.0)
                drainage = feat.get("drainage_coverage_pct", 50.0)
                is_underpass = feat.get("is_underpass", False)
                dist_waterway = feat.get("dist_to_waterway_m", 500.0)

                is_hotspot = seg_id in snapped_hotspots
                hotspot_info = snapped_hotspots.get(seg_id, {})
                grade = hotspot_info.get("grade", "B")

                # Physical Inundation Rule:
                # Waterlogging requires SUFFICIENT RAINFALL exceeding local terrain & drainage capacity!
                is_flooded = False
                severity = 0
                risk_class = "low"
                source_tag = "ERA5 Physical Sensor Simulation"

                if r3 >= 6.0:  # Active rain event
                    # Criteria 1: Grade A+ hotspot during heavy rain
                    if is_hotspot and grade == "A+" and (r3 >= 12.0 or r1 >= 8.0):
                        is_flooded = True
                        severity = 4
                        risk_class = "severe"
                        source_tag = f"Pune Police Grade A+ Hotspot ({storm_name})"
                    # Criteria 2: Grade A hotspot during heavy rain
                    elif is_hotspot and grade == "A" and r3 >= 14.0:
                        is_flooded = True
                        severity = 3
                        risk_class = "high"
                        source_tag = f"Pune Police Grade A Hotspot ({storm_name})"
                    # Criteria 3: Road underpass flash flooding
                    elif is_underpass and (r1 >= 7.0 or r3 >= 15.0):
                        is_flooded = True
                        severity = 4
                        risk_class = "severe"
                        source_tag = f"Underpass Subway Inundation ({storm_name})"
                    # Criteria 4: Very low-lying terrain (HAND < 2.2m) near drainage channel
                    elif hand < 2.2 and dist_waterway < 200.0 and r3 >= 16.0:
                        is_flooded = True
                        severity = 3
                        risk_class = "high"
                        source_tag = f"Low HAND Floodplain Overflow ({storm_name})"
                    # Criteria 5: Grade B/B+ hotspot or poor drainage with moderate rain
                    elif (is_hotspot and r3 >= 18.0) or (drainage < 35.0 and hand < 3.0 and r3 >= 22.0):
                        is_flooded = True
                        severity = 2
                        risk_class = "moderate"
                        source_tag = f"Drainage Bottleneck Inundation ({storm_name})"

                # If flooded: record positive event. If dry: record negative event.
                grade_label = grade if is_hotspot else None
                events_list.append({
                    "segment_id": seg_id,
                    "event_date": d_str,
                    "event_hour": h,
                    "risk_class": risk_class,
                    "severity": severity,
                    "source": source_tag,
                    "source_grade": grade_label,
                    "rainfall_1h": round(r1, 2),
                    "rainfall_3h": round(r3, 2),
                    "rainfall_6h": round(r6, 2),
                    "rainfall_24h": round(r24, 2),
                    "rainfall_72h": round(r72, 2),
                    "soil_moisture": round(sm, 2)
                })

    # Add dry baseline events (non-stormy days)
    for d_str in dry_dates:
        for seg_id in sampled_segments:
            h = int(np.random.choice([8, 12, 16, 20]))
            evt_key = (seg_id, d_str, h)
            if evt_key in seen_events:
                continue
            seen_events.add(evt_key)

            dt = datetime.strptime(f"{d_str} {h:02d}:00:00", "%Y-%m-%d %H:%M:%S")
            r1, r3, r6, r24, r72, sm = get_rainfall_window(df_era5, dt)

            events_list.append({
                "segment_id": seg_id,
                "event_date": d_str,
                "event_hour": h,
                "risk_class": "low",
                "severity": 0,
                "source": "Historical Dry Baseline (ERA5)",
                "source_grade": None,
                "rainfall_1h": round(r1, 2),
                "rainfall_3h": round(r3, 2),
                "rainfall_6h": round(r6, 2),
                "rainfall_24h": round(r24, 2),
                "rainfall_72h": round(r72, 2),
                "soil_moisture": round(sm, 2)
            })

    df_evts = pd.DataFrame(events_list)
    positives = (df_evts["risk_class"] != "low").sum()
    negatives = (df_evts["risk_class"] == "low").sum()
    print(f"Total events generated: {len(events_list)} (Positives: {positives}, Negatives: {negatives})")

    # Ingest into PostGIS
    print("Ingesting segment events into Neon PostGIS...")
    db = SessionLocal()
    try:
        db.query(SegmentEvent).delete()
        db.commit()

        db_events = []
        for e in events_list:
            db_ev = SegmentEvent(
                segment_id=e["segment_id"],
                event_date=datetime.strptime(e["event_date"], "%Y-%m-%d").date(),
                event_hour=e["event_hour"],
                risk_class=e["risk_class"],
                severity=e["severity"],
                source=e["source"],
                source_grade=e["source_grade"],
                rainfall_1h=e["rainfall_1h"],
                rainfall_3h=e["rainfall_3h"],
                rainfall_6h=e["rainfall_6h"],
                rainfall_24h=e["rainfall_24h"],
                rainfall_72h=e["rainfall_72h"],
                soil_moisture=e["soil_moisture"]
            )
            db_events.append(db_ev)

        db.bulk_save_objects(db_events)
        db.commit()
        print(f"Successfully committed {len(db_events)} segment events to Neon database.")
    except Exception as e:
        db.rollback()
        print(f"Database error during event insertion: {e}")
        raise
    finally:
        db.close()

    # Save to JSON cache
    with open(EVENTS_JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(events_list, f, indent=2)
    print(f"Saved labelled events to {EVENTS_JSON_OUT}")

    return events_list

if __name__ == "__main__":
    build_label_dataset()
