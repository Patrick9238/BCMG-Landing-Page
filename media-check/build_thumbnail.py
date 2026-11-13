#!/usr/bin/env python3
"""Build the episode thumbnail (1280x720) as self-contained HTML, then screenshot at 2x.
Brand rules: neon logo and Patrick photo are used as-is (uniform scale and crop only)."""
import base64, subprocess
def uri(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()
IMG = "../assets/img/"
logos = [("FOX35.png", "image/png"), ("WESH.png", "image/png"), ("WFTV.png", "image/png"), ("WKMG.jpg", "image/jpeg"), ("SPECTRUM13.svg", "image/svg+xml")]
# Knights: drawn armored figures; each carries a shield with the UNMODIFIED station logo on it.
KNIGHT = """<svg class="armor" viewBox="0 0 140 230" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ar" x1="0" x2="1"><stop offset="0" stop-color="#05070d"/><stop offset=".55" stop-color="#2a3447"/><stop offset="1" stop-color="#8fa0bd"/></linearGradient>
<linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="CAPE"/><stop offset="1" stop-color="#05070d"/></linearGradient>
<linearGradient id="bl" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7f8da6"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe0ff"/></linearGradient>
<linearGradient id="sh" x1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f5fb"/><stop offset=".5" stop-color="#8794aa"/><stop offset="1" stop-color="#2a3447"/></linearGradient>
</defs>
<path d="M56 60 C26 84 10 136 2 204 L20 192 L30 206 L44 186 C46 136 54 104 68 82 Z" fill="url(#cp)" stroke="#05070d" stroke-width="2"/>
<g fill="url(#ar)" stroke="#05070d" stroke-width="2" stroke-linejoin="round">
<path d="M58 126 L40 176 L28 216 L18 224 L50 224 L52 214 L62 180 L78 138 Z"/>
<path d="M72 126 L100 168 L104 214 L98 224 L134 224 L122 212 L116 162 L94 120 Z"/>
<path d="M50 66 L94 60 L100 96 L92 134 L56 136 L48 98 Z"/>
<path d="M96 66 L112 40 L122 46 L106 78 Z"/>
<circle cx="52" cy="68" r="14"/><circle cx="95" cy="63" r="14"/>
<path d="M60 52 L60 24 Q60 6 75 6 Q90 6 90 24 L92 52 Z"/>
</g>
<path d="M74 6 Q62 -16 40 -4 Q56 0 64 16 Z" fill="CAPE" stroke="#05070d" stroke-width="2"/>
<path d="M72 26 L91 26 L91 32 L72 32 Z M82 14 L82 50" fill="#05070d" stroke="#05070d" stroke-width="2"/>
<path d="M90 24 Q91 10 80 7 M108 64 Q104 54 96 50 M118 162 L122 212" fill="none" stroke="#cfe0ff" stroke-width="1.6" opacity=".8"/>
<path d="M116 42 L156 -44" stroke="#05070d" stroke-width="10" stroke-linecap="round"/>
<path d="M116 42 L156 -44" stroke="url(#bl)" stroke-width="5.5" stroke-linecap="round"/>
<path d="M104 30 L130 44" stroke="#f5c518" stroke-width="6" stroke-linecap="round"/>
<circle cx="114" cy="48" r="5" fill="#f5c518" stroke="#05070d" stroke-width="2"/>
<path d="M30 58 H134 V114 Q134 158 82 182 Q30 158 30 114 Z" fill="url(#sh)" stroke="#05070d" stroke-width="3"/>
<path d="M34 62 H130 V114 Q130 155 82 177 Q34 155 34 114 Z" fill="none" stroke="#f5c518" stroke-width="2.5"/>
</svg>"""
THRONE = """<svg class="throne" viewBox="0 0 120 250" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="th" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#f5c518"/><stop offset="1" stop-color="#5a3e06"/></linearGradient></defs>
<g fill="url(#th)" stroke="#05070d" stroke-width="2.5" stroke-linejoin="round">
<path d="M28 150 L28 46 L40 60 L48 22 L60 2 L72 22 L80 60 L92 46 L92 150 Z"/>
<path d="M14 118 H30 V186 H14 Z M90 118 H106 V186 H90 Z"/>
<path d="M22 150 H98 V190 H22 Z"/>
<path d="M12 190 H108 V208 H12 Z"/><path d="M4 208 H116 V228 H4 Z"/><path d="M-6 228 H126 V250 H-6 Z"/>
</g>
<path d="M40 150 L40 74 L48 80 L60 30 L72 80 L80 74 L80 150 Z" fill="#8e1b1b" stroke="#05070d" stroke-width="2"/>
<circle cx="60" cy="16" r="5" fill="#e03131" stroke="#05070d" stroke-width="2"/>
</svg>"""
SPARK = '<svg class="spark" style="left:{x}px;top:{y}px" viewBox="-50 -50 100 100"><path d="M0 -48 L7 -10 L44 -22 L14 2 L40 34 L4 14 L-14 46 L-10 12 L-46 6 L-12 -8 L-26 -40 Z" fill="#ffffff" stroke="#f5c518" stroke-width="4"/></svg>'
CAPES = ["#9c1f1f", "#1f4fb8", "#9c1f1f", "#1f4fb8", "#9c1f1f"]
SC = 132 / 140  # knight box is 132px wide
#           x, faces left?
POSE = [(0, False), (126, True), (378, False), (504, True), (630, True)]
knights = ""
for (f, m), (x, left), cape in zip(logos, POSE, CAPES):
    flip = "transform:scaleX(-1)" if left else ""
    lx = (18 if left else 42) * SC  # logo sits centered on the shield, never mirrored
    knights += (f'<div class="kn" style="left:{x}px"><div style="position:absolute;inset:0;{flip}">{KNIGHT.replace("CAPE", cape)}</div>'
                f'<img src="{uri("logos/" + f, m)}" style="left:{lx:.1f}px;top:{66 * SC:.1f}px;width:{80 * SC:.1f}px;height:{80 * SC:.1f}px"></div>')
knights += SPARK.format(x=98, y=-52) + SPARK.format(x=476, y=-52)
embers = "".join(f'<i style="left:{(i * 137) % 760}px;top:{(i * 71) % 250 - 40}px;width:{2 + i % 3}px;height:{2 + i % 3}px;opacity:{.35 + (i % 5) * .13}"></i>' for i in range(34))
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
.h u{{text-decoration-color:#e03131;text-decoration-thickness:7px;text-underline-offset:8px}}
.h{{position:absolute;left:150px;top:134px;font-size:84px;line-height:.96;letter-spacing:1px;text-shadow:0 5px 0 #000,0 0 40px rgba(0,0,0,.9)}}
.k{{position:absolute;left:36px;top:226px;font-size:248px;line-height:1;transform:rotate(-3deg);transform-origin:left bottom;
    background:linear-gradient(180deg,#fff3b0 0%,#f5c518 42%,#b8860b 100%);-webkit-background-clip:text;color:transparent;
    filter:drop-shadow(0 7px 0 #000) drop-shadow(0 0 34px rgba(245,197,24,.45))}}
.k i{{font-style:normal;-webkit-text-fill-color:#e03131}}
.crown{{position:absolute;left:-14px;top:-52px;width:120px;transform:rotate(-14deg);filter:drop-shadow(0 4px 0 #000)}}
.battle{{position:absolute;left:14px;top:483px;width:762px;height:217px}}
.kn{{position:absolute;top:0;width:132px;height:217px;filter:drop-shadow(0 0 10px rgba(245,197,24,.35)) drop-shadow(0 12px 8px rgba(0,0,0,.9))}}
.kn img{{position:absolute;border-radius:8px;object-fit:cover}}
.armor{{position:absolute;inset:0;width:132px;height:217px;overflow:visible}}
.throne{{position:absolute;left:258px;top:-22px;width:116px;height:241px;overflow:visible;filter:drop-shadow(0 0 26px rgba(245,197,24,.9))}}
.halo{{position:absolute;left:66px;top:-150px;width:500px;height:500px;background:radial-gradient(circle,rgba(255,236,150,.85) 0%,rgba(245,197,24,.42) 22%,rgba(245,197,24,0) 62%)}}
.rays{{position:absolute;left:66px;top:-150px;width:500px;height:500px;background:repeating-conic-gradient(from 8deg,rgba(255,240,170,.20) 0 5deg,rgba(255,240,170,0) 5deg 19deg);-webkit-mask-image:radial-gradient(circle,#000 10%,transparent 66%)}}
.spark{{position:absolute;width:62px;height:62px;filter:drop-shadow(0 0 12px #fff) drop-shadow(0 0 26px #f5c518)}}
.floor{{position:absolute;left:-60px;top:690px;width:900px;height:44px;background:radial-gradient(ellipse at 45% 0%,rgba(245,197,24,.34),rgba(245,197,24,0) 70%)}}
.haze{{position:absolute;left:-40px;top:630px;width:880px;height:110px;background:radial-gradient(ellipse at 42% 70%,rgba(255,236,170,.30),rgba(245,197,24,0) 68%);filter:blur(8px)}}
.embers i{{position:absolute;border-radius:50%;background:#ffd76a;box-shadow:0 0 8px #f5c518}}
</style></head><body>
<div class="key"></div><div class="beam"></div>
<img class="pat" src="{uri(IMG + 'patrick-pointing.png')}" alt="Patrick Carr">
<div class="fade"></div><div class="warm"></div><div class="vig"></div>
<svg class="grain" width="1280" height="720"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1280" height="720" filter="url(#g)"/></svg>
<img class="show" src="{uri(IMG + 'logo-neon.png')}" alt="The Patrick Carr Show">
<div class="tag">ORLANDO NEWS</div>
<div class="h">WHO'S <u>REALLY</u> THE</div>
<div class="k">{CROWN}KING<i>?</i></div>
<div class="floor"></div><div class="battle"><div class="halo"></div><div class="rays"></div>{THRONE}{knights}<div class="embers">{embers}</div></div><div class="haze"></div>
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
