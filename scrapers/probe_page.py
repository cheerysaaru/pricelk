"""Probe a retailer page structure: status, size, price/product-link patterns."""
import re
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from common.http import Http

RS_RE = re.compile(r"Rs\.?\s?[\d,]+")
LKR_RE = re.compile(r"LKR[\s:]*[\d,]+")
PROD_RE = re.compile(r'href="([^"]*product[^"]*)"', re.I)

url = sys.argv[1]
h = Http()
r = h.get(url)
print(f"status {r.status_code}  len {len(r.text)}")
print(f"Rs. patterns: {len(RS_RE.findall(r.text))}")
print(f"LKR patterns: {len(LKR_RE.findall(r.text))}")
print(f"product links: {len(PROD_RE.findall(r.text))}")
for m in RS_RE.findall(r.text)[:5]:
    print("  price:", m)
for m in PROD_RE.findall(r.text)[:5]:
    print("  link:", m)

if len(sys.argv) > 2 and sys.argv[2] == "cats":
    # dump category-ish links (unique)
    cat_re = re.compile(r'href="(https://takas\.lk/[^"]+\.html)"')
    seen = []
    for l in cat_re.findall(r.text):
        if l not in seen:
            seen.append(l)
    print(f"category links: {len(seen)}")
    for l in seen[:200]:
        print("  cat:", l)