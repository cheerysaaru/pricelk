"""First batch scrape: phones, laptops, TVs, audio, appliances, groceries.

Pulls real products from the WooCommerce retailers (wasi.lk, idealz.lk)
and writes normalized JSON snapshots into scrapers/data/.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.woocommerce import save_json  # noqa: E402

import idealz  # noqa: E402
import takas  # noqa: E402
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
        rows = scrape_retailer(module, SUBJECTS)
        path = os.path.join(DATA_DIR, f"{name}.json")
        save_json(rows, path)
        priced = [r for r in rows if r["price"]]
        print(f"  {name}: {len(rows)} unique, {len(priced)} with price")
        merged.extend(rows)

    # Takas scrapes whole categories (Magento listings), not search queries.
    takas_rows = takas.scrape_all()
    takas_rows = [r for r in takas_rows if r["price"]]
    save_json(takas_rows, os.path.join(DATA_DIR, "takas.json"))
    print(f"  takas: {len(takas_rows)} with price")
    merged.extend(takas_rows)

    save_json(merged, APP_SNAPSHOT)
    print(f"app snapshot -> {APP_SNAPSHOT}")


if __name__ == "__main__":
    main()