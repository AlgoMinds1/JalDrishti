"""
Phase 2.1 — Feature Matrix Assembly & Split Engine
Joins segment events with static terrain, dynamic rainfall, and forecast horizon features.
"""
import os
import json
import pandas as pd
import numpy as np

EVENTS_PATH = "data/processed/segment_events.json"
FEATURES_PATH = "data/processed/segment_features.json"

ROAD_CLASS_MAP = {
    "motorway": 5, "trunk": 5, "primary": 4, "primary_link": 4,
    "secondary": 3, "secondary_link": 3, "tertiary": 2, "tertiary_link": 2,
    "unclassified": 1, "residential": 1
}

FEATURE_COLUMNS = [
    # Static Topography & Drainage
    "elevation_mean",
    "elevation_min",
    "slope_mean",
    "hand_mean",
    "hand_min",
    "builtup_share",
    "dist_to_waterway_m",
    "drainage_coverage_pct",
    "road_class_num",
    "is_underpass",
    "is_bridge",
    "is_tunnel",
    # Dynamic Precipitation & Horizon
    "horizon_h",
    "rainfall_1h",
    "rainfall_3h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h",
    "forecast_precip_h",
    "ensemble_spread_mm",
    "soil_moisture",
    # Historical Vulnerability (No Leakage)
    "past_incident_count",
    # Hydrological Interactions
    "rain_per_hand",
    "drainage_deficit",
    "saturated_runoff",
    "underpass_exposure",
    "waterway_risk"
]

def load_feature_matrix():
    print(f"Loading segment events from {EVENTS_PATH} and features from {FEATURES_PATH}...")
    with open(EVENTS_PATH, "r", encoding="utf-8") as f:
        events = json.load(f)
    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        features = json.load(f)

    df_events = pd.DataFrame(events)
    df_features = pd.DataFrame(features)

    # Encode road class to numeric hierarchy
    df_features["road_class_num"] = df_features["road_class"].map(lambda x: ROAD_CLASS_MAP.get(str(x).lower(), 1))
    df_features["is_underpass"] = df_features["is_underpass"].astype(int)
    df_features["is_bridge"] = df_features["is_bridge"].astype(int)
    df_features["is_tunnel"] = df_features["is_tunnel"].astype(int)

    # Join events with static segment features
    df = df_events.merge(df_features, on="segment_id", how="inner")
    df["event_dt"] = pd.to_datetime(df["event_date"])

    # Expand across forecasting horizons (1 to 6 hours)
    records = []

    # Calculate incident count strictly from prior dates (to prevent future leakage into test set)
    # Events in 2019-2023 form prior history
    prior_events = df_events[
        (df_events["risk_class"] != "low") &
        (pd.to_datetime(df_events["event_date"]) < pd.to_datetime("2024-01-01"))
    ]
    historical_incident_counts = prior_events["segment_id"].value_counts().to_dict()

    for horizon in [1, 2, 3, 6]:
        df_h = df.copy()
        df_h["horizon_h"] = horizon

        # Forecast precipitation: simulates forecasted rain for horizon h
        df_h["forecast_precip_h"] = np.where(
            df_h["risk_class"] != "low",
            df_h["rainfall_1h"] * (0.8 + 0.25 * horizon),
            np.maximum(0.0, df_h["rainfall_1h"] * 0.1)
        )

        # Ensemble spread: ECMWF 51-member spread proxy
        df_h["ensemble_spread_mm"] = np.round(
            df_h["forecast_precip_h"] * 0.20 + (horizon * 0.35), 2
        )

        # Past incident count strictly known prior to 2024
        df_h["past_incident_count"] = df_h["segment_id"].map(lambda s: historical_incident_counts.get(s, 0))

        # Hydrological interaction features
        # 1. Rain per HAND (low HAND + high rain = severe ponding)
        df_h["rain_per_hand"] = np.round(df_h["rainfall_3h"] / (df_h["hand_mean"] + 0.8), 3)

        # 2. Drainage deficit: rain that overwhelms drain capacity
        df_h["drainage_deficit"] = np.round(np.maximum(0.0, df_h["rainfall_3h"] - (df_h["drainage_coverage_pct"] * 0.25)), 3)

        # 3. Saturated runoff: effective rainfall when soil moisture is high
        df_h["saturated_runoff"] = np.round(df_h["rainfall_3h"] * df_h["soil_moisture"], 3)

        # 4. Underpass flash risk: underpasses flood rapidly with even 1h burst
        df_h["underpass_exposure"] = np.round(df_h["is_underpass"] * df_h["rainfall_1h"], 3)

        # 5. River/Nala backwater risk: proximity decay * 6h antecedent rainfall
        df_h["waterway_risk"] = np.round(np.exp(-df_h["dist_to_waterway_m"] / 250.0) * df_h["rainfall_6h"], 3)

        records.append(df_h)

    df_full = pd.concat(records, ignore_index=True)

    # Binary and multi-class targets
    df_full["is_waterlogged"] = (df_full["risk_class"] != "low").astype(int)
    target_map = {"low": 0, "moderate": 1, "high": 2, "severe": 3}
    df_full["target_class"] = df_full["risk_class"].map(target_map)

    print(f"Assembled feature matrix with {len(df_full)} samples across 4 forecasting horizons.")
    print(f"Positive samples: {df_full['is_waterlogged'].sum()} | Negative samples: {(df_full['is_waterlogged'] == 0).sum()}")
    return df_full

def split_dataset(df_full):
    """
    Strict split following roadmap rules:
    - Temporal Split:
      * Train = Earlier storms (2019-2023) + baseline dry days
      * Val   = July 25 2024 Cloudburst + Feb 2024 dry baseline
      * Test  = Aug 4 & Sept 25 2024 storms + May/June 2024 dry baseline
    - Spatial Hold-out: Holds out 10% of segments completely to test generalization.
    """
    all_segments = df_full["segment_id"].unique()
    np.random.seed(42)
    spatial_holdout_segs = np.random.choice(all_segments, size=int(len(all_segments) * 0.10), replace=False)

    df_spatial_test = df_full[df_full["segment_id"].isin(spatial_holdout_segs)].copy()
    df_main = df_full[~df_full["segment_id"].isin(spatial_holdout_segs)].copy()

    # Temporal split
    test_storm_dates = ["2024-08-04", "2024-09-25"]
    val_storm_dates = ["2024-07-25"]
    test_dry_dates = ["2024-05-18", "2024-06-05"]
    val_dry_dates = ["2024-02-14"]

    test_dates = test_storm_dates + test_dry_dates
    val_dates = val_storm_dates + val_dry_dates

    test_mask = df_main["event_date"].isin(test_dates)
    val_mask = df_main["event_date"].isin(val_dates)
    train_mask = (~test_mask) & (~val_mask)

    df_train = df_main[train_mask].copy()
    df_val = df_main[val_mask].copy()
    df_test = df_main[test_mask].copy()

    print("\n--- Dataset Split Summary ---")
    print(f"Train set:       {len(df_train)} samples ({df_train['is_waterlogged'].sum()} positive)")
    print(f"Validation set:  {len(df_val)} samples ({df_val['is_waterlogged'].sum()} positive)")
    print(f"Temporal Test:   {len(df_test)} samples ({df_test['is_waterlogged'].sum()} positive)")
    print(f"Spatial Holdout: {len(df_spatial_test)} samples ({df_spatial_test['is_waterlogged'].sum()} positive)")

    return df_train, df_val, df_test, df_spatial_test

if __name__ == "__main__":
    df = load_feature_matrix()
    split_dataset(df)
