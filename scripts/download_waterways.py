import os
import osmnx as ox

# Configure osmnx settings
ox.settings.timeout = 60
ox.settings.log_console = True

bbox = (73.78, 18.48, 73.92, 18.60)
print(f"Downloading waterways for bbox {bbox}...")
try:
    waterways = ox.features_from_bbox(bbox=bbox, tags={'waterway': True})
    waterways.to_file("data/raw/pune_pilot_waterways.geojson", driver='GeoJSON')
    print(f"Waterways saved: {len(waterways)} features")
except Exception as e:
    print(f"Waterway download error: {e}")
