"""
Unified Inference Engine for JalDrishti Road Segment Risk Forecasting
Conforms directly to the frozen API Prediction contract.
"""
import os
import json
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from ml.features import FEATURE_COLUMNS, ROAD_CLASS_MAP
from ml.shap_explainer import ShapExplainer

MODEL_PATH = "ml/model_v1.pkl"
FEATURES_CACHE_PATH = "data/processed/segment_features.json"

class Predictor:
    def __init__(self, model_path: str = MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Train model first.")
        
        self.bundle = joblib.load(model_path)
        self.calibrated_model = self.bundle["calibrated_model"]
        self.mapie_model = self.bundle["mapie_model"]
        self.optimal_threshold = self.bundle["optimal_threshold"]
        self.feature_names = self.bundle["feature_names"]
        self.explainer = ShapExplainer(model_path)

        # Load segment features cache for high-speed sub-millisecond lookups
        with open(FEATURES_CACHE_PATH, "r", encoding="utf-8") as f:
            feats = json.load(f)
        self.features_by_id = {f["segment_id"]: f for f in feats}

    def predict_segment(
        self,
        segment_id: str,
        horizon_h: int = 1,
        rainfall_1h: float = 0.0,
        rainfall_3h: float = 0.0,
        rainfall_6h: float = 0.0,
        forecast_precip_h: float = 0.0,
        ensemble_spread_mm: float = 0.5,
        soil_moisture: float = 0.35,
        rain_data_age_min: int = 15,
        past_incident_count: int = 0
    ) -> dict:
        """
        Produce a calibrated risk prediction for a road segment at horizon h.
        """
        feat = self.features_by_id.get(segment_id, {})
        if not feat:
            # Default baseline features if segment not in pre-computed set
            feat = {
                "elevation_mean": 560.0, "elevation_min": 558.0, "slope_mean": 1.5,
                "hand_mean": 3.5, "hand_min": 3.0, "builtup_share": 0.80,
                "dist_to_waterway_m": 450.0, "drainage_coverage_pct": 50.0,
                "road_class": "secondary", "is_underpass": 0, "is_bridge": 0, "is_tunnel": 0
            }

        hand = feat.get("hand_mean", 3.5)
        drainage = feat.get("drainage_coverage_pct", 50.0)
        is_underpass = int(feat.get("is_underpass", 0))
        dist_waterway = feat.get("dist_to_waterway_m", 450.0)
        road_class_num = ROAD_CLASS_MAP.get(str(feat.get("road_class", "secondary")).lower(), 2)

        # Compute interaction features
        rain_per_hand = round(rainfall_3h / (hand + 0.8), 3)
        drainage_deficit = round(max(0.0, rainfall_3h - (drainage * 0.25)), 3)
        saturated_runoff = round(rainfall_3h * soil_moisture, 3)
        underpass_exposure = round(is_underpass * rainfall_1h, 3)
        waterway_risk = round(np.exp(-dist_waterway / 250.0) * rainfall_6h, 3)

        sample = {
            "elevation_mean": feat.get("elevation_mean", 560.0),
            "elevation_min": feat.get("elevation_min", 558.0),
            "slope_mean": feat.get("slope_mean", 1.5),
            "hand_mean": hand,
            "hand_min": feat.get("hand_min", 3.0),
            "builtup_share": feat.get("builtup_share", 0.80),
            "dist_to_waterway_m": dist_waterway,
            "drainage_coverage_pct": drainage,
            "road_class_num": road_class_num,
            "is_underpass": is_underpass,
            "is_bridge": int(feat.get("is_bridge", 0)),
            "is_tunnel": int(feat.get("is_tunnel", 0)),
            "horizon_h": horizon_h,
            "rainfall_1h": rainfall_1h,
            "rainfall_3h": rainfall_3h,
            "rainfall_6h": rainfall_6h,
            "rainfall_24h": rainfall_6h * 1.5,
            "rainfall_72h": rainfall_6h * 2.0,
            "forecast_precip_h": forecast_precip_h,
            "ensemble_spread_mm": ensemble_spread_mm,
            "soil_moisture": soil_moisture,
            "past_incident_count": past_incident_count,
            "rain_per_hand": rain_per_hand,
            "drainage_deficit": drainage_deficit,
            "saturated_runoff": saturated_runoff,
            "underpass_exposure": underpass_exposure,
            "waterway_risk": waterway_risk
        }

        # 1. Calibrated Probability
        df_row = pd.DataFrame([[sample[c] for c in self.feature_names]], columns=self.feature_names)
        prob = float(self.calibrated_model.predict_proba(df_row)[0, 1])

        # 2. Risk Classification (4 categories)
        if prob >= 0.75:
            risk_class = "severe"
        elif prob >= self.optimal_threshold:
            risk_class = "high"
        elif prob >= 0.20:
            risk_class = "moderate"
        else:
            risk_class = "low"

        # 3. Conformal Prediction Set Size
        try:
            _, p_sets = self.mapie_model.predict_set(df_row)
            if p_sets.ndim == 3:
                p_sets = p_sets[:, :, 0]
            conf_set_size = int(p_sets.sum(axis=1)[0])
        except Exception:
            conf_set_size = 1

        # 4. Confidence Level Assessment
        # Penalised by stale weather data, large ensemble spread, and ambiguity in conformal set
        is_stale = rain_data_age_min > 45
        is_uncertain_spread = ensemble_spread_mm > 8.0

        if conf_set_size == 1 and not is_stale and not is_uncertain_spread:
            confidence_level = "High"
            conf_score = round(float(np.clip(0.85 + (abs(prob - 0.5) * 0.25), 0.70, 0.98)), 2)
        elif conf_set_size <= 2 and not is_stale:
            confidence_level = "Medium"
            conf_score = round(float(np.clip(0.55 + (abs(prob - 0.5) * 0.20), 0.45, 0.75)), 2)
        else:
            confidence_level = "Low"
            conf_score = round(float(np.clip(0.30 + (abs(prob - 0.5) * 0.15), 0.20, 0.45)), 2)

        # 5. SHAP Explanations
        top_reasons, _ = self.explainer.explain(sample, top_k=3)

        # 6. Out-Of-Distribution (OOD) check
        is_ood = rainfall_1h > 150.0 or rainfall_3h > 300.0 or ensemble_spread_mm > 40.0

        return {
            "segment_id": segment_id,
            "horizon_h": horizon_h,
            "risk_class": risk_class,
            "probability": round(prob, 2),
            "confidence_level": confidence_level,
            "confidence_score": conf_score,
            "conf_set_size": conf_set_size,
            "top_reasons": top_reasons,
            "rain_data_age_min": rain_data_age_min,
            "is_ood": is_ood,
            "computed_at": datetime.now(timezone.utc).isoformat()
        }

if __name__ == "__main__":
    predictor = Predictor()
    pred = predictor.predict_segment(
        segment_id="way/123456",
        horizon_h=2,
        rainfall_1h=15.0,
        rainfall_3h=38.0,
        forecast_precip_h=24.0,
        ensemble_spread_mm=3.2,
        soil_moisture=0.46,
        rain_data_age_min=18,
        past_incident_count=2
    )
    print("=== Sample Inference Output ===")
    print(json.dumps(pred, indent=2))
