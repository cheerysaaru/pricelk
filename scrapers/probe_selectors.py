"""Comprehensive selector dump for the 6 bespoke laptop sites."""
from __future__ import annotations

import json
import re

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

SITES = [
    # (label, url, card_selector)
    ("redline", "https://www.redlinetech.lk/category/laptops", "li.ty-product-block"),
    ("nanotek", "https://www.nanotek.lk/category/laptop", "li.ty-catPage-productListItem"),
    ("gamestreet", "https://www.gamestreet.lk/products.php?cat=MQ%3D%3D&scat=Mzc%3D", "div.col-sm-4.MrgTp35"),
    ("mcentre", "https://www.mcentre.lk/store/categories/laptops", "div.b-prod-card"),
    ("lapshop", "https://www.lapshop.lk/brand-new-laptops", "article.list-product"),
    ("singersl", "https://www.singersl.com/products/electronics/laptops-notebooks", "div.productfilter"),
]


def dump_card(soup: BeautifulSoup, card) -> dict:
    def txt(sel):
        el = card.select_one(sel)
        return el.get_text(" ", strip=True)[:80] if el else ""
    link = card.select_one("a[href]")
    img = card.select_one("img")
    return {
        "name": txt("h1,h2,h3,h4,h5,.product_title,.name,.title"),
        "link": link.get("href", "")[:100] if link else "",
        "img": img.get("src", "")[:80] if img else "",
        "price_elms": [e.get_text(" ", strip=True)[:40] for e in card.select("[class*='price'], .redPrice, li")][:6],
    }


for label, url, sel in SITES:
    print(f"\n===== {label} : {url}")
    r = requests.get(url, timeout=30, headers=UA)
    print("status:", r.status_code, "len:", len(r.text))
    soup = BeautifulSoup(r.text, "lxml")
    cards = soup.select(sel)
    print(f"cards[{sel}]: {len(cards)}")
    for c in cards[:3]:
        print("  ", json.dumps(dump_card(soup, c), ensure_ascii=False))
    # pagination links
    pages = []
    for a in soup.select("a[href]"):
        t = a.get_text(strip=True)
        h = a.get("href", "")
        if re.match(r"^\d+$", t) or "page=" in h or t.lower() in ("next", "»", "›"):
            pages.append((t[:10], h[:90]))
    print("pagination:", pages[:8])