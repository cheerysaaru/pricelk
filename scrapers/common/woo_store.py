"""Generic WooCommerce Store API adapter (public, unauthenticated).

Endpoint: GET {base}/wp-json/wc/store/v1/products?per_page=100&page=N
Prices arrive in minor units (currency_minor_unit=2 -> divide by 100).
"""
from __future__ import annotations

import time
from typing import Any

from .http import Http
from .normalize import canonical_brand, clean_name, extract_attrs, is_junk

API_PATH = "/wp-json/wc/store/v1/products"
PER_PAGE = 100
MAX_PAGES = 50


def parse_product(p: dict[str, Any], retailer: str, category: str, base_url: str) -> dict[str, Any]:
    name = clean_name(p.get("name") or "")
    prices = p.get("prices") or {}
    minor = prices.get("currency_minor_unit", 2)
    div = 10 ** minor if minor else 1

    def to_lkr(v: Any) -> float | None:
        if v is None or v == "":
            return None
        try:
            return float(v) / div
        except (TypeError, ValueError):
            return None

    price = to_lkr(prices.get("price"))
    regular = to_lkr(prices.get("regular_price"))
    sale = to_lkr(prices.get("sale_price"))
    images = p.get("images") or []
    image = images[0].get("src", "") if images else ""
    permalink = p.get("permalink") or ""
    url = permalink if permalink.startswith("http") else base_url + permalink
    return {
        "retailer": retailer,
        "name": name,
        "brand": canonical_brand(name),
        "sku": p.get("sku") or "",
        "price": price,
        "regular_price": regular if regular and regular != price else None,
        "sale_price": sale if sale and sale != price else None,
        "currency": "LKR",
        "url": url,
        "image": image,
        "category": category,
        "attrs": extract_attrs(name),
        "on_sale": bool(sale and price and sale < price),
        "junk": is_junk(name),
    }


def scrape_all(
    http: Http,
    base_url: str,
    retailer: str,
    category: str,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for page in range(1, MAX_PAGES + 1):
        r = http.get(base_url + API_PATH, params={"per_page": PER_PAGE, "page": page})
        if r.status_code != 200:
            break
        try:
            data = r.json()
        except ValueError:
            break
        if not isinstance(data, list) or not data:
            break
        for p in data:
            row = parse_product(p, retailer, category, base_url)
            if row["name"] in seen:
                continue
            seen.add(row["name"])
            rows.append(row)
        if len(data) < PER_PAGE:
            break
        time.sleep(0.4)
    return rows