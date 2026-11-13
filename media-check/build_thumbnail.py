#!/usr/bin/env python3
"""Build the episode thumbnail (1280x720) as self-contained HTML, then screenshot at 2x.
Brand rules: neon logo and Patrick photo are used as-is (uniform scale and crop only)."""
import base64, subprocess
def uri(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = "../assets/img/"
logos = [("FOX35.png", "image/png"), ("WESH.png", "image/png"), ("WFTV.png", "image/png"), ("WKMG.jpg", "image/jpeg"), ("SPECTRUM13.svg", "image/svg+xml")]
row = "".join(f'<img src="{uri("logos/" + f, m)}">' for f, m in logos)
CROWN = """<svg class="crown" viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg"><path d="M8 72 L2 20 L32 44 L60 4 L88 44 L118 20 L112 72 Z" fill="#f5c518" stroke="#0b0f1a" stroke-width="5" stroke-linejoin="round"/><rect x="8" y="70" width="104" height="12" rx="3" fill="#f5c518" stroke="#0b0f1a" stroke-width="4"/><circle cx="60" cy="50" r="7" fill="#e03131"/><circle cx="32" cy="58" r="5" fill="#2f6fed"/><circle cx="88" cy="58" r="5" fill="#2f6fed"/></svg>"""
html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Media Check thumbnail</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1280px;height:720px;overflow:hidden}}
body{{position:relative;background:#0b0f1a;color:#fff;font-family:"Arial Narrow","Liberation Sans Narrow",Arial,sans-serif;font-weight:700}}
.glow{{position:absolute;right:-160px;top:-60px;width:900px;height:900px;background:radial-gradient(circle,#2f6fed 0%,rgba(47,111,237,.35) 35%,rgba(11,15,26,0) 68%)}}
.pat{{position:absolute;right:-170px;bottom:-150px;width:880px;height:880px;filter:drop-shadow(0 0 28px rgba(0,0,0,.7))}}
.fade{{position:absolute;left:0;top:0;width:740px;height:720px;background:linear-gradient(90deg,#0b0f1a 78%,rgba(11,15,26,0))}}
.show{{position:absolute;left:24px;top:2px;width:176px;height:176px}}
.tag{{position:absolute;left:212px;top:44px;background:#e03131;font-size:36px;line-height:1.05;padding:10px 18px 8px;letter-spacing:.5px;transform:rotate(-2deg);box-shadow:6px 6px 0 #000}}
.h{{position:absolute;left:40px;top:170px;font-size:150px;line-height:.96;text-shadow:0 6px 0 #000}}
.h .k{{color:#f5c518;font-size:262px;line-height:.82;display:inline-block;transform:rotate(-3deg);transform-origin:left bottom}}
.h .q{{color:#e03131}}
.row{{position:absolute;left:40px;bottom:26px;display:flex;gap:12px;align-items:flex-end}}
.row img{{width:96px;height:96px;border-radius:12px;object-fit:cover;box-shadow:0 0 0 3px #0b0f1a}}
.mystery{{position:relative;width:96px;height:96px;border-radius:12px;border:4px dashed #f5c518;background:#111827;color:#f5c518;font-size:80px;line-height:88px;text-align:center}}
.crown{{position:absolute;left:14px;top:-58px;width:92px;transform:rotate(12deg);filter:drop-shadow(0 4px 0 #000)}}
</style></head><body>
<div class="glow"></div>
<img class="pat" src="{uri(IMG + 'patrick-pointing.png')}" alt="Patrick Carr">
<div class="fade"></div>
<img class="show" src="{uri(IMG + 'logo-neon.png')}" alt="The Patrick Carr Show">
<div class="tag">WHERE DOES CENTRAL FLORIDA<br>REALLY GET ITS NEWS?</div>
<div class="h">WHO'S THE<br><span class="k">KING<span class="q">?</span></span></div>
<div class="row">{row}<div class="mystery">?{CROWN}</div></div>
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
