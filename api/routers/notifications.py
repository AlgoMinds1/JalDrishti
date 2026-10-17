"""Opt-in browser push and admin-scheduled broadcasts."""
import os
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from api.services import push_notifications

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class SubscriptionPayload(BaseModel):
    endpoint: str = Field(min_length=20, max_length=4096)
    keys: dict[str, str]


class BroadcastPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=500)
    due_at: datetime

    @field_validator("due_at")
    @classmethod
    def require_timezone(cls, value):
        if value.tzinfo is None:
            raise ValueError("due_at must include a timezone")
        if value <= datetime.now(timezone.utc):
            raise ValueError("due_at must be in the future")
        return value


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
    return {"authenticated": True, "opted_in_devices": count,
            "identity_note": "This prototype tracks opted-in browser devices, not named user accounts."}


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


@router.post("/broadcasts", status_code=201)
def create_broadcast(payload: BroadcastPayload):
    if not push_notifications.public_key() or not os.getenv("VAPID_PRIVATE_KEY"):
        raise HTTPException(status_code=503, detail="Browser push is not configured")
    try:
        result = push_notifications.schedule_broadcast(
            payload.title,
            payload.body,
            payload.due_at.astimezone(timezone.utc).replace(tzinfo=None),
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Broadcast storage is unavailable") from exc
