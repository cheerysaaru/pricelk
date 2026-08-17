"""Check abtronics wp-json endpoints + product card price structure."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

# 1. wp-json root
r = requests.get("https://abtronics.lk/wp-json", timeout=20, headers=UA)
print("wp-json root:", r.status_code, r.text[:100])
# 2. wc/store/v1/products
r2 = requests.get("https://abtronics.lk/wp-json/wc/store/v1/products?per_page=2", timeout=20, headers=UA)
print("wc/store:", r2.status_code, r2.text[:200])
# 3. product card price structure
r3 = requests.get("https://abtronics.lk/product-category/laptop/", timeout=25, headers=UA)
soup = BeautifulSoup(r3.text, "lxml")
cards = soup.select("div.wd-product")
print("wd-product cards:", len(cards))
if cards:
    print(str(cards[0])[:2500])
# pagination
for a in soup.select("a.page-numbers"):
    print("PAGE:", a.get_text(strip=True)[:10], a.get("href"))