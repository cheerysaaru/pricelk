"""Chama (chamacomputers.lk) — Next.js RSC payload scraper.

The category page is a React Server Components stream: only ~3 product
cards are server-rendered into DOM; the rest arrive as skeleton
placeholders. However every product is fully present in the embedded
`self.__next_f.push([1,"..."])` flight payloads as a `product` JSON
object (id, name, price, undiscountedPrice, discount, image, instock).

This scraper walks ?page=N (compressed pagination up to ~55 pages),
extracts the flight payloads, brace-matches each `"product":{...}`
object, and normalizes rows into the shared snapshot shape.
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.parse

import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.normalize import canonical_brand, clean_name, extract_attrs, is_junk  # noqa: E402

RETAILER = "Chama"
BASE_URL = "https://www.chamacomputers.lk"
START = f"{BASE_URL}/products/laptops"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

_PUSH_RE = re.compile(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', re.S)
_PRODUCT_RE = re.compile(r'"product":')


def _unescape(payload: str) -> str:
    return payload.encode().decode("unicode_escape", errors="ignore")


def _brace_match(s: str, start: int) -> str | None:
    """Return the JSON object text starting at s[start] == '{'."""
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(s)):
        c = s[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return s[start : i + 1]
    return None


def _products_from_html(html: str) -> list[dict]:
    out: list[dict] = []
    for payload in _PUSH_RE.findall(html):
        p = _unescape(payload)
        for m in _PRODUCT_RE.finditer(p):
            obj_start = m.end()
            if obj_start >= len(p) or p[obj_start] != "{":
                continue
            text = _brace_match(p, obj_start)
            if not text:
                continue
            try:
                prod = json.loads(text)
            except Exception:  # noqa: BLE001
                continue
            if isinstance(prod, dict) and prod.get("name") and prod.get("price") is not None:
                out.append(prod)
    return out


def _product_url(name: str) -> str:
    slug = urllib.parse.quote(name.lower(), safe="'")
    return f"{BASE_URL}/products/laptops/{slug}"


def scrape_all_products() -> list[dict]:
    # discover max page from compressed pagination on page 1
    r = requests.get(START, timeout=30, headers=UA)
    r.raise_for_status()
    soup = None
    max_page = 1
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(r.text, "lxml")
        nums = [int(a.get_text(strip=True)) for a in soup.select("a[href]") if a.get_text(strip=True).isdigit()]
        if nums:
            max_page = max(nums)
    except Exception:  # noqa: BLE001
        pass

    rows: list[dict] = []
    seen: set[tuple[str, float]] = set()
    for page in range(1, max_page + 1):
        url = START if page == 1 else f"{START}?page={page}"
        try:
            resp = requests.get(url, timeout=30, headers=UA)
            resp.raise_for_status()
        except Exception as e:  # noqa: BLE001
            print(f"  Chama: page {page} failed ({e})")
            continue
        for prod in _products_from_html(resp.text):
            name = clean_name(prod["name"])
            if not name:
                continue
            price = float(prod["price"])
            regular = float(prod.get("undiscountedPrice") or price)
            key = (name, round(price, 2))
            if key in seen:
                continue
            seen.add(key)
            sale = price if regular > price else None
            img = prod.get("image", "")
            if not img or img == "$undefined" or not img.startswith("http"):
                img = ""
            rows.append(
                {
                    "retailer": RETAILER,
                    "name": name,
                    "brand": canonical_brand(name),
                    "sku": str(prod.get("id", "")),
                    "price": price,
                    "regular_price": regular,
                    "sale_price": sale,
                    "currency": "LKR",
                    "url": _product_url(name),
                    "image": img,
                    "category": "laptops",
                    "attrs": extract_attrs(name),
                    "on_sale": sale is not None,
                    "junk": is_junk(name),
                }
            )
        time.sleep(0.3)
    return rows


if __name__ == "__main__":
    all_rows = scrape_all_products()
    for r in all_rows[:10]:
        price = r["price"] if r["price"] is not None else 0.0
        print(f"{price:>12,.2f} LKR  {r['name'][:70]}")
    print(f"... {len(all_rows)} total")