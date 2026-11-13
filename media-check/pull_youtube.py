#!/usr/bin/env python3
"""Pull one week of YouTube uploads (videos + shorts tabs) for Orlando's five TV news stations.
Step 1: flat-playlist listing per tab.  Step 2: full metadata per video (exact upload time, views).
Writes youtube_raw.json (one record per video in window). Stats are built by build_dataset.py."""
import json, sys, time, datetime as dt
from concurrent.futures import ThreadPoolExecutor
import yt_dlp

WINDOW_START, WINDOW_END = "20261106", "20261113"
# station -> (handle the user gave, handle actually used)
CHANNELS = {
    "FOX35":      ("@FOX35Orlando", "@fox35"),
    "WESH":       ("@WESH", "@WESH"),
    "WFTV":       ("@WFTV9", "@WFTV"),
    "WKMG":       ("@News6WKMG", "@News6WKMG"),
    "SPECTRUM13": ("@MyNews13", "@spectrumlocalnews"),
}
QUIET = {"quiet": True, "no_warnings": True, "skip_download": True}
FLAT = yt_dlp.YoutubeDL({**QUIET, "extract_flat": True, "playlistend": 600,
                         "extractor_args": {"youtubetab": {"approximate_date": [""]}}})
FULL_OPTS = {**QUIET, "ignore_no_formats_error": True, "retries": 2, "socket_timeout": 20,
             "extractor_args": {"youtube": {"player_client": ["mweb"], "player_skip": ["webpage"]}}}

import os, threading
CACHE, LOCK = {}, threading.Lock()
if os.path.exists("youtube_cache.jsonl"):
    for line in open("youtube_cache.jsonl"):
        r = json.loads(line); CACHE[r["id"]] = r
CACHE_F = open("youtube_cache.jsonl", "a")

def full(vid):
    if vid in CACHE:
        return CACHE[vid]
    r = _full(vid)
    if "error" not in r:
        with LOCK:
            CACHE[vid] = r; CACHE_F.write(json.dumps(r) + "\n"); CACHE_F.flush()
    return r

def _full(vid):
    for attempt in range(2):
        try:
            with yt_dlp.YoutubeDL(FULL_OPTS) as y:
                i = y.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
            if i.get("upload_date"):
                return {k: i.get(k) for k in ("id", "title", "upload_date", "timestamp", "view_count",
                        "duration", "live_status", "channel", "channel_id", "channel_follower_count")}
        except Exception as e:
            err = str(e)[:200]
        time.sleep(2 * (attempt + 1))
    return {"id": vid, "error": locals().get("err", "no upload_date")}

out, log = [], []
for station, (given, used) in CHANNELS.items():
    for tab in ("videos", "shorts"):
        url = f"https://www.youtube.com/{used}/{tab}"
        try:
            listing = FLAT.extract_info(url, download=False)
            entries = [e for e in listing.get("entries") or [] if e]
            listed = len(entries)
            # videos tab carries approximate dates ("3 days ago"): skip anything clearly older than the window
            CUT = dt.datetime(2026, 11, 4, tzinfo=dt.timezone.utc).timestamp()
            ids = [e["id"] for e in entries if not e.get("timestamp") or e["timestamp"] >= CUT]
            stamps = [e["timestamp"] for e in entries if e.get("timestamp")]
            if stamps and min(stamps) >= CUT:
                log.append({"station": station, "tab": tab, "status": "WARNING_LISTING_MAY_BE_TRUNCATED"})
            print(station, tab, "listed", listed, "candidates", len(ids), flush=True)
        except Exception as e:
            log.append({"station": station, "tab": tab, "url": url, "status": "LIST_FAILED", "detail": str(e)[:200]})
            print(station, tab, "LIST FAILED", str(e)[:150], flush=True)
            continue
        kept = errors = fetched = 0
        with ThreadPoolExecutor(4) as pool:
            for s in range(0, len(ids), 18):
                recs = list(pool.map(full, ids[s:s + 18]))
                fetched += len(recs)
                dated = [r for r in recs if "error" not in r]
                errors += len(recs) - len(dated)
                for r in dated:
                    if WINDOW_START <= r["upload_date"] <= WINDOW_END:
                        out.append({**r, "station": station, "tab": tab}); kept += 1
                # listings are newest first: stop once a whole batch is older than the window
                if dated and all(r["upload_date"] < WINDOW_START for r in dated):
                    break
            else:
                if ids and not stamps and listed >= 600:
                    log.append({"station": station, "tab": tab, "status": "WARNING_LISTING_MAY_BE_TRUNCATED"})
        log.append({"station": station, "tab": tab, "url": url, "handle_given": given, "handle_used": used,
                    "status": "OK", "listed": listed, "candidates": len(ids), "fetched": fetched, "in_window": kept, "errors": errors})
        print(log[-1], flush=True)

json.dump({"pulled_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(), "window": [WINDOW_START, WINDOW_END],
           "log": log, "videos": out}, open("youtube_raw.json", "w"), indent=1)
print("saved", len(out), "videos")
