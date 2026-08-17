"""Lapshop product card structure."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.lapshop.lk/laptops-desktops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# look for product grid containers
for sel in ["div.product", "div.product-item", "div.product-card", "div.card", "div.item", "div.product-box", "div.product-tile", "div.product-list"]:
    els = soup.select(sel)
    if len(els) >= 3:
        print(f"=== {sel}: {len(els)} ===")
        print(str(els[0])[:1500])
        break
# pagination
for a in soup.select("a[href*='page']"):
    print("PAGE:", a.get_text(strip=True)[:10], a.get("href"))