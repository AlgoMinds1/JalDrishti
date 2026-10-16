#!/usr/bin/env python3
"""Fetch Open-Meteo's current six-hour forecast and emit baseline GeoJSON."""
import datetime as dt
import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT=Path(__file__).resolve().parent
OUT=ROOT/"data/pilot/live"
OUT.mkdir(parents=True,exist_ok=True)
URL="https://api.open-meteo.com/v1/forecast?"+urllib.parse.urlencode({"latitude":18.492,"longitude":73.825,"hourly":"precipitation","forecast_days":2,"timezone":"Asia/Kolkata"})
LOG=OUT/"download.log"

def fetch():
    error=None
    for attempt in (1,2):
        try:
            req=urllib.request.Request(URL,headers={"User-Agent":"JalDrishtiPilot/1.0 (research prototype; data contact: project maintainers)"})
            with urllib.request.urlopen(req,timeout=20) as response:
                payload=json.loads(response.read().decode("utf-8"))
            LOG.write_text(f"{dt.datetime.now(dt.timezone.utc).isoformat()} success attempt={attempt} url={URL}\n",encoding="utf-8")
            return payload
        except Exception as exc:
            error=f"attempt={attempt} error={type(exc).__name__}: {exc}"
            if attempt==1: time.sleep(1)
    LOG.write_text(f"{dt.datetime.now(dt.timezone.utc).isoformat()} failed; retry exhausted; {error}; url={URL}\n",encoding="utf-8")
    raise RuntimeError(error)

def main():
    payload=fetch()
    times=payload.get("hourly",{}).get("time",[])
    rain=payload.get("hourly",{}).get("precipitation",[])
    local_zone=ZoneInfo("Asia/Kolkata")
    now=dt.datetime.now(local_zone).replace(minute=0,second=0,microsecond=0)
    pairs=[]
    for t,v in zip(times,rain):
        try:
            parsed=dt.datetime.fromisoformat(t)
            if parsed.tzinfo is None: parsed=parsed.replace(tzinfo=local_zone)
            pairs.append((parsed.astimezone(local_zone),float(v or 0)))
        except Exception: continue
    future=[(t,v) for t,v in pairs if t>now][:6]
    if len(future)<6: raise RuntimeError("Open-Meteo returned fewer than six future hourly precipitation values")
    generated=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    roads=json.loads((ROOT/"data/processed/pilot_segments.geojson").read_text())["features"]
    lon,lat=73.825,18.492
    half_lon=2.5/(111.32*math.cos(math.radians(lat)));half_lat=2.5/110.574
    roads=[r for r in roads if any(abs(x-lon)<=half_lon and abs(y-lat)<=half_lat for x,y,*_ in r.get("geometry",{}).get("coordinates",[]))]
    allrows=[]
    for h,(_,mm) in enumerate(future,1):
        prob=.01 if mm<.1 else min(.95,.10+.055*mm)
        rc="low" if prob<.15 else "moderate" if prob<.35 else "high" if prob<.65 else "severe"
        reason="Rainfall near zero in current forecast" if mm<.1 else f"Rain-threshold baseline; forecast next-hour rain {mm:.1f} mm"
        for r in roads:
            p=r.get("properties",{})
            allrows.append({"type":"Feature","geometry":r["geometry"],"properties":{"segment_id":p.get("id"),"road_name":p.get("name") or "Unnamed road","horizon_h":h,"risk_class":rc,"probability":round(prob,4),"confidence":"Low","top_reasons":[reason,"No geocoded source-backed segment incident labels","Uncalibrated rain-threshold baseline"],"rain_next_h_mm":round(mm,2),"generated_at":generated,"rain_data_timestamp":future[h-1][0].isoformat(),"mode":"live","is_prediction":True}})
    for h in range(1,7):
        rows=[r for r in allrows if r["properties"]["horizon_h"]==h]
        (OUT/f"predictions_h{h}.geojson").write_text(json.dumps({"type":"FeatureCollection","name":f"jaldrishti_live_h{h}","features":rows},indent=2)+"\n")
    (OUT/"predictions_all.json").write_text(json.dumps({"model_type":"baseline","mode":"live","generated_at":generated,"features":allrows},indent=2)+"\n")
    print(f"Live baseline written to {OUT}; hourly precipitation (mm): "+", ".join(f"{v:.2f}" for _,v in future))

if __name__=="__main__":
    main()
