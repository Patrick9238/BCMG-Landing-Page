#!/usr/bin/env python3
"""Build the episode thumbnail (1280x720) as self-contained HTML, then screenshot at 2x.
Brand rules: neon logo and Patrick photo are used as-is (uniform scale and crop only)."""
import base64, subprocess
def uri(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = "../assets/img/"
logos = [("FOX35.png", "image/png"), ("WESH.png", "image/png"), ("WFTV.png", "image/png"), ("WKMG.jpg", "image/jpeg"), ("SPECTRUM13.svg", "image/svg+xml")]
row = "".join(f'<img src="{uri("logos/" + f, m)}">' for f, m in logos)
html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Media Check thumbnail</title><style>
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1280px;height:720px;overflow:hidden}}
body{{position:relative;background:#0b0f1a;color:#fff;font-family:"Arial Narrow","Liberation Sans Narrow",Arial,sans-serif;font-weight:700}}
.glow{{position:absolute;right:-160px;top:-60px;width:900px;height:900px;background:radial-gradient(circle,#2f6fed 0%,rgba(47,111,237,.35) 35%,rgba(11,15,26,0) 68%)}}
.pat{{position:absolute;right:-170px;bottom:-150px;width:880px;height:880px;filter:drop-shadow(0 0 28px rgba(0,0,0,.7))}}
.show{{position:absolute;left:28px;top:6px;width:190px;height:190px}}
.tag{{position:absolute;left:232px;top:66px;background:#e03131;font-size:50px;line-height:1;padding:10px 20px 8px;letter-spacing:1px;transform:rotate(-2deg)}}
.l1{{position:absolute;left:44px;top:196px;font-size:112px;line-height:.95;text-shadow:0 4px 0 #000}}
.l1 s{{text-decoration-color:#e03131;text-decoration-thickness:10px}}
.l2{{position:absolute;left:44px;top:400px;font-size:142px;line-height:.9;color:#f5c518;text-shadow:0 6px 0 #000}}
.row{{position:absolute;left:44px;bottom:30px;display:flex;gap:14px;align-items:center}}
.row img{{width:92px;height:92px;border-radius:12px;object-fit:cover;box-shadow:0 0 0 3px #0b0f1a}}
.fade{{position:absolute;left:0;top:0;width:740px;height:720px;background:linear-gradient(90deg,#0b0f1a 78%,rgba(11,15,26,0))}}
</style></head><body>
<div class="glow"></div>
<img class="pat" src="{uri(IMG + 'patrick-pointing.png')}" alt="Patrick Carr">
<div class="fade"></div>
<img class="show" src="{uri(IMG + 'logo-neon.png')}" alt="The Patrick Carr Show">
<div class="tag">THE FOLLOWER LIE</div>
<div class="l1">2.1 MILLION<br>FOLLOWERS.</div>
<div class="l2">2,500 VIEWS.</div>
<div class="row">{row}</div>
</body></html>"""
assert "—" not in html
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
