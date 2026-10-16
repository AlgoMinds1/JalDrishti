# JalDrishti evaluation status

**Current status: baseline only; not quantitatively evaluable.** See `evaluation_results.json` for the machine-readable record used by the API.

Three distinct source-backed flood events were found: Pune (2019-09-24), Sinhagad Road (2023-09-28), and the Pune replay event (2024-07-24 to 2024-07-25). The reports do not geolocate the affected road segments sufficiently to create segment-level labels. There are zero eligible segment-level positives and no valid event/spatial test split. The training rule also requires at least five distinct labelled events, so no trained model or skill claim is made.

PR-AUC, precision, recall, F1, Brier score, false-alarm rate, recall at 5% false-alarm rate, per-horizon metrics, ablations, and calibrated probabilities are **not measured**. Always-no, hotspot-only, and rain-threshold comparison metrics are also not measured because there is no labelled test set. The current rain-threshold baseline output uses a cached zero-rain forecast snapshot that was about 66 hours old at export, so it is not a current weather evaluation.

The earlier perfect metrics and benchmark numbers in this file were not supported by the audited label set and have been withdrawn. Do not use them as model results.
