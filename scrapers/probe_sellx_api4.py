"""Sellx: try array params for brands/features."""
import re
import requests

s = requests.Session()
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
s.headers.update(UA)
r0 = s.get("https://gallelaptop.com/shop?cat=laptops", timeout=25)
m = re.search(r'<meta name="csrf-token" content="([^"]+)"', r0.text)
csrf = m.group(1) if m else None

variants = [
    {"cat": "laptops", "brands": [], "features": [], "sort_by": "", "limit": "12", "page": "1", "search": "", "min_price": "", "max_price": ""},
    {"cat": "laptops", "brands": "", "features": "", "sort_by": "", "limit": "12", "page": "1", "search": "", "min_price": "0", "max_price": "10000000"},
    {"cat": "laptops", "brands": "", "features": "", "sort_by": "", "limit": "12", "page": "1", "search": "", "min_price": "", "max_price": "", "price_range": ""},
]
for i, params in enumerate(variants):
    r = s.get("https://gallelaptop.com/get-shop-products", timeout=30, params=params,
              headers={"X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": csrf,
                       "Referer": "https://gallelaptop.com/shop?cat=laptops"})
    print(f"variant {i}: status={r.status_code} len={len(r.text)}")
    if r.status_code == 200:
        print(r.text[:600])
        break