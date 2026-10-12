import os
import osmnx as ox

os.makedirs("data/raw", exist_ok=True)
# Pilot zone bbox: left=73.78, bottom=18.48, right=73.92, top=18.60
# (Baner-Aundh-Pashan-Sinhagad Road corridor)
bbox = (73.78, 18.48, 73.92, 18.60)

print(f"Downloading OSM road network for pilot zone bbox {bbox}...")
G = ox.graph_from_bbox(bbox=bbox, network_type='drive')
roads_path = "data/raw/pune_pilot_roads.graphml"
ox.save_graphml(G, roads_path)
print(f"OSM roads saved to {roads_path}. Nodes: {len(G.nodes)}, Edges: {len(G.edges)}")

print("Downloading waterways for pilot zone...")
waterways = ox.features_from_bbox(bbox=bbox, tags={'waterway': True})
waterways_path = "data/raw/pune_pilot_waterways.geojson"
waterways.to_file(waterways_path, driver='GeoJSON')
print(f"Waterways saved to {waterways_path}. Features: {len(waterways)}")
