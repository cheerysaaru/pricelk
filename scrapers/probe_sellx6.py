"""Sellx: check if products are in initial HTML (search for product names/prices)."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# look for any element with class containing 'product' that has an img
imgs = soup.select("img")
print("total imgs:", len(imgs))
for img in imgs[:10]:
    src = img.get("src", "")
    alt = img.get("alt", "")
    if "product" in src.lower() or alt:
        print("IMG:", src[:80], "| alt:", alt[:50])
# look for product grid containers
for sel in ["div.product-grid", "div.products", "div.product-list", "div.product-wrapper", "div.product-item", "div.shop-products", "div.product-card"]:
    els = soup.select(sel)
    if els:
        print(f"\n=== {sel}: {len(els)} ===")
        print(str(els[0])[:1200])
        break