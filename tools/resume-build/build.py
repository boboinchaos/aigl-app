import base64, html, qrcode, qrcode.image.svg, io, json, pathlib

R = pathlib.Path(__file__).parent
D = json.loads((R / "content.json").read_text())
e = html.escape

def font(fam, w, f):
    b = base64.b64encode((R / "node_modules/@fontsource" / f).read_bytes()).decode()
    return f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{b}) format('woff2')}}"

fonts = "".join([
    font("Inter", w, f"inter/files/inter-latin-{w}-normal.woff2") for w in (400, 500, 600, 700)
] + [font("Space Grotesk", w, f"space-grotesk/files/space-grotesk-latin-{w}-normal.woff2") for w in (500, 600, 700)])

qr = qrcode.make(D["qr_url"], image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=0)
buf = io.BytesIO(); qr.save(buf)
qrsvg = buf.getvalue().decode().split("?>", 1)[-1]

def chips(items): return "".join(f"<span class='chip'>{e(i)}</span>" for i in items)

jobs = ""
for j in D["jobs"]:
    bullets = "".join(f"<li>{e(b)}</li>" for b in j["bullets"])
    jobs += f"""<div class='job'><div class='jh'><div><div class='jt'>{e(j['title'])}</div><div class='jo'>{e(j['org'])}</div></div><div class='jd'>{e(j['dates'])}</div></div><ul>{bullets}</ul></div>"""

edu = "".join(f"<div class='edu'><b>{e(x['name'])}</b><span>{e(x['detail'])}</span></div>" for x in D["education"])

page = f"""<!DOCTYPE html><html><head><meta charset='utf-8'><style>
{fonts}
@page{{size:Letter;margin:0}}
*{{box-sizing:border-box}}
html{{background:linear-gradient(90deg,#f3f6f9 2.15in,#e3e8ee 2.15in,#e3e8ee calc(2.15in + 1px),#fff calc(2.15in + 1px));-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{{margin:0;font:400 9.6pt/1.5 Inter,sans-serif;color:#2a2f37;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.top{{background:#0b0f17;color:#fff;padding:30px 40px 24px;position:relative;overflow:hidden}}
.top::before{{content:"";position:absolute;inset:0;background:radial-gradient(45% 120% at 0% 0%,rgba(34,197,139,.35),transparent 70%),radial-gradient(40% 120% at 100% 0%,rgba(56,120,255,.3),transparent 70%)}}
.top>*{{position:relative}}
.top::after{{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,#22c58b,#3878ff 55%,#8c5aff)}}
h1{{margin:0;font:700 30pt/1 'Space Grotesk',sans-serif;letter-spacing:-.02em}}
.role{{margin-top:7px;font:500 11.5pt 'Space Grotesk',sans-serif;color:#7be0b8;letter-spacing:.02em}}
.contact{{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px 18px;font-size:9pt;color:#c9d1dc}}
.contact span::before{{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#22c58b;margin:0 7px 1px 0}}
.wrap{{display:grid;grid-template-columns:2.15in 1fr}}
.side{{padding:28px 18px 30px 24px;-webkit-box-decoration-break:clone;box-decoration-break:clone}}
.main{{padding:28px 36px 34px 26px;-webkit-box-decoration-break:clone;box-decoration-break:clone}}.main .job:first-child{{margin-top:0}}
h2{{display:flex;align-items:center;gap:8px;margin:0 0 9px;font:600 8.6pt 'Space Grotesk',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#0f7a54}}
h2::after{{content:"";flex:1;height:1px;background:linear-gradient(90deg,#cfe5db,transparent)}}
.sec{{margin-bottom:16px}}.side .sec{{break-inside:avoid}}.top{{display:flex;justify-content:space-between;align-items:center;gap:24px}}
.lab{{font:600 8.2pt Inter,sans-serif;color:#0d1117;margin:0 0 6px}}
.chip{{display:inline-block;font-size:7.6pt;line-height:1.3;padding:2.5px 7px;margin:0 3px 4px 0;border-radius:20px;background:#fff;border:1px solid #d9e3ea;color:#2a2f37}}
.chip.ops{{background:#eaf7f1;border-color:#cdeadc}}
.edu{{margin-bottom:8px;font-size:8.4pt;line-height:1.4}}.edu b{{display:block;color:#0d1117}}.edu span{{color:#5b6472}}
.qr{{flex:none;width:1.6in;text-align:center;color:#fff}}
.qr svg{{width:.95in;height:.95in;background:#fff;padding:6px;border-radius:8px}}
.qr svg path{{fill:#0b0f17}}
.qr b{{display:block;margin-top:8px;font:600 9pt 'Space Grotesk',sans-serif;color:#7be0b8}}
.qr span{{display:block;font-size:7.4pt;color:#c9d1dc;line-height:1.35;margin-top:2px}}
.sum{{font-size:9.7pt;line-height:1.6;color:#2a2f37;margin:0}}
.job{{margin:0 0 11px;break-inside:avoid;position:relative;padding-left:14px;border-left:2px solid #e3ece8}}
.job::before{{content:"";position:absolute;left:-5px;top:3px;width:8px;height:8px;border-radius:50%;background:#22c58b;box-shadow:0 0 0 2px #fff}}
.jh{{display:flex;justify-content:space-between;gap:12px;align-items:baseline}}
.jt{{font:600 10.6pt/1.25 'Space Grotesk',sans-serif;color:#0d1117}}
.jo{{font-size:8.6pt;color:#5b6472;margin-top:1px}}
.jd{{flex:none;font:600 7.8pt Inter,sans-serif;color:#0f7a54;background:#eaf7f1;padding:2px 8px;border-radius:20px;white-space:nowrap}}
ul{{margin:5px 0 0;padding:0;list-style:none}}
li{{position:relative;padding-left:12px;margin:2px 0}}
li::before{{content:"";position:absolute;left:1px;top:.62em;width:4px;height:4px;border-radius:50%;background:#3878ff}}
</style></head><body>
<div class='top'><div><h1>{e(D['name'])}</h1><div class='role'>{e(D['role'])}</div>
<div class='contact'>{''.join(f'<span>{e(c)}</span>' for c in D['contact'])}</div></div><div class='qr'>{qrsvg}<b>Talk to my AI résumé</b><span>Scan to ask Ryan anything, in any language.</span></div></div>
<div class='wrap'><aside class='side'>
<div class='sec'><h2>Core Skills</h2><p class='lab'>{e(D['ai_label'])}</p>{chips(D['ai_skills'])}</div>
<div class='sec'><p class='lab'>{e(D['ops_label'])}</p>{''.join(f"<span class='chip ops'>{e(i)}</span>" for i in D['ops_skills'])}</div>
<div class='sec'><h2>Education</h2>{edu}</div>
</aside><main class='main'>
<div class='sec'><h2>Summary</h2><p class='sum'>{e(D['summary'])}</p></div>
<div class='sec'><h2>Experience</h2>{jobs}</div>
</main></div></body></html>"""
(R / "resume.html").write_text(page)
print("ok")
