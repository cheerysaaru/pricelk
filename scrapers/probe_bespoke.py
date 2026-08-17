"""Probe bespoke retailer HTML: find product cards, prices, pagination.

Fetches a category page and reports structural signals so we can decide how
to scrape each site (HTML parsing vs hidden JSON vs API).
"""
from __future__ import annotations

import json
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}

SITES = [
    ("nanotek", "https://www.nanotek.lk", "/product-category/laptops/"),
    ("redline", "https://www.redlinetech.lk", "/product-category/laptops/"),
    ("laptopcare", "https://www.laptopcare.lk", "/shop/"),
    ("mcentre", "https://www.mcentre.lk", "/laptops/"),
    ("gamestreet", "https://www.gamestreet.lk", "/products.php?cat=MQ%3D%3D&scat=Mzc%3D"),
    ("singersl", "https://www.singersl.com", "/laptops"),
    ("softlogic", "https://softlogic.lk", "/laptops"),
    ("kapruka", "https://www.kapruka.com", "/shop/online/laptops"),
    ("sellx", "https://gallelaptop.com", "/product-category/laptops/"),
    ("lapshop", "https://www.lapshop.lk", "/laptops-desktops"),
    ("smartstorelk", "https://smartstorelk.com", "/product-category/laptops/"),
    ("abtronics", "https://abtronics.lk", "/product-category/laptop/"),
]


def probe(site: str, base: str, path: str) -> dict:
    url = base + path
    out: dict = {"site": site, "url": url}
    try:
        r = requests.get(url, timeout=20, headers=UA, allow_redirects=True)
        out["status"] = r.status_code
        out["final_url"] = r.url
        out["len"] = len(r.text)
        soup = BeautifulSoup(r.text, "lxml")
        out["title"] = soup.title.get_text(strip=True)[:80] if soup.title else ""
        # price signals
        prices = re.findall(r"Rs\.?\s?[\d,]+", r.text)
        out["price_samples"] = prices[:5]
        out["price_count"] = len(prices)
        # product-ish links
        links = [a.get("href", "") for a in soup.find_all("a", href=True)]
        prod_links = [l for l in links if re.search(r"(product|item|laptop|p=)", l, re.I)]
        out["prod_link_samples"] = prod_links[:5]
        out["prod_link_count"] = len(prod_links)
        # hidden JSON (Next.js __NEXT_DATA__, WooCommerce, etc.)
        for marker in ["__NEXT_DATA__", "wp-json", "application/ld+json", "products.json", "dataLayer", "window.__"]:
            out[marker] = marker in r.text
        # common card classes
        for cls in ["product", "product-item", "product-card", "card", "item", "grid-product", "product-list"]:
            n = len(soup.select(f"[class*='{cls}']"))
            if n:
                out[f"cls:{cls}"] = n
    except Exception as e:  # noqa: BLE001
        out["error"] = f"{type(e).__name__}: {e}"
    return out


def main() -> None:
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    out = []
    for site, base, path in SITES:
        if only and site not in only:
            continue
        res = probe(site, base, path)
        out.append(res)
        print(json.dumps(res, ensure_ascii=False))
        time.sleep(0.5)
    with open("data/bespoke-probe.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"\nwrote data/bespoke-probe.json ({len(out)} sites)")


if __name__ == "__main__":
    main()