"""Opt-in browser push and immediate admin broadcasts."""
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.services import push_notifications

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class SubscriptionPayload(BaseModel):
    endpoint: str = Field(min_length=20, max_length=4096)
    keys: dict[str, str]


class ImmediateBroadcastPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=500)


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
    if not push_notifications.public_key() or not os.getenv("VAPID_PRIVATE_KEY"):
        raise HTTPException(status_code=503, detail="Browser push is not configured")
    try:
        return push_notifications.send_broadcast_now(payload.title, payload.body)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Immediate push delivery failed") from exc
