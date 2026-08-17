"""GameStreet (gamestreet.lk) — single-page HTML listing.

Product links are relative (product_view.php?pid=...) and images are
relative too (images/products/N.jpg); ListingSite prefixes base_url.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.listing import ListingSite, make_rows  # noqa: E402

RETAILER = "GameStreet"
BASE_URL = "https://www.gamestreet.lk"
# cat=MQ== (=1) & scat=Mzc= (=37) -> gaming laptops sub-category.
START = f"{BASE_URL}/products.php?cat=MQ%3D%3D&scat=Mzc%3D"

_SITE = ListingSite(
    retailer=RETAILER,
    base_url=BASE_URL,
    start_url=START,
    card_sel="div.col-sm-4.MrgTp35",
    name_sel=".product_title a",
    price_sel=".redPrice",
    link_sel="a[href]",
    img_sel="img",
    img_attr="src",
    page_param=None,  # single page, no numbered pagination
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
