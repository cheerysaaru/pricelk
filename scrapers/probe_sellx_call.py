"""Sellx: find the exact get-shop-products call params in JS."""
import re
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA)
text = r.text
idx = text.find("get-shop-products")
while idx >= 0:
    print("--- context ---")
    print(text[max(0, idx - 500):idx + 500])
    print()
    idx = text.find("get-shop-products", idx + 1)
    if idx > 0:
        break  # only first two