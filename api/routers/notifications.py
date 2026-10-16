"""Opt-in browser push and admin-scheduled broadcasts."""
import hmac
import os
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Header, HTTPException
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


def _require_admin(authorization: str | None):
    secret = os.getenv("ADMIN_API_TOKEN", "")
    if not secret:
        raise HTTPException(status_code=503, detail="Admin notification token is not configured")
    token = authorization.removeprefix("Bearer ") if authorization else ""
    if not hmac.compare_digest(token, secret):
        raise HTTPException(status_code=401, detail="Invalid admin token")


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
def create_broadcast(payload: BroadcastPayload, authorization: str | None = Header(default=None)):
    _require_admin(authorization)
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
