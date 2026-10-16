"""Persistent Web Push subscriptions and delayed broadcast delivery."""
import json
import os
import threading
import time
from datetime import datetime, timezone

from sqlalchemy import select

from data.models import PushSubscription, ScheduledBroadcast


def _session_factory():
    from data.db import SessionLocal
    return SessionLocal


def _private_key():
    return os.getenv("VAPID_PRIVATE_KEY", "")


def public_key():
    return os.getenv("VAPID_PUBLIC_KEY", "")


def save_subscription(payload):
    endpoint = payload["endpoint"]
    db = _session_factory()()
    try:
        row = db.query(PushSubscription).filter_by(endpoint=endpoint).first()
        if row:
            row.subscription_json = payload
        else:
            db.add(PushSubscription(endpoint=endpoint, subscription_json=payload))
        db.commit()
    finally:
        db.close()


def schedule_broadcast(title, body, due_at):
    db = _session_factory()()
    try:
        row = ScheduledBroadcast(title=title, body=body, due_at=due_at, status="scheduled")
        db.add(row)
        db.commit()
        db.refresh(row)
        return {"id": row.id, "title": row.title, "body": row.body,
                "due_at": row.due_at.replace(tzinfo=timezone.utc).isoformat(), "status": row.status}
    finally:
        db.close()


def _send_due_once():
    """Claim due jobs transactionally, then send to each opted-in browser."""
    if not _private_key() or not public_key():
        return
    from pywebpush import WebPushException, webpush

    db = _session_factory()()
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        stmt = (select(ScheduledBroadcast)
                .where(ScheduledBroadcast.status == "scheduled", ScheduledBroadcast.due_at <= now)
                .order_by(ScheduledBroadcast.due_at)
                .limit(10)
                .with_for_update(skip_locked=True))
        jobs = list(db.scalars(stmt))
        for job in jobs:
            job.status = "sending"
        db.commit()
        for job in jobs:
            subs = db.query(PushSubscription).all()
            payload = json.dumps({"title": job.title, "body": job.body})
            for sub in subs:
                try:
                    webpush(
                        subscription_info=sub.subscription_json,
                        data=payload,
                        vapid_private_key=_private_key(),
                        vapid_claims={"sub": os.getenv("VAPID_SUBJECT", "mailto:admin@jaldrishti.local")},
                    )
                except WebPushException as exc:
                    response = getattr(exc, "response", None)
                    if response is not None and response.status_code in (404, 410):
                        db.delete(sub)
            job.status = "sent"
            job.sent_at = datetime.utcnow()
            db.commit()
    except Exception as exc:
        db.rollback()
        print(f"Push delivery worker error: {exc}")
    finally:
        db.close()


def start_delivery_worker():
    if getattr(start_delivery_worker, "started", False):
        return
    start_delivery_worker.started = True

    def run():
        while True:
            _send_due_once()
            time.sleep(15)

    threading.Thread(target=run, name="push-delivery-worker", daemon=True).start()
