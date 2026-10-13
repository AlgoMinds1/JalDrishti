"""
Phase 1.2 — Segment Graph Construction & PostGIS Ingestion
Extracts arterial road segments from OSM graph for the pilot corridor.
"""
import os
import json
from pathlib import Path
import osmnx as ox
import geopandas as gpd
from shapely.geometry import LineString
from geoalchemy2.shape import from_shape
from data.db import SessionLocal, engine
from data.models import Segment

os.makedirs("data/processed", exist_ok=True)

GRAPH_PATH = "data/raw/pune_pilot_roads.graphml"
GEOJSON_OUT = "data/processed/pilot_segments.geojson"

def build_pilot_segments(limit: int = 1500):
    print(f"Loading OSM road network from {GRAPH_PATH}...")
    G = ox.load_graphml(GRAPH_PATH)
    _, edges = ox.graph_to_gdfs(G)
    print(f"Total raw edges in bbox: {len(edges)}")

    # Target arterial corridors for the pilot demo: trunk, primary, secondary, tertiary + links
    arterial_classes = [
        "trunk", "primary", "secondary", "tertiary",
        "trunk_link", "primary_link", "secondary_link", "tertiary_link"
    ]

    def matches_arterial(hw):
        if isinstance(hw, list):
            return any(h in arterial_classes for h in hw)
        return hw in arterial_classes

    art_edges = edges[edges["highway"].apply(matches_arterial)].copy()
    print(f"Arterial edges count: {len(art_edges)}")

    # Clean attributes
    segments_data = []
    seen_ids = set()

    for idx, (u, v, k) in enumerate(art_edges.index):
        row = art_edges.loc[(u, v, k)]
        if isinstance(row, gpd.GeoDataFrame):
            row = row.iloc[0]

        osmid = row.get("osmid", f"{u}_{v}")
        if isinstance(osmid, list):
            osmid = osmid[0]

        seg_id = f"way/{osmid}_{k}"
        if seg_id in seen_ids:
            seg_id = f"way/{osmid}_{k}_{idx}"
        seen_ids.add(seg_id)

        name = row.get("name")
        if isinstance(name, list):
            name = " / ".join(str(n) for n in name if n)
        elif not name or str(name) == "nan":
            name = "Corridor Connector"
        else:
            name = str(name)

        hw = row.get("highway")
        road_class = hw[0] if isinstance(hw, list) else str(hw)

        length_m = float(row.get("length", 0.0))

        # Underpass / Bridge / Tunnel detection
        bridge = str(row.get("bridge", "no")).lower()
        tunnel = str(row.get("tunnel", "no")).lower()
        is_bridge = bridge in ["yes", "true", "1"]
        is_tunnel = tunnel in ["yes", "true", "1"]
        is_underpass = is_tunnel or "underpass" in name.lower() or "subway" in name.lower()

        geom = row.geometry
        if not isinstance(geom, LineString):
            # Convert multi-point / multilinestring if needed
            geom = LineString(geom.coords)

        segments_data.append({
            "id": seg_id,
            "name": name,
            "road_class": road_class,
            "length_m": round(length_m, 2),
            "is_underpass": is_underpass,
            "is_bridge": is_bridge,
            "is_tunnel": is_tunnel,
            "geometry": geom
        })

    gdf_segments = gpd.GeoDataFrame(segments_data, crs="EPSG:4326")

    # If limit specified, sort to retain the most critical segments (named, longer, or with junctions)
    if limit and len(gdf_segments) > limit:
        # Prioritize named roads and underpasses/bridges
        gdf_segments["priority"] = (
            (gdf_segments["name"] != "Corridor Connector").astype(int) * 2 +
            (gdf_segments["is_underpass"] | gdf_segments["is_bridge"]).astype(int) * 3 +
            (gdf_segments["length_m"] > 20).astype(int)
        )
        gdf_segments = gdf_segments.sort_values(by="priority", ascending=False).head(limit)
        gdf_segments = gdf_segments.drop(columns=["priority"])

    print(f"Selected {len(gdf_segments)} pilot road segments.")

    # Save to GeoJSON
    gdf_segments.to_file(GEOJSON_OUT, driver="GeoJSON")
    print(f"Saved segments to {GEOJSON_OUT} ({os.path.getsize(GEOJSON_OUT)} bytes)")

    # Ingest into PostGIS
    print("Ingesting segments into Neon PostGIS...")
    db = SessionLocal()
    try:
        # Clear existing segments before reload
        db.query(Segment).delete()
        db.commit()

        db_segments = []
        for _, r in gdf_segments.iterrows():
            db_seg = Segment(
                id=r["id"],
                name=r["name"],
                road_class=r["road_class"],
                length_m=r["length_m"],
                is_underpass=bool(r["is_underpass"]),
                is_bridge=bool(r["is_bridge"]),
                is_tunnel=bool(r["is_tunnel"]),
                geometry=from_shape(r["geometry"], srid=4326)
            )
            db_segments.append(db_seg)

        db.bulk_save_objects(db_segments)
        db.commit()
        print(f"Successfully committed {len(db_segments)} segments to Neon database.")
    except Exception as e:
        db.rollback()
        print(f"Error ingesting into PostGIS: {e}")
        raise
    finally:
        db.close()

    return gdf_segments

if __name__ == "__main__":
    build_pilot_segments(limit=1000)
