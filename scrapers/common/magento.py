"""Generic Magento 1.x category-listing parser.

Takas.lk (and other Magento stores) render product lists server-side with a
stable structure:
  <li class="item">
    <h2 class="product-name"><a href="..." title="...">Name</a></h2>
    <span class="price" id="product-price-123"> Rs. 159,999 </span>
    <span class="price" id="old-price-123"> Rs. 224,990 </span>
    <img id="product-collection-image-123" src="...">
  </li>
Pagination is Magento-style: ?p=2, ?p=3, ...
"""
from __future__ import annotations

import time
from typing import Any

from bs4 import BeautifulSoup

from .http import Http
from .normalize import canonical_brand, clean_name, extract_attrs, is_junk, parse_lkr_price

MAX_PAGES = 6


def parse_listing(html: str, retailer: str, category: str, base_url: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    items: list[dict[str, Any]] = []
    for li in soup.select("li.item"):
        name_el = li.select_one("h2.product-name a")
        if not name_el:
            continue
        name = clean_name(name_el.get_text(" ", strip=True))
        url = name_el.get("href", "")
        price_el = li.select_one("span[id^='product-price-']")
        old_el = li.select_one("span[id^='old-price-']")
        img_el = li.select_one("img[id^='product-collection-image-']")
        price = parse_lkr_price(price_el.get_text(strip=True)) if price_el else None
        regular = parse_lkr_price(old_el.get_text(strip=True)) if old_el else None
        items.append({
            "retailer": retailer,
            "name": name,
            "brand": canonical_brand(name),
            "sku": "",
            "price": price,
            "regular_price": regular,
            "sale_price": price if (regular and price and price < regular) else None,
            "currency": "LKR",
            "url": url if url.startswith("http") else base_url + url,
            "image": img_el.get("src", "") if img_el else "",
            "category": category,
            "attrs": extract_attrs(name),
            "on_sale": bool(regular and price and price < regular),
            "junk": is_junk(name),
        })
    return items


def scrape_category(
    http: Http,
    category_url: str,
    retailer: str,
    category: str,
    base_url: str,
) -> list[dict[str, Any]]:
    """Fetch a category across its pagination and parse every product.

    Some Magento stores repeat a "featured products" block on later pages, so
    records are deduped by (name, price) as they are collected.
    """
    rows: list[dict[str, Any]] = []
    seen: set[tuple[str, float | None]] = set()
    for page in range(1, MAX_PAGES + 1):
        url = category_url if page == 1 else f"{category_url}?p={page}"
        r = http.get(url)
        if r.status_code != 200:
            break
        batch = parse_listing(r.text, retailer, category, base_url)
        if not batch:
            break
        fresh = 0
        for row in batch:
            key = (row["name"], row["price"])
            if key in seen:
                continue
            seen.add(key)
            rows.append(row)
            fresh += 1
        if fresh == 0:  # every item was a repeat — stop paginating
            break
        if len(batch) < 12:  # last page
            break
        time.sleep(0.4)
    return rows