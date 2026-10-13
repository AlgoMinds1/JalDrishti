"""
Phase 6.1 — Multi-Channel Alert Delivery Service
Implements the hard-coded alert gate, Brevo SMTP email dispatch,
multilingual templating (Marathi, Hindi, English), and anti-flicker hysteresis.
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from data.models import Alert as AlertModel

load_dotenv()

BREVO_HOST = os.getenv("BREVO_SMTP_HOST", "smtp-relay.brevo.com")
BREVO_PORT = int(os.getenv("BREVO_SMTP_PORT", 587))
BREVO_LOGIN = os.getenv("BREVO_SMTP_LOGIN", "")
BREVO_KEY = os.getenv("BREVO_SMTP_KEY", "")
BREVO_SENDER = os.getenv("BREVO_SMTP_LOGIN", "alerts@jaldrishti.org")

# Anti-flicker hysteresis memory cache
_sent_alerts_cache = {}


def should_trigger_alert(
    segment_id: str,
    risk_class: str,
    probability: float,
    corroboration_count: int = 0,
    is_sandbox: bool = False
) -> bool:
    """
    Hard-Coded Alert Gate:
    trigger_alert() if:
      risk_class IN ('high', 'severe')
      AND (
        model_probability > 0.70
        OR (>=2 independent trusted reports AND model_probability > 0.40)
      )
      AND NOT is_sandbox
    """
    if is_sandbox:
        return False

    if risk_class not in ("high", "severe"):
        return False

    # Hysteresis: prevent re-alerting the exact same segment within 60 minutes
    now = datetime.now(timezone.utc)
    if segment_id in _sent_alerts_cache:
        last_sent = _sent_alerts_cache[segment_id]
        if (now - last_sent).total_seconds() < 3600:
            return False

    if probability >= 0.70:
        return True

    if corroboration_count >= 2 and probability >= 0.40:
        return True

    return False


def build_alert_content(
    segment_name: str,
    risk_class: str,
    probability: float,
    top_reason: str,
    language: str = "mr"
) -> Dict[str, str]:
    """Generates localized alert templates in Marathi, Hindi, or English."""
    prob_pct = int(probability * 100)

    if language == "mr":
        subject = f"[जलदृष्टी इशारा] {segment_name} येथे संभाव्य जलभराव ({prob_pct}%)"
        body = f"""
नमस्कार,

पुणे शहराच्या पूर पूर्वसूचना प्रणालीनुसार जलभराव इशारा:
• रस्ता / ठिकाण: {segment_name}
• जोखीम श्रेणी: {risk_class.upper()} ({prob_pct}% संभाव्यता)
• मुख्य कारण: {top_reason}
• वाहतूक सल्ला: शक्य असल्यास हा मार्ग टाळा. पर्यायी मार्गाचा वापर करा.

⚠️ टीप: ही पूर्वसूचना प्रणाली निर्णय-साहाय्यासाठी आहे. आणीबाणीच्या प्रसंगी PMC आपत्ती निवारण / 112 वर संपर्क साधा.
        """.strip()

    elif language == "hi":
        subject = f"[जलदृष्टि चेतावनी] {segment_name} पर संभावित जलभराव ({prob_pct}%)"
        body = f"""
नमस्ते,

पुणे शहर प्रारंभिक जलभराव चेतावनी प्रणाली:
• सड़क / स्थान: {segment_name}
• जोखिम श्रेणी: {risk_class.upper()} ({prob_pct}% संभावना)
• प्रमुख कारण: {top_reason}
• यातायात सलाह: कृपया इस मार्ग से बचें। वैकल्पिक सुरक्षित मार्ग चुनें।

⚠️ अस्वीकरण: यह निर्णय-समर्थन प्रोटोटाइप है। आपातकालीन स्थिति में 112 पर संपर्क करें।
        """.strip()

    else:
        subject = f"[JalDrishti Warning] High Waterlogging Risk on {segment_name} ({prob_pct}%)"
        body = f"""
Greetings,

Pune Urban Waterlogging Early Warning Bulletin:
• Location: {segment_name}
• Risk Level: {risk_class.upper()} ({prob_pct}% Probability)
• Key Factor: {top_reason}
• Travel Advisory: Avoid this segment if possible. Exercise extreme caution.

⚠️ Note: Decision-support prototype. For municipal emergencies, dial PMC / 112.
        """.strip()

    return {"subject": subject, "body": body}


def send_alert(
    recipient: str,
    segment_id: str,
    segment_name: str,
    risk_class: str,
    probability: float,
    top_reason: str,
    language: str = "mr",
    channel: str = "email",
    db: Optional[Session] = None
) -> dict:
    """
    Delivers early-warning alert via Brevo SMTP and logs to database.
    """
    content = build_alert_content(segment_name, risk_class, probability, top_reason, language)
    now = datetime.now(timezone.utc)

    delivery_status = "simulated_success"

    # Send real Brevo SMTP email if credentials are present
    if channel == "email" and BREVO_KEY and BREVO_LOGIN:
        try:
            msg = MIMEMultipart()
            msg["From"] = f"JalDrishti Alerts <{BREVO_SENDER}>"
            msg["To"] = recipient
            msg["Subject"] = content["subject"]
            msg.attach(MIMEText(content["body"], "plain", "utf-8"))

            server = smtplib.SMTP(BREVO_HOST, BREVO_PORT, timeout=12)
            server.starttls()
            server.login(BREVO_LOGIN, BREVO_KEY)
            server.sendmail(BREVO_SENDER, [recipient], msg.as_string())
            server.quit()
            delivery_status = "sent"
        except Exception as exc:
            delivery_status = f"smtp_failed_{str(exc)[:50]}"

    # Update hysteresis memory
    _sent_alerts_cache[segment_id] = now

    # Record in database if session available
    if db:
        try:
            db_alert = AlertModel(
                segment_id=segment_id,
                triggered_at=now,
                trigger_reason=f"{risk_class.upper()} ({int(probability*100)}%): {top_reason}",
                channel=channel,
                recipient_hash=str(hash(recipient)),
                language=language
            )
            db.add(db_alert)
            db.commit()
        except Exception:
            pass

    return {
        "status": delivery_status,
        "segment_id": segment_id,
        "recipient": recipient,
        "language": language,
        "subject": content["subject"],
        "triggered_at": now.isoformat()
    }
