import os
import boto3
from botocore import UNSIGNED
from botocore.config import Config

os.makedirs("data/raw", exist_ok=True)
output_path = "data/raw/pune_dem.tif"

print("Downloading GLO-30 DEM from AWS S3 (copernicus-dem-30m)...")
s3 = boto3.client('s3', region_name='eu-central-1',
    config=Config(signature_version=UNSIGNED))

key = 'Copernicus_DSM_COG_10_N18_00_E073_00_DEM/Copernicus_DSM_COG_10_N18_00_E073_00_DEM.tif'

try:
    s3.download_file('copernicus-dem-30m', key, output_path)
    print(f"DEM downloaded successfully to {output_path} ({os.path.getsize(output_path)} bytes)")
except Exception as e:
    print(f"Failed to download DEM: {e}")
