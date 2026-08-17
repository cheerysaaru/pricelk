"""Find WooCommerce product cards on abtronics."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://abtronics.lk/product-category/laptop/", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# WooCommerce: ul.products > li.product
for ul in soup.select("ul.products"):
    lis = ul.select("li.product")
    print("ul.products with", len(lis), "li.product")
    if lis:
        print(str(lis[0])[:1800])
        break
else:
    # try div.product inside product-grid
    for el in soup.select("div.product")[:3]:
        print("div.product:", str(el)[:800])
        print("---")