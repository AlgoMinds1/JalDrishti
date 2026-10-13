"""
Phase 5.7 — Trust Engine Attack & Abuse Defense Test Suite
Proves that fake reports, bot bursts, ridge claims, and dry-weather spam
CANNOT trigger alerts and CANNOT reach 'Confirmed' state without independent verification.
"""
import sys
from pathlib import Path

# Ensure root workspace is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from api.main import app
from trust.score_report import score_report
from trust.anomaly import BehavioralAnomalyDetector

client = TestClient(app)


def test_hard_alert_isolation_rule():
    """Verify that NO SINGLE REPORT EVER TRIGGERS AN ALERT ALONE."""
    rep = {
        "snapped_segment_id": "way/477872889_0",
        "reporter_id": "cred_user_99",
        "text_original": "Severe 2 meter waterlogging",
        "text_en": "Severe waterlogging",
        "photo_path": "/fake/photo.jpg"
    }
    result = score_report(
        report_dict=rep,
        nearby_reports=[],
        reporter_info={"reputation_score": 90.0, "is_flagged": False},
        rainfall_override=25.0
    )
    assert result["alert_eligible"] == False, "A single report must NEVER trigger an alert alone!"


def test_dry_weather_rejection():
    """Verify reports during 0 mm rainfall are capped at Unverified."""
    rep = {
        "snapped_segment_id": "way/477872889_0",
        "reporter_id": "malicious_dry_spammer",
        "text_original": "Road is completely flooded",
        "text_en": "Road is completely flooded",
        "photo_path": None
    }
    result = score_report(
        report_dict=rep,
        nearby_reports=[],
        reporter_info={"reputation_score": 50.0},
        rainfall_override=0.0  # ZERO RAIN
    )
    assert result["state"] == "Unverified", f"Dry weather report should stay Unverified, got {result['state']}"
    assert result["trust_score"] <= 25, f"Dry weather report trust must be capped at 25, got {result['trust_score']}"


def test_ridge_terrain_rejection():
    """Verify flood reports on high ridges (HAND > 12m) are capped at Unverified."""
    # Mock high ridge segment with HAND 16.5m
    rep = {
        "snapped_segment_id": "way/ridge_top_segment",
        "reporter_id": "fake_ridge_reporter",
        "text_original": "Water accumulated on mountain top",
        "text_en": "Water accumulated on mountain top",
        "photo_path": None
    }
    result = score_report(
        report_dict=rep,
        nearby_reports=[],
        reporter_info={"reputation_score": 50.0},
        rainfall_override=30.0,  # Heavy rain, but physically impossible ridge accumulation
        terrain_override={"hand_mean": 18.0, "slope_mean": 12.0}
    )
    # Segments without low HAND cap score
    assert result["state"] == "Unverified"
    assert result["trust_score"] <= 50


def test_burst_spam_anomaly_flagging():
    """Verify isolation forest / burst detector catches spammers submitting ≥5 reports rapidly."""
    detector = BehavioralAnomalyDetector()
    is_anomaly = detector.is_anomalous(
        reports_last_10m=6,
        reports_last_24h=12,
        rejection_rate=0.5,
        min_interval_seconds=4.0
    )
    assert is_anomaly == True, "Burst spammer must be flagged as anomalous"

    # Evaluated report from flagged spammer
    rep = {
        "snapped_segment_id": "way/477872889_0",
        "reporter_id": "bot_spammer",
        "text_original": "Flooded flooded flooded",
        "text_en": "Flooded flooded flooded"
    }
    result = score_report(
        report_dict=rep,
        reporter_info={"is_flagged": True, "reputation_score": 0.0},
        rainfall_override=20.0
    )
    assert result["state"] == "Flagged"
    assert result["trust_score"] <= 10


def test_corroboration_progression():
    """
    Verify progression:
    1. Single legitimate report -> Unverified
    2. Second independent reporter nearby -> Likely
    """
    rep1 = {
        "snapped_segment_id": "way/477872889_0",
        "reporter_id": "citizen_a",
        "text_original": "Pashan circle waterlogging knee deep",
        "text_en": "Pashan circle waterlogging knee deep",
        "photo_path": "/uploads/valid.jpg"
    }
    res1 = score_report(
        report_dict=rep1,
        nearby_reports=[],
        reporter_info={"reputation_score": 35.0},
        rainfall_override=15.0
    )
    # Single report without corroboration stays Unverified
    assert res1["state"] == "Unverified"
    assert res1["trust_reasons"]["corroboration"] == 0

    # Second independent report arrives at same segment from distinct reporter
    nearby_reports = [{"reporter_id": "citizen_a", "is_flagged": False}]
    rep2 = {
        "snapped_segment_id": "way/477872889_0",
        "reporter_id": "citizen_b",
        "text_original": "Traffic jammed due to water at Pashan circle",
        "text_en": "Traffic jammed due to water at Pashan circle",
        "photo_path": None
    }
    res2 = score_report(
        report_dict=rep2,
        nearby_reports=nearby_reports,
        reporter_info={"reputation_score": 35.0},
        rainfall_override=15.0
    )
    # Corroborated by independent reporter -> elevates to Likely!
    assert res2["trust_reasons"]["corroboration"] == 15
    assert res2["state"] == "Likely", f"Corroborated report should elevate to Likely, got {res2['state']}"


def test_api_report_intake():
    """Verify live API endpoint POST /reports and GET /reports."""
    # Test valid submission within pilot area
    payload = {
        "lat": 18.574,
        "lon": 73.806,
        "text": "Mahatma Jyotiba Phule Flyover underpass flooded",
        "language": "en",
        "reporter_id": "integration_test_user"
    }
    resp = client.post("/reports", json=payload)
    assert resp.status_code == 200, f"Report submission failed: {resp.text}"
    data = resp.json()
    assert "id" in data
    assert data["snapped_segment_id"] is not None
    assert "trust_score" in data
    assert "trust_reasons" in data
    assert data["alert_triggered"] == False

    # Test GET /reports returns GeoJSON
    resp_get = client.get("/reports?hours=24")
    assert resp_get.status_code == 200
    feed = resp_get.json()
    assert feed["type"] == "FeatureCollection"
    assert len(feed["features"]) > 0


if __name__ == "__main__":
    print("=" * 60)
    print("🛡️ JalDrishti Trust Engine Attack Defense Test")
    print("=" * 60)
    test_hard_alert_isolation_rule()
    print("✓ Hard Alert Isolation Rule passed (No single report triggers alert)")
    test_dry_weather_rejection()
    print("✓ Dry Weather Rejection passed (0 mm rain capped at Unverified)")
    test_ridge_terrain_rejection()
    print("✓ Ridge Terrain Rejection passed (High elevation claims rejected)")
    test_burst_spam_anomaly_flagging()
    print("✓ Burst Spam Anomaly Flagging passed (Bots flagged with score ≤ 10)")
    test_corroboration_progression()
    print("✓ Corroboration Progression passed (Single -> Unverified, Dual -> Likely)")
    test_api_report_intake()
    print("✓ Live API Report Intake passed (Snap + Score + GeoJSON feed)")
    print("\nALL ATTACK DEFENSE & PHASE 5 TESTS PASSED SUCCESSFULLY! 🚀")
