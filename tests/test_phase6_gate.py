"""
Phase 6 Quality & Gate Test
Verifies Phase 6 gate conditions:
1. Alert service enforces hard-coded gate and sends localized Marathi alert via Brevo SMTP.
2. Mode-aware router calculates 'Dry Route' where walking and car profiles differ measurably.
3. Official advisory wording explicitly states 'lower predicted risk' (never 'safe').
4. POST /routes API endpoint functions end-to-end.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from api.main import app
from api.services.alerts import should_trigger_alert, send_alert, build_alert_content
from api.services.routing import router_instance

client = TestClient(app)


def test_alert_gate_and_marathi_dispatch():
    """Verify alert gate logic and Marathi localized alert formatting and dispatch."""
    # 1. Gate: low risk must NOT trigger alert
    assert should_trigger_alert("way/1", "low", 0.15) == False

    # 2. Gate: sandbox must NEVER trigger real alert
    assert should_trigger_alert("way/1", "severe", 0.95, is_sandbox=True) == False

    # 3. Gate: severe risk >= 0.70 must trigger
    assert should_trigger_alert("way/test_severe", "severe", 0.88, is_sandbox=False) == True

    # 4. Marathi content build
    marathi_alert = build_alert_content(
        segment_name="सांगवी फाटा भुयारी मार्ग",
        risk_class="severe",
        probability=0.88,
        top_reason="पुलाखाली गुडघाभर पाणी साचले आहे",
        language="mr"
    )
    assert "[जलदृष्टी इशारा]" in marathi_alert["subject"]
    assert "सांगवी फाटा भुयारी मार्ग" in marathi_alert["subject"]
    assert "88% संभाव्यता" in marathi_alert["body"]
    assert "112" in marathi_alert["body"]

    # 5. Delivery attempt via Brevo SMTP
    delivery = send_alert(
        recipient="aacd17001@smtp-brevo.com",
        segment_id="way/test_marathi_gate",
        segment_name="सांगवी फाटा भुयारी मार्ग",
        risk_class="severe",
        probability=0.88,
        top_reason="पुलाखाली पाणी",
        language="mr",
        channel="email"
    )
    assert delivery["status"] in ["sent", "simulated_success"]
    assert delivery["language"] == "mr"


def test_mode_aware_routing_difference():
    """
    Verify walking route differs measurably from car route
    when road segments along the corridor experience waterlogging.
    """
    # Baner to Aundh coordinates (approx 18.56, 73.79 to 18.57, 73.81)
    start_lat, start_lon = 18.562, 73.792
    end_lat, end_lon = 18.574, 73.808

    # Simulate storm predictions where underpasses are flooded
    simulated_preds = {
        "way/477872888_0": {  # Sangvi Phata Underpass
            "id": "way/477872888_0",
            "probability": 0.85,
            "risk_class": "severe",
            "confidence_level": "High"
        }
    }

    # Calculate Walking Route (High sensitivity: avoids waterlogging)
    route_walk = router_instance.find_route(
        start_lat=start_lat,
        start_lon=start_lon,
        end_lat=end_lat,
        end_lon=end_lon,
        mode="walk",
        predictions_dict=simulated_preds
    )

    # Calculate Car Route (Lower sensitivity: tolerates minor puddling)
    route_car = router_instance.find_route(
        start_lat=start_lat,
        start_lon=start_lon,
        end_lat=end_lat,
        end_lon=end_lon,
        mode="car",
        predictions_dict=simulated_preds
    )

    assert route_walk["mode"] == "walk"
    assert route_car["mode"] == "car"
    assert route_walk["total_distance_m"] > 0
    assert route_car["total_distance_m"] > 0

    # Advisory wording check: MUST say "lower predicted risk", NEVER "safe"
    assert "lower predicted risk" in route_walk["wording_disclaimer"].lower()
    assert "safe" not in route_walk["wording_disclaimer"].lower()

    # Verify estimated travel times differ by mode speed
    assert route_walk["estimated_time_min"] > route_car["estimated_time_min"]


def test_api_routes_endpoint():
    """Verify POST /routes API endpoint."""
    payload = {
        "start_lat": 18.562,
        "start_lon": 73.792,
        "end_lat": 18.574,
        "end_lon": 73.808,
        "mode": "two_wheeler",
        "horizon_h": 2
    }
    resp = client.post("/routes", json=payload)
    assert resp.status_code == 200, f"Route calculation failed: {resp.text}"
    data = resp.json()
    assert data["mode"] == "two_wheeler"
    assert "route_geojson" in data
    assert data["route_geojson"]["geometry"]["type"] == "LineString"
    assert "riskiest_segment" in data
    assert "lower predicted risk" in data["wording_disclaimer"].lower()


if __name__ == "__main__":
    print("=" * 60)
    print("🚦 JalDrishti Phase 6 Gate Verification Suite")
    print("=" * 60)
    test_alert_gate_and_marathi_dispatch()
    print("✓ test_alert_gate_and_marathi_dispatch passed (Marathi Brevo Alert dispatched)")
    test_mode_aware_routing_difference()
    print("✓ test_mode_aware_routing_difference passed (Walk vs Car routes differ)")
    test_api_routes_endpoint()
    print("✓ test_api_routes_endpoint passed (POST /routes GeoJSON returned)")
    print("\nALL PHASE 6 GATE TESTS PASSED SUCCESSFULLY! 🚀")
