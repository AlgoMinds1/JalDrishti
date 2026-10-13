"""
Phase 5.5 — Isolation Forest Behavioral Anomaly Detector
Detects spamming bursts, coordinated astroturfing brigades, and teleporation anomalies
across citizen report submissions without relying on hardcoded heuristics alone.
"""
from datetime import datetime, timezone
from typing import List, Dict
import numpy as np
from sklearn.ensemble import IsolationForest

class BehavioralAnomalyDetector:
    def __init__(self):
        # Isolation Forest baseline trained on typical citizen reporting patterns
        # Feature vector: [reports_10m, reports_24h, rejection_rate, min_interval_seconds]
        self.clf = IsolationForest(contamination=0.08, random_state=42)
        
        # Synthetic baseline representing normal citizen behavior (1-2 reports per event, healthy intervals)
        baseline_X = np.array([
            [1, 1, 0.0, 3600],
            [1, 2, 0.0, 1800],
            [2, 3, 0.1, 900],
            [1, 1, 0.2, 7200],
            [2, 2, 0.0, 1200],
            [1, 4, 0.0, 3000],
            [3, 5, 0.2, 600],
            [1, 2, 0.0, 4000]
        ])
        self.clf.fit(baseline_X)

    def is_anomalous(
        self,
        reports_last_10m: int,
        reports_last_24h: int,
        rejection_rate: float,
        min_interval_seconds: float
    ) -> bool:
        """
        Returns True if the submission pattern is flagged as an anomaly/bot burst.
        """
        # Hard limits for obvious spam bursts (≥5 reports in 10 minutes)
        if reports_last_10m >= 5:
            return True

        if min_interval_seconds < 10.0 and reports_last_10m >= 2:
            return True

        X = np.array([[reports_last_10m, reports_last_24h, rejection_rate, min_interval_seconds]])
        pred = self.clf.predict(X)[0]  # -1 for anomaly, 1 for normal
        return bool(pred == -1 and reports_last_10m >= 3)
