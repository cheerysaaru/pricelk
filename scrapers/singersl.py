"""Singer (singersl.com) — HTML category listing with ?page=N.

Cards are div.productfilter; name in h5.card-title.product__name a,
price in span.price. Sale items show two prices ("Rs 299,999 Rs 359,999
16.67% Off") — price_mode "all" takes first as current, second as regular.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.listing import ListingSite, make_rows  # noqa: E402

RETAILER = "Singer"
BASE_URL = "https://www.singersl.com"
START = f"{BASE_URL}/products/electronics/laptops-notebooks"

_SITE = ListingSite(
    retailer=RETAILER,
    base_url=BASE_URL,
    start_url=START,
    card_sel="div.productfilter",
    name_sel="h5.card-title.product__name a",
    price_sel="span.price",
    link_sel="h5.card-title.product__name a[href]",
    img_sel="img.card-img-top",
    img_attr="src",
    price_mode="all",
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
