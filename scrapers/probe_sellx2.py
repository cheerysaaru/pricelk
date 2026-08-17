"""Sellx: find product cards in /shop?cat=laptops."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# all links with product-ish hrefs
links = [a for a in soup.select("a[href]")]
prod = [a for a in links if re.search(r"(product|/p/|item|detail)", a.get("href", ""), re.I)]
print("total links:", len(links), "prod-ish:", len(prod))
for a in prod[:10]:
    print("  ", a.get_text(strip=True)[:60], "->", a.get("href"))
# look for card containers
for sel in ["div.product", "div.card", "div.item", "div.product-item", "div.product-card", "div.product-box", "div.product-tile", "div.product-list"]:
    els = soup.select(sel)
    if len(els) >= 3:
        print(f"\n=== {sel}: {len(els)} ===")
        print(str(els[0])[:1500])
        break