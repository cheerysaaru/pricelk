"""Sellx: probe get-shop-products with full params."""
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://gallelaptop.com/shop?cat=laptops"}

params = {
    "cat": "laptops",
    "brands": "",
    "features": "",
    "sort_by": "",
    "limit": "12",
    "page": "1",
    "search": "",
    "min_price": "",
    "max_price": "",
}
r = requests.get("https://gallelaptop.com/get-shop-products", timeout=30, headers=UA, params=params)
print("status:", r.status_code, "len:", len(r.text))
print(r.text[:800])