"""
Unified Inference Engine for JalDrishti Road Segment Risk Forecasting
Conforms directly to the frozen API Prediction contract.
"""
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

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
            "ensemble_spread": round(ensemble_spread_mm, 2),
            "model_version": "v1.0.0-lightgbm-isotonic",
            "computed_at": datetime.now(timezone.utc).isoformat()
        }

    def predict_batch(self, samples_list: list, compute_shap: bool = True) -> list:
        """
        Vectorized batch inference over multiple segments.
        Computes calibrated probability, conformal sets, confidence badges,
        and SHAP explanations in batch.
        """
        if not samples_list:
            return []

        df_batch = pd.DataFrame([{col: s.get(col, 0.0) for col in self.feature_names} for s in samples_list])

        # 1. Calibrated Probabilities
        probs = self.calibrated_model.predict_proba(df_batch)[:, 1]

        # 2. Conformal Prediction Set Sizes
        try:
            _, p_sets = self.mapie_model.predict_set(df_batch)
            if p_sets.ndim == 3:
                p_sets = p_sets[:, :, 0]
            conf_set_sizes = p_sets.sum(axis=1).astype(int)
        except Exception:
            conf_set_sizes = np.ones(len(samples_list), dtype=int)

        # 3. Batch SHAP Values (optional for ultra-fast sandbox inference)
        if compute_shap:
            try:
                shap_values = self.explainer.explainer.shap_values(df_batch)
                if isinstance(shap_values, list):
                    shap_mat = shap_values[1]
                elif shap_values.ndim == 2:
                    shap_mat = shap_values
                else:
                    shap_mat = shap_values[:, :, 1]
            except Exception:
                shap_mat = np.zeros((len(samples_list), len(self.feature_names)))
        else:
            shap_mat = np.zeros((len(samples_list), len(self.feature_names)))

        now_iso = datetime.now(timezone.utc).isoformat()
        results = []

        for idx, sample in enumerate(samples_list):
            prob = float(probs[idx])
            conf_set_size = int(conf_set_sizes[idx])
            s_row = shap_mat[idx]

            # Risk Classification
            if prob >= 0.75:
                risk_class = "severe"
            elif prob >= self.optimal_threshold:
                risk_class = "high"
            elif prob >= 0.20:
                risk_class = "moderate"
            else:
                risk_class = "low"

            rain_data_age_min = int(sample.get("rain_data_age_min", 15))
            ensemble_spread_mm = float(sample.get("ensemble_spread_mm", 0.5))
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

            # Top 3 SHAP explanations
            top_indices = np.argsort(-s_row)[:3]
            top_reasons = []
            for feat_idx in top_indices:
                feat_name = self.feature_names[feat_idx]
                raw_val = float(sample.get(feat_name, 0.0))
                s_val = float(s_row[feat_idx])
                sentence = self.explainer._render_sentence(feat_name, raw_val, s_val)
                if sentence:
                    top_reasons.append(sentence)

            if not top_reasons:
                top_reasons = ["Normal urban surface runoff within drainage capacity"]

            r1h = float(sample.get("rainfall_1h", 0.0))
            r3h = float(sample.get("rainfall_3h", 0.0))
            is_ood = r1h > 150.0 or r3h > 300.0 or ensemble_spread_mm > 40.0

            results.append({
                "segment_id": sample["segment_id"],
                "horizon_h": int(sample["horizon_h"]),
                "risk_class": risk_class,
                "probability": round(prob, 2),
                "confidence_level": confidence_level,
                "confidence_score": conf_score,
                "conf_set_size": conf_set_size,
                "top_reasons": top_reasons,
                "rain_data_age_min": rain_data_age_min,
                "is_ood": is_ood,
                "ensemble_spread": round(ensemble_spread_mm, 2),
                "model_version": "v1.0.0-lightgbm-isotonic",
                "computed_at": now_iso
            })

        return results


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
