"""Laptop.lk (laptop.lk) — Shopify."""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.shopify import scrape_all  # noqa: E402

RETAILER = "Laptop.lk"
BASE_URL = "https://www.laptop.lk"
CATEGORY = "laptops"


def scrape_all_products() -> list[dict]:
    return scrape_all(Http(), BASE_URL, RETAILER, CATEGORY)


if __name__ == "__main__":
    rows = scrape_all_products()
    for r in rows[:10]:
        price = r["price"] if r["price"] is not None else 0.0
        print(f"{price:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(rows)} total")