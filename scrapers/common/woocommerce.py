"""WooCommerce Store API adapter.

The WooCommerce Store API (wp-json/wc/store/products) is a public JSON feed
used by many Sri Lankan retailers (wasi.lk, idealz.lk). It returns real
products with LKR prices in minor units.

Standard record produced by this adapter:
{
  "retailer": "Wasi.lk",
  "name": "...",
  "brand": "Samsung" | null,
  "sku": "...",
  "price": 228699.0,          # LKR, float
  "regular_price": 228699.0,
  "sale_price": null,
  "currency": "LKR",
  "url": "https://...",
  "image": "https://...",
  "category": "...",
  "attrs": {"storage": "256GB", "ram": "12GB", "color": "..."},
  "on_sale": false,
}
"""
from __future__ import annotations

import json
import time
from typing import Any

from .http import Http
from .normalize import canonical_brand, clean_name, extract_attrs, is_junk, parse_lkr_price

PER_PAGE = 100


class WooCommerceStore:
    """Client for a retailer's WooCommerce Store API."""

    def __init__(self, retailer: str, base_url: str, http: Http | None = None) -> None:
        self.retailer = retailer
        self.base_url = base_url.rstrip("/")
        self.api = f"{self.base_url}/wp-json/wc/store/products"
        self.http = http or Http()

    def _fetch(self, params: dict[str, Any]) -> list[dict[str, Any]]:
        """Fetch every page of a query, honoring per_page limits."""
        out: list[dict[str, Any]] = []
        page = 1
        while True:
            r = self.http.get(self.api, params={**params, "per_page": PER_PAGE, "page": page})
            if r.status_code == 404 or r.status_code == 400:
                break  # past the last page
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            out.extend(batch)
            if len(batch) < PER_PAGE:
                break
            page += 1
            time.sleep(0.3)
        return out

    def all(self) -> list[dict[str, Any]]:
        return self._fetch({})

    def search(self, query: str) -> list[dict[str, Any]]:
        return self._fetch({"search": query})

    def normalize(self, raw: dict[str, Any]) -> dict[str, Any]:
        prices = raw.get("prices") or {}
        name = clean_name(raw.get("name") or "")
        images = raw.get("images") or []
        categories = raw.get("categories") or []
        return {
            "retailer": self.retailer,
            "name": name,
            "brand": canonical_brand(name),
            "sku": raw.get("sku") or "",
            "price": parse_lkr_price(prices.get("price"), prices.get("currency_minor_unit", 0)),
            "regular_price": parse_lkr_price(prices.get("regular_price"), prices.get("currency_minor_unit", 0)),
            "sale_price": parse_lkr_price(prices.get("sale_price"), prices.get("currency_minor_unit", 0)),
            "currency": prices.get("currency_code", "LKR"),
            "url": raw.get("permalink") or "",
            "image": images[0]["src"] if images else "",
            "category": categories[0]["name"] if categories else "",
            "attrs": extract_attrs(name),
            "on_sale": bool(raw.get("on_sale")),
            "junk": is_junk(name),
        }

    def scrape_all(self) -> list[dict[str, Any]]:
        return [self.normalize(p) for p in self.all()]

    def scrape_search(self, query: str) -> list[dict[str, Any]]:
        return [self.normalize(p) for p in self.search(query)]


def save_json(records: list[dict[str, Any]], path: str) -> None:
    """Write normalized records to a JSON snapshot file."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"wrote {len(records)} records -> {path}")