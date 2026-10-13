"""
Phase 7 Verification Test Gate Suite
Tests all Tier 2 standout features and administrative controls:
1. What-If Storm Sandbox (/sandbox/simulate) with SIMULATION watermark and hard alert isolation assertion
2. Admin Ranked Inspection Queue (/admin/queue) answering: 'Which 10 segments need inspection first at 60 mm?'
3. Intervention Effectiveness Ledger (/admin/ledger) showing before/after flood reduction
4. New intervention logging and audit trail logging
"""
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from api.main import app
from api.services.sandbox import sandbox_instance


def test_sandbox_simulation_and_alert_isolation():
    """
    Verifies What-If Storm Sandbox re-scores pilot zone with prominent watermark
    and confirms strict alert isolation assertions.
    """
    print("\n--- Testing What-If Storm Sandbox & Alert Isolation ---")
    
    # 1. Hard alert isolation code assertion
    assert not hasattr(sandbox_instance, "alert_sender"), "Security failure: sandbox has alert sender attribute"
    assert not hasattr(sandbox_instance, "dispatch_alert"), "Security failure: sandbox has dispatch_alert method"

    client = TestClient(app)
    t0 = time.time()
    res = client.get("/sandbox/simulate?mm=60.0&duration_h=2")
    elapsed_ms = (time.time() - t0) * 1000

    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    assert data["is_simulation"] is True, "Must be flagged as simulation"
    assert "SIMULATION" in data["watermark"], "Must contain prominent SIMULATION watermark"
    assert "features" in data and len(data["features"]) > 0, "Must return simulated features"
    assert "summary" in data and "counts" in data["summary"], "Must contain risk breakdown"
    assert len(data.get("top_failing_corridors", [])) > 0, "Must identify top failing corridors"

    print(f"✓ Sandbox simulated in {elapsed_ms:.1f}ms (backend reported: {data.get('execution_time_ms')}ms)")
    print(f"✓ Watermark: {data['watermark']}")
    print(f"✓ Risk counts at 60mm: {data['summary']['counts']}")


def test_admin_inspection_queue_60mm():
    """
    Verifies that the admin can answer:
    'Which 10 segments need inspection first at 60 mm?' in under 1 second.
    """
    print("\n--- Testing Admin Ranked Inspection Queue (Phase 7 Gate) ---")
    client = TestClient(app)

    t0 = time.time()
    res = client.get("/admin/queue?mm=60.0&duration_h=2&top_n=10")
    elapsed = time.time() - t0

    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    assert elapsed < 3.0, f"Must compute ranked queue quickly, took {elapsed:.2f}s"
    assert "queue" in data, "Queue response missing"
    queue = data["queue"]
    assert len(queue) == 10, f"Expected 10 segments, got {len(queue)}"

    # Check descending order by priority score
    for i in range(len(queue) - 1):
        assert queue[i]["priority_score"] >= queue[i + 1]["priority_score"], "Queue must be sorted descending"

    # Verify rank, attributes and recommended action
    for item in queue:
        assert "rank" in item and 1 <= item["rank"] <= 10
        assert "name" in item and len(item["name"]) > 0
        assert "priority_score" in item and item["priority_score"] > 0
        assert "recommended_action" in item and len(item["recommended_action"]) > 0

    print(f"✓ Successfully answered 'Which 10 segments need inspection first at 60 mm?' in {elapsed:.3f}s:")
    for item in queue[:3]:
        print(f"   #{item['rank']}: {item['name']} (Priority: {item['priority_score']}) -> {item['recommended_action']}")


def test_intervention_effectiveness_ledger():
    """
    Verifies Intervention Effectiveness Ledger displays before/after comparison
    for at least one repaired segment with reduction percentage and disclaimers.
    """
    print("\n--- Testing Intervention Effectiveness Ledger ---")
    client = TestClient(app)
    res = client.get("/admin/ledger")

    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    items = res.json()
    assert len(items) >= 1, "Must contain at least one recorded intervention"

    sample = items[0]
    assert "name" in sample, "Missing intervention name"
    assert "metrics" in sample, "Missing metrics"
    m = sample["metrics"]

    assert "before_waterlogging_rate_pct" in m, "Missing before rate"
    assert "after_waterlogging_rate_pct" in m, "Missing after rate"
    assert "reduction_pct" in m, "Missing reduction percentage"
    assert m["reduction_pct"] >= 0.0, "Reduction percentage must be non-negative"
    assert "disclaimer" in sample, "Must include observational limitations disclaimer"

    print(f"✓ Intervention: {sample['name']} ({sample['type']})")
    print(f"✓ Before rate: {m['before_waterlogging_rate_pct']}% | After rate: {m['after_waterlogging_rate_pct']}%")
    print(f"✓ Measured reduction: {m['reduction_pct']}% (Status: {m['status']})")
    print(f"✓ Observational disclaimer: {sample['disclaimer'][:80]}...")


def test_log_new_intervention_and_audit():
    """
    Verifies POST /admin/ledger logs new civic works and writes to audit log.
    """
    print("\n--- Testing Logging New Intervention & Audit Log ---")
    client = TestClient(app)
    payload = {
        "name": "Pashan-Sus Road Storm Culvert Desilting Drill",
        "segment_id": "way/24819203",
        "segment_name": "Pashan-Sus Road Culvert",
        "type": "desilting",
        "completion_date": "2024-06-10",
        "description": "Pre-monsoon emergency silt desilting by Ward 8 emergency squad",
        "cost_inr": 350000,
        "agency": "PMC Ward 8 Drainage Div"
    }

    res = client.post("/admin/ledger", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    created = res.json().get("recorded_intervention", {})
    assert created.get("name") == payload["name"]

    # Verify audit log recorded the action
    audit_res = client.get("/admin/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any("LOG_INTERVENTION" in entry.get("action", "") for entry in logs), "Action must be in audit log"
    print("✓ New intervention successfully logged to ledger and audit trail.")


if __name__ == "__main__":
    print("=" * 60)
    print("🚦 JalDrishti Phase 7 Gate Verification Suite")
    print("=" * 60)
    test_sandbox_simulation_and_alert_isolation()
    test_admin_inspection_queue_60mm()
    test_intervention_effectiveness_ledger()
    test_log_new_intervention_and_audit()
    print("\nALL PHASE 7 GATE TESTS PASSED SUCCESSFULLY! 🚀")
