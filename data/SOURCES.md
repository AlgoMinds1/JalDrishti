# Data and source inventory

| Source / URL | Use | Licence / notes |
|---|---|---|
| https://www.hindustantimes.com/cities/pune-news/pmc-panel-to-identify-causes-of-flooding-suggest-preventive-measures-101722452082351.html | July 24–25 2024 event and affected Sinhagad Road localities | Hindustan Times article; copyright remains with publisher. Search result and article text reviewed; no coordinates supplied. |
| https://www.hindustantimes.com/cities/pune-news/thursday-downpour-leads-to-waterlogging-in-some-areas-101696011409574.html | 2023 Sinhagad Road flooding; Thursday date inferred as Sept. 28, 2023 from article publication date Sept. 30 | Hindustan Times article; copyright remains with publisher. |
| https://timesofindia.indiatimes.com/city/pune/waterlogging-reveals-poor-standard-of-smart-roads/articleshow/71284804.cms | 2019 citywide flooding; article says Monday night into Tuesday and is dated Sept. 25 | Times of India article; copyright remains with publisher. |
| https://nominatim.openstreetmap.org/search | Intended geocoding service | Not successfully queried in this environment. Nominatim data follows OpenStreetMap ODbL; obey usage policy and 1 request/second when retrieving. |
| https://www.openstreetmap.org/copyright | Existing road geometry attribution/licence reference | OpenStreetMap contributors, ODbL. Existing project network files were reused without verified download log; confirm provenance before redistribution. |
| https://archive-api.open-meteo.com/v1/archive | Intended observed hourly rain (ERA5) source | Open-Meteo API terms apply; no archive download was completed in this run. |
| https://api.open-meteo.com/v1/forecast | Live forecast source in `predict_live.py` | Open-Meteo terms apply; current forecast requests are not cached here. |
| https://registry.opendata.aws/copernicus-dem/ | Intended Copernicus GLO-30 DEM | AWS registry entry; no download performed. Check the dataset-specific licence/attribution before redistribution. |
| https://registry.opendata.aws/glo-30-hand/ | Intended ASF HAND | AWS registry entry; no download performed. Check dataset-specific terms. |
| https://esa-worldcover.org/en/data-access | Intended ESA WorldCover built-up proxy | ESA WorldCover terms apply; no download performed. |
| `data/processed/pilot_segments.geojson`, `data/processed/segment_features.json`, `data/processed/rainfall_cache.json` | Existing geometry/features/cache used to build prototype exports | Checked-in files; upstream URLs and licence metadata are not attached and their contents are not independently verified. Weather snapshot is stale. |
| `data/raw/incidents.csv` | Examined, excluded from verified labels | Per-row source URLs are absent; its labels are not used. |

One failed/unavailable acquisition was not retried because no external data fetch was attempted by this run. The live script retries the forecast request once and logs failures.
