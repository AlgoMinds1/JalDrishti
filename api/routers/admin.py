"""
Phase 7 — Admin & What-If Sandbox Router
Exposes:
- GET /sandbox/simulate: What-If Storm Sandbox stress test with sub-500ms vectorized inference
- GET /admin/queue: Ranked inspection queue by risk * exposure * report support
- GET /admin/ledger: Civic intervention before/after effectiveness ledger
- POST /admin/ledger: Log new civic drainage intervention
- GET /admin/audit: Immutable admin activity audit log
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from api.services.sandbox import sandbox_instance
from api.services.ledger import ledger_instance
from api.services.queue import queue_service

# We provide two router objects: one for /admin and one for /sandbox to keep URLs clean and direct
admin_router = APIRouter(prefix="/admin", tags=["Admin Operations"])
sandbox_router = APIRouter(prefix="/sandbox", tags=["What-If Sandbox"])


# -------------------------------------------------------------
# What-If Storm Sandbox Endpoints
# -------------------------------------------------------------
@sandbox_router.get("/simulate", summary="Run hypothetical What-If storm simulation")
def simulate_storm(
    mm: float = Query(60.0, ge=1.0, le=200.0, description="Hypothetical total rainfall in mm"),
    duration_h: int = Query(2, ge=1, le=6, description="Storm duration in hours (1-6)")
):
    """
    Evaluates pilot road segments under hypothetical storm scenarios (10 to 150 mm).
    Sub-500ms response time with prominent SIMULATION watermark.
    Hard-isolated: CANNOT dispatch real alerts.
    """
    try:
        # Strict hard isolation assertion verification
        assert not hasattr(sandbox_instance, "alert_sender"), "Sandbox alert sender access violation"
        return sandbox_instance.simulate(mm=mm, duration_h=duration_h)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Simulation error: {exc}")


# -------------------------------------------------------------
# Admin Ranked Inspection Queue Endpoints
# -------------------------------------------------------------
@admin_router.get("/queue", summary="Ranked road segment inspection queue")
def get_inspection_queue(
    mm: Optional[float] = Query(None, description="Optional What-If rainfall in mm (e.g. 60.0) to reorder queue dynamically"),
    duration_h: int = Query(2, ge=1, le=6, description="Storm duration in hours"),
    top_n: int = Query(10, ge=1, le=50, description="Number of top prioritized segments to return")
):
    """
    Ranks pilot road segments by Priority Score = Risk Weight * Exposure Score * Report Support.
    Directly answers: 'Which 10 segments need inspection first at 60 mm?' in seconds.
    """
    try:
        return queue_service.get_ranked_queue(mm=mm, duration_h=duration_h, top_n=top_n)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inspection queue error: {exc}")


# -------------------------------------------------------------
# Intervention Effectiveness Ledger Endpoints
# -------------------------------------------------------------
class InterventionPayload(BaseModel):
    name: str = Field(..., description="Name of intervention, e.g. 'Baner Road Culvert Widening'")
    segment_id: str = Field(..., description="Target OSM road segment ID")
    segment_name: str = Field(..., description="Descriptive road or intersection name")
    type: str = Field("desilting", description="Intervention category: desilting, pump_installation, culvert_widening, inlet_clearing")
    completion_date: str = Field(..., description="Date of completion in YYYY-MM-DD format")
    description: str = Field(..., description="Scope of works performed")
    cost_inr: int = Field(500000, description="Estimated civic expenditure in INR")
    agency: str = Field("PMC Stormwater Drainage Department", description="Executing government division")


@admin_router.get("/ledger", summary="Get intervention effectiveness ledger with before/after analysis")
def get_intervention_ledger(
    intervention_id: Optional[str] = Query(None, description="Filter for specific intervention ID")
):
    """
    Returns recorded civic interventions with comparative waterlogging frequency (+/-20% rain window)
    before vs after completion, showing reduction percentage and observational disclaimers.
    """
    try:
        return ledger_instance.analyze_effectiveness(intervention_id=intervention_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ledger analysis error: {exc}")


@admin_router.post("/ledger", summary="Log a new civic drainage intervention")
def log_intervention(payload: InterventionPayload):
    """
    Records a completed civic repair (pumps, desilting, culverts) into the permanent audit ledger.
    """
    try:
        record = ledger_instance.log_intervention(payload.dict())
        queue_service.log_action(
            action="LOG_INTERVENTION",
            details=f"Logged intervention {record['intervention_id']}: {record['name']} on {record['segment_name']}"
        )
        return {"status": "success", "recorded_intervention": record}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to record intervention: {exc}")


# -------------------------------------------------------------
# Admin Audit Trail Endpoint
# -------------------------------------------------------------
@admin_router.get("/audit", summary="Get administrative audit trail")
def get_audit_trail():
    """
    Returns logged administrative actions with timestamps and admin IDs.
    """
    try:
        return queue_service.get_audit_logs()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Audit trail error: {exc}")
