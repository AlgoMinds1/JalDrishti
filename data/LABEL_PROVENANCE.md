# 📜 JalDrishti — Label Provenance & Bias Statement

> **Document Version:** 1.0 — Phase 1 Milestone  
> **Target Audience:** Hackathon Evaluation Jury & Civic Data Auditors  

---

## 1. Label Provenance & Data Sources

JalDrishti combines multiple official and journalistic waterlogging records covering the Pune metropolitan corridor, joined with high-resolution ERA5 atmospheric reanalysis:

| Source | Type | Geographic Coverage | Sample Count | Attributes Provided |
|---|---|---|---|---|
| **Pune Traffic Police Hotspot Registry** | Official Civic Records | Pune Key Arterials (Baner, Aundh, Swargate, Sinhagad, etc.) | 26 primary hotspots | Severity Grade (A+, A, B+, B), bottleneck descriptions |
| **Pune Municipal Corporation (PMC) Stormwater Drain Audit** | Municipal GIS Layer | Pune Pilot Corridor | 89,551 drain features | Drainage line geometries, culverts, nala connection points |
| **Monsoon Emergency Archives** | News & Incident Logs (Punekar News, Bridge Chronicle, Free Press Journal) | City-wide, 2018–2024 monsoons | 6 major extreme weather days | Inundation hour, road underpass closures, flood depth estimates |
| **Open-Meteo & ECMWF ERA5 Reanalysis** | Gridded Atmospheric Dataset | Centroid (18.52° N, 73.85° E) | 55,536 hourly records | Antecedent rainfall (1h, 3h, 6h, 24h, 72h), soil moisture 0–7cm |

---

## 2. Label Engineering Pipeline

1. **Spatial Snapping**:
   - Each named hotspot was projected into UTM Zone 43N (`EPSG:32643`) and snapped to the nearest road segment within a 150–250 m threshold.
   - Identified segments inherit the official traffic police vulnerability grade.

2. **Temporal Alignment**:
   - Positive instances were created across peak storm windows:
     * **25 July 2024** (Cloudburst: 14:00 – 18:00)
     * **04 August 2024** (Heavy Downpour: 16:00 – 19:00)
     * **25 September 2024** (Monsoon Surge: 08:00 – 11:00)
     * **24 September 2019** (Catastrophic Flash Flood: 08:00 – 12:00)
     * **31 August 2022** (Subway Inundation: 09:00 – 12:00)
     * **17 June 2020** (Pre-monsoon Surge: 06:00 – 09:00)
   - Antecedent precipitation features (`rainfall_1h`, `rainfall_3h`, `rainfall_6h`, `rainfall_24h`, `rainfall_72h`, `soil_moisture`) were extracted directly from the ERA5 record.

3. **Severity & Target Classes**:
   - `severe` (Severity = 4): Grade A+ (Underpasses with >1.5 ft water, Mutha backwater overflow)
   - `high` (Severity = 3): Grade A (Arterial choke points, slow-moving stormwater accumulation)
   - `moderate` (Severity = 1–2): Grade B / B+ (Internal connecting roads with water ponding)
   - `low` (Severity = 0): Negative dry baseline samples

---

## 3. Dataset Summary Statistics

* **Total Labelled Segment-Hours:** 2,176
* **Positive Inundation Events:** 676 segment-hours (Exceeds Phase 1 Gate minimum of 50 by 13.5×)
* **Negative (Dry Baseline) Events:** 1,500 segment-hours
* **Imbalance Ratio:** ~1 positive to 2.2 negatives (balanced representation for robust ML training)

---

## 4. Honest Label Bias Statement (Limitations)

1. **Reporting & Complaint Bias:**
   - Official records and media logs naturally over-sample high-visibility commercial corridors (e.g., Baner Road, Swargate, Karve Road) where citizen complaints and traffic disruption are immediately recorded.
   - Low-traffic residential lanes may experience localized puddles that never enter civic registries.

2. **Temporal Sparsity:**
   - Ground truth timestamps are typically recorded to the nearest hour or shift window rather than minute-level precision.
   - We address this by computing rolling antecedent rainfall windows (1h, 3h, 6h) rather than relying on instantaneous spikes.

3. **Disparate Municipal Counts:**
   - Public statements cite anywhere between 120, 201, and 260 spots. We anchor our training on the verified 26 Traffic Police graded hotspots (A+/A/B+/B) as high-confidence positive anchors.
