# 🌊 JalDrishti — Comprehensive Hackathon Build Roadmap

> **Working name:** JalDrishti ("water-vision") — a forecasting-first, explainable waterlogging early-warning system for Pune.
> **Pilot zone:** Baner–Aundh–Pashan–Sinhagad Road corridor (or Hadapsar–Mundhwa). **One zone done well beats a whole-city weak map.**

---

## 🗺️ Master Vision in One Sentence

> Predict road-segment waterlogging 1–6 hours ahead, quantify every uncertainty, verify citizen reports through a trust engine, and tell people and administrators what to do next — all running on free APIs with no single report ever triggering an alert alone.

---

## 🧠 What Judges Will Ask — And Our Answers (Pre-loaded)

| Judge Question | Our Answer |
|---|---|
| "Why not just a static hotspot map?" | Static maps show the past; ours forecasts 1–6 h ahead and beats the hotspot-only baseline on PR-AUC in the test set |
| "Your model says no-flood most of the time; how is accuracy useful?" | It isn't. We report PR-AUC, Recall, F1, False-Alarm Rate, Brier Score, and always-no baseline side by side |
| "Where did labels come from? How much data?" | PMC/Traffic Police hotspot lists (graded A+/A/B+/B), dated incident records, citizen reports; labels are sparse — we say so explicitly in our Limitations page |
| "What is the confidence score made of?" | Calibrated probability (Platt/Isotonic) + conformal prediction set size (MAPIE) + rainfall ensemble spread (Open-Meteo 51-member) + data age decay |
| "How do you handle fake/malicious reports?" | No single report can trigger an alert; reports are scored on 6 independent signals (neighbours, rain, terrain, reputation, photo, text) with weights published openly |
| "What are your data points / features?" | ~20 features: rainfall now/1/3/6/24/72 h + forecast + ensemble spread + soil moisture + elevation + slope + HAND + built-up share + distance to nala + drainage coverage + road class flags + underpass/bridge/tunnel + past incident count/recency + live report density |
| "What is SHAP? How do explanations match predictions?" | SHAP TreeExplainer computes per-prediction feature contributions from the same LightGBM model; top 3 factors become plain sentences e.g. "low HAND + 38 mm in 3 h + 2 past incidents" |
| "Does your model generalise to unseen locations?" | Yes — test includes a spatial hold-out of whole wards/road clusters never seen in training, separate from the temporal hold-out |
| "What if the weather API goes down?" | Cached last-good forecast, confidence degrades with data age, banner shows "rain data 40 min old"; automatic fallback to secondary source |
| "Is the route safe?" | We never claim safe; routes show "lower predicted risk", display the riskiest segment and its confidence |
| "Is this an official warning system?" | No; persistent "decision-support prototype, not an official emergency service" banner on every screen |
| "What is new vs Riskmap.in or Mumbai Flood Portal?" | Model-based road-segment forecasts with SHAP explanations + conformal uncertainty + Trust Engine protecting the report layer |
| "What about privacy?" | Public map rounds locations to ~100 m; photo EXIF stripped on upload; images in private bucket; report coordinates visible to admins only |
| "Can it scale beyond the pilot zone?" | Yes — same OSM + ERA5 + GLO-30 pipeline works for any Indian city; Pune pilot proves the architecture |
| "Why free APIs — can it scale to production?" | Free for a non-commercial prototype. Production needs licensed IMD/NOAA feed and privacy review per DPDPA |
| "How do you prevent label poisoning in retraining?" | Only admin-confirmed or high-trust corroborated events become hard labels; other reports are soft signals only |
| "What is conformal prediction?" | A framework that gives a set of plausible classes such that the true class is in the set ~90% of the time on the calibration set, regardless of model assumptions (MAPIE library) |
| "How do you handle class imbalance?" | Class weights / focal-style weighting; threshold tuned on PR curve to meet a fixed false-alarm budget; report recall at that budget |

---

## 📦 Full Feature Inventory

### Tier 1 — PS Required (Must-Haves)
| # | Feature | PS Tag |
|---|---|---|
| T1-01 | Colour-coded risk map (4 classes: low/moderate/high/severe) per road segment, +1h to +6h time slider | Must |
| T1-02 | Segment detail popup: probability, class, confidence band, data freshness, top-3 SHAP reasons, nearby report count | Must |
| T1-03 | Confidence badge (High/Medium/Low) + freshness timestamp per source; stale data auto-degrades confidence | Must |
| T1-04 | SHAP explainability per segment rendered as plain-language sentences | Must |
| T1-05 | Citizen report intake: GPS pin, timestamp, free text, optional photo, optional voice note | Must |
| T1-06 | Neighbour verification: spatial-temporal clustering + rain + terrain plausibility → Unverified/Likely/Confirmed states | Must |
| T1-07 | Observed layer (reports/official confirmations) drawn visually distinct from predicted layer (dashed vs solid) | Must |
| T1-08 | Response recommendation per segment (avoid / slow / inspect) + basic route suggestion | Must |
| T1-09 | Admin dashboard: ranked segments by risk × exposure × report support | Expected |
| T1-10 | Evaluation page: Precision, Recall, F1, PR-AUC, Brier, False-Alarm Rate, calibration curve, always-no baseline | Expected |
| T1-11 | Limitations page: written data gaps, uncertainty sources, honest label bias statement | Expected |
| T1-12 | Forecast-driven model (uses forecast rainfall for future hours — not just historical) | USP |
| T1-13 | Mode-aware routing: pedestrian, two-wheeler, car profiles with different risk penalties | USP |

### Tier 2 — Standout Features (Win-Differentiators)
| # | Feature | Why It Wins |
|---|---|---|
| T2-01 | **What-If Storm Sandbox**: slider sets hypothetical mm/h, model re-scores pilot area in milliseconds, output stamped SIMULATION — cannot trigger real alerts | Pre-monsoon planning; sandbox question in PS |
| T2-02 | **Report Trust Engine**: 0–100 trust score from 6 independent signals; scores shown to admins with reasons; attack-test script in repo | Direct answer to malicious-input question |
| T2-03 | **Voice-first multilingual reporting and alerts**: Web Speech API → Whisper STT → LLM extracts fixed JSON → back-translation in Marathi/Hindi/English | Rare in hackathon entries; lowers reporting barrier |
| T2-04 | **Dry Route by travel mode**: osmnx graph, edge cost = distance + penalty × predicted risk × mode sensitivity; pedestrian/two-wheeler penalty >> car | Each route shows riskiest segment + confidence; wording "lower predicted risk" never "safe" |
| T2-05 | **Intervention Effectiveness Ledger**: records every repair (desilting, pump, inlet) → compares before/after flooding for comparable rainfall events | Targets exact gap in Pune civic audits; accountability tool |

### Tier 3 — Stretch (If Time Remains)
- **Ask JalDrishti (RAG assistant)**: pgvector over NDMA/PMC advisories + live prediction facts; answers with citations; refuses out-of-scope questions
- **Sentinel-1 post-event flood mask**: radar water mask vs predictions as extra validation (known to be hard in urban areas)
- **Telegram Bot**: mirrors alerts and report intake

---

## 🏗️ System Architecture (5 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: CONSUMER INTERFACES                               │
│  [Citizen PWA] [Admin Dashboard] [Email/Telegram/WebPush]  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────────────────┐
│  LAYER 4: API  (FastAPI)                                    │
│  /predictions  /reports  /routes  /alerts  /admin  /health │
└──┬─────────┬─────────────┬──────────────┬───────────────────┘
   │         │             │              │
┌──▼──┐  ┌──▼──┐      ┌───▼───┐     ┌───▼───┐
│ ML  │  │Trust│      │Routing│     │Alerts │
│Svc  │  │Svc  │      │  Svc  │     │  Svc  │
└──┬──┘  └──┬──┘      └───┬───┘     └───┬───┘
   └────────┴─────────────┴─────────────┘
                       │ SQL / PostGIS
┌──────────────────────▼──────────────────────────────────────┐
│  LAYER 3: DATABASE                                          │
│  PostgreSQL + PostGIS + pgvector  (Neon / Supabase)        │
│  segments | predictions | reports | alerts | interventions  │
└──────────────────────┬──────────────────────────────────────┘
                       │ write
┌──────────────────────▼──────────────────────────────────────┐
│  LAYER 2: FEATURE PIPELINE  (cron / GitHub Actions)        │
│  Pull forecast rain → join terrain → score segments →       │
│  write predictions + freshness timestamps                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ fetch
┌──────────────────────▼──────────────────────────────────────┐
│  LAYER 1: DATA SOURCES                                      │
│  Open-Meteo (forecast + ensemble + archive)                 │
│  NASA GPM IMERG │ GLO-30 DEM │ HAND │ ESA WorldCover       │
│  OSM Overpass   │ PMC/OpenCity │ IMD gridded rainfall       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 All API Keys / Accounts to Register (Day 0)

| Service | Purpose | Key Type | Notes |
|---|---|---|---|
| NASA Earthdata | GPM IMERG rainfall download | Free login | earthdata.nasa.gov |
| Groq | LLM (report parsing, photo check) + Whisper STT | Free API key, no card | 30 req/min, 14,400/day; primary AI provider |
| Google Gemini free tier | Embeddings, non-sensitive text parsing | Free key | Flash models only since Apr 2026; avoid sending citizen photos |
| Cloudflare Workers AI | Backup LLM + embeddings | Free account | Daily neuron allowance; reported not to train on free-tier inputs |
| Bhashini (MeitY) | Translation EN/HI/MR + speech APIs | Free registration + approval wait | Plan LLM fallback in case approval is delayed |
| Brevo | Email alerts (300/day free) | Free account | SMTP or REST; opt-in, one-click unsubscribe |
| Telegram BotFather | Bot token for alert + report intake | Free token | Opt-in only |
| Supabase / Neon | PostgreSQL + PostGIS + pgvector | Free account | **Prefer Neon** — doesn't pause after inactivity like Supabase free tier |
| Cloudflare Turnstile | CAPTCHA for report form | Free account | No track record required |
| GitHub | Repo, Actions for cron pipeline | Free | |
| Render / Railway | Backend hosting | Free tier | Keep local Docker Compose as backup |
| VAPID keys | Web Push notifications | Generated locally | Needs HTTPS host |

---

## 📚 Open-Source Libraries & Tools

| Library | Purpose | Licence | Notes |
|---|---|---|---|
| LightGBM | Core classifier | MIT | Primary model; fast on tabular data |
| XGBoost | Alternative/ensemble | Apache 2.0 | Fallback if LightGBM overfits |
| scikit-learn | Calibration, preprocessing, baselines | BSD | |
| SHAP | Per-prediction TreeExplainer | MIT | Top-3 factors into template sentences |
| MAPIE | Conformal prediction sets + calibration metrics | BSD | Split conformal classification |
| pandas, geopandas | Data wrangling | BSD | |
| rasterio | Raster DEM/HAND reading | BSD | |
| pysheds | Flow accumulation + HAND computation | MIT | If ASF tiles are awkward |
| osmnx | OSM road graph download + snapping | MIT | Pilot area router |
| networkx | Graph routing algorithms | BSD | Used with osmnx |
| FastAPI | Backend API | MIT | Same language as ML code |
| Uvicorn | ASGI server | BSD | |
| slowapi | Rate limiting on FastAPI | MIT | |
| SQLAlchemy + GeoAlchemy2 | ORM + spatial types | MIT | |
| React (Vite) | Frontend framework | MIT | |
| Leaflet + react-leaflet | Map rendering | BSD | |
| i18next | EN/HI/MR i18n | MIT | |
| sentence-transformers | Embeddings for RAG | Apache 2.0 | |
| pgvector (Python client) | Vector similarity search | MIT | |
| earthaccess / imergpy | NASA IMERG download | Apache | |
| imdlib | IMD gridded rainfall files | MIT | |
| Whisper (via Groq) | Speech-to-text | MIT | Server fallback for voice reports |
| OpenTopoData | Self-hosted elevation API | MIT | Docker one-liner |
| Photon | Autocomplete geocoder (self-hostable) | MIT | Avoids Nominatim rate limits |
| Pillow / piexif | Image EXIF stripping | MIT/BSD | |
| imagehash | Perceptual hash for duplicate photo detection | BSD | |

---

# 🚀 BUILD ROADMAP — 8 PHASES

> Each phase has a **clear gate** — a condition that must be TRUE before you can claim the phase is done. Never skip the gate.

---

## ⚙️ Phase 0: Pre-Hackathon Setup (Before Day 1 — Check Rules First)

> **Goal:** Arrive at the hackathon with zero friction. Everything below is account/environment setup, not project code.

### 0.1 — Account Registration (Do immediately)
- [ ] NASA Earthdata account → verify email → test IMERG download script
- [ ] Groq account → generate API key → test `llama-3.1-8b-instant` and `whisper-large-v3`
- [ ] Google Gemini API key → test `gemini-1.5-flash` call
- [ ] Cloudflare Workers AI → get account ID + API token
- [ ] Bhashini API credentials → submit registration → note approval timeline (build LLM fallback in parallel)
- [ ] Brevo account → verify sender domain → send 1 test email
- [ ] Neon (preferred) or Supabase → create project → enable PostGIS + pgvector extensions
- [ ] Telegram BotFather → create `@JalDrishtiBot` → save token
- [ ] Cloudflare Turnstile → create site → save site key + secret
- [ ] Generate VAPID keypair (`web-push generate-vapid-keys`)
- [ ] GitHub repo created with branch protection on `main`

### 0.2 — Pre-Download Data Assets
- [ ] Download GLO-30 DEM tiles covering pilot zone from AWS Open Data (no key, just `boto3 --no-sign-request`)
- [ ] Download ASF Global 30 m HAND tiles for pilot zone
- [ ] Download ESA WorldCover 10 m tiles for pilot zone
- [ ] Pull PMC/OpenCity layers: stormwater drains, road centrelines, ward boundaries, ward-level drainage coverage
- [ ] Pull OSM data for pilot zone via Overpass API → store as GeoJSON/GeoPackage
- [ ] Collect all dated waterlogging incident records: PMC hotspot list (A+/A/B+/B grades), Traffic Police 26-spot list, dated news incidents (Free Press Journal, Bridge Chronicle, Punekar News), any municipal complaint data
- [ ] Pull ERA5/ERA5-Land historical rainfall (1 Jan 2018 – Oct 2026) for pilot zone via Open-Meteo Archive API

### 0.3 — Dev Environment
- [ ] Docker Compose with: FastAPI app, PostgreSQL (PostGIS + pgvector), Redis (optional cache)
- [ ] Python virtual environment: `requirements.txt` locked versions
- [ ] `pnpm`/`npm` workspace for React frontend
- [ ] Pre-commit hooks: `black`, `ruff`, `prettier`
- [ ] `.env.example` with all key names (no values committed)
- [ ] Agree on **data contracts** (JSON shapes) for the key interfaces:
  - `Prediction` object: `{segment_id, horizon_h, risk_class, probability, confidence_level, confidence_score, top_reasons, data_age_min, timestamp}`
  - `Report` object: `{id, lat, lon, snapped_segment_id, time_server, text, language, photo_path, reporter_id, trust_score, state}`
  - **Freeze these on Day 0** so frontend can build against fake data while ML trains

### 0.4 — Repo Structure (Agreed by Whole Team)
```
jaldrishti/
├── data/          ← terrain, OSM, PMC assets; segment table owner
├── ml/            ← model training, SHAP, calibration, evaluation
├── api/           ← FastAPI app (predictions, reports, routes, alerts, admin)
├── trust/         ← score_report(report) → {score, state, reasons}
├── pipeline/      ← scheduled feature refresh jobs
├── frontend/      ← React + Vite + Leaflet
├── notebooks/     ← exploratory analysis, evaluation
├── tests/         ← unit + integration + attack scripts
└── docker-compose.yml
```

**🚦 Phase 0 Gate:** All accounts active, all data assets on disk, Docker Compose starts cleanly, repo has the agreed JSON contract shapes as fixture files.

---

## 🗂️ Phase 1: Data Audit & Label Engineering (Days 1–2)

> **Goal:** Produce a labelled segment-event table that the model can train on, with its sources explicitly documented.

### 1.1 — Pilot Zone Definition
- [ ] Choose pilot zone (recommend Baner–Aundh–Pashan–Sinhagad Road based on recent reporting density)
- [ ] Define bounding box in WGS84
- [ ] Confirm: how many OSM road segments fall inside? Target: 200–800 segments for tractable demo

### 1.2 — Segment Graph Construction
- [ ] Use `osmnx` to download OSM road network for bounding box
- [ ] Split ways at junctions → each way segment gets a unique `segment_id`
- [ ] Snap all incident records to nearest segment (within 150 m threshold; flag any that don't snap)
- [ ] Store in PostGIS: `segments(id, geometry LINESTRING, length_m, road_class, is_underpass, is_bridge, is_tunnel)`

### 1.3 — Terrain Features (Static, Computed Once)
- [ ] **Elevation (mean, min along segment)**: extract from GLO-30 DEM using `rasterio`
- [ ] **Slope** (degrees): compute from DEM
- [ ] **HAND** (Height Above Nearest Drainage): read from ASF HAND tiles — this is the single strongest terrain predictor for waterlogging
- [ ] **Flow accumulation** (upslope area): compute with `pysheds` if needed
- [ ] **Built-up share** (% impervious within 250 m buffer): from ESA WorldCover
- [ ] **Distance to nearest nala/waterway** (metres): from OSM waterway layer
- [ ] **Drainage coverage** (ward-level %, 0–100): join from PMC layer
- [ ] **Road class** (motorway/primary/secondary/residential/footway): from OSM `highway` tag
- [ ] **Underpass/bridge/tunnel flags**: from OSM `tunnel`, `bridge`, `layer` tags
- [ ] Store all static features in: `segment_features(segment_id, elevation_mean, elevation_min, slope_mean, hand_mean, hand_min, flow_acc, builtup_share, dist_to_waterway_m, drainage_coverage_pct, road_class, is_underpass, is_bridge, is_tunnel)`

### 1.4 — Label Engineering (The Hard Part)
- [ ] **Hotspot records**: assign each PMC/Traffic Police hotspot to segment(s); assign grade weights (A+ = 4, A = 3, B+ = 2, B = 1)
- [ ] **Dated incident records**: each record becomes a `(segment_id, date, approximate_hour)` positive example
- [ ] **Severity labels**: map to 4-class target (low/moderate/high/severe) using hotspot grade + report text severity words
- [ ] **Temporal coverage**: tag each positive example with the ERA5 rainfall in the 1/3/6/24/72 h window before the event
- [ ] Write explicit **Label Bias Statement** (to be shown on Limitations page):
  - Labels concentrate on busy roads and complaint-prone areas
  - Three conflicting counts exist (120, 201, 260 spots) — we use their union with explicit source tags
  - Traffic Police 26 spots have the best grades; PMC has broader coverage
- [ ] Final table: `segment_events(segment_id, event_date, event_hour, risk_class, severity, source, source_grade, rainfall_1h, rainfall_3h, rainfall_6h, rainfall_24h, rainfall_72h)`
- [ ] Count positives vs negatives. Document imbalance ratio.

### 1.5 — Rainfall History Pull
- [ ] Pull ERA5 hourly rainfall for pilot zone centroid 2018–2026 via Open-Meteo Archive API (no key)
- [ ] Pull IMD daily 0.25° gridded rainfall for calibration using `imdlib`
- [ ] Store in: `rainfall_history(date, hour, source, lat, lon, precip_mm, soil_moisture)`

**🚦 Phase 1 Gate:** A `segment_events` table exists with ≥50 positive segment-hours (even if small), each row has its source documented. The data team can answer every judge question about label provenance.

---

## 🤖 Phase 2: ML Model v1 (Days 2–5)

> **Goal:** A working LightGBM classifier that beats the always-no and hotspot-only baselines on PR-AUC, with calibration, conformal sets, and SHAP.

### 2.1 — Feature Matrix Assembly
- [ ] Join `segment_events` with `segment_features` (static) and `rainfall_history` (dynamic)
- [ ] Add **forecast rainfall features**: for each segment-hour, pull Open-Meteo forecast as-of that timestamp for +1/+2/+3/+6 h
- [ ] Add **ensemble spread**: pull Open-Meteo Ensemble API (ECMWF IFS 51 members) → compute std dev of forecast rainfall → `ensemble_spread_mm`
- [ ] Add **past incident count**: number of prior events on that segment in the dataset
- [ ] Add **incident recency**: days since last confirmed event on that segment
- [ ] Add **live report density**: (at inference time) number of active reports within 500 m in last 2 h
- [ ] Final feature list (~20 features): document every feature with description, unit, and source in `ml/FEATURES.md`

### 2.2 — Baseline Models (Build First)
- [ ] **Always-no baseline**: predicts 0 for everything; compute Precision/Recall/F1/PR-AUC/Brier
- [ ] **Hotspot-list-only baseline**: segment risk = grade weight if it appears in hotspot list, else 0; same metrics
- [ ] **Rainfall-threshold rule**: if rainfall_3h > X mm, mark all segments in the ward as high risk; tune X on validation; same metrics
- [ ] Put all three on the same evaluation table — this is what the judges will see

### 2.3 — Train/Val/Test Split (Critical — Get This Right)
- [ ] **Temporal split**: Train = earlier monsoon events (e.g., 2018–2023), Validate = 2024, Test = 2025–2026 latest events
- [ ] **Spatial hold-out**: additionally hold out 2 entire wards (or a cluster of segments) completely from training — they appear only in test. This answers the "does it generalise to unseen places?" question.
- [ ] **Never random-split rows** — this leaks time and place and inflates all metrics

### 2.4 — LightGBM Model
- [ ] Train LightGBM classifier (or XGBoost) with:
  - Class weights or focal-style weighting for severe imbalance
  - `horizon_h` as an explicit feature (or one model per horizon — start with feature)
  - Temporal cross-validation on the training period
- [ ] Tune threshold on validation PR curve to meet false-alarm budget
- [ ] Report recall at fixed false-alarm rate (e.g., FAR ≤ 20%)
- [ ] Save trained model + feature names + threshold in `ml/model_v1.pkl`

### 2.5 — Probability Calibration
- [ ] Apply **Isotonic Regression** (or Platt Scaling) on the validation block (never the test set)
- [ ] Compute **Brier Score** before and after calibration — show improvement
- [ ] Plot **reliability (calibration) curve** — expected calibration error (ECE)
- [ ] This calibrated probability is what gets shown in the UI

### 2.6 — Conformal Prediction Sets (Uncertainty)
- [ ] Use **MAPIE** (`MapieClassifier`) with split conformal on calibration data
- [ ] Target coverage = 90% (i.e., the true class is in the prediction set 90% of the time)
- [ ] Compute **conformal set size per segment-hour**: size = 1 (very certain) to 4 (very uncertain)
- [ ] **Confidence level mapping**:
  - Set size 1 + prob far from threshold + fresh data → **High**
  - Set size 2 + moderate prob → **Medium**
  - Set size 3–4 or stale data → **Low**
- [ ] Verify coverage holds on the test set (report as a table metric)

### 2.7 — SHAP Explanations
- [ ] Use `shap.TreeExplainer` on the LightGBM model (fast, exact for tree models)
- [ ] Compute SHAP values for every prediction
- [ ] **Template-to-sentence renderer**: map top-3 SHAP features to human sentences:
  - `hand_mean` high → "low-lying terrain prone to pooling"
  - `rainfall_3h` high → "38 mm rain in the last 3 hours"
  - `past_incident_count` > 0 → "2 past waterlogging incidents on this segment"
  - `dist_to_waterway_m` low → "close to a nala"
  - `ensemble_spread` high → "uncertain rainfall forecast"
- [ ] Test: SHAP explanation must directionally match the prediction (e.g., if risk is high, at least one positive SHAP contributor must appear in the sentence)

### 2.8 — Evaluation Page Content
- [ ] For the dedicated Evaluation page, compute and store:
  - Precision, Recall, F1 per class
  - PR-AUC (macro + for "high/severe" classes)
  - False-alarm rate at tuned threshold
  - Brier Score (calibrated vs uncalibrated)
  - ECE (Expected Calibration Error)
  - Conformal coverage on test set
  - **By horizon**: +1h, +3h, +6h metrics separately (skill falls with horizon — say so)
  - **By severity**: confusion matrix across 4 classes; weight missed "severe" errors
  - **Lead time**: how many minutes before first citizen report would model have crossed alert threshold?
  - **Ablations**: with vs without forecast rainfall; with vs without terrain; with vs without live reports
  - All four baselines vs our model on the same table

### 2.9 — Model Artifacts
- [ ] `ml/train.py` — reproducible training script with fixed random seed
- [ ] `ml/evaluate.py` — produces the full evaluation table in JSON
- [ ] `ml/FEATURES.md` — feature documentation
- [ ] `ml/DATA_SOURCES.md` — data provenance
- [ ] Training notebook committed to repo

**🚦 Phase 2 Gate:** Model beats hotspot-only baseline on PR-AUC on the temporal test set. If not — document why and present both honestly. SHAP explanations are directionally consistent with predictions.

---

## 🔌 Phase 3: Data Pipeline & Inference Engine (Days 3–6, Parallel with Phase 4)

> **Goal:** A scheduled job that pulls live forecast rain, builds feature vectors, runs the model, and writes predictions to the database — with honest freshness timestamps.

### 3.1 — Feature Refresh Pipeline (cron / GitHub Actions)
- [ ] **Trigger**: every hour (or every 30 min during active storm)
- [ ] **Steps**:
  1. Pull Open-Meteo Forecast API for pilot zone: hourly precip + prob + soil moisture for next 6 h (no key required)
  2. Pull Open-Meteo Ensemble API: 51-member spread for next 6 h → compute std dev
  3. For each segment, join forecast rain with static terrain features
  4. For each segment × horizon (+1h to +6h), run calibrated LightGBM → get probability + conformal set
  5. Compute SHAP top-3 features
  6. Compute confidence level (High/Medium/Low) from set size + prob + data age
  7. Write to `predictions` table with `computed_at` timestamp
- [ ] **Data freshness tracking**: each prediction row stores `rain_data_age_min` = minutes since the Open-Meteo fetch
- [ ] **Stale data handling**: if last successful fetch > 90 min old → confidence drops to Low; > 3 h → map shows "Cannot forecast: data too old" notice
- [ ] **Fallback**: if Open-Meteo API fails → use cached last-good forecast, clearly marked as stale
- [ ] **Out-of-distribution detection**: if forecast rainfall > 99th percentile of training set → flag `is_ood = True` → fall back to conservative rule (hotspot-list + heavy-rain threshold) + show notice
- [ ] **Cache one real past storm** (pick the most visually dramatic storm in the dataset) as a fully static JSON fixture for offline demo mode

### 3.2 — FastAPI Backend Skeleton (Endpoints)
- [ ] `GET /predictions?hour={+1..+6}` → GeoJSON of all segment predictions for that horizon
- [ ] `GET /predictions/{segment_id}?hour={+1..+6}` → single segment detail card
- [ ] `GET /health` → data freshness per source (`rain_data_age_min`, `last_pipeline_run`, `model_version`)
- [ ] `POST /reports` → citizen report intake (see Phase 5)
- [ ] `GET /reports?bbox=...` → GeoJSON of reports in bbox
- [ ] `POST /routes` → routing request (see Phase 6)
- [ ] `GET /admin/queue` → ranked inspection list
- [ ] `GET /admin/ledger` → intervention effectiveness
- [ ] `POST /admin/confirm/{report_id}` → admin confirms/rejects a report
- [ ] `GET /sandbox/simulate?mm={x}&duration_h={y}` → What-if storm (Phase 7)
- [ ] `GET /evaluate` → returns the full evaluation metrics JSON (for Evaluation page)
- [ ] All endpoints: rate-limited via `slowapi`, authenticated where needed (JWT or Supabase auth)

### 3.3 — Database Schema
```sql
-- Core tables
segments(id, geometry LINESTRING, length_m, road_class, is_underpass, is_bridge, is_tunnel, ward_id)
segment_features(segment_id, elevation_mean, elevation_min, slope_mean, hand_mean, hand_min,
                 builtup_share, dist_to_waterway_m, drainage_coverage_pct, past_incident_count,
                 incident_recency_days, updated_at)
predictions(id, segment_id, horizon_h, computed_at, risk_class, probability, confidence_level,
            confidence_score, conf_set_size, shap_top3 JSONB, rain_data_age_min, is_ood,
            ensemble_spread, model_version)
reports(id, lat_exact, lon_exact, lat_public, lon_public, snapped_segment_id, time_server,
        time_client, text_original, language, text_en, photo_path, voice_path, reporter_id,
        trust_score, trust_reasons JSONB, state, admin_reviewed_by, admin_reviewed_at)
reporters(id, device_fingerprint, created_at, confirmed_count, rejected_count, 
          reputation_score, is_flagged, rate_limit_until)
alerts(id, segment_id, triggered_at, trigger_reason, channel, recipient_hash, language)
interventions(id, segment_id, type, completed_at, description, before_period, after_period,
              effectiveness_score)
rainfall_cache(fetched_at, source, lat, lon, precip_1h, precip_3h, precip_6h,
               ensemble_spread, soil_moisture, valid_for_horizon_h)
```

**🚦 Phase 3 Gate:** One command (`python pipeline/refresh.py`) rebuilds all predictions for the pilot area and writes to the database. A stranger can call `GET /predictions?hour=1` and get valid GeoJSON back.

---

## 🗺️ Phase 4: Frontend Map & UI (Days 4–8, Parallel with Phase 3)

> **Goal:** A beautiful, functional React+Leaflet map that a stranger can use without help to read any segment's risk, confidence, and reasons.

### 4.1 — Map Core
- [ ] React + Vite + TypeScript setup
- [ ] Leaflet map centred on pilot zone; OSM base tiles (use Stadia Maps or CartoCDN for demo — not OSM tile servers which aren't meant for production load)
- [ ] **Risk layer**: GeoJSON road segments coloured by risk class
  - Colour scale: `#3DD68C` (low) → `#F4C542` (moderate) → `#E8722A` (high) → `#D93025` (severe)
  - Must be **colourblind-safe** (test with a deuteranopia simulator)
  - Dashed/translucent = predicted; solid with icon = reported; ✓ checkmark icon = verified/confirmed
- [ ] **Time slider**: scrub from +1h to +6h; segments re-colour from the cached prediction data; later hours visibly softer (lower opacity)
- [ ] **Segment popup (click)**:
  - Risk class + coloured badge
  - Calibrated probability (e.g., "72% chance of waterlogging")
  - Confidence level: High / Medium / Low + what lowered it (e.g., "rain data 18 min old")
  - Data freshness: "Rain data from 18 min ago"
  - Top-3 SHAP reasons as plain sentences
  - Nearby report count + link to report form
  - Response recommendation: "Avoid if possible" / "Slow down" / "Inspect"
- [ ] **Data-freshness badge**: global banner showing age of rain data; turns amber > 30 min, red > 60 min

### 4.2 — Layers & Controls
- [ ] Layer toggle: Predicted Risk (on) | Citizen Reports (on) | Verified Only | Admin View
- [ ] Legend panel: 4 risk colours + confidence icons + layer type icons
- [ ] Search bar: Photon geocoder for address search within pilot zone; returns clear error for out-of-pilot requests
- [ ] "My location" button: browser Geolocation API → jump to user position
- [ ] Zoom to pilot zone button

### 4.3 — Citizen Report Layer
- [ ] Reports rendered as map markers by state:
  - Grey pin with "?" = Unverified
  - Orange pin = Likely
  - Red pin with water drop = Confirmed
- [ ] Click marker → report card: location, time, snippet, trust score (shown as bar), state
- [ ] Reports layer is **visually distinct** from predictions layer at all times

### 4.4 — UI/UX Standards
- [ ] PWA: `manifest.json` + service worker → installable on Android phone
- [ ] Service worker caches: last map state, last prediction GeoJSON, report form skeleton
- [ ] Offline banner: "You are offline. Showing cached data from [timestamp]"
- [ ] Report queue: if offline, form submissions are queued in `localStorage` and uploaded when back online
- [ ] Responsive: usable on 360px wide phone screen
- [ ] i18n: `i18next` with EN/HI/MR JSON files; language switcher in navbar
- [ ] **Persistent banner** (cannot be dismissed): "⚠️ Decision-support prototype. Not an official emergency service. For emergencies call 112."
- [ ] All route labels say "lower predicted risk" — **never "safe route"**

### 4.5 — Pages
- [ ] `/map` — main map view (default landing)
- [ ] `/report` — citizen report form (see Phase 5)
- [ ] `/routes` — route planner (see Phase 6)
- [ ] `/admin` — admin dashboard (see Phase 7, auth-gated)
- [ ] `/evaluate` — model evaluation page (public)
- [ ] `/limits` — data limitations page (public)
- [ ] `/about` — what JalDrishti is and is not

**🚦 Phase 4 Gate:** A stranger can open the app, read a segment's risk/confidence/reasons/freshness, and toggle between time horizons, without any instructions. Works on a phone screen.

---

## 📋 Phase 5: Citizen Reports & Trust Engine (Days 7–11)

> **Goal:** Report intake with voice + photo + multilingual support; trust scoring that catches fake reports; attack-test script that proves it.

### 5.1 — Report Form (Frontend)
- [ ] GPS pin: auto-detect from browser Geolocation; allow manual move; snap to nearest road segment on submission
- [ ] Text input: free text in any of EN/HI/MR (or mixed)
- [ ] **Voice input**: Web Speech API (browser-native) → transcript shown for review before submit; fallback to Groq Whisper if browser API fails/unavailable
- [ ] Optional photo upload: max 5 MB; preview shown; EXIF stripped client-side before upload (use `piexif` via pyodide or server-side)
- [ ] Cloudflare Turnstile CAPTCHA widget
- [ ] Offline: if no connection, form queued in localStorage → submitted when back online

### 5.2 — Report Intake Endpoint (`POST /reports`)
- [ ] Server-side EXIF strip on photo (PIL/piexif) — store stripped image only
- [ ] Compare device-reported GPS vs PIN location: flag if >500 m apart
- [ ] Snap PIN to nearest road segment using `osmnx` spatial index (within 200 m); if no snap → return user-facing error "Could not match to a road; please re-pin"
- [ ] LLM parsing (Groq primary, Gemini fallback): extract `{language, text_en, severity_words, place_names, depth_cues}` into fixed JSON schema; model has **no tools, no privileges**; output validated against schema before any action
- [ ] Rate limiting: 5 reports per hour per device fingerprint; 20 per day per account

### 5.3 — Trust Score Engine (`trust/score_report.py`)

Score = sum of weighted signals, 0–100:

| Signal | Max Weight | Implementation |
|---|---|---|
| Independent corroboration: ≥2 distinct reporters within 150 m in 30 min | 30 | Count `DISTINCT reporter_id` in spatial-temporal window |
| Rain plausibility: observed OR forecast precip > 5 mm in window | 20 | Look up `rainfall_cache` for segment location |
| Terrain plausibility: HAND < 5 m AND slope < 5° | 15 | Read from `segment_features.hand_mean` + `slope_mean` |
| Reporter reputation: starts at 25/100; rises with confirmed reports | 15 | Read from `reporters.reputation_score` |
| Photo evidence: EXIF time within 2 h of submission; EXIF GPS within 500 m; vision-model says "plausible flood scene" | 15 | Groq vision call → yes/no/unclear; photo is ONE signal, never confirms alone |
| Text consistency: LLM-extracted place name matches snapped segment location | 5 | Geomatch extracted place vs snapped segment |

**State thresholds:**
- < 30: `Unverified`
- 30–60: `Likely`
- > 60 AND (corroboration OR admin tick): `Confirmed`

### 5.4 — Abuse & Anti-Spam Defences
- [ ] **No single report triggers an alert** (core principle — hard-coded gate in alert service)
- [ ] **Per-account/per-device rate limits** (slowapi + `reporters` table)
- [ ] **Burst detection**: ≥5 reports from a cluster of new accounts in 10 min → `is_flagged = True` on all; not counted toward corroboration
- [ ] **Rain plausibility gate**: no recent/forecast rain → report held for admin review, not auto-elevated
- [ ] **Terrain plausibility**: flood claim on segment with HAND > 10 m AND slope > 10° → trust capped at 40
- [ ] **GPS/pin/EXIF triangle**: large mismatch between any two → trust deducted; snap-and-confirm flow shown to user
- [ ] **Perceptual hash**: duplicate photo across reports detected via `imagehash`; counts as same photo, not independent evidence
- [ ] **Server time authority**: client timestamp compared to server time; > 5 min drift → trust deducted; > 30 min → report flagged
- [ ] **Prompt injection guard**: LLM call only extracts into fixed JSON; text is sanitised before any DB write; displayed escaped
- [ ] **Content moderation**: text and image run through safety check (Groq or Cloudflare) before anything shown publicly; admin removal tool
- [ ] **Contradicting reports**: show both with timestamps; trust-weighted vote with recency decay; never silently pick one

### 5.5 — Isolation Forest on Reporter Behaviour
- [ ] Track per-reporter: burst rate, spatial spread of reports, rejection ratio
- [ ] Train a lightweight `sklearn.IsolationForest` on this behavioural feature vector (unsupervised)
- [ ] Flagged reporters' reports downweighted in trust score calculation

### 5.6 — Moderation Queue (Admin)
- [ ] Admin sees all Unverified/Likely reports with trust score breakdown
- [ ] One-click Confirm / Reject with reason
- [ ] Confirmed reports by admin can be used as hard labels in future model retraining (label quality gate)

### 5.7 — Attack Test Script
- [ ] `tests/attack_test.py`:
  - Spam test: 20 reports from 1 device/account → assert no alert triggered
  - Dry-weather test: submit report with 0 mm forecast rain → assert state stays Unverified
  - Ridge test: submit report from segment with HAND > 15 m → assert trust < 30
  - Coordinate mismatch test: photo EXIF GPS ≠ pin → assert trust deducted
  - Coordinated brigade test: 5 reports from new accounts in 2 min → assert all flagged, none count toward corroboration
- [ ] This script is shown live during the demo: "submit three fake reports; watch them all get rejected"

**🚦 Phase 5 Gate:** Planted fake reports pass the attack test (none reach Confirmed, none trigger alerts). A single legitimate report from a credible reporter near rain stays Unverified until corroborated. A second independent reporter elevates to Likely.

---

## 📣 Phase 6: Alerts, Languages & Routing (Days 9–13)

> **Goal:** Multi-channel opt-in alerts in EN/HI/MR; voice input working; mode-aware routing with honest wording.

### 6.1 — Alert System

**Alert gate (hard-coded):**
```
trigger_alert() if:
  risk_class IN ('high', 'severe')
  AND (
    model_probability > threshold
    OR (≥2 independent trusted reports AND model_probability > low_threshold)
  )
  AND NOT is_sandbox
```

- [ ] **Email (Brevo SMTP)**: templated HTML email; opt-in only (double opt-in); one-click unsubscribe token; daily cap ≤ 300 (free tier); retry queue
- [ ] **Telegram Bot**: message formatted with risk class + top reason + route tip + helpline link; opt-in only
- [ ] **Web Push (VAPID)**: `webpush` Python library; requires HTTPS host; opt-in prompt shown after first map interaction; unsupported on some iOS — show fallback
- [ ] Alert templates in EN, HI, MR for all channels (i18n JSON files)
- [ ] Hysteresis: once an alert is sent for a segment, no repeat alert unless risk drops to low then rises again (prevents flicker)
- [ ] Per-user alert cap: max 3 alerts/day from the system
- [ ] All alerts include: official helpline link (112), timestamp, "Decision-support prototype" footer

### 6.2 — Multilingual & Voice

- [ ] **i18n strings**: `en.json`, `hi.json`, `mr.json` for all UI fixed text; use `i18next`
- [ ] **Free-text translation**: LLM prompt for Marathi/Hindi → English normalisation; Bhashini API as primary (if approved), Groq as fallback
- [ ] **Voice input** (report form):
  1. Browser Web Speech API → `recognition.lang = 'mr-IN'` (Marathi) or `hi-IN` or `en-IN`
  2. If browser API unavailable/fails → send audio blob to Groq Whisper large-v3 endpoint
  3. Transcript shown to user for review and edit before submit
- [ ] **Voice output** (stretch): `window.speechSynthesis.speak()` for reading alerts aloud; Bhashini Edge TTS for better Marathi

### 6.3 — Mode-Aware Routing

- [ ] Build routing graph with `osmnx` for pilot zone
- [ ] **Edge cost function**:
  ```
  cost(edge) = distance_m + penalty_factor[mode] × risk_score × mode_sensitivity[mode]
  ```
  Where:
  - `risk_score` = model probability × risk_class_weight
  - `mode_sensitivity`: pedestrian = 3.0, two-wheeler = 2.0, car = 1.0
- [ ] Three travel mode profiles: **walk**, **two-wheeler**, **car**
- [ ] Each route result shows:
  - Estimated travel time
  - **Riskiest segment** on the route (name + risk class + confidence)
  - Overall route confidence (minimum confidence along route)
  - Wording: "This route has **lower predicted risk** at this time" — **never "safe"**
- [ ] Out-of-pilot-area requests: clear message + nearest covered area
- [ ] Route rendered on the map as a highlighted path, with the riskiest segment marked

**🚦 Phase 6 Gate:** A Marathi alert reaches a test inbox (email or Telegram) during a simulated storm. A walking route differs measurably from a car route on the same origin-destination pair.

---

## 🔧 Phase 7: Standout Features & Admin (Days 12–17)

> **Goal:** All Tier 2 features + admin dashboard. These are the features judges remember after the demo.

### 7.1 — What-If Storm Sandbox (T2-01)
- [ ] Admin UI: sliders for rainfall intensity (mm/h) and duration (h) → covers 10/20/50/90 mm scenarios
- [ ] Backend: `GET /sandbox/simulate?mm={x}&duration_h={y}`
  - Re-run model with user-set rainfall on precomputed static features (fast, no terrain recompute)
  - Response within 500 ms
- [ ] **SIMULATION watermark** on every view while sandbox is active (red banner, cannot be dismissed)
- [ ] Sandbox code path has **no access to the alert sender** — hard assertion in code
- [ ] Use case: "Which 15 segments fail first at 60 mm?" → reorders admin inspection queue
- [ ] Pre-monsoon planning mode: can be shown to ward officers for drill scenarios

### 7.2 — Report Trust Engine Full Admin View (T2-02 enhancement)
- [ ] Admin sees per-report trust score breakdown: each signal's contribution displayed
- [ ] Isolation Forest anomaly scores shown for flagged reporters
- [ ] Attack test results visible in admin panel

### 7.3 — Dry Route by Travel Mode (T2-04 enhancement)
- [ ] Add route history: saved routes, share-by-link, route comparison view
- [ ] "Alternate routes" toggle: show 2nd-best route with its risk comparison

### 7.4 — Intervention Effectiveness Ledger (T2-05)
- [ ] Admin form: log intervention (type, segment, date of completion, description)
- [ ] Backend: for each logged intervention, compare waterlogging frequency/severity in comparable rainfall events **before** vs **after** the intervention date
- [ ] Comparable rainfall window: rainfall events within ±20% of the same intensity range
- [ ] Display: before/after bar chart per intervention; "X% reduction in high/severe events at this segment"
- [ ] This directly answers Pune civic question: "Did the drain desilt work?"
- [ ] **Limitations clearly stated**: comparison is observational, not causal; weather variation confounds results

### 7.5 — Admin Dashboard
- [ ] **Ranked inspection queue**: segments sorted by `risk_class × exposure_score × report_support`
  - `exposure_score` = road class weight × estimated daily traffic (from OSM highway type)
  - `report_support` = number of verified/likely reports
- [ ] Each queue item shows: segment name, risk class, probability, confidence, exposure, report count, last intervention date
- [ ] Sandbox reorders the queue in real time
- [ ] One-click links: navigate to segment on map, view report history, log intervention
- [ ] Audit log: every admin action (confirm/reject report, log intervention, change status) logged with timestamp + admin ID
- [ ] Role-based access: admin vs viewer roles; 2FA for admin accounts (TOTP via `pyotp`)

### 7.6 — Evaluation Page (Public)
- [ ] Renders the metrics JSON from `GET /evaluate`
- [ ] Tables: our model vs all 3 baselines on all metrics
- [ ] Charts: PR curve, calibration curve, metrics by horizon (+1/+3/+6 h)
- [ ] Confusion matrix: 4-class, colour-coded; weighted error display
- [ ] Ablation table: with/without forecast rain, terrain, live reports
- [ ] Lead time chart: minutes before first citizen report that model crossed threshold
- [ ] Trust engine evaluation: precision/recall of fake-report rejection
- [ ] Honest caption: "These results are from a temporal+spatial test split. Do not compare directly to models trained on different datasets."

### 7.7 — Limitations Page (Public)
- [ ] Full written list of all data limitations (from Section 2.4 of the plan):
  1. Underreporting and label bias
  2. Conflicting official counts (120 / 201 / 260 spots)
  3. Incomplete drainage data (some layers from 2016)
  4. Coarse rainfall (9–25 km reanalysis; misses 30-min cloudburst)
  5. Terrain model limits (30 m; sees roofs and flyovers)
  6. Location error in reports (GPS off by tens of metres)
  7. Few positives (flood events rare per segment-hour)
  8. Changing ground truth (drain repairs change future behaviour)
  9. Class not depth (predicts risk class, not cm of water)
  10. Free API terms (non-commercial; subject to change)
- [ ] Each limitation has: what it means, how we handle it, what it means for users

### 7.8 — RAG Assistant "Ask JalDrishti" (Stretch — only if core is stable)
- [ ] Document corpus: NDMA advisories, PMC SOPs, ward officer contacts
- [ ] Embeddings: `sentence-transformers/all-MiniLM-L6-v2` → stored in pgvector
- [ ] Retrieval: top-3 relevant passages + live prediction facts as context
- [ ] LLM (Groq): answer only from retrieved passages + live data; cite sources
- [ ] Refusal: "I don't have a source for that" for out-of-scope questions
- [ ] Shown as a floating chat button on the map

**🚦 Phase 7 Gate:** Admin can answer "Which 10 segments need inspection first at 60 mm?" in under 1 minute using the Sandbox + admin queue. Effectiveness Ledger shows at least one repaired segment with a before/after comparison.

---

## 🔒 Phase 8: Hardening, Demo Prep & Final Polish (Days 17–21)

> **Goal:** The full Predict → Map → Verify → Alert → Respond loop runs end-to-end from a cold start with no Wi-Fi.

### 8.1 — Offline Demo Mode
- [ ] Select the most dramatic real storm in the dataset (ideally a named Pune flood event, e.g., monsoon 2024)
- [ ] Cache complete storm fixture: prediction GeoJSON for all horizons, 5–10 citizen reports (mix of real-looking + fake), route calculations, alert content
- [ ] Fixture loaded automatically when API calls fail (service worker + fallback URL)
- [ ] All demo steps rehearsed using **only cached data** (no live API dependency during demo)

### 8.2 — Load Testing
- [ ] `locust` or `k6` load test: 50 concurrent users reading the map; 10 concurrent report submissions
- [ ] Ensure `GET /predictions` responds in < 500 ms under load (index on `segment_id` + `computed_at`)
- [ ] API rate limits verified: slowapi correctly throttles at configured limits

### 8.3 — Security Hardening
- [ ] All LLM inputs sanitised; outputs validated against JSON schema before any action
- [ ] Photo upload: max size enforced, file type validation (accept only JPEG/PNG), virus scan if possible
- [ ] SQL injection: use parameterised queries only (SQLAlchemy ORM)
- [ ] CSRF protection on all POST endpoints
- [ ] HTTPS enforced; HSTS header
- [ ] Secrets: all in environment variables, never in code or logs
- [ ] Structured logs: no PII in logs; structured JSON format for easy parsing
- [ ] `/health` endpoint: returns current data freshness per source (public; show this during demo)

### 8.4 — Accessibility
- [ ] Colour-blind safe palette verified (deuteranopia, protanopia)
- [ ] All map layers have text labels (not colour alone)
- [ ] Keyboard navigation for all interactive elements
- [ ] ARIA labels on map controls and form elements
- [ ] Font size minimum 16px body text

### 8.5 — Documentation
- [ ] `README.md`: architecture diagram, setup instructions, data sources, licences, limitations
- [ ] `CONTRIBUTING.md`: branch strategy, commit conventions
- [ ] `DATA_SOURCES.md`: every data source, licence, terms, last-verified date
- [ ] `ml/FEATURES.md`: every feature, unit, source
- [ ] `LIMITATIONS.md`: mirrors the limitations page
- [ ] Reproducible training: `make train` runs training from scratch with fixed seed
- [ ] Reproducible demo: `make demo` starts offline mode with cached storm

### 8.6 — Presentation Prep
- [ ] Architecture slide: the 5-layer diagram above
- [ ] 3-minute demo rehearsed 3 times with real timer; each person knows their role
- [ ] Demo script (from the plan):
  1. 0:00–0:20: Problem hook — "Pune named hundreds of spots but couldn't show if fixes worked"
  2. 0:20–1:10: Open map at cached storm; drag +1h to +6h slider; click segment → read probability/confidence/freshness/reasons
  3. 1:10–1:50: Submit voice report in Marathi; show translation, snap to road, trust score, state change
  4. 1:50–2:15: Submit 3 fake reports; show all held back, no alert sent → **Attack test live on stage**
  5. 2:15–2:40: Show email + Telegram alert in Marathi; walking vs car route with riskiest segment
  6. 2:40–2:55: Sandbox at 60 mm → admin queue reorders; Effectiveness Ledger
  7. 2:55–3:00: Honesty slide — baseline table + limitations list + "prototype" banner
- [ ] QR code on slide 3/4 linking to demo video and GitHub repo
- [ ] 2–3 minute demo video recorded using cached storm (no Wi-Fi dependency); captions added

### 8.7 — Final Checklist Before Submission
- [ ] "Decision-support prototype" banner visible on every screen
- [ ] No screen says "safe route" — all say "lower predicted risk"
- [ ] All confidence scores are explained (not just a number)
- [ ] Evaluation page is public and live
- [ ] Limitations page is public and live
- [ ] Attack test script is in the repo and passing
- [ ] Training script is reproducible with a fixed seed
- [ ] All data sources documented with licences
- [ ] Offline demo mode verified on demo laptop with Wi-Fi off
- [ ] `/health` endpoint showing live freshness

**🚦 Phase 8 Gate:** Full loop (Predict → Map → Verify → Alert → Respond) runs cold-start with Wi-Fi disabled, end-to-end, in under 3 minutes.

---

## 🧪 Edge Cases — Complete Table

### Fake/Hostile Reports
| Case | Defence | Where Implemented |
|---|---|---|
| Single-user spam | Per-device + per-account rate limit (5/h, 20/day) | Trust Engine + slowapi |
| Coordinated brigade (new accounts) | Burst detection: cluster of new accounts in <10 min → all flagged | Isolation Forest + rule |
| Flood claimed in dry weather | Rain plausibility gate: <5 mm observed or forecast → hold for review | Trust Engine signal 2 |
| Flood claimed on ridge/flyover | Terrain plausibility: HAND > 10 m + slope > 10° → trust capped at 40 | Trust Engine signal 3 |
| GPS / pin spoofing | Compare device GPS vs pin vs EXIF GPS; >500 m mismatch → trust deducted | Trust Engine signal 5 |
| Old or stock photo | EXIF time vs submission time; perceptual hash for duplicates; vision check | Trust Engine signal 5 |
| AI-generated photo | Treated as one weak signal; confirmation still needs corroboration or admin | Trust Engine + admin |
| Offensive content | Text moderation + image safety check before public display | Content moderation |
| Prompt injection in text | LLM extracts only into fixed JSON schema; no tools/privileges; output validated | Report parsing |
| Contradicting reports (one wet, one dry) | Show both with timestamps; trust-weighted vote with recency decay | Trust Engine |
| Timestamp spoofing (client sends old time) | Server time is authoritative; >5 min drift → trust deducted | Intake endpoint |
| Duplicate reports | Cluster by distance+time; count distinct reporters, not raw submissions | Trust Engine signal 1 |

### Platform & Data Failures
| Case | Defence |
|---|---|
| Weather API down | Cached last-good forecast; banner shows age; confidence degrades; auto-fallback |
| Stale data beyond limit | Map greys out; "Cannot forecast: data too old" notice |
| Extreme OOD rainfall (beyond training distribution) | OOD flag; fall back to conservative rule; explicit notice shown |
| New road segment (no history) | Cold-start prior from terrain features only; Low confidence |
| Alarm fatigue | Threshold + hysteresis + per-user alert cap (3/day) |
| Request outside pilot area | Clear error + nearest covered area |
| Poor connectivity during storm | PWA queues reports; last map cached |
| LLM/API quota exhausted | Fallback chain: Groq → Gemini → Cloudflare → keyword rules |
| RAG assistant hallucinates | Answers only from retrieved passages + live data; shows sources; refuses otherwise |
| Label poisoning in retraining | Only admin-confirmed or high-trust corroborated events → hard labels |
| Sandbox mistaken for reality | SIMULATION watermark on every view; sandbox has no access to alert sender |
| Admin account compromise | Role-based access; audit log; TOTP 2FA |

### Privacy & Safety
| Case | Defence |
|---|---|
| Reporter location exposed | Public map rounds to ~100 m; exact coords visible to admins only |
| Faces/plates in photos | EXIF stripped on upload; optional auto-blur; private bucket with signed links |
| Spam emails to others | Double opt-in; one-click unsubscribe; daily cap under 300 |
| User over-trusting the system | Persistent undismissable banner; "lower predicted risk" wording; helpline links |
| Data retention | Delete raw images after stated period; store only derived features |

---

## 📊 Metrics That Will Be Shown on the Evaluation Page

| Metric | Why It Matters to Judges |
|---|---|
| PR-AUC (Precision-Recall Area Under Curve) | Primary metric for imbalanced classes; accuracy is useless here |
| Recall at fixed False-Alarm Rate | Practical: how many floods do we catch while keeping false alarms manageable |
| F1 (per class + macro) | Harmonic mean of precision and recall |
| False-Alarm Rate | Critical for preventing alert fatigue |
| Brier Score (before and after calibration) | Measures probability calibration quality |
| Expected Calibration Error (ECE) | Shows reliability curve matches reality |
| Conformal Coverage (90% target) | Does the conformal set contain the truth 90% of the time? |
| By-horizon metrics (+1h, +3h, +6h) | Shows skill degradation with time — expected and honest |
| Spatial hold-out performance | Proves generalisation to unseen locations |
| Lead time vs first citizen report | Shows forecasting value-add over crowd-sourcing alone |
| Ablation: with/without forecast rain | Proves the core USP |
| Always-No Baseline vs Our Model | The judge's anti-BS test |
| Trust Engine: fake-report rejection precision/recall | Proves the Trust Engine works |

---

## 🔢 All Data Sources Summary

| Source | What | Key? | Hackathon Fit |
|---|---|---|---|
| Open-Meteo Forecast API | Hourly rain, probability, soil moisture, +6h | None | ✅ |
| Open-Meteo Ensemble API | 51-member spread for uncertainty | None | ✅ |
| Open-Meteo Archive (ERA5) | Historical rain back to 1940 | None | ✅ |
| Open-Meteo Flood API (GloFAS) | River discharge near nalas | None | ✅ |
| NASA GPM IMERG Early Run | Satellite rain every 30 min | Earthdata login | ✅ |
| IMD gridded (0.25°) | Climatology, calibration | None (download) | ✅ |
| Copernicus GLO-30 DEM | 30 m elevation, slope | AWS Open Data (no key) | ✅ |
| ASF Global 30 m HAND | Height above nearest drainage | AWS Open Data (no key) | ✅ |
| ESA WorldCover 10 m | Built-up/vegetation share | None | ✅ |
| OpenStreetMap (Overpass API) | Roads, waterways, drains, bridges | None | ✅ |
| PMC / OpenCity | Stormwater drain map, ward layers | None | ✅ |
| Groq | LLM + Whisper STT | Free key | ✅ |
| Google Gemini free | Backup LLM + embeddings | Free key | ✅ (non-sensitive only) |
| Cloudflare Workers AI | Backup LLM | Free account | ✅ |
| Bhashini | Translation + speech | Free registration | ✅ (may need fallback) |
| Brevo | Email alerts | Free account | ✅ (300/day) |
| Neon | PostgreSQL + PostGIS + pgvector | Free account | ✅ |
| Telegram BotFather | Bot alerts | Free token | ✅ |
| Cloudflare Turnstile | CAPTCHA | Free | ✅ |

---

## 👥 Team Split Suggestion (4 People)

| Person | Ownership | Phases |
|---|---|---|
| **A — ML + Data** | `data/`, `ml/`, `pipeline/`, evaluation page | 1, 2, 3, 7.6 |
| **B — Backend** | `api/`, database schema, routing | 3, 6.3, 7.5 |
| **C — Frontend + Map** | `frontend/`, PWA, i18n, all pages | 4, 6.2 |
| **D — Trust + NLP + Alerts + DevOps** | `trust/`, alert channels, voice, Docker, attack tests | 5, 6.1, 6.2, 8 |

**Coordination contracts (agree Day 0):**
- `data/` writes `segments` + `segment_features` tables — nothing else
- `ml/` reads those tables + rainfall, writes `predictions` table
- `api/` serves `predictions`, `reports`, `routes` as JSON; frontend never touches DB directly
- `trust/` exposes exactly one function: `score_report(report) → {score, state, reasons}`
- **JSON shape of `Prediction` is frozen on Day 0** — frontend builds against fixtures

---

## ⚠️ Pitfalls to Actively Avoid

1. **Random row split in training** → leaks time and place → inflates all metrics → judges will catch this
2. **Calling raw model probability "confidence"** → must calibrate first (Isotonic/Platt + Brier score)
3. **LLM touches privileged actions or unsanitised input** → use fixed JSON schema extraction only
4. **Building RAG assistant before core loop is stable** → RAG is Tier 3 stretch; never sacrifice Tier 1
5. **Depending on one free API with no cached fallback** → every external API has a cached fallback
6. **Presenting as an official warning system** → persistent banner; "lower predicted risk" wording
7. **"Accuracy" as headline metric** → lead with PR-AUC and recall; always show always-no baseline
8. **Whole-city weak labels** → one pilot zone done well beats a whole-city map with no ground truth
9. **Demo depending on live Wi-Fi** → offline demo mode with cached storm must work cold
10. **Adding features in the last 2 hours before deadline** → freeze the demo path at Day 2 Hour 5 (two-day hackathon) or equivalent

---

## 🏆 Winning Strategy — What Separates 1st from 2nd

1. **Show the baseline first** — Almost every team shows accuracy; showing PR-AUC + always-no baseline signals the team understood the problem at a research level
2. **Forecast, visibly** — Ablation "with vs without forecast rainfall" is the proof that forecasting beats a static map
3. **Make uncertainty a feature** — Confidence bands, fading future hours, "I'm unsure here, please confirm" prompt
4. **Attack your own system on stage** — Fake reports being rejected on stage is more memorable than a clean run
5. **Tie to Pune specifically** — Use real hotspot names from Traffic Police grading (A+ to B) and the accountability story about unproven drain fixes
6. **Be honest** — An honest weak model with baselines beats an unexplained strong one every time
7. **Name the prior art** — Cite Riskmap.in and IIT Bombay Mumbai portal; show exactly what we add beyond them

---

*This roadmap is built to answer every judge question that could arise — on data provenance, model validity, edge case handling, privacy, scalability, and intellectual honesty. Follow the gates at the end of each phase and you will have a demo that judges cannot poke holes in.*
