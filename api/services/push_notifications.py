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


def send_broadcast_now(title, body, translations=None):
    """Send a demo broadcast synchronously to every opted-in browser."""
    db = _session_factory()()
    sent = failed = 0
    push_configured = bool(_private_key() and public_key())
    push_error = None
    try:
        clean_translations = {
            lang: {key: value.strip() for key, value in content.items() if key in ("title", "body") and isinstance(value, str) and value.strip()}
            for lang, content in (translations or {}).items() if lang in ("en", "hi", "mr") and isinstance(content, dict)
        }
        notice = AppNotification(title=title, body=body, translations=clean_translations or None)
        db.add(notice)
        db.commit()
        db.refresh(notice)
        try:
            subscriptions = db.query(PushSubscription).all()
        except Exception:
            # The in-app notice is already committed. A push-table issue must
            # not turn a successfully saved notice into an apparent send failure.
            db.rollback()
            subscriptions = []
            push_configured = False
            push_error = "Push subscription storage is unavailable."
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
                            data=json.dumps({"id": notice.id, "title": title, "body": body,
                                             "translations": clean_translations}),
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
                "recipient_count": len(subscriptions), "push_configured": push_configured,
                "inbox_saved": True, "push_error": push_error}
    finally:
        db.close()
