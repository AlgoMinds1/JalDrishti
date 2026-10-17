"""Opt-in browser push and immediate admin broadcasts."""
from fastapi import APIRouter, Header, HTTPException, Query, Response
from pydantic import BaseModel, Field
from typing import Optional
from datetime import timezone
import hmac

from api.services import push_notifications

router = APIRouter(prefix="/notifications", tags=["Notifications"])
DEMO_ADMIN_PASSWORD = "123456"


def _require_admin(password: str | None):
    if not password or not hmac.compare_digest(password, DEMO_ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Admin sign-in required")


class SubscriptionPayload(BaseModel):
    endpoint: str = Field(min_length=20, max_length=4096)
    keys: dict[str, str]


class ImmediateBroadcastPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=500)
    translations: Optional[dict[str, dict[str, str]]] = None


@router.get("/subscriber-count")
def subscriber_count():
    try:
        from data.db import SessionLocal
        from data.models import PushSubscription
        db = SessionLocal()
        try:
            count = db.query(PushSubscription).count()
        finally:
            db.close()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Subscription database is unavailable") from exc
    return {"opted_in_devices": count,
            "identity_note": "This prototype tracks opted-in browser devices, not named user accounts."}


@router.get("/feed")
def get_notification_feed(limit: int = Query(20, ge=1, le=50)):
    try:
        from data.db import SessionLocal
        from data.models import AppNotification
        db = SessionLocal()
        try:
            rows = (db.query(AppNotification)
                    .order_by(AppNotification.created_at.desc(), AppNotification.id.desc())
                    .limit(limit).all())
            return [{"id": row.id, "title": row.title, "body": row.body,
                     "translations": row.translations,
                     "created_at": row.created_at.isoformat() + "Z"}
                    for row in rows]
        finally:
            db.close()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Notification feed is unavailable") from exc


@router.get("/admin/reports", summary="Private report inbox for the admin device")
def get_admin_report_feed(
    limit: int = Query(30, ge=1, le=100),
    x_admin_password: Optional[str] = Header(None),
):
    _require_admin(x_admin_password)
    try:
        from data.db import SessionLocal
        from data.models import Report, ReportMedia
        db = SessionLocal()
        try:
            rows = (db.query(Report)
                    .order_by(Report.time_server.desc(), Report.id.desc())
                    .limit(limit).all())
            media_ids = {row.report_id for row in db.query(ReportMedia.report_id).filter(
                ReportMedia.report_id.in_([item.id for item in rows])
            ).all()} if rows else set()
            return [{
                "id": row.id,
                "description": row.text_original or "",
                "language": row.language or "en",
                "created_at": (row.time_server.replace(tzinfo=timezone.utc).isoformat()
                               if row.time_server and row.time_server.tzinfo is None
                               else row.time_server.isoformat() if row.time_server else None),
                "lat": row.lat,
                "lon": row.lon,
                "trust_score": row.trust_score,
                "state": row.state,
                "has_photo": row.id in media_ids,
            } for row in rows]
        finally:
            db.close()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Admin report inbox is unavailable") from exc


@router.get("/admin/reports/{report_id}/photo", summary="Private citizen report photo for the admin")
def get_admin_report_photo(report_id: str, x_admin_password: Optional[str] = Header(None)):
    _require_admin(x_admin_password)
    try:
        from data.db import SessionLocal
        from data.models import ReportMedia
        db = SessionLocal()
        try:
            media = db.query(ReportMedia).filter(ReportMedia.report_id == report_id).first()
            if not media:
                raise HTTPException(status_code=404, detail="Photo not found")
            return Response(content=media.image_data, media_type=media.content_type,
                            headers={"Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})
        finally:
            db.close()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Report photo is unavailable") from exc


@router.get("/public-key")
def get_push_public_key():
    key = push_notifications.public_key()
    if not key:
        raise HTTPException(status_code=503, detail="Browser push is not configured")
    return {"public_key": key}


@router.post("/subscribe", status_code=201)
def subscribe(payload: SubscriptionPayload):
    if not push_notifications.public_key():
        raise HTTPException(status_code=503, detail="Browser push is not configured")
    try:
        push_notifications.save_subscription(payload.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Subscription storage is unavailable") from exc
    return {"status": "subscribed"}


@router.post("/broadcasts/send-now")
def send_broadcast_now(payload: ImmediateBroadcastPayload):
    try:
        return push_notifications.send_broadcast_now(payload.title, payload.body, payload.translations)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Immediate push delivery failed") from exc
