#!/usr/bin/env python3
"""Turn youtube_raw.json into youtube_week.csv + youtube_videos.csv, merge with manual_week.csv
into master_dataset.csv, and compute the power ranking (power_ranking.csv)."""
import csv, json, statistics as st, datetime as dt

COLS = ["station", "platform", "followers", "posts_7d", "total_views", "avg_views", "median_views",
        "top_post_views", "top_post_share", "viral_flag", "notes"]
STATIONS = ["FOX35", "WFTV", "WESH", "WKMG", "SPECTRUM13"]
raw = json.load(open("youtube_raw.json"))
pulled = dt.datetime.fromisoformat(raw["pulled_at_utc"])
vids = raw["videos"]
for v in vids:
    v["views"] = v["view_count"] or 0
    if v.get("timestamp"):
        v["age_hours"] = round((pulled.timestamp() - v["timestamp"]) / 3600, 1)
    else:  # no exact time: treat pull-day uploads as fresh
        v["age_hours"] = 0.0 if v["upload_date"] == pulled.strftime("%Y%m%d") else 999.0
    v["fresh"] = v["age_hours"] < 24

handles = {l["station"]: l for l in raw["log"] if l.get("status") == "OK"}
missing_tabs = {(l["station"], l["tab"]) for l in raw["log"] if l.get("status") == "LIST_FAILED"}
EXTRA = {
    "FOX35": "handle @FOX35Orlando is a dead channel (last upload 2010); used @fox35",
    "WFTV": "handle @WFTV9 is a dead channel (last upload 2009); used @WFTV",
    "SPECTRUM13": "@MyNews13 does not exist; used @spectrumlocalnews, the NATIONAL Spectrum News channel linked from mynews13.com (not Orlando only)",
}

def pct(x):
    return f"{round(x * 100, 1):g}%"

def row(station, label, items, tab=None):
    subs = max((v.get("channel_follower_count") or 0 for v in vids if v["station"] == station), default=0) or ""
    week_total = sum(v["views"] for v in vids if v["station"] == station)  # channel week, for viral test
    notes = []
    if tab and (station, tab) in missing_tabs:
        notes.append(f"channel has no {tab} tab")
    r = dict(station=station, platform=label, followers=subs, posts_7d=len(items), total_views="", avg_views="",
             median_views="", top_post_views="", top_post_share="", viral_flag="", notes="")
    if items:
        total = sum(v["views"] for v in items)
        mature = [v["views"] for v in items if not v["fresh"]]
        top = max(items, key=lambda v: v["views"])
        viral = [v for v in items if week_total and v["views"] > week_total / 3]
        r.update(total_views=total,
                 avg_views=round(st.mean(mature)) if mature else "",
                 median_views=round(st.median(mature)) if mature else "",
                 top_post_views=top["views"],
                 top_post_share=pct(top["views"] / total) if total else "0%",
                 viral_flag="YES" if viral else "no")
        notes.append(f"Top: {top['title'][:70]}")
        fresh = sum(v["fresh"] for v in items)
        if fresh:
            notes.append(f"{fresh} posts under 24h old left out of avg/median")
    if not tab and station in EXTRA:
        notes.append(EXTRA[station])
    r["notes"] = "; ".join(notes).replace(",", " ").replace("\u2014", " - ").replace("\u2013", "-")
    return r

yt_rows = []
for s in STATIONS:
    sv = [v for v in vids if v["station"] == s]
    yt_rows.append(row(s, "YouTube Shorts", [v for v in sv if v["tab"] == "shorts"], "shorts"))
    yt_rows.append(row(s, "YouTube Long-form", [v for v in sv if v["tab"] == "videos"], "videos"))
    yt_rows.append(row(s, "YouTube", sv))

def write(path, rows, cols=COLS):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)

write("youtube_week.csv", yt_rows)
write("youtube_videos.csv", sorted(vids, key=lambda v: (v["station"], v["tab"], -v["views"])),
      ["station", "tab", "id", "upload_date", "age_hours", "fresh", "duration", "views", "title"])

manual = list(csv.DictReader(open("manual_week.csv")))
master = manual + yt_rows
order = {s: i for i, s in enumerate(STATIONS)}
master.sort(key=lambda r: order[r["station"]])
write("master_dataset.csv", master)

# ---------- power ranking ----------
# Uses Facebook, Instagram, TikTok and combined YouTube rows. X has follower counts only.
def num(x):
    return float(x) if x not in ("", None) else None

NOT_LOCAL = {("SPECTRUM13", "YouTube")}  # national Spectrum News channel: reported, not ranked
RANK_PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube"]
WEIGHTS = [4, 3, 2, 1]
KEYS = ["median_avg", "views_ex_top", "posts", "views_per_follower"]

def components(platforms):
    comp = {}
    for s in STATIONS:
        rows = [r for r in master if r["station"] == s and r["platform"] in platforms and num(r["total_views"]) is not None
                and (s, r["platform"]) not in NOT_LOCAL]
        meds = [num(r["median_views"]) for r in rows if num(r["median_views"]) is not None]
        total = sum(num(r["total_views"]) for r in rows)
        top = max(num(r["top_post_views"]) for r in rows)
        fol = sum(num(r["followers"]) or 0 for r in rows)
        # every station is averaged over the same platform list; no local channel = 0 for that platform
        comp[s] = dict(median_avg=round(sum(meds) / len(platforms)), total_views=round(total), biggest_post=round(top),
                       views_ex_top=round(total - top), posts=round(sum(num(r["posts_7d"]) for r in rows)),
                       followers=round(fol), views_per_follower=round(total / fol, 2),
                       platforms_counted=len(rows))
    for k, w in zip(KEYS, WEIGHTS):
        for pos, s in enumerate(sorted(STATIONS, key=lambda s: -comp[s][k])):
            comp[s][k + "_rank"] = pos + 1
            comp[s][k + "_pts"] = (5 - pos) * w
    for s in STATIONS:
        comp[s]["score"] = sum(comp[s][k + "_pts"] for k in KEYS)
    final = sorted(STATIONS, key=lambda s: (-comp[s]["score"], comp[s]["median_avg_rank"]))
    for i, s in enumerate(final):
        comp[s]["final_rank"] = i + 1
    return comp, final

comp, final = components(RANK_PLATFORMS)
comp3, final3 = components(RANK_PLATFORMS[:3])
cols = ["final_rank", "station", "score"] + [c for k in KEYS for c in (k, k + "_rank", k + "_pts")] + \
       ["total_views", "biggest_post", "followers", "platforms_counted"]
write("power_ranking.csv", [dict(station=s, **comp[s]) for s in final], cols)
json.dump({"ranking": [dict(station=s, **comp[s]) for s in final],
           "ranking_without_youtube": [dict(station=s, **comp3[s]) for s in final3],
           "weights": dict(zip(KEYS, WEIGHTS)), "pulled_at_utc": raw["pulled_at_utc"], "log": raw["log"]},
          open("power_ranking.json", "w"), indent=1)

for name, (c, f) in {"WITH YouTube": (comp, final), "WITHOUT YouTube (manual data only)": (comp3, final3)}.items():
    print(f"\n{name}")
    print(f"{'#':<2}{'station':<11}{'score':>5} | {'median avg':>10} {'r':>2} | {'views ex-top':>12} {'r':>2} | {'posts':>5} {'r':>2} | {'views/fol':>9} {'r':>2}")
    for s in f:
        x = c[s]
        print(f"{x['final_rank']:<2}{s:<11}{x['score']:>5} | {x['median_avg']:>10,} {x['median_avg_rank']:>2} | {x['views_ex_top']:>12,} "
              f"{x['views_ex_top_rank']:>2} | {x['posts']:>5} {x['posts_rank']:>2} | {x['views_per_follower']:>9} {x['views_per_follower_rank']:>2}")
print()
for r in yt_rows:
    print(",".join(str(r[c]) for c in COLS)[:230])
