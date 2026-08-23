# Orange County Mayor — Precinct Strategy Map

Standalone interactive map of all 263 Orange County voting precincts, carrying the
August 18, 2026 County Mayor results and a strategic classification of every precinct.
**Not part of The Patrick Carr Show / BCMG site** — it shares this repo but is
otherwise unrelated to it, and nothing on the site links to it.

## Use

Open `orange-county-precinct-map.html` in any browser. Single self-contained
file (Leaflet and all boundary geometry are inlined) — no build step, no server,
no API key. The only network request is the optional OpenStreetMap basemap; with
no connection the basemap switches itself off and the precincts still render.

- **Hover** a precinct to read it, **click** to pin the selection
- **Find precinct** box jumps to any precinct number
- **Labels / Basemap** toggles, **Reset view** returns to the whole county

Precinct numbers are placed by live decluttering, matching the source viewer:
each label is drawn only if it fits inside its own precinct's on-screen shape
and does not collide with a label already placed, with the largest precincts
taking priority. About 50 of 263 labels show at county-wide zoom, and more
appear as you zoom in.

## Data source

Boundaries: Orange County Supervisor of Elections, `OCSOE_Precincts` (the live
current layer, 263 precincts).

    https://services8.arcgis.com/KROpZDerJ9MICPIU/arcgis/rest/services/OCSOE_Precincts/FeatureServer/0

Published via the SOE GIS hub:
<https://orange-county-elections-gis-data-hub-ocsoe.hub.arcgis.com/>

Geometry is reprojected to WGS84 and coordinates rounded to 5 decimal places
(~1 m) to keep the file small. Rounding is applied uniformly, so boundaries
shared between neighboring precincts stay welded — no slivers or gaps.

## Election data (Step 2)

Source: Orange County SOE 2nd unofficial results, 2026 primary, County Mayor.
All 263 precincts join to a polygon by precinct number; a polygon with no data
match renders hatched in red and logs to the console.

**Five map modes**

| Mode | Shows |
|------|-------|
| Strategy *(default)* | Each precinct's bucket: harvest / battleground / fortress / write-off |
| Winner | Who carried the precinct, color intensity scaled to margin |
| Vulnerability | Moore Russell's vote share — pale is where she is weakest |
| Harvest | Raw Murphy + Uribe votes available, in five classes |
| Mail Gap | `vbm_deficit` — red where Messina trails on mail, green where he leads |

Write-off precincts carrying `surge_warning` get a red diagonal hatch in Strategy
mode: low August turnout in a Moore Russell base that will surge in November.

**Redacted vote types.** Florida Statute 98.0981 withholds any election-day /
early / mail cell of 1–29 votes, so those cells arrive as zero while the
candidate total stays exact. The detail table never shows those as zeros — it
prints `—` and carries the remainder in a separate `Redact.` column, so every row
still sums to its total.

**Scoreboard** (right panel, collapsible): countywide four-way result, per-bucket
precinct/ballot/harvest totals, a district-by-district table, and the ten highest
harvest-vote targets — click any one to fly to it.

Countywide check figures: 174,966 ballots; harvest 104 precincts / 33,166 votes;
battleground 71; fortress 41; write-off 47.

## Step 3 (not built)

Republican registration overlay and GOTV upside per fortress precinct, plus the
November turnout projection. Needs the SOE Book Closing Party-by-Precinct file.
