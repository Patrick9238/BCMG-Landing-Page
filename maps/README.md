# Orange County, Florida — Precinct Map

Standalone interactive map of all 263 Orange County voting precincts.
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

## Next: election results

The map is built to take a results layer. Precincts are keyed by the SOE
precinct number as a string (`"101"`, `"214"`, `"812"`), which is the join key
for any results data. `styleFor()` in the page script is the single place that
decides a precinct's appearance, and `window.OCMap` exposes the map, the
precinct records, and the label redraw for that layer to hook into.
