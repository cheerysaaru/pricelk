"""mCentre (mcentre.lk) — HTML category listing with ?page=N.

Images are CSS background-image URLs on a.b-prod-card__image.
Regular (before) price sits in .b-prod-card__price-before, current in
.b-prod-card__price-val.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.listing import ListingSite, make_rows  # noqa: E402

RETAILER = "mCentre"
BASE_URL = "https://www.mcentre.lk"
START = f"{BASE_URL}/store/categories/laptops"

_SITE = ListingSite(
    retailer=RETAILER,
    base_url=BASE_URL,
    start_url=START,
    card_sel="div.b-prod-card",
    name_sel=".b-prod-card__title a",
    price_sel=".b-prod-card__price-val",
    link_sel=".b-prod-card__title a[href]",
    img_sel="a.b-prod-card__image",
    img_attr="style",
    regular_sel=".b-prod-card__price-before",
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
