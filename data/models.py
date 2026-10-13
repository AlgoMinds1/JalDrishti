from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, Date, Text, JSON, ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship
from geoalchemy2 import Geometry

Base = declarative_base()

class Segment(Base):
    __tablename__ = "segments"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    road_class = Column(String(64), nullable=False, default="unclassified")
    length_m = Column(Float, nullable=False, default=0.0)
    is_underpass = Column(Boolean, default=False)
    is_bridge = Column(Boolean, default=False)
    is_tunnel = Column(Boolean, default=False)
    geometry = Column(Geometry("LINESTRING", srid=4326), nullable=False)

    feature = relationship("SegmentFeature", back_populates="segment", uselist=False)
    events = relationship("SegmentEvent", back_populates="segment")


class SegmentFeature(Base):
    __tablename__ = "segment_features"

    segment_id = Column(String(64), ForeignKey("segments.id"), primary_key=True)
    elevation_mean = Column(Float, nullable=False)
    elevation_min = Column(Float, nullable=False)
    slope_mean = Column(Float, nullable=False)
    hand_mean = Column(Float, nullable=False)  # Height Above Nearest Drainage (m)
    hand_min = Column(Float, nullable=False)
    builtup_share = Column(Float, nullable=False)  # % built-up from WorldCover
    dist_to_waterway_m = Column(Float, nullable=False)  # meters to nearest stream
    drainage_coverage_pct = Column(Float, nullable=False)  # stormwater drainage density %
    road_class = Column(String(64), nullable=False)
    is_underpass = Column(Boolean, default=False)
    is_bridge = Column(Boolean, default=False)
    is_tunnel = Column(Boolean, default=False)

    segment = relationship("Segment", back_populates="feature")


class SegmentEvent(Base):
    __tablename__ = "segment_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    segment_id = Column(String(64), ForeignKey("segments.id"), nullable=False, index=True)
    event_date = Column(Date, nullable=False, index=True)
    event_hour = Column(Integer, nullable=False)
    risk_class = Column(String(32), nullable=False)  # low / moderate / high / severe
    severity = Column(Integer, nullable=False)  # 1 to 4
    source = Column(String(128), nullable=False)
    source_grade = Column(String(16), nullable=True)  # A+, A, B+, B, None
    rainfall_1h = Column(Float, default=0.0)
    rainfall_3h = Column(Float, default=0.0)
    rainfall_6h = Column(Float, default=0.0)
    rainfall_24h = Column(Float, default=0.0)
    rainfall_72h = Column(Float, default=0.0)
    soil_moisture = Column(Float, default=0.0)

    segment = relationship("Segment", back_populates="events")


class RainfallHistory(Base):
    __tablename__ = "rainfall_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, unique=True, index=True)
    precip_mm = Column(Float, nullable=False)
    soil_moisture = Column(Float, nullable=False)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    segment_id = Column(String(64), ForeignKey("segments.id"), nullable=False, index=True)
    horizon_h = Column(Integer, nullable=False, index=True)  # 1 to 6
    risk_class = Column(String(32), nullable=False)
    probability = Column(Float, nullable=False)
    confidence_level = Column(String(32), nullable=False)  # High / Medium / Low
    confidence_score = Column(Float, nullable=False)
    conf_set_size = Column(Integer, default=1)
    top_reasons = Column(JSON, nullable=False)
    rain_data_age_min = Column(Integer, default=0)
    is_ood = Column(Boolean, default=False)
    computed_at = Column(DateTime, default=datetime.utcnow, index=True)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, index=True)
    snapped_segment_id = Column(String(64), ForeignKey("segments.id"), nullable=True, index=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    geometry = Column(Geometry("POINT", srid=4326), nullable=False)
    time_server = Column(DateTime, default=datetime.utcnow, index=True)
    text_original = Column(Text, nullable=True)
    language = Column(String(8), default="mr")
    text_en = Column(Text, nullable=True)
    photo_path = Column(String(255), nullable=True)
    reporter_id = Column(String(128), nullable=False)
    trust_score = Column(Float, default=0.0)
    trust_reasons = Column(JSON, nullable=False)
    state = Column(String(32), default="Unverified")  # Unverified / Likely / Confirmed / Flagged
