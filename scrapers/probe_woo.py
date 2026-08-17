"""Inspect WooCommerce Store API product shape."""
import json
import sys

import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def main() -> None:
    base = sys.argv[1]
    url = base + "/wp-json/wc/store/v1/products?per_page=3"
    r = requests.get(url, timeout=25, headers=UA)
    print("status:", r.status_code)
    data = r.json()
    print("count:", len(data))
    if data:
        p = data[0]
        print(json.dumps({k: p.get(k) for k in ["id", "name", "slug", "permalink", "type", "status", "sku", "prices", "images", "categories", "attributes"]}, indent=2, ensure_ascii=False)[:2500])


if __name__ == "__main__":
    main()