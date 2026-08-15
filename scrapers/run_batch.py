"""First batch scrape: phones, laptops, TVs, audio, appliances, groceries.

Pulls real products from the WooCommerce retailers (wasi.lk, idealz.lk)
and writes normalized JSON snapshots into scrapers/data/.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.woocommerce import save_json  # noqa: E402

import abans  # noqa: E402
import acecom  # noqa: E402
import computercare  # noqa: E402
import idealz  # noqa: E402
import laptop_lk  # noqa: E402
import pclk  # noqa: E402
import takas  # noqa: E402
import toplaps  # noqa: E402
import wasi  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Merged snapshot consumed by the Next.js app (bundled, no fs at runtime).
APP_SNAPSHOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "lib", "data", "scraped-snapshot.json",
)

# Search subjects per category, matching the demo catalog's product families.
SUBJECTS = {
    "phones": ["samsung galaxy s25", "samsung galaxy a56", "iphone 16", "redmi note 14", "oneplus 13"],
    "laptops": ["macbook air", "dell xps", "thinkpad", "hp pavilion", "asus vivobook"],
    "tvs": ["samsung crystal uhd", "lg 43", "sony bravia"],
    "audio": ["sony wh-1000xm", "airpods pro", "jbl tune"],
    "appliances": ["samsung washing machine", "lg refrigerator", "rice cooker"],
    "groceries": ["milk powder", "basmati rice", "samba rice"],
}


def scrape_retailer(module, subjects: dict[str, list[str]]) -> list[dict]:
    rows: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for category, queries in subjects.items():
        for q in queries:
            for r in module.scrape_search(q):
                if r["junk"]:
                    continue
                key = (r["name"], r["price"])
                if key in seen:
                    continue
                seen.add(key)
                r["category"] = category
                rows.append(r)
    return rows


def main() -> None:
    merged: list[dict] = []
    for name, module in (("wasi", wasi), ("idealz", idealz)):
        try:
            rows = scrape_retailer(module, SUBJECTS)
        except Exception as e:  # noqa: BLE001
            print(f"  {name}: FAILED ({e.__class__.__name__}: {e})")
            continue
        path = os.path.join(DATA_DIR, f"{name}.json")
        save_json(rows, path)
        priced = [r for r in rows if r["price"]]
        print(f"  {name}: {len(rows)} unique, {len(priced)} with price")
        merged.extend(rows)

    # Takas scrapes whole categories (Magento listings), not search queries.
    try:
        takas_rows = takas.scrape_all()
        takas_rows = [r for r in takas_rows if r["price"]]
        save_json(takas_rows, os.path.join(DATA_DIR, "takas.json"))
        print(f"  takas: {len(takas_rows)} with price")
        merged.extend(takas_rows)
    except Exception as e:  # noqa: BLE001
        print(f"  takas: FAILED ({e.__class__.__name__}: {e})")

    # Abans scrapes whole categories (Vue/AJAX product-list API).
    try:
        abans_rows = abans.scrape_all()
        abans_rows = [r for r in abans_rows if r["price"]]
        save_json(abans_rows, os.path.join(DATA_DIR, "abans.json"))
        print(f"  abans: {len(abans_rows)} with price")
        merged.extend(abans_rows)
    except Exception as e:  # noqa: BLE001
        print(f"  abans: FAILED ({e.__class__.__name__}: {e})")

    # Laptop retailers: WooCommerce Store API (acecom, pc.lk, computercare)
    # and Shopify (laptop.lk, toplaps) — whole catalogues, no search queries.
    for name, module in (
        ("acecom", acecom),
        ("pclk", pclk),
        ("computercare", computercare),
        ("laptop_lk", laptop_lk),
        ("toplaps", toplaps),
    ):
        try:
            rows = module.scrape_all_products()
            rows = [r for r in rows if r["price"]]
            save_json(rows, os.path.join(DATA_DIR, f"{name}.json"))
            print(f"  {name}: {len(rows)} with price")
            merged.extend(rows)
        except Exception as e:  # noqa: BLE001
            print(f"  {name}: FAILED ({e.__class__.__name__}: {e})")

    save_json(merged, APP_SNAPSHOT)
    print(f"app snapshot -> {APP_SNAPSHOT}")


if __name__ == "__main__":
    main()