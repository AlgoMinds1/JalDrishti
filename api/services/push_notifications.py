"""Persistent Web Push subscriptions and in-app notification delivery."""
import json
import os
from data.models import AppNotification, PushSubscription


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
    db = _session_factory()()
    sent = failed = 0
    push_configured = bool(_private_key() and public_key())
    try:
        notice = AppNotification(title=title, body=body)
        db.add(notice)
        db.commit()
        db.refresh(notice)
        subscriptions = db.query(PushSubscription).all()
        if push_configured and subscriptions:
            try:
                from pywebpush import WebPushException, webpush
            except ImportError:
                push_configured = False
                failed = len(subscriptions)
            else:
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
        return {"status": "sent", "notification_id": notice.id,
                "sent_count": sent, "failed_count": failed,
                "recipient_count": len(subscriptions), "push_configured": push_configured}
    finally:
        db.close()
