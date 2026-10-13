"""
Phase 2.7 — SHAP TreeExplainer & Human-Language Explanation Generator
Computes exact per-prediction feature contributions from LightGBM and translates
them into plain, intuitive English sentences for citizens and administrators.
"""
import os
import joblib
import shap
import numpy as np
import pandas as pd
from ml.features import FEATURE_COLUMNS

MODEL_PATH = "ml/model_v1.pkl"

class ShapExplainer:
    def __init__(self, model_bundle_path: str = MODEL_PATH):
        if not os.path.exists(model_bundle_path):
            raise FileNotFoundError(f"Model file not found at {model_bundle_path}. Run ml/train.py first.")
        
        bundle = joblib.load(model_bundle_path)
        self.model = bundle["lgbm_model"]
        self.feature_names = bundle["feature_names"]
        self.explainer = shap.TreeExplainer(self.model)

    def explain(self, sample_dict: dict, top_k: int = 3):
        """
        Explain a single feature vector.
        Returns:
            top_reasons: List[str] — Top 3 plain language human explanation sentences
            shap_dict: Dict[str, float] — Feature importance values for inspection
        """
        # Convert dictionary to DataFrame with ordered feature columns
        df_row = pd.DataFrame([{col: sample_dict.get(col, 0.0) for col in self.feature_names}])
        shap_values = self.explainer.shap_values(df_row)

        # In binary classification, shap_values may be a list of 2 arrays [neg, pos] or 1 array (pos)
        if isinstance(shap_values, list):
            vals = shap_values[1][0]
        elif shap_values.ndim == 2:
            vals = shap_values[0]
        else:
            vals = shap_values[0, :, 1]

        # Pair features with values and SHAP scores
        contributions = []
        for feat_name, s_val in zip(self.feature_names, vals):
            raw_val = sample_dict.get(feat_name, 0.0)
            contributions.append((feat_name, float(s_val), raw_val))

        # Sort by highest positive impact on waterlogging risk
        contributions.sort(key=lambda x: x[1], reverse=True)

        top_reasons = []
        for feat_name, s_val, raw_val in contributions[:top_k]:
            sentence = self._render_sentence(feat_name, raw_val, s_val)
            if sentence:
                top_reasons.append(sentence)

        # Fallback if no prominent drivers
        if not top_reasons:
            top_reasons = ["Normal urban surface runoff within drainage capacity"]

        return top_reasons, {feat: round(val, 4) for feat, val, _ in contributions}

    def _render_sentence(self, feat_name: str, raw_val: float, shap_val: float) -> str:
        """Translates numerical feature impacts into clear human sentences."""
        if feat_name in ["hand_mean", "hand_min", "rain_per_hand"]:
            if raw_val <= 2.5 or feat_name == "rain_per_hand":
                return f"Low-lying terrain prone to water accumulation (HAND {raw_val:.1f} m)"
            return f"Moderate terrain height (HAND {raw_val:.1f} m)"

        elif feat_name == "rainfall_3h":
            return f"Heavy storm rainfall ({raw_val:.1f} mm in last 3 h)"

        elif feat_name == "rainfall_1h":
            return f"Intense localized cloudburst ({raw_val:.1f} mm in past hour)"

        elif feat_name == "forecast_precip_h":
            return f"Forecasted rainfall of {raw_val:.1f} mm in upcoming hours"

        elif feat_name == "is_underpass" and raw_val > 0:
            return "Grade separator / road underpass prone to flash inundation"

        elif feat_name == "drainage_coverage_pct" or feat_name == "drainage_deficit":
            if raw_val < 45.0 or feat_name == "drainage_deficit":
                return "Inadequate municipal stormwater drainage capacity"
            return f"Stormwater drain density: {raw_val:.0f}%"

        elif feat_name == "dist_to_waterway_m" or feat_name == "waterway_risk":
            if raw_val < 250.0 or feat_name == "waterway_risk":
                return f"Close proximity ({raw_val:.0f} m) to river/nala drainage channel"
            return f"Located {raw_val:.0f} m from natural waterway"

        elif feat_name == "past_incident_count" and raw_val > 0:
            return f"{int(raw_val)} historical waterlogging incidents recorded at this spot"

        elif feat_name == "soil_moisture":
            if raw_val > 0.40:
                return "Saturated ground with zero rainwater infiltration"
            return f"Soil moisture saturation: {raw_val:.2f}"

        elif feat_name == "ensemble_spread_mm":
            return f"Forecast ensemble spread ±{raw_val:.1f} mm"

        elif feat_name == "builtup_share":
            return f"High impervious built-up surface ({int(raw_val * 100)}%) preventing percolation"

        return f"{feat_name.replace('_', ' ').title()}: {raw_val}"

if __name__ == "__main__":
    explainer = ShapExplainer()
    # Test on a simulated severe waterlogging segment
    sample_risk = {
        "elevation_mean": 558.0,
        "elevation_min": 556.0,
        "slope_mean": 1.2,
        "hand_mean": 1.4,
        "hand_min": 1.1,
        "builtup_share": 0.88,
        "dist_to_waterway_m": 85.0,
        "drainage_coverage_pct": 28.0,
        "road_class_num": 4,
        "is_underpass": 1,
        "is_bridge": 0,
        "is_tunnel": 0,
        "horizon_h": 2,
        "rainfall_1h": 14.5,
        "rainfall_3h": 38.0,
        "rainfall_6h": 46.0,
        "rainfall_24h": 58.0,
        "rainfall_72h": 82.0,
        "forecast_precip_h": 22.0,
        "ensemble_spread_mm": 5.2,
        "soil_moisture": 0.48,
        "past_incident_count": 3,
        "rain_per_hand": 17.2,
        "drainage_deficit": 31.0,
        "saturated_runoff": 18.24,
        "underpass_exposure": 14.5,
        "waterway_risk": 32.7
    }

    reasons, shap_vals = explainer.explain(sample_risk)
    print("=== SHAP Explanation Generator Test ===")
    print("Top Reasons:")
    for idx, r in enumerate(reasons, 1):
        print(f"  {idx}. {r}")
    print("\nTop Contributing SHAP Features:")
    for k, v in list(shap_vals.items())[:5]:
        print(f"  - {k}: {v}")
