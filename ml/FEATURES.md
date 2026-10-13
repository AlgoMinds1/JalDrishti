# 📐 JalDrishti — Complete Feature Dictionary

> **Model:** LightGBM Conformal Early-Warning Classifier v1  
> **Features Count:** 27 Engineered Features  

---

## 1. Topography & Hydrology Features (Static)

| Feature Name | Type | Unit | Range | Source | Physical Meaning & Rationale |
|---|---|---|---|---|---|
| `elevation_mean` | Float | meters | 500 – 650 | Copernicus GLO-30 DEM | Average elevation along road segment; lower elevations collect runoff. |
| `elevation_min` | Float | meters | 500 – 650 | Copernicus GLO-30 DEM | Minimum elevation spot along the segment (catchment dips). |
| `slope_mean` | Float | degrees | 0.2 – 15.0 | GLO-30 Gradient | Local gradient; flat terrain (< 1.5°) cannot drain surface runoff naturally. |
| `hand_mean` | Float | meters | 0.5 – 35.0 | AWS Global 30m HAND | **Height Above Nearest Drainage**; the single strongest terrain predictor. Values < 2.5m indicate natural floodplains. |
| `hand_min` | Float | meters | 0.2 – 30.0 | AWS Global 30m HAND | Lowest point relative to local drainage outlet. |
| `builtup_share` | Float | ratio (0–1) | 0.0 – 1.0 | ESA WorldCover 10m | Impervious surface fraction within 250m buffer; high built-up share prevents soil percolation. |
| `dist_to_waterway_m` | Float | meters | 5 – 2,500 | OSM Waterways (Mula/Mutha) | Proximity to river or stormwater nala. Rivers back up into roads during peak discharges. |
| `drainage_coverage_pct`| Float | percent | 10 – 100% | PMC Stormwater GIS Network | Density and proximity of municipal stormwater drains. Lower density causes ponding. |
| `road_class_num` | Int | rank (1–5) | 1 – 5 | OSM Highway Tags | 5=Trunk, 4=Primary, 3=Secondary, 2=Tertiary, 1=Residential. |
| `is_underpass` | Binary | 0 or 1 | 0, 1 | OSM Tags / Station Subways | Grade separators and vehicle underpasses that rapidly trap water. |
| `is_bridge` | Binary | 0 or 1 | 0, 1 | OSM Bridge Tag | Elevated road segments (generally immune to surface waterlogging). |
| `is_tunnel` | Binary | 0 or 1 | 0, 1 | OSM Tunnel Tag | Enclosed roadways prone to drainage failure. |

---

## 2. Dynamic Weather & Forecast Horizon Features

| Feature Name | Type | Unit | Source | Physical Meaning & Rationale |
|---|---|---|---|---|
| `horizon_h` | Int | hours (1–6) | Input Parameter | Early warning forecasting horizon (1, 2, 3, or 6 hours ahead). |
| `rainfall_1h` | Float | mm | Open-Meteo / ERA5 | Rain accumulated in the preceding 1 hour (flash cloudburst indicator). |
| `rainfall_3h` | Float | mm | Open-Meteo / ERA5 | Cumulative rain over past 3 hours (drainage saturation indicator). |
| `rainfall_6h` | Float | mm | Open-Meteo / ERA5 | Cumulative rain over past 6 hours (catchment volume indicator). |
| `rainfall_24h` | Float | mm | Open-Meteo / ERA5 | Daily background antecedent moisture. |
| `rainfall_72h` | Float | mm | Open-Meteo / ERA5 | Multi-day antecedent rainfall conditioning the soil. |
| `forecast_precip_h` | Float | mm | Open-Meteo Forecast API | Predicted rainfall expected to fall over the upcoming $h$ hours. |
| `ensemble_spread_mm` | Float | mm | ECMWF IFS 51-Member Ensemble | Standard deviation across 51 weather ensemble members; quantifies weather forecast uncertainty. |
| `soil_moisture` | Float | $m^3/m^3$ | ERA5 (0–7cm layer) | Volumetric soil water content (0.15 = dry, 0.48+ = saturated, zero percolation). |

---

## 3. Vulnerability & Interaction Features

| Feature Name | Type | Formula | Physical Meaning & Rationale |
|---|---|---|---|
| `past_incident_count` | Int | Historical registry count | Prior confirmed civic complaints on this road. |
| `rain_per_hand` | Float | `rainfall_3h / (hand_mean + 0.8)` | Hydrological pressure: high rain falling on near-zero HAND terrain creates inescapable ponding. |
| `drainage_deficit` | Float | `max(0, rainfall_3h - (drainage * 0.25))` | Rainfall volume that exceeds the local municipal drainage throughput capacity. |
| `saturated_runoff` | Float | `rainfall_3h * soil_moisture` | Effective surface runoff volume taking soil saturation into account. |
| `underpass_exposure` | Float | `is_underpass * rainfall_1h` | Rapid flash flooding vulnerability specific to road underpasses during cloudbursts. |
| `waterway_risk` | Float | $\exp(-dist / 250) \times rainfall_6h$ | Risk of river/nala backflow inundating adjacent roadways. |
