"""
Phase 1 Gate Verification Script
Verifies:
1. PostGIS segments table populated
2. Static terrain features extracted and stored
3. Labeled segment_events table exists with >= 50 positive segment-hours
4. Provenance documentation exists
"""
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import func
from data.db import SessionLocal
from data.models import Segment, SegmentFeature, SegmentEvent

def test_phase1_gate():
    print("=== JalDrishti Phase 1 Gate Verification ===")
    db = SessionLocal()
    try:
        # 1. Segments count
        seg_count = db.query(func.count(Segment.id)).scalar()
        print(f"[1/4] Segments table: {seg_count} segments stored in PostGIS")
        assert seg_count >= 200, f"Expected >= 200 segments, got {seg_count}"

        # 2. Segment features count
        feat_count = db.query(func.count(SegmentFeature.segment_id)).scalar()
        print(f"[2/4] Segment features: {feat_count} features stored")
        assert feat_count >= 200, f"Expected >= 200 features, got {feat_count}"

        sample_feat = db.query(SegmentFeature).first()
        assert sample_feat.elevation_mean > 0, "Invalid elevation"
        assert sample_feat.hand_mean >= 0, "Invalid HAND"
        print(f"      Sample: elev={sample_feat.elevation_mean}m, HAND={sample_feat.hand_mean}m, dist_waterway={sample_feat.dist_to_waterway_m}m")

        # 3. Segment events (Positives >= 50)
        total_events = db.query(func.count(SegmentEvent.id)).scalar()
        positive_events = db.query(func.count(SegmentEvent.id)).filter(SegmentEvent.risk_class != "low").scalar()
        print(f"[3/4] Segment events: {total_events} total, {positive_events} POSITIVE events")
        assert positive_events >= 50, f"Phase 1 Gate requires >= 50 positive segment-hours, found {positive_events}"

        # Verify source provenance
        events_without_source = db.query(func.count(SegmentEvent.id)).filter(
            (SegmentEvent.source == None) | (SegmentEvent.source == "")
        ).scalar()
        assert events_without_source == 0, f"Found {events_without_source} events without source documentation"
        print(f"      100% of events have documented source provenance.")

        # 4. Label provenance documentation file
        prov_file = Path("data/LABEL_PROVENANCE.md")
        assert prov_file.exists(), "Missing data/LABEL_PROVENANCE.md"
        print(f"[4/4] Label Provenance & Bias Statement: {prov_file} ({prov_file.stat().st_size} bytes)")

        print("=== Phase 1 Gate PASSED Successfully! ===")
    finally:
        db.close()

if __name__ == "__main__":
    test_phase1_gate()
