# 📋 Phase 0 — Exact Action Brief

> **Time budget:** Do this BEFORE the hackathon starts. Should take ~3–4 hours total.
> No project code is written here — only accounts, data downloads, and environment setup.

---

## ✅ Step 1: Register All Accounts (1.5 hours)

Do these **in parallel** across browser tabs:

| # | Service | URL | What to do | Time |
|---|---|---|---|---|
| 1 | **NASA Earthdata** | earthdata.nasa.gov | Sign up → verify email → "Applications" → authorize "NASA GESDISC DATA ARCHIVE" | 10 min |
| 2 | **Groq** | console.groq.com | Sign up → API Keys → Create key → copy it | 5 min |
| 3 | **Google Gemini** | aistudio.google.com | Sign in → Get API Key → Create key in new project | 5 min |
| 4 | **Cloudflare Workers AI** | dash.cloudflare.com | Sign up → AI → note Account ID + create API Token | 10 min |
| 5 | **Bhashini** | bhashini.gov.in/ulca | Register → request API access (may take a day) | 10 min |
| 6 | **Brevo** | brevo.com | Sign up → SMTP & API → Generate SMTP key → verify sender email | 10 min |
| 7 | **Neon (Postgres)** | neon.tech | Sign up → Create project "jaldrishti" → Enable PostGIS + pgvector | 10 min |
| 8 | **Telegram BotFather** | t.me/BotFather | /newbot → name "JalDrishtiBot" → copy token | 5 min |
| 9 | **GitHub** | github.com | Create repo `jaldrishti` → add `.gitignore` for Python + Node | 5 min |

**After Neon — run in Neon SQL editor:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## ✅ Step 2: Generate VAPID Keys (Web Push)

```bash
pip install py-vapid
python -c "
from py_vapid import Vapid
v = Vapid()
v.generate_keys()
print('PUBLIC:', v.public_key)
print('PRIVATE:', v.private_key)
"
```
Save both keys into your `.env` file.

---

## ✅ Step 3: Download Static Data Assets (~45 min)

All data goes into `jaldrishti/data/raw/`.

### 3a — OSM road network for pilot zone (Baner-Aundh-Pashan)
```python
import osmnx as ox
G = ox.graph_from_bbox(18.60, 18.48, 73.92, 73.78, network_type='drive')
ox.save_graphml(G, "data/raw/pune_pilot_roads.graphml")
waterways = ox.features_from_bbox(18.60, 18.48, 73.92, 73.78, tags={'waterway': True})
waterways.to_file("data/raw/pune_pilot_waterways.geojson", driver='GeoJSON')
print("OSM done")
```

### 3b — GLO-30 DEM (Elevation) from AWS
```python
import boto3
s3 = boto3.client('s3', region_name='eu-central-1',
    config=boto3.session.Config(signature_version='UNSIGNED'))
s3.download_file('copernicus-dem-30m',
    'Copernicus_DSM_COG_10_N18_00_E073_00_DEM/DEM/Copernicus_DSM_COG_10_N18_00_E073_00_DEM.tif',
    'data/raw/pune_dem.tif')
print('DEM downloaded')
```

### 3c — HAND (Height Above Nearest Drainage) from AWS
```python
import boto3
s3 = boto3.client('s3', region_name='us-west-2',
    config=boto3.session.Config(signature_version='UNSIGNED'))
s3.download_file('glo-30-hand', 'N18E073/N18E073_HAND.tif', 'data/raw/pune_hand.tif')
print('HAND downloaded')
```

### 3d — ESA WorldCover (built-up share)
```python
import urllib.request
urllib.request.urlretrieve(
    'https://esa-worldcover.s3.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N18E073_Map.tif',
    'data/raw/pune_worldcover.tif'
)
print('WorldCover done')
```

### 3e — ERA5 Rainfall History via Open-Meteo Archive (no key)
```python
import openmeteo_requests, pandas as pd, requests_cache
from retry_requests import retry

cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
openmeteo = openmeteo_requests.Client(session=retry(cache_session, retries=5, backoff_factor=0.2))

params = {
    "latitude": 18.52, "longitude": 73.85,
    "start_date": "2018-06-01", "end_date": "2026-09-30",
    "hourly": ["precipitation", "soil_moisture_0_to_7cm"],
    "timezone": "Asia/Kolkata"
}
responses = openmeteo.weather_api("https://archive-api.open-meteo.com/v1/archive", params=params)
r = responses[0]
hourly = r.Hourly()
df = pd.DataFrame({
    "time": pd.date_range(start=pd.to_datetime(hourly.Time(), unit="s"),
                          end=pd.to_datetime(hourly.TimeEnd(), unit="s"),
                          freq=pd.Timedelta(seconds=hourly.Interval()), inclusive="left"),
    "precip_mm": hourly.Variables(0).ValuesAsNumpy(),
    "soil_moisture": hourly.Variables(1).ValuesAsNumpy()
})
df.to_csv("data/raw/era5_pune_2018_2026.csv", index=False)
print(f"ERA5 done: {len(df)} rows")
```

### 3f — PMC Data from OpenCity (manual download)
Go to https://data.opencity.in/organization/pune-municipal-corporation and download:
- Stormwater drain network (GeoJSON/Shapefile)
- Ward boundaries (GeoJSON)
Save into `data/raw/pmc/`

---

## ✅ Step 4: Collect Waterlogging Incident Records (~30 min)

This is your **label source**. Paste findings into `data/raw/incidents.csv`:

| Source | What to collect |
|---|---|
| [Punekar News — Traffic Police 26 hotspots](https://www.punekarnews.in/?p=238846) | 26 spots with A+/A/B+/B grades + road names |
| [Free Press Journal — 120 spots](https://www.freepressjournal.in/pune/...) | Ward-wise list 2026 |
| [Bridge Chronicle — 201 spots](https://www.thebridgechronicle.com/pune/...) | Road names + frequency |

CSV columns: `segment_name, ward, date, approximate_hour, grade, source, notes`

---

## ✅ Step 5: Set Up the Dev Environment (30 min)

```bash
# Backend
cd jaldrishti
python -m venv venv
venv\Scripts\activate              # Windows
pip install -r requirements.txt
copy .env.example .env             # fill in your keys

# Verify DB
python -c "
from sqlalchemy import create_engine, text
import os; from dotenv import load_dotenv; load_dotenv()
e = create_engine(os.environ['DATABASE_URL'])
with e.connect() as c: print(c.execute(text('SELECT PostGIS_version()')).fetchone())
"

# Verify Groq
python -c "
from groq import Groq; import os; from dotenv import load_dotenv; load_dotenv()
c = Groq(api_key=os.environ['GROQ_API_KEY'])
r = c.chat.completions.create(model='llama-3.1-8b-instant',
    messages=[{'role':'user','content':'Say: API key works'}])
print(r.choices[0].message.content)
"

# Verify Open-Meteo (no key needed)
python -c "
import requests
r = requests.get('https://api.open-meteo.com/v1/forecast',
    params={'latitude':18.52,'longitude':73.85,'hourly':'precipitation','forecast_days':1})
print('Open-Meteo OK:', len(r.json()['hourly']['time']), 'hours')
"

# Frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install leaflet react-leaflet @types/leaflet i18next react-i18next axios
```

---

## ✅ Step 6: Freeze Data Contracts (15 min — whole team)

Commit these as `fixtures/fake_prediction.json` and `fixtures/fake_report.json`.
The frontend builds against these while the ML team trains.

**`fixtures/fake_prediction.json`**
```json
{
  "segment_id": "way/123456",
  "horizon_h": 2,
  "risk_class": "high",
  "probability": 0.72,
  "confidence_level": "Medium",
  "confidence_score": 0.61,
  "conf_set_size": 2,
  "top_reasons": [
    "Low-lying terrain (HAND 1.2 m)",
    "38 mm rain in last 3 h",
    "2 past incidents on this segment"
  ],
  "rain_data_age_min": 18,
  "is_ood": false,
  "computed_at": "2026-10-12T15:00:00+05:30"
}
```

**`fixtures/fake_report.json`**
```json
{
  "id": "uuid-placeholder",
  "lat": 18.552,
  "lon": 73.847,
  "snapped_segment_id": "way/123456",
  "time_server": "2026-10-12T15:23:00+05:30",
  "text_original": "रस्त्यावर पाणी साचलंय",
  "language": "mr",
  "text_en": "Water has accumulated on the road",
  "photo_path": null,
  "reporter_id": "device_abc123",
  "trust_score": 45,
  "trust_reasons": {
    "corroboration": 0, "rain_plausibility": 20,
    "terrain_plausibility": 15, "reputation": 10,
    "photo": 0, "text_consistency": 0
  },
  "state": "Likely"
}
```

---

## 🔄 No Docker, No Redis, No CAPTCHA — Simpler Alternatives

| Originally Proposed | ✅ Hackathon Alternative | Why OK |
|---|---|---|
| Docker Compose | `uvicorn api.main:app --reload` run directly | No containerisation needed for a 2–3 day hackathon |
| Redis (caching) | `cachetools.TTLCache` (in-memory) + `diskcache` (SQLite, for offline fixtures) | Zero extra service; pure Python; survives restarts |
| Redis (rate limiting) | `slowapi` with in-memory backend on FastAPI | Good enough for hackathon-scale traffic |
| Cloudflare Turnstile CAPTCHA | **Dropped** — just use `slowapi` rate limit on report endpoint | CAPTCHA setup costs 1 hour; slowapi costs 3 lines of code |
| Site safety / virus scan | **Dropped** — validate file type + size only | Judges won't upload malware; keep it simple |

**The caching pattern (replaces Redis):**
```python
# api/services/cache.py
from cachetools import TTLCache
import diskcache

prediction_cache = TTLCache(maxsize=1000, ttl=3600)   # 1h TTL, in-memory
storm_cache = diskcache.Cache('./cache/storm_fixture') # persists to disk

def get_predictions(horizon_h: int):
    key = f"preds_{horizon_h}"
    if key in prediction_cache:
        return prediction_cache[key]
    result = db.query_predictions(horizon_h)           # fetch from Neon
    prediction_cache[key] = result
    return result
```

---

## 🚦 Phase 0 Gate — All Must Be TRUE

- [ ] All 9 accounts active and verified
- [ ] Neon DB has PostGIS + pgvector enabled
- [ ] VAPID keys generated and in `.env`
- [ ] `rasterio.open('data/raw/pune_dem.tif')` succeeds
- [ ] `rasterio.open('data/raw/pune_hand.tif')` succeeds
- [ ] `era5_pune_2018_2026.csv` has ≥ 1,000 rows
- [ ] `osmnx.load_graphml('data/raw/pune_pilot_roads.graphml')` succeeds
- [ ] `python -c "import lightgbm, shap, mapie, geopandas; print('OK')"` passes
- [ ] `GET http://localhost:8000/health` returns 200 (even stub)
- [ ] Both fixture JSON files committed to the repo
- [ ] Every team member has cloned the repo + `.env` filled
