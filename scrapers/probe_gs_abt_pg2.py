"""GameStreet + Abtronics: find pagination mechanism."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

print("=== GAMESTREET: look for load-more / page JS ===")
r = requests.get("https://www.gamestreet.lk/products.php?cat=MQ%3D%3D&scat=Mzc%3D", timeout=25, headers=UA)
for m in re.finditer(r'(?:page|pagination|loadMore|load_more|nextPage|totalPages|total_pages)[^,;]{0,80}', r.text, re.I):
    s = m.group(0)
    if "function" not in s and "css" not in s:
        print("  JS:", s[:100])

print("\n=== ABTRONICS: page= links ===")
r2 = requests.get("https://abtronics.lk/product-category/laptop/", timeout=25, headers=UA)
soup2 = BeautifulSoup(r2.text, "lxml")
for a in soup2.select("a[href*='page']"):
    print("  ", a.get_text(strip=True)[:15], "->", a.get("href")[:120])
# check woocommerce pagination classes
for el in soup2.select(".woocommerce-pagination a, .page-numbers a"):
    print("  WC:", el.get_text(strip=True)[:10], "->", el.get("href")[:120])