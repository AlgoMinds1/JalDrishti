import os
import urllib.request

os.makedirs("data/raw", exist_ok=True)
url = 'https://esa-worldcover.s3.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N18E072_Map.tif'
output_path = 'data/raw/pune_worldcover.tif'

print(f"Downloading ESA WorldCover from {url}...")
try:
    urllib.request.urlretrieve(url, output_path)
    print(f"WorldCover downloaded successfully to {output_path} ({os.path.getsize(output_path)} bytes)")
except Exception as e:
    print(f"Failed to download ESA WorldCover: {e}")
