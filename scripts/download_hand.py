import os
import boto3
from botocore import UNSIGNED
from botocore.config import Config

os.makedirs("data/raw", exist_ok=True)
output_path = "data/raw/pune_hand.tif"

print("Downloading HAND from AWS S3 (glo-30-hand in us-west-2)...")
s3 = boto3.client('s3', region_name='us-west-2',
    config=Config(signature_version=UNSIGNED))

key = 'v1/2021/Copernicus_DSM_COG_10_N18_00_E073_00_HAND.tif'

try:
    s3.download_file('glo-30-hand', key, output_path)
    print(f"HAND downloaded successfully to {output_path} ({os.path.getsize(output_path)} bytes)")
except Exception as e:
    print(f"Failed to download HAND: {e}")
