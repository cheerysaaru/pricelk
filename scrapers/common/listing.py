"""Generic HTML category-listing scraper for bespoke retailer sites.

Sites without a JSON API (Redline, Nanotek, GameStreet, mCentre, LapShop,
Singer) expose product grids in plain HTML. This module walks the category
pages (with optional ?page=N pagination), extracts product cards using
per-site CSS selectors, and normalizes rows into the shared snapshot shape.

Standard record produced:
{
  "retailer": "...",
  "name": "...",
  "brand": "ASUS" | null,
  "sku": "",
  "price": 490000.0,
  "regular_price": 490000.0,
  "sale_price": null,
  "currency": "LKR",
  "url": "https://...",
  "image": "https://...",
  "category": "laptops",
  "attrs": {...},
  "on_sale": false,
  "junk": false,
}
"""
from __future__ import annotations

import re
import time
from typing import Any, Callable

from bs4 import BeautifulSoup, Tag

from .http import Http
from .normalize import canonical_brand, clean_name, extract_attrs, is_junk, parse_lkr_price

_PAGE_NUM_RE = re.compile(r"^\d+$")
_BG_URL_RE = re.compile(r"url\(['\"]?(.*?)['\"]?\)")

# Site config: card_sel + inner selectors, optional pagination.
# pagination=None -> single page; {"param": "page"} -> numbered ?page=N links.


class ListingSite:
    def __init__(
        self,
        retailer: str,
        base_url: str,
        start_url: str,
        card_sel: str,
        name_sel: str,
        price_sel: str,
        link_sel: str = "a[href]",
        img_sel: str = "img",
        img_attr: str = "src",
        regular_sel: str | None = None,
        price_mode: str = "first",  # "first" | "all" (all -> first is sale/current, second regular)
        page_param: str | None = "page",
        category: str = "laptops",
        http: Http | None = None,
    ) -> None:
        self.retailer = retailer
        self.base_url = base_url.rstrip("/")
        self.start_url = start_url
        self.card_sel = card_sel
        self.name_sel = name_sel
        self.price_sel = price_sel
        self.link_sel = link_sel
        self.img_sel = img_sel
        self.img_attr = img_attr
        self.regular_sel = regular_sel
        self.price_mode = price_mode
        self.page_param = page_param
        self.category = category
        self.http = http or Http()

    # -- page walking ----------------------------------------------------
    def page_urls(self) -> list[str]:
        """First page + numbered ?page=N pages in order.

        Handles compressed pagination (e.g. "2 3 ... 54 55"): when the
        visible numbered links skip a range, all pages up to the max are
        generated so no products are missed.
        """
        urls = [self.start_url]
        if self.page_param is None:
            return urls
        try:
            r = self.http.get(self.start_url)
        except Exception:  # noqa: BLE001
            return urls
        soup = BeautifulSoup(r.text, "lxml")
        numbered: list[tuple[int, str]] = []
        for a in soup.select("a[href]"):
            t = a.get_text(strip=True)
            if _PAGE_NUM_RE.match(t):
                numbered.append((int(t), a.get("href", "")))
        if not numbered:
            return urls

        max_page = max(p for p, _ in numbered)
        visible = len(numbered)
        href_by_num = {p: h for p, h in numbered}

        def full(href: str) -> str:
            return href if href.startswith("http") else self.base_url + href

        # Compressed pagination: "1 2 3 ... 54 55" shows ~5-7 numbers for
        # many pages. If the max page is well beyond what's visible, expand.
        if max_page > visible + 2:
            return [self.start_url] + [
                full(href_by_num.get(p) or f"{self.start_url}?{self.page_param}={p}")
                for p in range(2, max_page + 1)
            ]

        # Normal case: just the visible numbered pages, in order.
        seen: set[str] = set()
        for _, href in sorted(numbered, key=lambda p: p[0]):
            f = full(href)
            if f not in seen:
                seen.add(f)
                urls.append(f)
        return urls

    # -- card extraction --------------------------------------------------
    def extract(self, card: Tag, page_url: str) -> dict[str, Any] | None:
        link_el = card.select_one(self.link_sel)
        name_el = card.select_one(self.name_sel)
        img_el = card.select_one(self.img_sel)
        price_el = card.select_one(self.price_sel)
        if not name_el or not price_el:
            return None

        name = clean_name(name_el.get_text(" ", strip=True))
        if not name:
            return None

        url = ""
        if link_el is not None:
            href = link_el.get("href", "")
            url = href if href.startswith("http") else self.base_url + href

        image = ""
        if img_el is not None:
            raw = img_el.get(self.img_attr, "")
            if self.img_attr == "style" and raw:
                m = _BG_URL_RE.search(raw)
                if m:
                    raw = m.group(1)
            image = raw if raw.startswith("http") else self.base_url + raw

        price = regular = None
        if self.price_mode == "first":
            price = parse_lkr_price(price_el.get_text(" ", strip=True))
            if self.regular_sel:
                reg_el = card.select_one(self.regular_sel)
                if reg_el is not None:
                    regular = parse_lkr_price(reg_el.get_text(" ", strip=True))
        else:  # "all": text holds both prices, first = current, second = regular
            nums = re.findall(r"[\d,]+(?:\.\d+)?", price_el.get_text(" ", strip=True))
            if not nums:
                return None
            price = parse_lkr_price(nums[0])
            if len(nums) > 1:
                regular = parse_lkr_price(nums[1])

        if price is None:
            return None

        sale = price if regular is not None and regular > price else None
        return {
            "retailer": self.retailer,
            "name": name,
            "brand": canonical_brand(name),
            "sku": "",
            "price": price,
            "regular_price": regular if regular is not None else price,
            "sale_price": sale,
            "currency": "LKR",
            "url": url,
            "image": image,
            "category": self.category,
            "attrs": extract_attrs(name),
            "on_sale": sale is not None,
            "junk": is_junk(name),
        }

    # -- driver -----------------------------------------------------------
    def scrape_all(self) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        seen: set[tuple[str, str]] = set()
        for page_url in self.page_urls():
            try:
                r = self.http.get(page_url)
            except Exception as e:  # noqa: BLE001
                print(f"  {self.retailer}: page {page_url} failed ({e})")
                continue
            soup = BeautifulSoup(r.text, "lxml")
            for card in soup.select(self.card_sel):
                row = self.extract(card, page_url)
                if not row:
                    continue
                key = (row["name"], round(row["price"], 2))
                if key in seen:
                    continue
                seen.add(key)
                rows.append(row)
            time.sleep(0.3)
        return rows


def make_rows(site: ListingSite) -> list[dict[str, Any]]:
    """Convenience wrapper: scrape + drop junk."""
    return [r for r in site.scrape_all() if not r["junk"]]
