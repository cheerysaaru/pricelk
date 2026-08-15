"""Generic buyabans.com (Abans) product-list API parser.

buyabans.com renders category pages with Vue and loads products via AJAX from
``/product-list?category_id=N&stamp_banner_id=0&sort=new_arrivals&is_search_list=false&aging_only=0&page=P``,
which returns JSON::

    { "html": "<div class=\"product-list-item\">...", "links": [...] }

Product card structure (inside ``html``)::

    <div class="product-list-item">
      <div class="grid-product-wapper">
        <div class="product-imgage">
          <a href="..."><img class="grid-product-img" src="..." alt="..."></a>
        </div>
        <div class="grid-pro-drtail-con">
          <div class="grid-product-title">
            <div class="pro-name-compact" title="Name">Name</div>
          </div>
          <div class="hprice-con">
            <span class="market-price">Rs. 139,999</span>   (optional regular)
            <span class="selling-price">Rs. 119,999</span>  (current)
          </div>
        </div>
      </div>
    </div>

Pagination: the ``links`` array holds page URLs; the last numeric label is the
final page number.
"""
from __future__ import annotations

import time
from typing import Any

from bs4 import BeautifulSoup

from .http import Http
from .normalize import canonical_brand, clean_name, extract_attrs, is_junk, parse_lkr_price

API_URL = "https://buyabans.com/product-list"
MAX_PAGES = 10


def parse_listing(html: str, retailer: str, category: str, base_url: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "lxml")
    items: list[dict[str, Any]] = []
    for card in soup.select("div.product-list-item"):
        name_el = card.select_one("div.pro-name-compact")
        if not name_el:
            continue
        name = clean_name(name_el.get("title") or name_el.get_text(" ", strip=True))
        link_el = card.select_one("a[href]")
        url = link_el.get("href", "") if link_el else ""
        img_el = card.select_one("img.grid-product-img")
        price_el = card.select_one("span.selling-price")
        regular_el = card.select_one("span.market-price")
        price = parse_lkr_price(price_el.get_text(strip=True)) if price_el else None
        regular = parse_lkr_price(regular_el.get_text(strip=True)) if regular_el else None
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


def last_page(links: list[dict[str, Any]] | None) -> int:
    """Largest numeric page label in the pagination links (1 if none)."""
    pages = [l.get("label") for l in (links or []) if isinstance(l.get("label"), int)]
    return max(pages) if pages else 1


def scrape_category(
    http: Http,
    category_id: int,
    retailer: str,
    category: str,
    base_url: str,
) -> list[dict[str, Any]]:
    """Fetch a category across its pagination and parse every product."""
    rows: list[dict[str, Any]] = []
    seen: set[tuple[str, float | None]] = set()
    params = {
        "category_id": str(category_id),
        "stamp_banner_id": "0",
        "sort": "new_arrivals",
        "is_search_list": "false",
        "aging_only": "0",
    }
    for page in range(1, MAX_PAGES + 1):
        params["page"] = str(page)
        r = http.get(API_URL, params=params)
        if r.status_code != 200:
            break
        try:
            data = r.json()
        except ValueError:
            break
        batch = parse_listing(data.get("html", ""), retailer, category, base_url)
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
        if page >= last_page(data.get("links")):
            break
        time.sleep(0.4)
    return rows