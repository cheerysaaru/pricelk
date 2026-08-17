"""Winsoft (winsoft.lk) — HTML category listing with ?page=N.

Same template as Redline/Nanotek: li.ty-product-block cards with h2 name
and span.ty-price. Prices are plain numbers ("264,000").
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.listing import ListingSite, make_rows  # noqa: E402

RETAILER = "Winsoft"
BASE_URL = "https://www.winsoft.lk"
START = f"{BASE_URL}/category/laptops"

_SITE = ListingSite(
    retailer=RETAILER,
    base_url=BASE_URL,
    start_url=START,
    card_sel="li.ty-product-block",
    name_sel="h2",
    price_sel="span.ty-price",
    link_sel="a[href]",
    img_sel="img",
    img_attr="src",
    page_param="page",
    category="laptops",
    http=Http(),
)


def scrape_all_products() -> list[dict]:
    return make_rows(_SITE)


if __name__ == "__main__":
    rows = scrape_all_products()
    for r in rows[:10]:
        price = r["price"] if r["price"] is not None else 0.0
        print(f"{price:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(rows)} total")