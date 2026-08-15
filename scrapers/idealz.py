"""iDealz.lk adapter (WooCommerce Store API)."""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.woocommerce import WooCommerceStore  # noqa: E402

RETAILER = "iDealz"
BASE_URL = "https://idealz.lk"


def client() -> WooCommerceStore:
    return WooCommerceStore(RETAILER, BASE_URL)


def scrape_all() -> list[dict]:
    return client().scrape_all()


def scrape_search(query: str) -> list[dict]:
    return client().scrape_search(query)


if __name__ == "__main__":
    import sys

    q = sys.argv[1] if len(sys.argv) > 1 else None
    rows = scrape_search(q) if q else scrape_all()
    for r in rows[:10]:
        print(f"{r['price']:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(rows)} total")