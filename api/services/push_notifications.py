"""Persistent Web Push subscriptions and delayed broadcast delivery."""
import json
import os
from data.models import PushSubscription


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


def send_broadcast_now(title, body):
    """Send a demo broadcast synchronously to every opted-in browser."""
    if not _private_key() or not public_key():
        raise RuntimeError("Browser push is not configured")
    from pywebpush import WebPushException, webpush

    db = _session_factory()()
    sent = failed = 0
    try:
        subscriptions = db.query(PushSubscription).all()
        for subscription in subscriptions:
            try:
                webpush(
                    subscription_info=subscription.subscription_json,
                    data=json.dumps({"title": title, "body": body}),
                    vapid_private_key=_private_key(),
                    vapid_claims={"sub": os.getenv("VAPID_SUBJECT", "mailto:admin@jaldrishti.local")},
                )
                sent += 1
            except WebPushException as exc:
                failed += 1
                response = getattr(exc, "response", None)
                if response is not None and response.status_code in (404, 410):
                    db.delete(subscription)
            except Exception:
                failed += 1
        db.commit()
        return {"status": "sent", "sent_count": sent, "failed_count": failed,
                "recipient_count": len(subscriptions)}
    finally:
        db.close()
