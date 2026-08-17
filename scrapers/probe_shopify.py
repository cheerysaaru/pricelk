"""Inspect Shopify products.json shape."""
import json
import sys

import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def main() -> None:
    base = sys.argv[1]
    url = base + "/products.json?limit=3"
    r = requests.get(url, timeout=25, headers=UA)
    print("status:", r.status_code)
    data = r.json()
    prods = data.get("products", [])
    print("count:", len(prods))
    if prods:
        p = prods[0]
        print(json.dumps({k: p.get(k) for k in ["id", "title", "handle", "vendor", "product_type", "tags", "variants", "images"]}, indent=2, ensure_ascii=False)[:2500])


if __name__ == "__main__":
    main()