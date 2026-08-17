"""Extract raw card HTML snippet for mcentre + lapshop name/img classes."""
from __future__ import annotations

import re

import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

r = requests.get("https://www.mcentre.lk/store/categories/laptops", timeout=30, headers=UA)
m = re.search(r'<div class="b-prod-card"[^>]*>.*?</div>\s*</div>\s*</div>', r.text, re.S)
if m:
    html = m.group(0)
    # strip to first ~1200 chars
    print("MCENTRE CARD HTML:")
    print(re.sub(r"\s+", " ", html)[:1600])
else:
    print("no mcentre card match")

print("\n\nLAPSHOP:")
r2 = requests.get("https://www.lapshop.lk/brand-new-laptops", timeout=30, headers=UA)
m2 = re.search(r'<article class="list-product"[^>]*>.*?</article>', r2.text, re.S)
if m2:
    print(re.sub(r"\s+", " ", m2.group(0))[:1400])