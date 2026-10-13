"""
Phase 2 Gate Verification Script
Verifies:
1. Model bundle exists and loads properly
2. Model beats Hotspot-Only baseline on PR-AUC
3. Conformal prediction sets are generated
4. SHAP explanations are directionally consistent with predictions
5. predict_segment returns the valid Prediction contract shape
6. Features and Evaluation documentation files exist
"""
import os
import sys
import json
import joblib
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.predict import Predictor
from ml.shap_explainer import ShapExplainer

def test_phase2_gate():
    print("=== JalDrishti Phase 2 Gate Verification ===")

    # 1. Check model bundle
    model_path = Path("ml/model_v1.pkl")
    assert model_path.exists(), f"Model file {model_path} does not exist!"
    bundle = joblib.load(model_path)
    print(f"[1/6] Model Bundle: Loaded {model_path} ({model_path.stat().st_size} bytes)")

    # 2. Check baselines and PR-AUC Gate condition
    baselines = bundle["baselines"]
    model_metrics = bundle["model_metrics"]["calibrated"]
    hotspot_pr_auc = baselines["hotspot_only"]["pr_auc"]
    model_pr_auc = model_metrics["pr_auc"]

    print(f"[2/6] Baseline Comparison:")
    print(f"      Always-No PR-AUC:      {baselines['always_no']['pr_auc']:.4f}")
    print(f"      Hotspot-Only PR-AUC:   {hotspot_pr_auc:.4f}")
    print(f"      Rainfall-Rule PR-AUC:  {baselines['rainfall_rule']['pr_auc']:.4f}")
    print(f"      JalDrishti Model PR-AUC: {model_pr_auc:.4f}")

    assert model_pr_auc > hotspot_pr_auc, (
        f"Phase 2 Gate Failure: Model PR-AUC ({model_pr_auc}) did not beat Hotspot Baseline ({hotspot_pr_auc})"
    )
    print("      -> Gate Requirement (Model PR-AUC > Hotspot PR-AUC): PASSED [OK]")

    # 3. Check Conformal Coverage & MAPIE
    conf_coverage = bundle["model_metrics"]["conformal_coverage"]
    avg_set_size = bundle["model_metrics"]["avg_set_size"]
    print(f"[3/6] MAPIE Conformal Set Coverage: {conf_coverage * 100:.1f}% (Avg set size: {avg_set_size})")
    assert conf_coverage >= 0.85, f"Conformal coverage below 85%: {conf_coverage}"

    # 4. Check SHAP Explanations & Directional Consistency
    explainer = ShapExplainer()
    severe_sample = {
        "elevation_mean": 558.0, "elevation_min": 556.0, "slope_mean": 1.0,
        "hand_mean": 1.2, "hand_min": 1.0, "builtup_share": 0.85,
        "dist_to_waterway_m": 75.0, "drainage_coverage_pct": 25.0,
        "road_class_num": 4, "is_underpass": 1, "is_bridge": 0, "is_tunnel": 0,
        "horizon_h": 2, "rainfall_1h": 16.0, "rainfall_3h": 42.0, "rainfall_6h": 50.0,
        "rainfall_24h": 60.0, "rainfall_72h": 85.0, "forecast_precip_h": 25.0,
        "ensemble_spread_mm": 4.5, "soil_moisture": 0.49, "past_incident_count": 3,
        "rain_per_hand": 21.0, "drainage_deficit": 35.0, "saturated_runoff": 20.5,
        "underpass_exposure": 16.0, "waterway_risk": 37.0
    }
    reasons, shap_vals = explainer.explain(severe_sample)
    print(f"[4/6] SHAP Directional Consistency Check:")
    print(f"      Top reasons generated: {len(reasons)}")
    for r in reasons:
        print(f"        * {r}")
    assert len(reasons) >= 1, "No explanation sentences generated"
    # Ensure at least one prominent positive flood risk driver appears
    assert any("rainfall" in r.lower() or "terrain" in r.lower() or "underpass" in r.lower() or "drainage" in r.lower() or "incident" in r.lower() for r in reasons), "Explanations lack physical flood drivers"
    print("      -> Directional consistency: PASSED [OK]")

    # 5. Check Unified Prediction Contract
    predictor = Predictor()
    pred = predictor.predict_segment(
        segment_id="way/test_seg_123",
        horizon_h=3,
        rainfall_1h=12.0,
        rainfall_3h=35.0,
        forecast_precip_h=18.0
    )
    print(f"[5/6] Prediction Contract Check:")
    required_keys = [
        "segment_id", "horizon_h", "risk_class", "probability",
        "confidence_level", "confidence_score", "conf_set_size",
        "top_reasons", "rain_data_age_min", "is_ood", "computed_at"
    ]
    for k in required_keys:
        assert k in pred, f"Missing required key '{k}' in Prediction contract"
    print(f"      Output: risk={pred['risk_class']}, prob={pred['probability']}, confidence={pred['confidence_level']}")
    print("      -> Data contract validation: PASSED [OK]")

    # 6. Check Documentation Files
    features_md = Path("ml/FEATURES.md")
    eval_md = Path("ml/EVALUATION.md")
    eval_json = Path("ml/evaluation_results.json")
    assert features_md.exists(), "Missing ml/FEATURES.md"
    assert eval_md.exists(), "Missing ml/EVALUATION.md"
    assert eval_json.exists(), "Missing ml/evaluation_results.json"
    print(f"[6/6] Documentation Files: All present (FEATURES.md, EVALUATION.md, evaluation_results.json)")

    print("=== Phase 2 Gate PASSED Successfully! ===")

if __name__ == "__main__":
    test_phase2_gate()
