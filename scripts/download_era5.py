import os
import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry

os.makedirs("data/raw", exist_ok=True)
os.makedirs(".cache", exist_ok=True)

cache_session = requests_cache.CachedSession('.cache/openmeteo', expire_after=-1)
openmeteo = openmeteo_requests.Client(session=retry(cache_session, retries=5, backoff_factor=0.2))

# Open-Meteo archive is typically available up to a few days ago (e.g. 2024 or earlier).
# We query from 2018-06-01 to 2024-09-30 (monsoon records)
params = {
    "latitude": 18.52,
    "longitude": 73.85,
    "start_date": "2018-06-01",
    "end_date": "2024-09-30",
    "hourly": ["precipitation", "soil_moisture_0_to_7cm"],
    "timezone": "Asia/Kolkata"
}

print("Fetching ERA5 historical rainfall and soil moisture for Pune from Open-Meteo...")
try:
    responses = openmeteo.weather_api("https://archive-api.open-meteo.com/v1/archive", params=params)
    r = responses[0]
    hourly = r.Hourly()
    
    df = pd.DataFrame({
        "time": pd.date_range(
            start=pd.to_datetime(hourly.Time(), unit="s"),
            end=pd.to_datetime(hourly.TimeEnd(), unit="s"),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left"
        ),
        "precip_mm": hourly.Variables(0).ValuesAsNumpy(),
        "soil_moisture": hourly.Variables(1).ValuesAsNumpy()
    })
    
    out_csv = "data/raw/era5_pune_2018_2026.csv"
    df.to_csv(out_csv, index=False)
    print(f"ERA5 completed successfully! {len(df)} rows written to {out_csv}")
except Exception as e:
    print(f"Error fetching ERA5 data: {e}")
