# Results: baseline only

## Event inventory

Three dated flood events are supported by the sourced findings in `labels_compiled.csv`: Pune city, 2019-09-24; Sinhagad Road, 2023-09-28; and Sinhagad Road localities, 2024-07-24/25 (replay event). All lack exact road-point/time coordinates. Consequently there are **zero eligible segment-hour positives**, no defensible event/spatial train-validation-test split, and no test metrics.

## Decision

The hard minimum of five distinct labelled events is not met. No classifier, calibration, PR-AUC, F1, Brier score, false-alarm rate, ablation, or SHAP claims are reported. Comparing against always-no, hotspot-list-only and rain-threshold metrics would require valid test labels; none exist at segment level. The delivered `model_type` is `baseline`.

## Baseline output

The cached forecast values for the six-hour window are 0.0 mm each. The baseline therefore reports near-zero rain and assigns 0.01 heuristic probability to each exported road and horizon. Probabilities are uncalibrated, confidence is Low, and outputs must not be interpreted as validated forecasts. The cache was roughly 66 hours old at generation time. Use `predict_live.py` to fetch a current forecast before viewing live conditions.

## Work not run

No Nominatim geocoding, OSM network refresh, Copernicus DEM/HAND/WorldCover download, Open-Meteo archive download, forecast-history retrieval, parquet export, model training, calibration, SHAP, learning-curve plot, or quantitative evaluation ran. See `data/SOURCES.md` for URLs and licence notes.
