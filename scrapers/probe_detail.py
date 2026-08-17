"""Detail dump for mcentre + lapshop + singersl sale price cards."""
from __future__ import annotations

import json

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}


def dump(label: str, url: str, sel: str) -> None:
    print(f"\n===== {label}")
    r = requests.get(url, timeout=30, headers=UA)
    soup = BeautifulSoup(r.text, "lxml")
    cards = soup.select(sel)
    print(f"cards: {len(cards)}")
    for c in cards[:2]:
        print("  HTML:", " ".join(c.get_text(" ", strip=True).split())[:200])
        for a in c.select("a[href]")[:4]:
            print("   A:", a.get_text(" ", strip=True)[:50], "->", a.get("href")[:90])
        for img in c.select("img")[:3]:
            print("   IMG:", (img.get("src") or img.get("data-src") or "")[:90])
        for p in c.select("[class*='price'], [class*='Price']")[:6]:
            print("   PRICE EL:", p.get("class"), "|", p.get_text(" ", strip=True)[:50])


dump("mcentre", "https://www.mcentre.lk/store/categories/laptops", "div.b-prod-card")
dump("lapshop", "https://www.lapshop.lk/brand-new-laptops", "article.list-product")
dump("singersl-sale", "https://www.singersl.com/products/electronics/laptops-notebooks", "div.productfilter")