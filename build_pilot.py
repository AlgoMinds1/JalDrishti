#!/usr/bin/env python3
"""Build auditable, map-ready pilot artifacts without training on unsupported labels.

This deliberately stops at a rain-threshold + reported-hotspot baseline while
the pilot has fewer than five distinct, source-backed events.
"""
from __future__ import annotations

import csv
import datetime as dt
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "data" / "pilot"
OUT.mkdir(parents=True, exist_ok=True)
ZONE = (73.825, 18.492)  # approximate Ekta Nagar / Vitthalwadi centre
HALF_LON, HALF_LAT = 2.5 / (111.32 * math.cos(math.radians(ZONE[1]))), 2.5 / 110.574
EVENTS = [
    {"place_or_segment":"Pune city (reported citywide road flooding; exact pilot-zone road not specified)","lat":"","lon":"","date":"2019-09-24","source_url":"https://timesofindia.indiatimes.com/city/pune/waterlogging-reveals-poor-standard-of-smart-roads/articleshow/71284804.cms","severity":"reported flooding; location too broad for segment label","event_id":"pune-2019-09"},
    {"place_or_segment":"Sinhagad Road, Pune","lat":"","lon":"","date":"2023-09-28","source_url":"https://www.hindustantimes.com/cities/pune-news/thursday-downpour-leads-to-waterlogging-in-some-areas-101696011409574.html","severity":"reported flash-flooding; road segment unspecified","event_id":"pune-2023-09"},
    {"place_or_segment":"Ektanagar, Vitthalwadi and Sinhagad Road, Pune","lat":"","lon":"","date":"2024-07-24","source_url":"https://www.hindustantimes.com/cities/pune-news/pmc-panel-to-identify-causes-of-flooding-suggest-preventive-measures-101722452082351.html","severity":"flooding; affected localities reported, exact road points unavailable","event_id":"pune-2024-07"},
    {"place_or_segment":"Ektanagar, Vitthalwadi and Sinhagad Road, Pune","lat":"","lon":"","date":"2024-07-25","source_url":"https://www.hindustantimes.com/cities/pune-news/pmc-panel-to-identify-causes-of-flooding-suggest-preventive-measures-101722452082351.html","severity":"flooding; affected localities reported, exact road points unavailable","event_id":"pune-2024-07"},
]

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def main():
    with (ROOT / "labels_compiled.csv").open("w", newline="", encoding="utf-8") as f:
        w=csv.DictWriter(f, fieldnames=list(EVENTS[0])); w.writeheader(); w.writerows(EVENTS)

    # The pre-existing network is used only as an explicitly unverified geometry
    # snapshot. Keep road segments whose vertices fall in the requested 5x5 km box.
    roads=read_json(ROOT/"data/processed/pilot_segments.geojson")["features"]
    fs=read_json(ROOT/"data/processed/segment_features.json")
    featmap={x.get("segment_id"):x for x in fs}
    kept=[]
    for road in roads:
        coords=road.get("geometry",{}).get("coordinates",[])
        if not coords or not any(abs(x-ZONE[0])<=HALF_LON and abs(y-ZONE[1])<=HALF_LAT for x,y,*_ in coords):
            continue
        p=road.get("properties",{}); sid=p.get("id", "unknown")
        kept.append((road,p,sid,featmap.get(sid,{})))

    cache=read_json(ROOT/"data/processed/rainfall_cache.json")
    rain=[float(x or 0) for x in cache.get("hourly_precip",[])[:6]]
    if len(rain)<6: rain += [0.0]*(6-len(rain))
    rain1=rain[0]; rain3=sum(rain[:3]); rain6=sum(rain[:6])
    generated=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    timestamp=cache.get("fetched_at", "unknown")
    age_hours=None
    try: age_hours=(dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(timestamp.replace("Z","+00:00"))).total_seconds()/3600
    except Exception: pass
    data_old=age_hours is None or age_hours>3
    near_zero=max(rain,default=0)<0.1

    allrows=[]
    def risk(prob): return "low" if prob<.15 else "moderate" if prob<.35 else "high" if prob<.65 else "severe"
    for h in range(1,7):
        next_rain=rain[h-1]
        # Threshold baseline: no source-backed segment labels are geocoded, so
        # hotspot contribution is disabled rather than guessed from place names.
        prob=0.01 if next_rain<0.1 else min(.95, .10 + .055*next_rain + .008*sum(rain[:h]))
        for road,p,sid,sf in kept:
            reason=("Rainfall near zero in available forecast snapshot" if near_zero else f"Rain threshold baseline; next-hour rain {next_rain:.1f} mm")
            reasons=[reason, "No geocoded source-backed segment incident labels", "Terrain and road geometry snapshot not independently verified"]
            row={"segment_id":sid,"road_name":p.get("name") or "Unnamed road","horizon_h":h,"risk_class":risk(prob),"probability":round(prob,4),"confidence":"Low" if data_old else "Low","top_reasons":reasons,"rain_next_h_mm":round(next_rain,2),"generated_at":generated,"rain_data_timestamp":timestamp,"mode":"replay","is_prediction":True,"confidence_basis":"baseline; sparse labels; forecast snapshot age unknown or >3 h" if data_old else "baseline and sparse labels"}
            feature={"type":"Feature","geometry":road["geometry"],"properties":row}
            allrows.append(feature)
    for h in range(1,7):
        rows=[x for x in allrows if x["properties"]["horizon_h"]==h]
        (OUT/f"predictions_h{h}.geojson").write_text(json.dumps({"type":"FeatureCollection","name":f"jaldrishti_h{h}","features":rows},indent=2)+"\n",encoding="utf-8")
    (OUT/"predictions_all.json").write_text(json.dumps({"model_type":"baseline","generated_at":generated,"mode":"replay","features":allrows},indent=2)+"\n",encoding="utf-8")
    (OUT/"model.txt").write_text("model_type=baseline\nrule=rain-threshold + hotspot contribution only when geocoded source-backed segment labels exist\ntraining=not run (fewer than five distinct labelled events)\nprobability=0.01 when available forecast-hour rain < 0.1 mm; otherwise bounded heuristic, not calibrated\n",encoding="utf-8")
    # Source metadata and audit trail are retained next to the generated data.
    (OUT/"event_counts.csv").write_text("event_id,date,places,source_url\n"+"".join(f"{x['event_id']},{x['date']},1,{x['source_url']}\n" for x in EVENTS),encoding="utf-8")
    # CSV feature inventory is the portable substitute in this environment;
    # never emit a file with a .parquet suffix unless it is genuine Parquet.
    with (OUT/"features.csv").open("w",newline="",encoding="utf-8") as f:
        cols=["segment_id","road_name","road_class","elevation_mean","slope_mean","hand_mean","builtup_share","dist_to_waterway_m","is_underpass","is_bridge","is_tunnel"]
        w=csv.DictWriter(f,fieldnames=cols);w.writeheader()
        for road,p,sid,sf in kept:
            w.writerow({"segment_id":sid,"road_name":p.get("name",""),"road_class":p.get("road_class",""),**{k:sf.get(k,"") for k in cols[3:]}})
    (OUT/"map.html").write_text(MAP_HTML,encoding="utf-8")
    print(f"zone_segments={len(kept)}; labelled_events={len(set(x['event_id'] for x in EVENTS))}; rows={len(allrows)}; rain_1h={rain1:.2f}; rain_3h={rain3:.2f}; rain_6h={rain6:.2f}; rain_near_zero={near_zero}; rain_age_hours={age_hours}")

MAP_HTML = r'''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JalDrishti pilot replay</title><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;margin:0;font:14px system-ui}#bar{position:absolute;z-index:1000;top:10px;left:55px;right:10px;background:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 1px 6px #555}#map{height:100%}.road{color:#0072B2} .low{color:#009E73}.moderate{color:#E69F00}.high{color:#D55E00}.severe{color:#CC79A7}</style></head><body><div id="bar"><strong>Decision-support prototype, not an official emergency service. Replay of a past event</strong><br>Rainfall near zero in the available forecast snapshot. All outputs are a low-confidence threshold baseline. Horizon: <input id="slider" type="range" min="1" max="6" value="1"><b id="h">+1 h</b></div><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const map=L.map('map').setView([18.492,73.825],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);let layer;async function show(h){document.getElementById('h').textContent='+'+h+' h';const r=await fetch('predictions_h'+h+'.geojson');const data=await r.json();if(layer)map.removeLayer(layer);layer=L.geoJSON(data,{style:f=>({color:({low:'#009E73',moderate:'#E69F00',high:'#D55E00',severe:'#CC79A7'})[f.properties.risk_class]||'#0072B2',weight:4,opacity:.55}),onEachFeature:(f,l)=>{const p=f.properties;l.bindPopup(`<b>${p.road_name}</b><br>Risk: ${p.risk_class}<br>Probability: ${p.probability}<br>Confidence: ${p.confidence}<br>Rain next hour: ${p.rain_next_h_mm} mm<br>Reasons: ${p.top_reasons.join('; ')}<br>Generated: ${p.generated_at}<br>Rain data: ${p.rain_data_timestamp}`)}}).addTo(map)}document.getElementById('slider').oninput=e=>show(e.target.value);show(1);</script></body></html>'''

if __name__=="__main__": main()
