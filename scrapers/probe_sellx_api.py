"""Sellx: probe /get-shop-products endpoint."""
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://gallelaptop.com/shop?cat=laptops"}

# try GET first
r = requests.get("https://gallelaptop.com/get-shop-products?cat=laptops", timeout=25, headers=UA)
print("GET:", r.status_code, r.text[:500])

# try POST
r2 = requests.post("https://gallelaptop.com/get-shop-products", timeout=25, headers=UA, data={"cat": "laptops"})
print("\nPOST:", r2.status_code, r2.text[:500])