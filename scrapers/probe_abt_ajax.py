"""Abtronics: find AJAX endpoint for product loading."""
import re
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://abtronics.lk/product-category/laptop/", timeout=25, headers=UA)
text = r.text
# find ajax urls
for m in re.finditer(r'(?:url|action|href)\s*[:=]\s*["\']([^"\']*(?:admin-ajax|ajax)[^"\']*)["\']', text, re.I):
    print("AJAX:", m.group(1)[:150])
# woodmart settings
for m in re.finditer(r'woodmart_settings\s*=\s*(\{.{0,400})', text, re.I):
    print("SETTINGS:", m.group(1)[:400])
    break