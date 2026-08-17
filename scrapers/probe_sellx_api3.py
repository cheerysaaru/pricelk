"""Sellx: full session flow with CSRF token."""
import re
import requests
from bs4 import BeautifulSoup

s = requests.Session()
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
s.headers.update(UA)
# 1. load shop page, get CSRF + cookies
r0 = s.get("https://gallelaptop.com/shop?cat=laptops", timeout=25)
print("page status:", r0.status_code)
m = re.search(r'<meta name="csrf-token" content="([^"]+)"', r0.text)
csrf = m.group(1) if m else None
print("csrf:", csrf[:40] if csrf else None)
# 2. call API with session cookies + csrf
params = {
    "cat": "laptops", "brands": "", "features": "", "sort_by": "",
    "limit": "12", "page": "1", "search": "", "min_price": "", "max_price": "",
}
r = s.get("https://gallelaptop.com/get-shop-products", timeout=30, params=params,
          headers={"X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": csrf,
                   "Referer": "https://gallelaptop.com/shop?cat=laptops"})
print("api status:", r.status_code, "len:", len(r.text))
print(r.text[:1000])