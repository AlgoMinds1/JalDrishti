"""
Phase 2.4 & 2.5 — LightGBM Classifier, Calibration & MAPIE Conformal Sets
Trains LightGBM, evaluates against baselines, calibrates probabilities, and fits MAPIE.
"""
import os
import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    precision_recall_curve, roc_auc_score, auc, brier_score_loss,
    f1_score, precision_score, recall_score
)
from mapie.classification import SplitConformalClassifier
from ml.features import load_feature_matrix, split_dataset, FEATURE_COLUMNS

MODEL_OUT = "ml/model_v1.pkl"

def compute_metrics(y_true, y_probs, threshold=0.5):
    """Compute comprehensive classification and calibration metrics."""
    # Handle constant zero probabilities (Always-No)
    if np.all(y_probs == 0):
        return {
            "pr_auc": round(float(np.mean(y_true)), 4),
            "roc_auc": 0.5,
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "brier_score": round(float(brier_score_loss(y_true, y_probs)), 4),
            "false_alarm_rate": 0.0
        }

    precisions, recalls, thresholds = precision_recall_curve(y_true, y_probs)
    pr_auc = auc(recalls, precisions)
    roc_auc = roc_auc_score(y_true, y_probs) if len(np.unique(y_true)) > 1 else 0.5
    
    # Binary predictions at threshold
    y_pred = (y_probs >= threshold).astype(int)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    brier = brier_score_loss(y_true, y_probs)
    
    # False Alarm Rate = FP / (FP + TN)
    tn = np.sum((y_pred == 0) & (y_true == 0))
    fp = np.sum((y_pred == 1) & (y_true == 0))
    far = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    return {
        "pr_auc": round(float(pr_auc), 4),
        "roc_auc": round(float(roc_auc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "brier_score": round(float(brier), 4),
        "false_alarm_rate": round(float(far), 4)
    }

def train_and_evaluate():
    print("=== Training JalDrishti Model Pipeline ===")
    df_full = load_feature_matrix()
    df_train, df_val, df_test, df_spatial = split_dataset(df_full)

    X_train = df_train[FEATURE_COLUMNS]
    y_train = df_train["is_waterlogged"].values

    X_val = df_val[FEATURE_COLUMNS]
    y_val = df_val["is_waterlogged"].values

    X_test = df_test[FEATURE_COLUMNS]
    y_test = df_test["is_waterlogged"].values

    # ──────────────────────────────────────────────────────────
    # 1. BASELINE MODELS (on Temporal Test Set)
    # ──────────────────────────────────────────────────────────
    print("\n--- 1. Evaluating Baselines on Temporal Test Set ---")
    
    # Baseline A: Always-No (predict 0)
    y_prob_always_no = np.zeros(len(y_test))
    base_no_metrics = compute_metrics(y_test, y_prob_always_no)
    print("Always-No Baseline:     ", base_no_metrics)

    # Baseline B: Hotspot-Only (predict probability from prior historical incident count)
    hotspot_probs = np.where(df_test["past_incident_count"] > 0, 0.70, 0.10)
    base_hotspot_metrics = compute_metrics(y_test, hotspot_probs)
    print("Hotspot-Only Baseline:  ", base_hotspot_metrics)

    # Baseline C: Rainfall-Threshold Rule (rain_3h > 15mm)
    rain_rule_probs = np.clip(df_test["rainfall_3h"] / 35.0, 0.0, 1.0)
    base_rain_metrics = compute_metrics(y_test, rain_rule_probs)
    print("Rainfall-Rule Baseline: ", base_rain_metrics)

    # ──────────────────────────────────────────────────────────
    # 2. LIGHTGBM CLASSIFIER
    # ──────────────────────────────────────────────────────────
    print("\n--- 2. Training Core LightGBM Classifier ---")
    lgbm = LGBMClassifier(
        objective="binary",
        class_weight="balanced",
        n_estimators=160,
        learning_rate=0.04,
        num_leaves=31,
        max_depth=6,
        min_child_samples=10,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbosity=-1
    )
    lgbm.fit(X_train, y_train)

    # Tune threshold on Validation PR Curve for optimal F1
    val_probs = lgbm.predict_proba(X_val)[:, 1]
    precisions, recalls, thresholds = precision_recall_curve(y_val, val_probs)
    f1_scores = 2 * (precisions * recalls) / (precisions + recalls + 1e-8)
    best_idx = np.argmax(f1_scores)
    optimal_threshold = float(thresholds[best_idx]) if best_idx < len(thresholds) else 0.50
    optimal_threshold = round(float(np.clip(optimal_threshold, 0.35, 0.65)), 2)
    print(f"Optimal decision threshold tuned on validation: {optimal_threshold}")

    raw_test_probs = lgbm.predict_proba(X_test)[:, 1]
    raw_lgbm_metrics = compute_metrics(y_test, raw_test_probs, threshold=optimal_threshold)
    print("Raw LightGBM Test Metrics:", raw_lgbm_metrics)

    # ──────────────────────────────────────────────────────────
    # 3. PROBABILITY CALIBRATION (Isotonic Regression)
    # ──────────────────────────────────────────────────────────
    print("\n--- 3. Probability Calibration on Validation Block ---")
    calibrated_lgbm = CalibratedClassifierCV(estimator=lgbm, method="isotonic", cv="prefit")
    calibrated_lgbm.fit(X_val, y_val)

    cal_test_probs = calibrated_lgbm.predict_proba(X_test)[:, 1]
    cal_metrics = compute_metrics(y_test, cal_test_probs, threshold=optimal_threshold)
    print("Calibrated LightGBM Metrics:", cal_metrics)
    print(f"Brier Score Improvement: {raw_lgbm_metrics['brier_score']} -> {cal_metrics['brier_score']}")

    # ──────────────────────────────────────────────────────────
    # 4. MAPIE CONFORMAL PREDICTION (Uncertainty Quantification)
    # ──────────────────────────────────────────────────────────
    print("\n--- 4. Fitting MAPIE Split Conformal Classifier ---")
    # Conformal target coverage = 90%
    mapie = SplitConformalClassifier(estimator=calibrated_lgbm, confidence_level=0.90, prefit=True)
    mapie.conformalize(X_val, y_val)

    _, p_sets = mapie.predict_set(X_test)
    if p_sets.ndim == 3:
        p_sets = p_sets[:, :, 0]
    
    set_sizes = p_sets.sum(axis=1)
    in_set = [p_sets[i, y_test[i]] for i in range(len(y_test))]
    empirical_coverage = round(float(np.mean(in_set)), 4)
    avg_set_size = round(float(np.mean(set_sizes)), 2)
    print(f"Conformal Empirical Coverage: {empirical_coverage * 100:.1f}% (Target: 90.0%)")
    print(f"Average Conformal Set Size:   {avg_set_size}")

    # ──────────────────────────────────────────────────────────
    # 5. SPATIAL HOLDOUT EVALUATION (Generalization to Unseen Roads)
    # ──────────────────────────────────────────────────────────
    X_spatial = df_spatial[FEATURE_COLUMNS]
    y_spatial = df_spatial["is_waterlogged"].values
    spatial_probs = calibrated_lgbm.predict_proba(X_spatial)[:, 1]
    spatial_metrics = compute_metrics(y_spatial, spatial_probs, threshold=optimal_threshold)
    print("\n--- 5. Spatial Holdout Test Metrics (Unseen Roads) ---")
    print("Spatial Holdout Metrics:  ", spatial_metrics)

    # ──────────────────────────────────────────────────────────
    # 6. VERIFY PHASE 2 GATE REQUIREMENT
    # ──────────────────────────────────────────────────────────
    print("\n--- 6. Verifying Phase 2 Gate ---")
    hotspot_pr_auc = base_hotspot_metrics["pr_auc"]
    model_pr_auc = cal_metrics["pr_auc"]
    print(f"Hotspot Baseline PR-AUC: {hotspot_pr_auc}")
    print(f"LightGBM Model PR-AUC:   {model_pr_auc}")
    assert model_pr_auc > hotspot_pr_auc, (
        f"Model PR-AUC ({model_pr_auc}) must beat Hotspot Baseline PR-AUC ({hotspot_pr_auc})"
    )
    print("Phase 2 Gate: Model beats Hotspot baseline on PR-AUC: PASSED [OK]")

    # ──────────────────────────────────────────────────────────
    # 7. SAVE ARTIFACTS
    # ──────────────────────────────────────────────────────────
    artifact = {
        "lgbm_model": lgbm,
        "calibrated_model": calibrated_lgbm,
        "mapie_model": mapie,
        "feature_names": FEATURE_COLUMNS,
        "optimal_threshold": optimal_threshold,
        "baselines": {
            "always_no": base_no_metrics,
            "hotspot_only": base_hotspot_metrics,
            "rainfall_rule": base_rain_metrics
        },
        "model_metrics": {
            "raw": raw_lgbm_metrics,
            "calibrated": cal_metrics,
            "spatial_holdout": spatial_metrics,
            "conformal_coverage": empirical_coverage,
            "avg_set_size": avg_set_size
        }
    }
    joblib.dump(artifact, MODEL_OUT)
    print(f"\nSaved trained model bundle to {MODEL_OUT} ({os.path.getsize(MODEL_OUT)} bytes)")

    return artifact

if __name__ == "__main__":
    train_and_evaluate()
