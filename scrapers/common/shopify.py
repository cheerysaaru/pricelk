"""Generic Shopify adapter (public /products.json).

Endpoint: GET {base}/products.json?limit=250&page=N
Each product has variants[] with price/compare_at_price; we emit one row per
variant so different configs (RAM/storage) stay separate.
"""
from __future__ import annotations

import time
from typing import Any

from .http import Http
from .normalize import canonical_brand, clean_name, extract_attrs, is_junk

API_PATH = "/products.json"
PER_PAGE = 250
MAX_PAGES = 20


def parse_product(p: dict[str, Any], retailer: str, category: str, base_url: str) -> list[dict[str, Any]]:
    title = clean_name(p.get("title") or "")
    images = p.get("images") or []
    image = images[0].get("src", "") if images else ""
    handle = p.get("handle") or ""
    rows: list[dict[str, Any]] = []
    for v in p.get("variants") or []:
        vtitle = v.get("title") or ""
        name = clean_name(f"{title} {vtitle}" if vtitle and vtitle != "Default Title" else title)
        price = _to_lkr(v.get("price"))
        compare = _to_lkr(v.get("compare_at_price"))
        url = f"{base_url}/products/{handle}" if handle else base_url
        if v.get("id"):
            url = f"{url}?variant={v['id']}"
        rows.append({
            "retailer": retailer,
            "name": name,
            "brand": canonical_brand(name),
            "sku": v.get("sku") or "",
            "price": price,
            "regular_price": compare if compare and compare != price else None,
            "sale_price": price if (compare and price and price < compare) else None,
            "currency": "LKR",
            "url": url,
            "image": image,
            "category": category,
            "attrs": extract_attrs(name),
            "on_sale": bool(compare and price and price < compare),
            "junk": is_junk(name),
        })
    return rows


def _to_lkr(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def scrape_all(
    http: Http,
    base_url: str,
    retailer: str,
    category: str,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for page in range(1, MAX_PAGES + 1):
        r = http.get(base_url + API_PATH, params={"limit": PER_PAGE, "page": page})
        if r.status_code != 200:
            break
        try:
            data = r.json()
        except ValueError:
            break
        prods = data.get("products") or []
        if not prods:
            break
        for p in prods:
            for row in parse_product(p, retailer, category, base_url):
                key = (row["name"], row["price"])
                if key in seen:
                    continue
                seen.add(key)
                rows.append(row)
        if len(prods) < PER_PAGE:
            break
        time.sleep(0.4)
    return rows