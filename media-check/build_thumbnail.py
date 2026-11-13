#!/usr/bin/env python3
"""Build the episode thumbnail (1280x720) as self-contained HTML, then screenshot at 2x.
Background: thumbnail/knights-background.jpg (supplied by Patrick). Station logos are placed
unmodified on the shields. Brand rules: neon logo and Patrick photo are scale and crop only."""
import base64, os, subprocess
def uri(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = "../assets/img/"
K = 1280 / 1672  # background scale
# logo, mime, center x/y in background pixels, size px (thumbnail), rotate deg, rotateY deg
SHIELDS = [
    ("FOX35.png", "image/png", 283, 512, 132, 5, 18),        # front left
    ("WESH.png", "image/png", 826, 572, 126, -7, -14),       # front right
    ("WFTV.png", "image/png", 700, 362, 74, 2, 10),          # centre, on the steps
    ("WKMG.jpg", "image/jpeg", 281, 262, 60, -6, -16),       # back left
    ("SPECTRUM13.svg", "image/svg+xml", 1012, 330, 54, 4, 14),  # back right
]
logos = "".join(
    f'<img class="lg" src="{uri("logos/" + f, m)}" style="left:{x * K - s / 2:.0f}px;top:{y * K - s / 2:.0f}px;width:{s}px;height:{s}px;'
    f'transform:perspective(600px) rotateY({ry}deg) rotate({r}deg)">' for f, m, x, y, s, r, ry in SHIELDS)
CROWN = """<svg class="crown" viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><path d="M8 72 L2 20 L32 44 L60 4 L88 44 L118 20 L112 72 Z" fill="#f5c518" stroke="#0b0f1a" stroke-width="5" stroke-linejoin="round"/><rect x="8" y="70" width="104" height="12" rx="3" fill="#f5c518" stroke="#0b0f1a" stroke-width="4"/><circle cx="60" cy="50" r="7" fill="#e03131"/><circle cx="32" cy="58" r="5" fill="#2f6fed"/><circle cx="88" cy="58" r="5" fill="#2f6fed"/></svg>"""
html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Media Check thumbnail</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1280px;height:720px;overflow:hidden}}
body{{position:relative;background:#05070d;color:#fff;font-family:"Arial Narrow","Liberation Sans Narrow",Arial,sans-serif;font-weight:700}}
.bg{{position:absolute;left:0;top:0;width:1280px;height:720px;object-fit:cover}}
.lg{{position:absolute;border-radius:12%;object-fit:cover;box-shadow:0 0 0 2px rgba(255,255,255,.85),0 6px 18px rgba(0,0,0,.75)}}
.key{{position:absolute;right:-260px;top:-80px;width:900px;height:900px;background:radial-gradient(circle,rgba(47,111,237,.55) 0%,rgba(47,111,237,.18) 36%,rgba(5,7,13,0) 64%)}}
.pat{{position:absolute;right:-190px;bottom:-150px;width:800px;height:800px;filter:drop-shadow(-10px 0 30px rgba(47,111,237,.5)) drop-shadow(0 0 26px rgba(0,0,0,.85))}}
.base{{position:absolute;left:0;bottom:0;width:1280px;height:250px;background:linear-gradient(180deg,rgba(5,7,13,0),rgba(5,7,13,.92) 62%)}}
.vig{{position:absolute;inset:0;background:radial-gradient(ellipse at 45% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.6) 100%)}}
.show{{position:absolute;right:2px;top:-6px;width:168px;height:168px}}
.tag{{position:absolute;left:822px;top:40px;background:#e03131;font-size:34px;line-height:1;padding:9px 16px 7px;letter-spacing:3px;transform:rotate(-2deg);box-shadow:5px 5px 0 #000}}
.h{{position:absolute;left:30px;bottom:14px;font-size:112px;line-height:1;white-space:nowrap;text-shadow:0 5px 0 #000,0 0 30px #000}}
.h u{{text-decoration-color:#e03131;text-decoration-thickness:8px;text-underline-offset:9px}}
.k{{position:relative;display:inline-block;margin-left:10px;background:linear-gradient(180deg,#fff3b0 0%,#f5c518 45%,#b8860b 100%);-webkit-background-clip:text;color:transparent;
    text-shadow:none;filter:drop-shadow(0 5px 0 #000) drop-shadow(0 0 26px rgba(245,197,24,.55))}}
.k i{{font-style:normal;-webkit-text-fill-color:#e03131}}
.crown{{position:absolute;left:-22px;top:-34px;width:70px;transform:rotate(-16deg);filter:drop-shadow(0 3px 0 #000)}}
</style></head><body>
<img class="bg" src="{uri('thumbnail/knights-background.jpg', 'image/jpeg')}" alt="">
{logos}
<div class="key"></div><div class="vig"></div>
<img class="pat" src="{uri(IMG + 'patrick-pointing.png')}" alt="Patrick Carr">
<div class="base"></div>
<img class="show" src="{uri(IMG + 'logo-neon.png')}" alt="The Patrick Carr Show">
<div class="tag">ORLANDO NEWS</div>
<div class="h">WHO'S <u>REALLY</u> THE <span class="k">{CROWN}KING<i>?</i></span></div>
</body></html>"""
assert "—" not in html
open("thumbnail/thumbnail.html", "w").write(html)
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const p=await(await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:2})).newPage();
await p.goto('file://'+process.argv[1]+'/thumbnail.html');await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:process.argv[1]+'/thumbnail.png'});await b.close();})();"""
subprocess.run(["node", "-e", js, os.path.abspath("thumbnail")], check=True)
from PIL import Image
im = Image.open("thumbnail/thumbnail.png").convert("RGB")
im.resize((1280, 720), Image.LANCZOS).save("thumbnail/thumbnail-1280x720.jpg", quality=92)
print(im.size, os.path.getsize("thumbnail/thumbnail.png") // 1024, "KB")
