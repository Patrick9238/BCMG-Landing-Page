#!/usr/bin/env python3
"""Build the episode thumbnail (1280x720) as self-contained HTML, then screenshot at 2x.
Brand rules: neon logo and Patrick photo are used as-is (uniform scale and crop only)."""
import base64, subprocess
def uri(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = "../assets/img/"
logos = [("FOX35.png", "image/png"), ("WESH.png", "image/png"), ("WFTV.png", "image/png"), ("WKMG.jpg", "image/jpeg"), ("SPECTRUM13.svg", "image/svg+xml")]
KNIGHT = """<svg class="armor" viewBox="0 0 150 220" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="st" x1="0" x2="1"><stop offset="0" stop-color="#6b7688"/><stop offset=".45" stop-color="#e6ecf5"/><stop offset="1" stop-color="#7d8798"/></linearGradient></defs>
<g stroke="#05070d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<path d="M44 156 L62 156 L52 204 L30 204 Z" fill="url(#st)"/><path d="M90 156 L108 156 L124 204 L102 204 Z" fill="url(#st)"/>
<rect x="22" y="200" width="34" height="12" rx="5" fill="#3a4252"/><rect x="98" y="200" width="36" height="12" rx="5" fill="#3a4252"/>
<path d="M80 12 Q58 -16 26 0 Q50 4 60 26 Z" fill="PLUME"/>
<path d="M52 66 L52 38 Q52 8 80 8 Q108 8 108 38 L108 66 Z" fill="url(#st)"/>
<rect x="60" y="62" width="40" height="9" rx="3" fill="#8a94a6"/>
<path d="M74 34 L108 34 L108 43 L74 43 Z" fill="#05070d"/><path d="M92 20 L92 62" stroke-width="3" fill="none"/>
<path d="M172 -34 L142 54" stroke="#05070d" stroke-width="13" fill="none"/><path d="M172 -34 L142 54" stroke="#f4f8ff" stroke-width="7" fill="none"/>
<path d="M128 47 L157 59" stroke="#f5c518" stroke-width="8" fill="none"/>
<path d="M118 92 L140 62" stroke="#05070d" stroke-width="20" fill="none"/><path d="M118 92 L140 62" stroke="#aeb7c6" stroke-width="14" fill="none"/>
<circle cx="141" cy="60" r="10" fill="#dfe5ef"/>
</g></svg>"""
SPARK = '<svg class="spark" style="left:{x}px;top:{y}px" viewBox="-50 -50 100 100"><path d="M0 -48 L9 -12 L44 -22 L16 2 L40 34 L4 16 L-14 46 L-12 12 L-46 6 L-14 -8 L-26 -40 Z" fill="#fff3b0" stroke="#f5c518" stroke-width="4"/></svg>'
PLUMES = ["#e03131", "#2f6fed", "#f5c518", "#e03131", "#2f6fed"]
#           x, faces left?, lean
POSE = [(0, False, 4), (142, True, -4), (302, False, 4), (444, True, -4), (602, True, -7)]
knights = ""
for (f, m), (x, left, lean), plume in zip(logos, POSE, PLUMES):
    flip = "transform:scaleX(-1)" if left else ""
    knights += (f'<div class="kn" style="left:{x}px;transform:rotate({lean}deg)"><img src="{uri("logos/" + f, m)}">'
                f'<div style="position:absolute;inset:0;{flip}">{KNIGHT.replace("PLUME", plume)}</div></div>')
knights += SPARK.format(x=109, y=-26) + SPARK.format(x=411, y=-26)
row = "".join(f'<img src="{uri("logos/" + f, m)}">' for f, m in logos)
CROWN = """<svg class="crown" viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><path d="M8 72 L2 20 L32 44 L60 4 L88 44 L118 20 L112 72 Z" fill="#f5c518" stroke="#0b0f1a" stroke-width="5" stroke-linejoin="round"/><rect x="8" y="70" width="104" height="12" rx="3" fill="#f5c518" stroke="#0b0f1a" stroke-width="4"/><circle cx="60" cy="50" r="7" fill="#e03131"/><circle cx="32" cy="58" r="5" fill="#2f6fed"/><circle cx="88" cy="58" r="5" fill="#2f6fed"/></svg>"""
html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Media Check thumbnail</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1280px;height:720px;overflow:hidden}}
body{{position:relative;background:#05070d;color:#fff;font-family:"Arial Narrow","Liberation Sans Narrow",Arial,sans-serif;font-weight:700}}
/* cinematic light: blue key light behind Patrick, warm gold rim low left, hard beam from top right */
.key{{position:absolute;right:-220px;top:-140px;width:1040px;height:1040px;background:radial-gradient(circle,rgba(47,111,237,.95) 0%,rgba(47,111,237,.38) 32%,rgba(5,7,13,0) 66%)}}
.warm{{position:absolute;left:-200px;bottom:-330px;width:1100px;height:640px;background:radial-gradient(ellipse,rgba(245,197,24,.30) 0%,rgba(245,197,24,0) 65%)}}
.beam{{position:absolute;right:120px;top:-200px;width:340px;height:1200px;transform:rotate(24deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(160,200,255,.16),rgba(255,255,255,0));filter:blur(18px)}}
.pat{{position:absolute;right:-170px;bottom:-150px;width:880px;height:880px;filter:drop-shadow(-14px 0 34px rgba(47,111,237,.55)) drop-shadow(0 0 30px rgba(0,0,0,.8))}}
.fade{{position:absolute;left:0;top:0;width:760px;height:720px;background:linear-gradient(90deg,#05070d 62%,rgba(5,7,13,0))}}
.vig{{position:absolute;inset:0;background:radial-gradient(ellipse at 58% 46%,rgba(0,0,0,0) 46%,rgba(0,0,0,.72) 100%)}}
.grain{{position:absolute;inset:0;opacity:.13;mix-blend-mode:overlay}}
.show{{position:absolute;left:22px;top:0;width:160px;height:160px}}
.tag{{position:absolute;left:196px;top:54px;background:#e03131;font-size:44px;line-height:1;padding:10px 20px 8px;letter-spacing:3px;transform:rotate(-2deg);box-shadow:6px 6px 0 #000}}
.h{{position:absolute;left:150px;top:128px;font-size:100px;line-height:.96;letter-spacing:1px;text-shadow:0 5px 0 #000,0 0 40px rgba(0,0,0,.9)}}
.k{{position:absolute;left:36px;top:226px;font-size:248px;line-height:1;transform:rotate(-3deg);transform-origin:left bottom;
    background:linear-gradient(180deg,#fff3b0 0%,#f5c518 42%,#b8860b 100%);-webkit-background-clip:text;color:transparent;
    filter:drop-shadow(0 7px 0 #000) drop-shadow(0 0 34px rgba(245,197,24,.45))}}
.k i{{font-style:normal;-webkit-text-fill-color:#e03131}}
.crown{{position:absolute;left:-14px;top:-52px;width:120px;transform:rotate(-14deg);filter:drop-shadow(0 4px 0 #000)}}
.battle{{position:absolute;left:26px;top:474px;width:760px;height:230px}}
.kn{{position:absolute;top:0;width:150px;height:220px;transform-origin:50% 100%;filter:drop-shadow(0 10px 10px rgba(0,0,0,.85))}}
.kn img{{position:absolute;left:23px;top:60px;width:104px;height:104px;border-radius:14px;object-fit:cover;box-shadow:0 0 0 4px #e6ecf5,0 0 0 7px #05070d,0 0 26px rgba(245,197,24,.5)}}
.armor{{position:absolute;inset:0;width:150px;height:220px;overflow:visible}}
.spark{{position:absolute;width:74px;height:74px;filter:drop-shadow(0 0 14px #f5c518) drop-shadow(0 0 30px rgba(245,197,24,.8))}}
.dust{{position:absolute;left:0;top:640px;width:800px;height:90px;background:radial-gradient(ellipse at 45% 60%,rgba(245,197,24,.22),rgba(245,197,24,0) 70%);filter:blur(6px)}}
</style></head><body>
<div class="key"></div><div class="beam"></div>
<img class="pat" src="{uri(IMG + 'patrick-pointing.png')}" alt="Patrick Carr">
<div class="fade"></div><div class="warm"></div><div class="vig"></div>
<svg class="grain" width="1280" height="720"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1280" height="720" filter="url(#g)"/></svg>
<img class="show" src="{uri(IMG + 'logo-neon.png')}" alt="The Patrick Carr Show">
<div class="tag">ORLANDO NEWS</div>
<div class="h">WHO'S THE</div>
<div class="k">{CROWN}KING<i>?</i></div>
<div class="dust"></div><div class="battle">{knights}</div>
</body></html>"""
assert "\u2014" not in html
open("thumbnail/thumbnail.html", "w").write(html)
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const p=await(await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:2})).newPage();
await p.goto('file://'+process.argv[1]+'/thumbnail.html');await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:process.argv[1]+'/thumbnail.png'});await b.close();})();"""
import os
subprocess.run(["node", "-e", js, os.path.abspath("thumbnail")], check=True)
from PIL import Image
im = Image.open("thumbnail/thumbnail.png").convert("RGB")
im.resize((1280, 720), Image.LANCZOS).save("thumbnail/thumbnail-1280x720.jpg", quality=92)
print(im.size, os.path.getsize("thumbnail/thumbnail.png") // 1024, "KB")
