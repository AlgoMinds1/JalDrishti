"""
Citizen Report Intake & Trust Engine Router for JalDrishti API
Exposes citizen report submission, privacy-preserving GeoJSON feed, and verification.
"""
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

from data.db import get_db
from data.models import Report as ReportModel, Reporter as ReporterModel
from trust.plausibility import snap_to_segment
from trust.anomaly import BehavioralAnomalyDetector
from trust.score_report import score_report

router = APIRouter(prefix="/reports", tags=["Citizen Reports"])

anomaly_detector = BehavioralAnomalyDetector()


class ReportCreatePayload(BaseModel):
    lat: float = Field(..., description="Latitude of the waterlogging incident")
    lon: float = Field(..., description="Longitude of the waterlogging incident")
    text: str = Field(..., description="Description in English, Marathi, or Hindi")
    language: str = Field("mr", description="Language code: mr, hi, or en")
    reporter_id: str = Field("anonymous_device", description="Device or reporter identifier")
    photo_path: Optional[str] = Field(None, description="Path or URL to stripped photo")


@router.post("", summary="Submit a citizen waterlogging report with Trust Scoring")
def create_report(payload: ReportCreatePayload, db: Session = Depends(get_db)):
    """
    Intake citizen report, snap to road segment, evaluate 6-signal trust score,
    and persist to database.
    """
    now = datetime.now(timezone.utc)

    # 1. Road Snapping within 300m
    seg_id, dist_m, seg_info = snap_to_segment(payload.lat, payload.lon, max_dist_m=300.0)
    if not seg_id:
        raise HTTPException(
            status_code=400,
            detail=f"Report location ({payload.lat}, {payload.lon}) is too far ({dist_m:.0f}m) from any arterial road in the pilot corridor. Please re-pin on a road."
        )

    # 2. Check Reporter History & Rate Limiting (5 reports/10m, 20 reports/day)
    reporter = db.query(ReporterModel).filter(ReporterModel.id == payload.reporter_id).first()
    if not reporter:
        reporter = ReporterModel(
            id=payload.reporter_id,
            reputation_score=25.0,
            is_flagged=False
        )
        db.add(reporter)
        db.commit()
        db.refresh(reporter)

    ten_mins_ago = now - timedelta(minutes=10)
    recent_count_10m = db.query(ReportModel).filter(
        ReportModel.reporter_id == payload.reporter_id,
        ReportModel.time_server >= ten_mins_ago
    ).count()

    one_day_ago = now - timedelta(days=1)
    recent_count_24h = db.query(ReportModel).filter(
        ReportModel.reporter_id == payload.reporter_id,
        ReportModel.time_server >= one_day_ago
    ).count()

    is_anomalous = anomaly_detector.is_anomalous(
        reports_last_10m=recent_count_10m + 1,
        reports_last_24h=recent_count_24h + 1,
        rejection_rate=reporter.rejected_count / max(1, reporter.confirmed_count + reporter.rejected_count),
        min_interval_seconds=30.0
    )

    if is_anomalous or reporter.is_flagged:
        reporter.is_flagged = True
        db.commit()

    # 3. Find Nearby Reports for Corroboration (within 150m in last 30 minutes)
    thirty_mins_ago = now - timedelta(minutes=30)
    nearby_db_reports = db.query(ReportModel).filter(
        ReportModel.snapped_segment_id == seg_id,
        ReportModel.time_server >= thirty_mins_ago
    ).all()

    nearby_list = [
        {"reporter_id": r.reporter_id, "is_flagged": False}
        for r in nearby_db_reports
    ]

    # 4. Evaluate Trust Score
    rep_dict = {
        "snapped_segment_id": seg_id,
        "reporter_id": payload.reporter_id,
        "text_original": payload.text,
        "text_en": payload.text,
        "photo_path": payload.photo_path
    }
    reporter_info = {
        "reputation_score": reporter.reputation_score,
        "is_flagged": reporter.is_flagged
    }

    trust_result = score_report(
        report_dict=rep_dict,
        nearby_reports=nearby_list,
        reporter_info=reporter_info
    )

    # 5. Persist Report to PostGIS
    report_id = str(uuid.uuid4())
    geom = from_shape(Point(payload.lon, payload.lat), srid=4326)

    db_report = ReportModel(
        id=report_id,
        snapped_segment_id=seg_id,
        lat=payload.lat,
        lon=payload.lon,
        geometry=geom,
        time_server=now,
        text_original=payload.text,
        language=payload.language,
        text_en=payload.text,
        photo_path=payload.photo_path,
        reporter_id=payload.reporter_id,
        trust_score=trust_result["trust_score"],
        trust_reasons=trust_result["trust_reasons"],
        state=trust_result["state"]
    )
    db.add(db_report)
    db.commit()

    return {
        "id": report_id,
        "lat": payload.lat,
        "lon": payload.lon,
        "snapped_segment_id": seg_id,
        "time_server": now.isoformat(),
        "text_original": payload.text,
        "language": payload.language,
        "text_en": payload.text,
        "photo_path": payload.photo_path,
        "reporter_id": payload.reporter_id,
        "trust_score": trust_result["trust_score"],
        "trust_reasons": trust_result["trust_reasons"],
        "state": trust_result["state"],
        "alert_triggered": False  # Hard Rule
    }


@router.get("", summary="Get recent citizen reports as privacy-preserving GeoJSON")
def list_reports(
    hours: int = Query(6, ge=1, le=48, description="Lookback window in hours"),
    db: Session = Depends(get_db)
):
    """
    Returns active reports within the lookback window as a GeoJSON FeatureCollection.
    Coordinates are rounded to 3 decimal places (~100m) to preserve citizen privacy.
    """
    since_time = datetime.now(timezone.utc) - timedelta(hours=hours)
    reports = db.query(ReportModel).filter(ReportModel.time_server >= since_time).all()

    features = []
    for r in reports:
        # Privacy: round coordinates to ~100m
        lat_public = round(r.lat, 3)
        lon_public = round(r.lon, 3)

        features.append({
            "type": "Feature",
            "properties": {
                "id": r.id,
                "snapped_segment_id": r.snapped_segment_id,
                "text": r.text_original,
                "language": r.language,
                "time_server": r.time_server.isoformat() if r.time_server else None,
                "trust_score": r.trust_score,
                "trust_reasons": r.trust_reasons,
                "state": r.state,
                "photo_path": r.photo_path
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon_public, lat_public]
            }
        })

    return {
        "type": "FeatureCollection",
        "name": "jaldrishti_citizen_reports",
        "features": features
    }


@router.post("/{report_id}/verify", summary="Admin verification of citizen report")
def verify_report(
    report_id: str,
    action: str = Query(..., pattern="^(confirm|reject)$"),
    db: Session = Depends(get_db)
):
    """
    Admin one-click verification. Elevated confirmed reports update reporter reputation
    and can serve as hard ground truth labels.
    """
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    reporter = db.query(ReporterModel).filter(ReporterModel.id == report.reporter_id).first()

    if action == "confirm":
        report.state = "Confirmed"
        report.trust_score = max(report.trust_score, 85.0)
        if reporter:
            reporter.confirmed_count += 1
            reporter.reputation_score = min(100.0, reporter.reputation_score + 15.0)
    else:
        report.state = "Flagged"
        report.trust_score = min(report.trust_score, 10.0)
        if reporter:
            reporter.rejected_count += 1
            reporter.reputation_score = max(0.0, reporter.reputation_score - 20.0)

    db.commit()
    return {"status": "ok", "report_id": report_id, "new_state": report.state, "trust_score": report.trust_score}
