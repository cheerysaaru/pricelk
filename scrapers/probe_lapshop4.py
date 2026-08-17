"""Lapshop: look for AJAX/JSON data sources."""
import re
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.lapshop.lk/brand-new-laptops", timeout=25, headers=UA)
text = r.text
# find ajax URLs
for m in re.finditer(r'(?:url|action|href|src)\s*[:=]\s*["\']([^"\']*(?:ajax|api|json|product)[^"\']*)["\']', text, re.I):
    print("AJAX:", m.group(1)[:120])
# find fetch/ajax calls
for m in re.finditer(r'(?:fetch|ajax|axios|\.get|\.post)\s*\(\s*["\']([^"\']+)["\']', text, re.I):
    print("CALL:", m.group(1)[:120])
# look for embedded JSON arrays of products
for m in re.finditer(r'(\[\{[^]]{200,}?\}\])', text):
    print("JSON ARRAY:", m.group(1)[:200])
    break