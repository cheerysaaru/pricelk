"""Sellx: look for AJAX/API endpoints in page JS."""
import re
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA)
text = r.text
for m in re.finditer(r'(?:url|action|href|src)\s*[:=]\s*["\']([^"\']*(?:api|ajax|json|product|search)[^"\']*)["\']', text, re.I):
    u = m.group(1)
    if "cdn" not in u and "css" not in u and "js" not in u:
        print("URL:", u[:150])
for m in re.finditer(r'(?:fetch|ajax|axios)\s*\(\s*["\']([^"\']+)["\']', text, re.I):
    print("CALL:", m.group(1)[:150])
# look for __INITIAL_STATE__ or similar
for marker in ["__INITIAL", "initialState", "__NUXT__", "__APP__", "products =", "window.products"]:
    idx = text.find(marker)
    if idx >= 0:
        print(f"MARKER {marker} at {idx}:", text[idx:idx + 300])
        break