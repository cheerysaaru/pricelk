"""LapShop (lapshop.lk) — single-page HTML listing.

Cards are article.list-product with the name in a.inner-link span, price
in li.current-price (Sinhala rupee symbol රු is ignored by the price
parser). Product links are relative; images have a ../.. prefix that
urljoin-style concatenation must not double — ListingSite prefixes the
base URL, so strip leading ../ segments here via a fixed absolute image
base (lapshop-data lives under the site root).
"""
from __future__ import annotations

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.http import Http  # noqa: E402
from common.listing import ListingSite, make_rows  # noqa: E402

RETAILER = "LapShop"
BASE_URL = "https://www.lapshop.lk"
START = f"{BASE_URL}/brand-new-laptops"

_IMG_CLEAN = re.compile(r"^\.\./+")


def _abs_img(raw: str) -> str:
    """Normalize ../-prefixed image paths to an absolute https URL."""
    return f"{BASE_URL}/{_IMG_CLEAN.sub('', raw.lstrip('/'))}"


_SITE = ListingSite(
    retailer=RETAILER,
    base_url=BASE_URL,
    start_url=START,
    card_sel="article.list-product",
    name_sel="a.inner-link span",
    price_sel="li.current-price",
    link_sel="a.inner-link[href]",
    img_sel="img.first-img",
    img_attr="src",
    page_param=None,  # single page (35 cards)
    category="laptops",
    http=Http(),
)

# Patch image URL normalization for the ../.. prefix.
_SITE.extract = lambda card, page_url: _extract(card, page_url)  # type: ignore[assignment]


def _extract(card, page_url):
    row = ListingSite.extract(_SITE, card, page_url)
    if row and row["image"]:
        row["image"] = _abs_img(row["image"])
    return row


def scrape_all_products() -> list[dict]:
    return make_rows(_SITE)


if __name__ == "__main__":
    rows = scrape_all_products()
    for r in rows[:10]:
        price = r["price"] if r["price"] is not None else 0.0
        print(f"{price:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(rows)} total")
