"""Abtronics: test paged param on category page."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
for p in ["2", "3"]:
    r = requests.get(f"https://abtronics.lk/product-category/laptop/?paged={p}", timeout=25, headers=UA)
    soup = BeautifulSoup(r.text, "lxml")
    cards = soup.select("div.wd-product")
    print(f"paged={p}: status={r.status_code} cards={len(cards)}")
    if len(cards) == 0:
        break