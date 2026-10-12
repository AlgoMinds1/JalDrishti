# JalDrishti: PPT and Diagram Pack
Oct 11, 2026 · @Krishna
Each section below is one slide of your template, with text you can paste and a diagram
where the slide asks for one. Keep slides to 5 or 6 short lines; the diagrams carry the
detail. For the full research behind it, see the earlier JalDrishti solution plan.
## Slide 1: Proposed Solution
Problem (one line). Pune floods on specific roads within an hour of heavy rain, but
citizens and authorities only get scattered, late, non-local information, and static hotspot
lists cannot say what will flood next.
Our solution. JalDrishti forecasts waterlogging risk for each road segment in a pilot zone 1
to 6 hours ahead, shows it on a live map with confidence and data freshness, explains
every prediction, verifies citizen reports, and recommends safer routes and inspection
priorities.
Target users. Commuters (pedestrians, two-wheelers, cars), residents of low-lying areas,
PMC ward and drainage officers, traffic police.
Key features (paste as bullets).
Colour-coded risk map: low, moderate, high, severe, with a +1h to +6h slider
Confidence level and data-freshness badge on every prediction
"Why this risk?" explanation from SHAP, in plain words
Citizen reports with photo and voice (Marathi, Hindi, English)
Report Trust Engine that checks reports against neighbours, rain and terrain
Predicted risk and confirmed reports shown as separate layers
Route suggestions by travel mode and an admin inspection ranking
What-if storm sandbox for pre-monsoon planning
USP (paste as one boxed line). "A forecast that learns from verified citizens: explainable 1
to 6 hour risk, corrected by a trust-scored report layer that fake or panicked reports
cannot trigger alone."
Three differentiators to say aloud.
1. Forecasts the future; existing tools map the past or the present.
2. Says how sure it is and why; no black-box colours.
3. Defends itself against false reports, which most crowd-sourced flood maps do not
address.
JalDrishti: PPT and Diagram Pack
Page 1 of 12

---

Visual suggestion. A screenshot of the map with one segment popup open (risk,
confidence, top reasons), small, on the right half of the slide.
## Slide 2: Technical Approach
Put the table on the left half of the slide and the diagram on the right (or the diagram full
width with the table as a thin strip). Screenshot or export the diagram as an image.
How inputs become outputs (say this under the diagram). Rain forecasts and
terrain/drainage features are joined per road segment; the model outputs a calibrated risk
class and confidence; SHAP gives the reasons; citizen reports pass through the Trust
Engine and update the map; the API serves the map, routes, alerts and admin ranking.
Layer Tools Why we chose it
ML LightGBM, SHAP, MAPIE Fast on small tabular data,
explainable, gives calibrated
uncertainty
Data Open-Meteo, ERA5, GLO-30 DEM,
HAND, OSM, PMC open data
Free, no key for most, covers rain,
terrain and drainage
Backend FastAPI Same language as the ML code, quick
to ship
Database PostgreSQL + PostGIS Geometry queries on road segments
Frontend React + Leaflet, installable PWA Works on a phone in the rain, no app
store
AI
helpers
Groq or Gemini free tier, Whisper Voice and multilingual reports, photo
plausibility
Alerts Brevo SMTP, Telegram bot Free, opt-in
JalDrishti: PPT and Diagram Pack
Page 2 of 12

---

Data flows down: sources feed the pipeline and database, four services read from it, one
API exposes them, and the citizen app, admin dashboard and alerts sit on top.
Slide 2 system architecture · 5 layers
JalDrishti: PPT and Diagram Pack
Page 3 of 12

---

## Slide 3: End to End Workflow
Use this flowchart as the main image. Under it, write three lines: a rainstorm is forecast;
the map turns red on the segments most likely to flood; a citizen reports water on one of
them, the Trust Engine checks it, and only then does an alert go out and routes change.
Illustrative example for the speaker (30 seconds, not real data). Forecast shows 40 mm
in 3 hours. A low-lying underpass turns orange at +2h with Medium confidence, because
the terrain is low and rain is heavy. Two people nearby report water; their trust scores are
high, so the segment moves to red and an alert goes to subscribers in Marathi. A
pedestrian route avoids it; the admin queue lists it first.
Demo video (2 to 3 minutes, optional on the slide). Embed or link it on this slide. Script is
in the last sections of this doc.
## Our USP: forecast corrected by a Trust Engine
The claim. Citizen-report maps exist and rainfall forecasts exist. JalDrishti joins them
safely: the forecast says where water is likely, trusted reports say where it is, and a report
can never trigger an alert by itself. This answers the PS question about malicious input and
the PS demand to separate predicted from reported waterlogging.
Slide 3 end-to-end workflow · 5 steps, 1 gate, 1 loop
JalDrishti: PPT and Diagram Pack
Page 4 of 12

---

Weights are starting values to tune; state them as such on the slide.
How to build it in two days
1. Reports table (1 h). Columns: id, lat, lon, snapped segment id, time, text, language,
photo path, reporter id, trust score, state.
2. Intake endpoint (2 h). FastAPI POST that stores the report, strips photo EXIF after
reading it, and snaps the pin to the nearest road segment within a set distance using
the OSM graph.
3. Voice and translation (2 h). Browser Web Speech API for speech on the client; send
text to an LLM prompt that returns fixed JSON (language, English text, water depth
words, severity). The model gets no tools and its output is validated.
4. Five checks as plain functions (4 h). Neighbours: count distinct reporters within
about 150 m in 30 min. Rain: look up the last and next hour of rainfall at the point.
Terrain: read HAND and slope for the segment. Reporter: reputation starts low and
rises with confirmed reports. Photo: compare EXIF time and place, then one vision-
model yes/no/unclear.
5. Score and state (1 h). Weighted sum, thresholds 30 and 60, written back to the table.
6. Map layer (2 h). A separate Leaflet layer for reports, with icons by state; predicted
layer stays dashed or translucent.
USP implementation · Report Trust Engine
JalDrishti: PPT and Diagram Pack
Page 5 of 12

---

7. Alert gate (1 h). Alert only if model risk is high or at least two independent trusted
reports agree.
8. Attack test (1 h). A script that posts spam, dry-weather and far-away reports and
asserts none reaches an alert. Show this result in the demo.
Cut if short on time. Photo check and reporter reputation; the other three checks still
demonstrate the idea.
Backup wow feature. The What-If Storm Sandbox is cheap (re-run the model with a user-
set rainfall) and demos well; build it only after the Trust Engine works.
## Project architecture
This is the layout to show if a judge asks "how is the project organised?" It assumes four
people; with three, merge frontend with trust, and with five, give the fifth person
evaluation and the PPT.
Contracts between folders (agree these in the first hour so people never block each
other).
project architecture · repo layout and owners
JalDrishti: PPT and Diagram Pack
Page 6 of 12

---

data/ writes one table, segments (id, geometry, static features), and nothing else.
ml/ reads segments plus rainfall, writes predictions (segment id, horizon, class,
probability, confidence, top reasons).
api/ serves predictions , reports and routes as JSON; the frontend never touches
the database.
trust/ exposes one function, score_report(report) -> score, state, reasons .
Freeze the JSON shape of a prediction on day 1, so the map can be built against fake
data before the model exists.
## Slide 4: Future Scope and References
Future scope (paste as 5 bullets).
Scale: from one pilot zone to all of Pune, then other flood-prone Indian cities, reusing
the same open data pipeline.
Better ground truth: low-cost water-level sensors at hotspots and PMC complaint
feeds, so labels no longer rely on sparse reports.
Finer rainfall: local rain-gauge and radar nowcasts for minute-level cloudburst
warnings.
Integration: hand-off to ward control rooms, traffic police advisories and the national
alert apps as a decision-support layer, with official approval.
Accountability: the effectiveness ledger to show which drain repairs actually reduced
flooding.
Real-world deployment note. Today it is a decision-support prototype, not an official
emergency service. A commercial or official rollout needs a licensed weather feed (the
free Open-Meteo tier is non-commercial) and a privacy review.
References (paste as a compact list; add the QR code to the full doc).
Open-Meteo forecast, ensemble, archive and flood APIs: open-meteo.com
NASA GPM IMERG rainfall: registry.opendata.aws/nasa-gpm3imerghhe
Copernicus GLO-30 DEM and ASF Global 30 m HAND: registry.opendata.aws/glo-30-
hand
ESA WorldCover land cover: esa-worldcover.org
OpenStreetMap (Overpass API) and PMC open data on OpenCity: data.opencity.in
MAPIE conformal prediction: mapie.readthedocs.io
Sen1Floods11 radar flood dataset: github.com/cloudtostreet/Sen1Floods11
Prior art: Riskmap.in (MIT Tata Center), IIT Bombay Mumbai Flood portal
JalDrishti: PPT and Diagram Pack
Page 7 of 12

---

PMC and Traffic Police waterlogging hotspot reporting, 2026 (Free Press Journal,
Bridge Chronicle, Punekar News)
The full link list with working URLs is in the Sources section of the earlier JalDrishti
solution plan.
## Two-day build plan
The full plan from the earlier doc is about three weeks of work, so a two-day build needs
hard cuts. Assumptions: four people, roughly 8 to 10 working hours per day. Tell me the
real hours and team size and I will re-time it.
Scope for two days
Item Treatment Why
Risk map, +1h to +6h slider,
segment card
Build for real The core of the PS
LightGBM model, calibration,
SHAP reasons
Build for real, small pilot
zone
PS must-have; train on
whatever labels you can
assemble
Confidence and freshness
badge
Build for real Cheap and judges look for
it
Report form (text, photo, pin)
and separate reports layer
Build for real PS must-have
Trust Engine (3 checks:
neighbours, rain, terrain)
Build for real The USP
Reporter reputation and
photo vision check
Cut or stub Add only if ahead
Voice input, Marathi/Hindi Browser speech plus LLM
translation, one language
first
Strong demo, low effort
Email alert One template through Brevo
SMTP
Proves the Alert step
Route by travel mode Own small graph for the
pilot zone; two profiles
(walk, car)
Bonus USP in the PS
Admin ranking Simple sorted table Enough to show Respond
JalDrishti: PPT and Diagram Pack
Page 8 of 12

---

Timeline
Before the event (if rules allow; check them). Create accounts and keys, download DEM,
HAND, OSM and PMC layers for the pilot zone, collect hotspot names and dates, set up
the repo, Docker Compose and the slide template. Prepare nothing that the rules count as
pre-built project code.
Day 1: make the loop work end to end, ugly is fine.
1. Hours 0 to 1. Agree the data contracts and the fake prediction JSON; split the repo as
in the project architecture.
2. Hours 1 to 4. ML: segment table and features, first baseline. Backend: endpoints
returning fake predictions. Frontend: map with colours from fake data. Trust: report
table and intake endpoint.
3. Hours 4 to 7. ML: LightGBM with temporal split, calibration, SHAP. Frontend: slider,
segment card, reports layer. Trust: neighbour and rain checks.
4. Hours 7 to 9. Swap fake predictions for model output. First full run: forecast, map,
submit report, score, state change. Gate: the loop works once on a laptop.
Day 2: make it trustworthy and presentable.
1. Hours 0 to 2. Terrain check, alert gate, email alert, evaluation numbers (PR-AUC, recall,
false-alarm rate, always-no baseline).
2. Hours 2 to 5. Routing with two profiles, admin ranking, voice input, Marathi alert text,
attack test script.
3. Hours 5 to 7. Freeze features. Offline demo mode with the cached storm, bug fixing,
screenshots for the PPT.
4. Hours 7 to 9. Fill the four slides, record the 2 to 3 minute video, rehearse twice. Gate:
submit with time to spare; never add features in the last two hours.
Rules of thumb
One person owns the demo path and nobody else changes it after Day 2 hour 5.
Commit to the repo every hour; tag the working version.
Item Treatment Why
Sandbox, RAG assistant,
Telegram, effectiveness
ledger
Slide only (Future scope), or
sandbox if time remains
Do not risk the core loop
Live weather Real API plus a cached storm
for the demo
Wi-Fi at venues fails
JalDrishti: PPT and Diagram Pack
Page 9 of 12

---

If the model is weak, say so with the baseline beside it; an honest weak model beats an
unexplained strong one.
If labels are too thin to train, use hotspot grades plus rainfall thresholds as a
transparent baseline, train on what exists, and show both.
## Resources and tips for the PPT and demo video
These tools and habits come from general knowledge, not this research; check licences
and availability before relying on them.
Making the slides
Keep your template. Replace the grey instruction lines, keep the logos and the red
footer band, and keep text above the band. Title in the template's monospace heading
style.
Max 6 short lines per slide. Put detail in the diagram and in speaker notes.
Export diagrams as images. Take a screenshot of each diagram in this doc, or redraw it
in Excalidraw, diagrams.net (draw.io) or Figma if you want to match the template
colours; the template's footer red would suit the highlight colour.
Use real screenshots on Slide 1 and 3. A cropped map with a segment popup beats any
stock image. Take them from the demo with the cached storm so they are clean.
One idea per slide. Slide 1 problem and promise, Slide 2 how it is built, Slide 3 how it
works for a user, Slide 4 where it goes.
Icons. Material Symbols, Lucide or Phosphor are free sets; check each licence and
credit if required.
QR code. Add one on Slide 3 or 4 linking to the demo video and repo; any free QR
generator works.
Fonts and contrast. Body at 18 pt or larger; dark text on the light slide background; do
not put text over the faded logo.
Recording the 2 to 3 minute demo video
Tools. OBS Studio (free) or your OS screen recorder; record at 1080p, mic close, laptop
on charge.
Rehearse twice, record once. Script below; record the phone voice-report segment as
a separate clip and insert it.
Use the cached storm so the video never depends on Wi-Fi or API limits.
Show failure handling. Ten seconds of fake reports being rejected is more memorable
than a clean run.
JalDrishti: PPT and Diagram Pack
Page 10 of 12

---

Captions. Add subtitles; judges may watch without sound.
Video script (about 2 minutes 40 seconds)
1. 0:00 to 0:20. Problem: Pune floods on specific roads within an hour; lists are static;
nobody knows what is next.
2. 0:20 to 1:00. Map and slider from +1h to +6h; open a segment: risk, confidence,
freshness, reasons.
3. 1:00 to 1:40. Submit a voice report in Marathi; show translation, snapping, trust score,
state change.
4. 1:40 to 2:05. Submit three fake reports; show them held back and no alert sent.
5. 2:05 to 2:30. Email alert in Marathi; walking route versus car route; admin ranking.
6. 2:30 to 2:40. Test-set table with the always-no baseline; limitations; "decision-support
prototype" banner.
Reading list for you
The earlier JalDrishti solution plan has the sources, API limits and the data-limitations list;
read its "Evaluation, data limitations and uncertainty" section before the presentation,
since judges often probe exactly there.
## Likely judge questions
Question Short answer
Why not just a static hotspot map? A static map shows where it flooded before;
ours forecasts the next 1 to 6 hours and we
show it beats the hotspot-only baseline on
the test set
Your model says "no flood" most of the time;
how is accuracy useful?
It is not; we report PR-AUC, recall, false-
alarm rate and the always-no baseline beside
our numbers
Where did your labels come from? PMC and Traffic Police hotspot records with
grades, dated incidents, and citizen reports;
labels are sparse and biased toward busy
roads, and we say so
How do you handle fake reports? One report never triggers an alert; reports
are scored on neighbours, rain, terrain,
reputation and photo, and an attack test
script is in the repo
JalDrishti: PPT and Diagram Pack
Page 11 of 12

---

Question Short answer
How sure is the model? Calibrated probability, conformal prediction
set and rainfall-ensemble spread become
High, Medium or Low confidence; old data
lowers it
Why should we trust the explanation? SHAP values come from the same model
that made the prediction; we show the top
three factors
Does it work for unseen places? Test includes a spatial hold-out of wards or
segments never seen in training
What if the weather API fails? Cached last forecast, confidence drops with
data age, and a banner shows how old the
data is
Is the route safe? We never claim safe; routes show lower
predicted risk, the riskiest segment and its
confidence
Privacy of reports and photos? Public map rounds locations to about 100 m,
photo EXIF is stripped, images are private,
retention is limited
Is this an official warning system? No; it is a decision-support prototype and
says so on every screen
What would you do with more time or data? Water-level sensors at hotspots, finer
rainfall, official integration, and the
effectiveness ledger for drain repairs
Why free APIs; can it scale? Fine for a prototype; Open-Meteo's free tier
is non-commercial, so a deployment needs a
licensed feed or IMD data
What is new compared to Riskmap.in or the
Mumbai flood portal?
Model-based road-segment forecasts with
explanations and uncertainty, plus a trust
engine that protects the report layer
JalDrishti: PPT and Diagram Pack
Page 12 of 12