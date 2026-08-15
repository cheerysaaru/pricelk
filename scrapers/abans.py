"""Abans (buyabans.com) adapter — Vue/AJAX product-list API.

Category pages are Vue-rendered; products load from /product-list?category_id=N.
Category IDs were found by reading the `paramsArray` JS block on each category
page (e.g. https://buyabans.com/tv/tv-all/led-smart-tv -> category_id=61).
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.buyabans import scrape_category  # noqa: E402
from common.http import Http  # noqa: E402

RETAILER = "Abans"
BASE_URL = "https://buyabans.com"

# Category IDs per subject family (multiple IDs = multiple sub-categories).
CATEGORIES = {
    "phones": [224, 620, 259, 257, 256],  # iphone, iphone-16, iphone-15, iphone-14, iphone-13
    "laptops": [225, 261],                # macbooks, macbook-air
    "tvs": [61, 59, 62, 766],             # led-smart-tv, led-tv, oled-tv, qled-tv
    "audio": [95, 92, 97, 91, 93, 227],   # headphones, speakers, earphones, home-theaters, sound-bar, airpods
    "appliances": [10, 8, 115],           # washing-machines, refrigerators, rice-cookers
}


def scrape_all() -> list[dict]:
    http = Http()
    rows: list[dict] = []
    for category, ids in CATEGORIES.items():
        for cid in ids:
            batch = scrape_category(http, cid, RETAILER, category, BASE_URL)
            print(f"  {category} (id {cid}): {len(batch)}")
            rows.extend(batch)
    return rows


if __name__ == "__main__":
    rows = scrape_all()
    for r in rows[:10]:
        price = r["price"] if r["price"] is not None else 0.0
        print(f"{price:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(rows)} total")