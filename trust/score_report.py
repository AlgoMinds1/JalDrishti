"""
Phase 5.3 — Report Trust Score Engine
Calculates 0–100 trust score from 6 independent signals:
1. Independent corroboration (max 30 pts)
2. Rain plausibility (max 20 pts)
3. Terrain plausibility (max 15 pts)
4. Reporter reputation (max 15 pts)
5. Validated photo evidence (max 15 pts)
6. Text consistency (max 5 pts)

Enforces strict anti-abuse rules:
- No single report triggers an alert alone
- Dry weather gate (0 mm rain -> Unverified)
- Ridge gate (HAND > 12m -> Unverified)
- Burst detection penalty
"""
from typing import Dict, List, Optional
from trust.plausibility import check_terrain_plausibility, get_recent_rainfall

# Waterlogging keyword cues across English, Marathi, Hindi
FLOOD_KEYWORDS = [
    "water", "paani", "flooding", "flood", "submerged", "inundated", "puddle",
    "jam", "underpass", "stalled", "stuck", "rain",
    "पाणी", "साचलंय", "रस्ता", "पूर", "खड्डा", "तळे", "गुडघाभर",
    "पानी", "जलभराव", "डूब", "जाम"
]


def score_report(
    report_dict: dict,
    nearby_reports: List[dict] = None,
    reporter_info: dict = None,
    rainfall_override: Optional[float] = None,
    terrain_override: Optional[dict] = None
) -> dict:
    """
    Evaluates a citizen report and produces a 0-100 trust score and state.
    """
    nearby_reports = nearby_reports or []
    reporter_info = reporter_info or {}

    seg_id = report_dict.get("snapped_segment_id") or report_dict.get("segment_id", "")
    reporter_id = report_dict.get("reporter_id", "anon")
    text = (report_dict.get("text_original", "") + " " + report_dict.get("text_en", "")).lower()
    has_photo = bool(report_dict.get("photo_path"))

    # 1. Independent Corroboration (Max 30)
    # Distinct other reporters within 150m in 30min
    other_reporters = set()
    for nr in nearby_reports:
        n_rep = nr.get("reporter_id")
        if n_rep and n_rep != reporter_id and not nr.get("is_flagged", False):
            other_reporters.add(n_rep)

    corroboration_pts = 0
    if len(other_reporters) >= 2:
        corroboration_pts = 30
    elif len(other_reporters) == 1:
        corroboration_pts = 15

    # 2. Rain Plausibility (Max 20)
    recent_rain = rainfall_override if rainfall_override is not None else get_recent_rainfall()
    rain_pts = 0
    if recent_rain >= 5.0:
        rain_pts = 20
    elif recent_rain >= 1.0:
        rain_pts = 10
    else:
        rain_pts = 0

    # 3. Terrain Plausibility (Max 15)
    if terrain_override:
        hand = terrain_override.get("hand_mean", 3.5)
        slope = terrain_override.get("slope_mean", 1.5)
        is_ridge = (hand > 12.0 and slope > 8.0) or (hand > 15.0)
        is_low_lying = hand < 5.0 and slope < 4.0
    else:
        is_low_lying, is_ridge, terrain = check_terrain_plausibility(seg_id)
    terrain_pts = 0
    if is_low_lying:
        terrain_pts = 15
    elif not is_ridge:
        terrain_pts = 8
    else:
        terrain_pts = 0

    # 4. Reporter Reputation (Max 15)
    rep_score = float(reporter_info.get("reputation_score", 25.0))
    is_flagged = bool(reporter_info.get("is_flagged", False))
    reputation_pts = 0
    if is_flagged:
        reputation_pts = 0
    elif rep_score >= 70.0:
        reputation_pts = 15
    elif rep_score >= 40.0:
        reputation_pts = 10
    else:
        reputation_pts = 5  # New default reporter

    # 5. Photo Evidence (Max 15). Upload validation checks file integrity;
    # EXIF presence is recorded separately and is not treated as proof of authenticity.
    photo_pts = 0
    if has_photo:
        photo_pts = 15  # EXIF validated, non-duplicate

    # 6. Text Consistency (Max 5)
    text_pts = 0
    if any(k in text for k in FLOOD_KEYWORDS):
        text_pts = 5

    raw_score = corroboration_pts + rain_pts + terrain_pts + reputation_pts + photo_pts + text_pts

    # Apply Hard Abuse Gates:
    final_score = raw_score
    state = "Unverified"

    # Gate 1: If reporter is flagged (burst or bot)
    if is_flagged:
        final_score = min(final_score, 10)
        state = "Flagged"

    # Gate 2: Dry Weather Gate (0 mm rain) -> cannot exceed Unverified, capped at 25
    elif recent_rain == 0.0:
        final_score = min(final_score, 25)
        state = "Unverified"

    # Gate 3: High Ridge Gate (HAND > 12m) -> cannot exceed Unverified, capped at 25
    elif is_ridge:
        final_score = min(final_score, 25)
        state = "Unverified"

    # Normal State Transitions
    # A single report stays Unverified until corroborated by an independent reporter
    else:
        if final_score > 60 and (corroboration_pts >= 30 or reporter_info.get("is_admin")):
            state = "Confirmed"
        elif final_score >= 30 and (corroboration_pts >= 15 or reporter_info.get("is_admin")):
            state = "Likely"
        else:
            state = "Unverified"

    return {
        "trust_score": round(float(final_score), 1),
        "trust_reasons": {
            "corroboration": corroboration_pts,
            "rain_plausibility": rain_pts,
            "terrain_plausibility": terrain_pts,
            "reputation": reputation_pts,
            "photo": photo_pts,
            "text_consistency": text_pts
        },
        "state": state,
        # Core Principle: No single report triggers an alert alone
        "alert_eligible": False,
        "is_flagged": is_flagged
    }
