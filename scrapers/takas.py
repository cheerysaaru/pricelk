"""Takas.lk adapter (Magento category listings, server-rendered HTML)."""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.magento import scrape_category  # noqa: E402

RETAILER = "Takas"
BASE_URL = "https://takas.lk"

# Category URLs per subject family (found via homepage category tree).
CATEGORIES = {
    "phones": "https://takas.lk/electronics-computers/mobile-phones/smartphones.html",
    "laptops": "https://takas.lk/electronics-computers/laptops-desktops/laptop.html",
    "tvs": "https://takas.lk/electronics-computers/ledtv-dvd-electronics/televisions/led.html",
    "audio": "https://takas.lk/electronics-computers/earphones-headphones/headphones.html",
    "appliances": "https://takas.lk/home-garden/home-appliances/washing-machines.html",
    "refrigerators": "https://takas.lk/home-garden/home-appliances/kitchen-appliance/refrigerators.html",
    "rice-cookers": "https://takas.lk/home-garden/home-appliances/kitchen-appliance/rice-cookers.html",
}


def scrape_all() -> list[dict]:
    http = Http()
    rows: list[dict] = []
    for category, url in CATEGORIES.items():
        batch = scrape_category(http, url, RETAILER, category, BASE_URL)
        print(f"  {category}: {len(batch)}")
        rows.extend(batch)
    return rows


if __name__ == "__main__":
    rows = scrape_all()
    for r in rows[:10]:
        price = r["price"] if r["price"] is not None else 0.0
        print(f"{price:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(rows)} total")