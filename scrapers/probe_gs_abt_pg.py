"""GameStreet + Abtronics pagination."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

print("=== GAMESTREET ===")
r = requests.get("https://www.gamestreet.lk/products.php?cat=MQ%3D%3D&scat=Mzc%3D", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    t = a.get_text(strip=True)
    h = a.get("href", "")
    if re.match(r"^\d+$", t) or "page" in h.lower() or t.lower() in ("next", "»", "›", "last"):
        print("  PAGE:", t[:10], "->", h[:100])
# count cards
cards = soup.select("div.col-sm-4.MrgTp35")
print("cards on page:", len(cards))

print("\n=== ABTRONICS ===")
r2 = requests.get("https://abtronics.lk/product-category/laptop/", timeout=25, headers=UA)
soup2 = BeautifulSoup(r2.text, "lxml")
for a in soup2.select("a[href]"):
    t = a.get_text(strip=True)
    h = a.get("href", "")
    if re.match(r"^\d+$", t) or "page" in h.lower() or t.lower() in ("next", "»", "›"):
        print("  PAGE:", t[:10], "->", h[:100])
cards2 = soup2.select("div.wd-product")
print("wd-product cards:", len(cards2))