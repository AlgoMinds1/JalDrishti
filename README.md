# JalDrishti Pune pilot: auditable baseline

This pilot exports a **rain-threshold + hotspot baseline** for an approximate 5 × 5 km window centred on Ekta Nagar / Vitthalwadi on Sinhagad Road. It does not claim predictive skill. The currently available evidence contains only three dated flood events and none of the published reports geolocates individual affected road segments precisely enough to create segment-hour labels. Under the project rule, model training stops until there are at least five distinct labelled events.

## What was verified

The requested replay dates were corrected to **24–25 July 2024**. A Hindustan Times report states that heavy rain on July 24–25 flooded Sinhagad Road and that Ektanagar, Vitthalwadi, Nimbajnagar, Warje and Shivane were affected. The event findings are recorded in [labels_compiled.csv](labels_compiled.csv). The 2019 report describes citywide road flooding on September 24 (published Sept. 25); the 2023 report describes Thursday, September 28 flooding on Sinhagad Road. These reports verify dated events, but not exact flooded road coordinates in the pilot window.

| Event | Date(s) | Source-backed place mentions | Segment labels eligible |
|---|---|---:|---:|
| Pune 2019 monsoon flooding | 2019-09-24 | 1 broad city report | 0 |
| Pune 2023 downpour | 2023-09-28 | 1 Sinhagad Road report | 0 |
| Pune July 2024 flooding (replay) | 2024-07-24, 2024-07-25 | 1 report covering several localities | 0 |

`data/pilot/event_counts.csv` records the findings. No positive coordinates were guessed and no Nominatim results were available through the connected research interface; therefore labels are not snapped or shown as point markers. The supplied `data/raw/incidents.csv` has no per-row `source_url`, so it was not accepted as verified labels.

## Outputs and limitations

- Run `/opt/homebrew/bin/python3 build_pilot.py` to rebuild `labels_compiled.csv` and the baseline files in `data/pilot/` using the checked-in road and rain snapshots.
- `data/pilot/predictions_h1.geojson` … `predictions_h6.geojson`, `predictions_all.json`, and `data/pilot/map.html` are map-ready. The Leaflet map uses OpenStreetMap tiles and a colour-blind-safe palette. The replay banner is persistent. Prediction confidence is Low.
- `data/pilot/features.csv` is the static feature inventory. A genuine `features.parquet`, LightGBM `model.txt`, fitted `calibrator.pkl`, learning curve, SHAP explanations and evaluation metrics were not produced. The local Python environment lacks pandas, PyArrow, LightGBM, scikit-learn and matplotlib; more importantly, the label-count rule forbids fitting a skill model. A placeholder pickle or fabricated metrics would be misleading.
- No historical hourly precipitation archive was fetched in this run. Existing cached hourly precipitation has six near-zero values and was fetched at `data/processed/rainfall_cache.json`'s timestamp (about 66 hours before generation). It is stale and is used only to demonstrate the baseline output contract, not as a valid forecast. `predict_live.py` fetches a fresh Open-Meteo forecast when run with network access.
- Existing road geometry and terrain features were reused from `data/processed/`. Their source lineage, licences, exact coverage, DEM/HAND processing and segment snapping were not independently verified. The inputs should be replaced with documented downloads before operational use.

Known limitations: sparse and reporting-biased labels; coarse ERA5 rainfall; 30 m terrain misses underpass dips; location/GPS uncertainty; no historical forecast archive or replay-time information set; and no verified segment-level source labels. There is no meaningful test split or baseline comparison while the target labels cannot be spatially assigned.

See [results.md](results.md) and [data/SOURCES.md](data/SOURCES.md) for the audit trail.

## Browser push notifications

Users must opt in on each browser/device using Enable alerts. The API stores
subscriptions in the configured database; broadcasts are sent immediately when
the admin presses Send notification now.
The deployed site must use HTTPS and the API must have `VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` (a `mailto:` contact) configured.
Install the added `pywebpush` requirement. The top-bar Notifications button
opens the demo admin sign-in (password `123456`) and broadcast composer; users
without a subscription will not receive the message. The password gate is a
frontend demo convenience and the broadcast API has no authentication. The
current app's sign-in screen is a prototype rather than account authentication,
so the admin view can count opted-in browser installations but cannot identify
named or currently active users.
