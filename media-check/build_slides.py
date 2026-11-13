#!/usr/bin/env python3
"""Build the nine 1920x1080 slides as self-contained HTML files in slides/html/.
Reads master_dataset.csv, power_ranking.json and logos/. Run shoot.js afterwards for the PNGs."""
import base64, csv, json, os, html

STATIONS = ["FOX35", "WFTV", "WESH", "WKMG", "SPECTRUM13"]
NAME = {"FOX35": "FOX 35", "WFTV": "WFTV 9", "WESH": "WESH 2", "WKMG": "WKMG News 6", "SPECTRUM13": "Spectrum News 13"}
LOGO_FILE = {"FOX35": "FOX35.png", "WFTV": "WFTV.png", "WESH": "WESH.png", "WKMG": "WKMG.jpg", "SPECTRUM13": "SPECTRUM13.svg"}
MIME = {"png": "image/png", "jpg": "image/jpeg", "svg": "image/svg+xml"}
VERDICT = {
    "WESH": ("THE VOLUME MACHINE", "Posts the most. Gets steady views all week."),
    "WKMG": ("THE EFFICIENCY KING", "Best Facebook median on the smallest big page."),
    "FOX35": ("THE SLOT MACHINE", "Huge when it hits. Quiet when it does not."),
    "WFTV": ("THE HOLLOW GIANT", "Big follower count. Small crowd per post."),
    "SPECTRUM13": ("LIGHTNING IN A BOTTLE", "One reel made the week. The rest was small."),
}
TOTAL = 9

rows = list(csv.DictReader(open("master_dataset.csv")))
D = {(r["station"], r["platform"]): r for r in rows}
RK = json.load(open("power_ranking.json"))
YT_OK = any(D.get((s, "YouTube"), {}).get("total_views") for s in STATIONS)

def n(x):
    return float(x) if x not in ("", None) else None

def fmt(x):
    """2,543 / 54.6K / 2.67M"""
    if x in ("", None): return "n/a"
    x = float(x)
    if x >= 1e6: return f"{x / 1e6:.2f}".rstrip("0").rstrip(".") + "M"
    if x >= 1e4: return f"{x / 1e3:.1f}".rstrip("0").rstrip(".") + "K"
    return f"{round(x):,}"

def logo(s, size):
    f = LOGO_FILE.get(s)
    p = os.path.join("logos", f) if f else None
    if p and os.path.exists(p):
        b = base64.b64encode(open(p, "rb").read()).decode()
        return f'<img class="logo" style="width:{size}px;height:{size}px" src="data:{MIME[f.rsplit(".", 1)[1]]};base64,{b}" alt="{NAME[s]}">'
    # fallback: plain text badge, white on neutral dark chip
    return f'<div class="logo chip" style="width:{size}px;height:{size}px;font-size:{size * .2}px">{s}</div>'

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden}
body{background:#0b0f1a;color:#fff;font-family:Arial,"Liberation Sans",Helvetica,sans-serif;position:relative}
.kicker{position:absolute;left:72px;top:48px;font-size:22px;font-weight:700;letter-spacing:4px;color:#f5c518}
.kicker:before{content:"";display:inline-block;width:44px;height:6px;background:#e03131;margin-right:16px;vertical-align:middle;position:relative;top:-2px}
.num{position:absolute;right:72px;bottom:44px;font-size:22px;font-weight:700;letter-spacing:3px;color:#8b93a7}
.num b{color:#fff}
h1{font-family:"Arial Narrow","Liberation Sans Narrow",Arial,sans-serif;font-weight:700;text-transform:uppercase;
   position:absolute;left:72px;top:104px;font-size:92px;line-height:1;letter-spacing:.5px;width:1776px}
h1 em{font-style:normal;color:#f5c518}
.sub{position:absolute;left:72px;top:212px;font-size:30px;color:#c3c9d6;width:1776px}
.narrow{font-family:"Arial Narrow","Liberation Sans Narrow",Arial,sans-serif;font-weight:700}
.panel{background:#111827;border-radius:14px}
.logo{border-radius:14px;object-fit:cover;display:block;flex:none}
.chip{background:#2a3142;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;letter-spacing:1px}
.gold{color:#f5c518}.red{color:#e03131}.blue{color:#5b8ff5}.dim{color:#8b93a7}
.lab{font-size:19px;font-weight:700;letter-spacing:2.5px;color:#8b93a7;text-transform:uppercase}
.foot{position:absolute;left:72px;bottom:44px;font-size:20px;color:#8b93a7;width:1500px;line-height:1.35}
/* scoreboard */
.board{position:absolute;left:72px;top:282px;width:1190px}
.board .hd,.board .rw{display:grid;grid-template-columns:420px 190px 130px 200px 1fr;align-items:center;padding:0 28px}
.board .hd{height:44px}.board .hd div{text-align:right}.board .hd div:first-child{text-align:left}
.board .rw{height:122px;margin-top:10px}
.board .st{display:flex;align-items:center;gap:22px;font-size:34px}
.board .v{text-align:right;font-size:42px}
.board .v.med{font-size:72px;color:#f5c518;line-height:1}
.board .flag{display:inline-block;font:700 15px Arial;letter-spacing:2px;background:#e03131;color:#fff;border-radius:5px;padding:4px 8px;margin-left:10px;vertical-align:middle}
.call{position:absolute;left:1302px;top:282px;width:546px;height:704px;padding:36px 38px;border-top:8px solid #e03131}
.call .t{font-size:54px;line-height:1.02;text-transform:uppercase;margin:10px 0 18px}
.call .big{font-size:150px;line-height:.95;color:#e03131;margin-top:16px}
.call p{font-size:29px;line-height:1.32;color:#dfe3ec;margin-top:18px}
.call p b{color:#fff}
"""

def page(i, body, extra=""):
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Media Check slide {i}</title>
<style>{CSS}{extra}</style></head><body>
<div class="kicker">THE PATRICK CARR SHOW · MEDIA CHECK</div>
{body}
<div class="num"><b>{i:02d}</b> / {TOTAL:02d}</div></body></html>"""

slides = {}

# ---------- 1 title ----------
logos_row = "".join(logo(s, 150) for s in ["FOX35", "WESH", "WFTV", "WKMG", "SPECTRUM13"])
slides[1] = page(1, f"""
<div class="narrow" style="position:absolute;left:72px;top:210px;width:1700px;font-size:176px;line-height:.94;text-transform:uppercase">
Who <span class="gold">actually</span> owns Orlando's news audience?</div>
<div style="position:absolute;left:72px;top:782px;display:flex;gap:26px">{logos_row}</div>
<div style="position:absolute;left:72px;top:968px;font-size:32px;color:#c3c9d6">
Every public post, every platform, same 7 days: <b style="color:#fff">Nov 6-13, 2026</b></div>""")

# ---------- 2 follower lie ----------
PLATS = ["Facebook", "Instagram", "TikTok", "YouTube"]
def followers_total(s):
    return sum(n(D[(s, p)]["followers"]) or 0 for p in PLATS + ["X"] if (s, p) in D and not (s, p) in SKIP)
SKIP = {("SPECTRUM13", "YouTube")}  # national channel, not an Orlando page
med = {r["station"]: r["median_avg"] for r in RK["ranking"]}
fol = {s: followers_total(s) for s in STATIONS}
order = sorted(STATIONS, key=lambda s: -fol[s])
fmax, mmax = max(fol.values()), max(med.values())
cards = ""
for s in order:
    per = round(fol[s] / med[s])
    cards += f"""<div class="panel card">
  <div class="top">{logo(s, 84)}<div class="narrow nm">{NAME[s]}</div></div>
  <div class="lab">Total followers</div>
  <div class="narrow fv">{fmt(fol[s])}</div>
  <div class="bar"><i style="width:{fol[s] / fmax * 100:.1f}%;background:#2f6fed"></i></div>
  <div class="lab" style="margin-top:22px">Typical post views</div>
  <div class="narrow mv">{fmt(med[s])}</div>
  <div class="bar"><i style="width:{med[s] / mmax * 100:.1f}%;background:#f5c518"></i></div>
  <div class="per">1 view for every<br><b>{per:,}</b> followers</div>
</div>"""
most, bestmed = order[0], max(STATIONS, key=lambda s: med[s])
slides[2] = page(2, f"""
<h1>The follower <em>lie</em></h1>
<div class="sub">A big follower count does not mean people watch. Here is each station's total next to what a normal post gets.</div>
<div class="cards">{cards}</div>
<div class="foot">Followers = Facebook + Instagram + TikTok + X + YouTube. Typical views = median views per post, averaged across platforms.
Spectrum News 13 has no Orlando YouTube channel, so YouTube counts as zero for them.</div>
<div class="proof"><b class="gold narrow">THE PROOF:</b> WFTV 9 and WKMG News 6 have almost the same number of followers. A normal WKMG post gets <b>{med["WKMG"] / med["WFTV"]:.1f} times</b> the views.</div>""",
""".cards{position:absolute;left:72px;top:290px;display:flex;gap:20px}
.card{width:339px;height:560px;padding:24px 28px}
.proof{position:absolute;left:72px;top:872px;width:1776px;font-size:32px;color:#dfe3ec;border-left:8px solid #e03131;padding:10px 0 10px 24px}.proof b{color:#fff}.proof b.gold{color:#f5c518;font-size:36px;margin-right:8px}
.card .top{display:flex;align-items:center;gap:16px;height:84px;margin-bottom:22px}
.card .nm{font-size:31px;line-height:1.05}
.card .fv{font-size:84px;line-height:1.05;color:#fff}
.card .mv{font-size:112px;line-height:1.02;color:#f5c518}
.bar{height:12px;background:#1f2937;border-radius:6px;margin-top:8px;overflow:hidden}
.bar i{display:block;height:100%;border-radius:6px}
.per{margin-top:20px;font-size:24px;line-height:1.3;color:#c3c9d6}.per b{color:#fff;font-size:30px}
""")

# ---------- 3-5 scoreboards ----------
def board(platform, flag_fn=None):
    sts = sorted(STATIONS, key=lambda s: -(n(D[(s, platform)]["median_views"]) or 0))
    h = '<div class="hd lab"><div>Station</div><div>Followers</div><div>Posts</div><div>Total views</div><div>Median views</div></div>'
    for s in sts:
        r = D[(s, platform)]
        flag = '<span class="flag">VIRAL SKEW</span>' if r["viral_flag"] == "YES" else ""
        h += f"""<div class="rw panel"><div class="st">{logo(s, 86)}<div><span class="narrow">{NAME[s]}</span>{flag}</div></div>
<div class="v narrow">{fmt(r['followers'])}</div><div class="v narrow">{r['posts_7d']}</div>
<div class="v narrow">{fmt(r['total_views'])}</div><div class="v med narrow">{fmt(r['median_views'])}</div></div>"""
    return f'<div class="board">{h}</div>'

FOOT = '<div class="foot">Sorted by median views per post. Median = the middle post, so one viral hit cannot bend it. VIRAL SKEW = one post made more than a third of the week.</div>'

slides[3] = page(3, f"""<h1>Facebook <em>scoreboard</em></h1>
<div class="sub">FOX 35 has the biggest page and the biggest total. Now look at the last column.</div>
{board("Facebook")}
<div class="call panel"><div class="lab">The catch</div>
<div class="narrow big">97.5%</div>
<div class="narrow t">Two shipwreck livestreams</div>
<p>FOX 35 got <b>2.67M</b> Facebook views. Almost all of it came from two SS United States livestreams.</p>
<p>That is national content, not Orlando news. A normal FOX 35 post got about <b>2,500</b> views.</p></div>{FOOT}""")

sp = D[("SPECTRUM13", "Instagram")]
slides[4] = page(4, f"""<h1>Instagram <em>scoreboard</em></h1>
<div class="sub">The biggest number in the whole study came from the smallest account.</div>
{board("Instagram")}
<div class="call panel"><div class="lab">The outlier</div>
<div class="narrow big">3.4M</div>
<div class="narrow t">One reel. 54.6K followers.</div>
<p>Spectrum News 13's Clearwater speeding reel got <b>62 times</b> more views than the page has followers.</p>
<p>Take that one reel away and their week drops from <b>3.88M</b> to <b>475K</b>.</p></div>{FOOT}""")

slides[5] = page(5, f"""<h1>TikTok <em>scoreboard</em></h1>
<div class="sub">Three stations have a real TikTok crowd. Two are posting into empty rooms.</div>
{board("TikTok")}
<div class="call panel"><div class="lab">The callout</div>
<div class="narrow t" style="font-size:96px;color:#e03131;margin-top:14px">The graveyard</div>
<p><b>WFTV:</b> 2,543 followers. A normal post gets about 334 views.</p>
<p><b>Spectrum News 13:</b> 2,995 followers. Two posts got <b>0 views</b>. Not low. Zero.</p>
<p>The big tier: FOX 35 at <b>239.8K</b>, WESH at <b>79.1K</b>, WKMG at <b>65K</b>.</p></div>{FOOT}""")

# ---------- 6 YouTube ----------
if YT_OK:
    sts = sorted(STATIONS, key=lambda s: (s in [x[0] for x in SKIP], -(n(D[(s, "YouTube")]["median_views"]) or 0)))
    h = """<div class="yhd"><div></div><div></div><div class="grp" style="border-color:#2f6fed">SHORTS</div><div class="grp" style="border-color:#f5c518">LONG-FORM</div></div>
<div class="yrw lab" style="height:40px;background:none"><div>Station</div><div class="r">Subscribers</div>
<div class="tri"><span>Posts</span><span>Total views</span><span>Median</span></div><div class="tri"><span>Posts</span><span>Total views</span><span>Median</span></div></div>"""
    def tri(r, color):
        if not r or not n(r["posts_7d"]):
            return '<div class="tri none"><span></span><span class="narrow" style="grid-column:1/4;text-align:center;font-size:32px;color:#8b93a7">No Shorts posted</span></div>'
        flag = '<i class="vf">VIRAL</i>' if r["viral_flag"] == "YES" else ""
        return f'<div class="tri"><span class="narrow">{r["posts_7d"]}</span><span class="narrow">{fmt(r["total_views"])}{flag}</span><span class="narrow m" style="color:{color}">{fmt(r["median_views"])}</span></div>'
    for s in sts:
        star = "*" if (s, "YouTube") in SKIP else ""
        h += f"""<div class="yrw panel{' natl' if star else ''}"><div class="st">{logo(s, 80)}<span class="narrow">{NAME[s]}{star}</span></div>
<div class="r narrow sb">{fmt(D[(s, 'YouTube')]['followers'])}</div>{tri(D.get((s, 'YouTube Shorts')), '#5b8ff5')}{tri(D.get((s, 'YouTube Long-form')), '#f5c518')}</div>"""
    slides[6] = page(6, f"""<h1>YouTube <em>scoreboard</em></h1>
<div class="sub">__YT_SUB__</div>
<div class="yt">{h}</div>
<div class="foot" style="width:1560px">__YT_FOOT__</div>""",
""".yt{position:absolute;left:72px;top:262px;width:1776px}
.yhd,.yrw{display:grid;grid-template-columns:430px 200px 1fr 1fr;column-gap:24px;align-items:center;padding:0 28px}
.yhd{height:44px}.grp{font:700 22px Arial;letter-spacing:4px;text-align:center;border-bottom:5px solid;padding-bottom:8px;color:#fff}
.yrw{height:106px;margin-top:8px}.yrw .st{display:flex;align-items:center;gap:22px;font-size:34px}
.r{text-align:right}.sb{font-size:42px}
.tri{display:grid;grid-template-columns:110px 1fr 1fr;text-align:right;align-items:center}
.yrw.panel .tri span{font-size:42px}.yrw.panel .tri span.m{font-size:66px;line-height:1}
.vf{font:700 14px Arial;letter-spacing:2px;background:#e03131;color:#fff;border-radius:5px;padding:3px 7px;margin-left:8px;vertical-align:middle;font-style:normal}
.natl{opacity:.62}
""")
else:
    slides[6] = page(6, """<h1>YouTube <em>scoreboard</em></h1>
<div class="panel" style="position:absolute;left:72px;top:300px;width:1776px;height:640px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px dashed #e03131">
<div class="narrow" style="font-size:120px;color:#e03131">PLACEHOLDER</div>
<div style="font-size:36px;color:#c3c9d6;margin-top:20px">YouTube data could not be pulled. This slide is waiting on the data.</div></div>""")

# ---------- 7 one post ----------
def pc(x):
    return float(x.strip("%")) / 100
WHAT = {("FOX35", "TikTok"): "Bloodhound K9 video", ("SPECTRUM13", "Instagram"): "Clearwater speeding reel",
        ("WFTV", "TikTok"): "One bodycam video"}
bars = []
for s in STATIONS:
    cands = [(pc(D[(s, p)]["top_post_share"]), p) for p in PLATS if (s, p) in D and (s, p) not in SKIP and D[(s, p)]["top_post_share"]]
    share, p = max(cands)
    r = D[(s, p)]
    flagged = any(D[(s, q)]["viral_flag"] == "YES" for q in PLATS if (s, q) in D and (s, q) not in SKIP)
    tops = [n(D[(s, q)]["top_post_views"]) or 0 for q in PLATS if (s, q) in D and (s, q) not in SKIP]
    tot = sum(n(D[(s, q)]["total_views"]) or 0 for q in PLATS if (s, q) in D and (s, q) not in SKIP)
    bars.append((share, s, p, r, flagged, max(tops) / tot))
bars.sort(key=lambda b: -b[0])
PX = 1400  # px for 100%
bh = ""
for share, s, p, r, flagged, allshare in bars:
    col = "#e03131" if flagged else "#2f6fed"
    what = WHAT.get((s, p), "Top post")
    detail = f"{what} on {p}: {fmt(r['top_post_views'])} of {fmt(r['total_views'])} views that week"
    inside = share > .55
    pos = f"right:{PX - share * PX + 22:.0f}px;text-align:right" if inside else f"left:{share * PX + 20:.0f}px"
    tag = '<span class="tag">VIRAL SKEW</span>' if flagged and not inside else ""
    bh += f"""<div class="brow">{logo(s, 92)}<div class="bname narrow">{NAME[s]}</div>
<div class="track"><i style="width:{share * PX:.0f}px;background:{col}"></i>
<div class="bv narrow{' in' if inside else ''}" style="{pos}">{share * 100:.0f}%{tag}<small>{detail}</small></div></div></div>"""
slides[7] = page(7, f"""<h1>One post is doing <em>all the work</em></h1>
<div class="sub">On each station's most lopsided platform, how much of the week's views came from one single post.</div>
<div class="chart"><div class="line" style="left:{370 + PX / 3:.0f}px"><span>THE VIRAL LINE: ONE THIRD</span></div>{bh}</div>
<div class="legend"><i style="background:#e03131"></i>Red = viral skew. One post made more than a third of a week. <i style="background:#2f6fed;margin-left:36px"></i>Blue = no viral skew. Views were spread across many posts.</div>""",
""".chart{position:absolute;left:72px;top:330px;width:1776px;height:610px}
.brow{display:flex;align-items:center;height:104px;margin-bottom:14px;position:relative}
.bname{width:278px;font-size:34px;padding-left:20px;line-height:1.05}
.track{position:relative;height:84px;flex:1}
.track i{display:block;height:84px;border-radius:0 6px 6px 0;min-width:4px}
.bv{position:absolute;top:0;height:84px;font-size:58px;line-height:1;white-space:nowrap;background:#0b0f1a;padding:0 12px 0 0}
.bv.in{background:none;padding:0;display:flex;flex-direction:row-reverse;align-items:center;gap:24px}
.bv.in small{margin:0;font-size:23px}
.bv small{display:block;font:400 21px Arial;color:#c3c9d6;margin-top:3px}
.bv.in small{color:#fff}
.tag{font:700 15px Arial;letter-spacing:2px;background:#e03131;color:#fff;border-radius:5px;padding:4px 8px;margin-left:14px;vertical-align:middle;position:relative;top:-6px}
.line{position:absolute;top:-40px;bottom:30px;border-left:3px dashed #f5c518}
.line span{position:absolute;top:-4px;left:12px;font:700 17px Arial;letter-spacing:2.5px;color:#f5c518;white-space:nowrap}
.legend{position:absolute;left:72px;bottom:44px;font-size:21px;color:#c3c9d6}
.legend i{display:inline-block;width:18px;height:18px;border-radius:4px;margin-right:10px;vertical-align:-2px}
""")

# ---------- 8 power rankings ----------
rh = """<div class="prw lab" style="height:44px;background:none"><div></div><div>Station and verdict</div>
<div class="c">1. Median views<br>per post</div><div class="c">2. Weekly views<br>minus top post</div><div class="c">3. Posts<br>per week</div><div class="c">4. Views per<br>follower</div><div class="c">Score</div></div>"""
def cell(r, key, text):
    rank = r[key + "_rank"]
    return f'<div class="c"><span class="narrow cv{" best" if rank == 1 else ""}">{text}</span><small>#{rank} · {r[key + "_pts"]} pts</small></div>'
for r in RK["ranking"]:
    s = r["station"]
    rh += f"""<div class="prw panel"><div class="rank narrow">{r['final_rank']}</div>
<div class="st">{logo(s, 100)}<div><div class="narrow nm" style="white-space:nowrap">{NAME[s]} <span class="gold">{VERDICT[s][0]}</span></div><div class="vd">{VERDICT[s][1]}</div></div></div>
{cell(r, 'median_avg', fmt(r['median_avg']))}{cell(r, 'views_ex_top', fmt(r['views_ex_top']))}{cell(r, 'posts', r['posts'])}{cell(r, 'views_per_follower', f"{r['views_per_follower']:.2f}")}
<div class="c"><span class="narrow sc">{r['score']}</span><small>of 50</small></div></div>"""
slides[8] = page(8, f"""<h1>The final <em>power rankings</em></h1>
<div class="pr">{rh}</div>
<div class="foot" style="width:1560px">__PR_FOOT__</div>""",
""".pr{position:absolute;left:72px;top:212px;width:1776px}
.prw{display:grid;grid-template-columns:96px 690px 1fr 1fr 1fr 1fr 150px;align-items:center;padding:0 24px 0 8px}
.prw.lab{font-size:16px;letter-spacing:2px;line-height:1.3;height:56px!important;align-items:end;padding-bottom:6px}
.prw.panel{height:128px;margin-top:10px}
.rank{font-size:104px;color:#f5c518;text-align:center;line-height:1}
.st{display:flex;align-items:center;gap:22px}.nm{font-size:33px;line-height:1.05}.vd{font-size:23px;color:#c3c9d6;margin-top:6px}
.c{text-align:right}.cv{font-size:46px;line-height:1;display:block}.cv.best{color:#f5c518}
.c small{font-size:18px;color:#8b93a7;letter-spacing:1px}
.sc{font-size:76px;line-height:1;display:block;color:#fff}
""")

# ---------- 9 method ----------
bul = [
    ("Same 7 days for everyone", "Every station was measured over the same week: Nov 6-13, 2026."),
    ("Public view counts only", "We used the numbers anyone can see on each post. No inside data."),
    ("Reels and video only on Facebook", "Facebook only shows public view counts on video, so that is what we counted."),
    ("Medians over averages", "The median is the middle post. One viral hit cannot bend it the way it bends an average."),
    ("Viral flag at one third", "If a single post made more than a third of a week's views, we flagged it."),
]
bl = "".join(f'<div class="b panel"><div class="bn narrow">{i}</div><div><div class="bt narrow">{t}</div><div class="bd">{d}</div></div></div>'
             for i, (t, d) in enumerate(bul, 1))
slides[9] = page(9, f"""<h1>How we <em>did this</em></h1>
<div class="bl">{bl}</div>
<div class="foot" style="width:1560px">__METHOD_FOOT__</div>""",
""".bl{position:absolute;left:72px;top:232px;width:1776px}
.b{display:flex;align-items:center;gap:36px;height:126px;margin-bottom:12px;padding:0 36px}
.bn{font-size:96px;color:#f5c518;width:70px;text-align:center;line-height:1}
.bt{font-size:46px;text-transform:uppercase;line-height:1.05}.bd{font-size:27px;color:#c3c9d6;margin-top:6px}
""")

NOTES = json.load(open("slide_notes.json")) if os.path.exists("slide_notes.json") else {}
os.makedirs("slides/html", exist_ok=True)
for i, h in slides.items():
    for k, v in NOTES.items():
        h = h.replace(f"__{k}__", v)
    assert "—" not in h and "–" not in h, f"dash found in slide {i}"
    assert "__" not in h.split("</style>")[1].split("base64")[0], f"unfilled note in slide {i}"
    open(f"slides/html/slide-{i:02d}.html", "w").write(h)
print("built", len(slides), "slides; YouTube data:", YT_OK)
