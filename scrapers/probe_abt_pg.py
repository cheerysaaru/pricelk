"""Abtronics: try per_page=24 and check for AJAX load."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://abtronics.lk/product-category/laptop/?per_page=24", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
cards = soup.select("div.wd-product")
print("cards with per_page=24:", len(cards))
# look for ajax load more
for m in ["woodmart_ajax", "wd_ajax", "load_more", "infinite", "ajax-shop", "wd-ajax-shop"]:
    print(f"  marker {m}: {m in r.text}")