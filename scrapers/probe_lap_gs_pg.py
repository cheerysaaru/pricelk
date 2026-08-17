"""Lapshop + GameStreet pagination deep-check."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

print("=== LAPSHOP: any pagination? ===")
r = requests.get("https://www.lapshop.lk/brand-new-laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# count cards
cards = soup.select("article.list-product")
print("cards:", len(cards))
for a in soup.select("a[href]"):
    t = a.get_text(strip=True)
    if re.match(r"^\d+$", t) or t.lower() in ("next", "»", "›", "load more"):
        print("  PAGE:", t[:10], "->", a.get("href")[:100])
# look for ajax pagination
for m in re.finditer(r'(?:page|pagination|loadMore|next)[^,;]{0,60}(?:url|href|action)[^,;]{0,60}', r.text, re.I):
    print("  JS:", m.group(0)[:100])

print("\n=== GAMESTREET: try other pages ===")
for p in ["2", "3"]:
    r2 = requests.get(f"https://www.gamestreet.lk/products.php?cat=MQ%3D%3D&scat=Mzc%3D&page={p}", timeout=25, headers=UA)
    soup2 = BeautifulSoup(r2.text, "lxml")
    cards2 = soup2.select("div.col-sm-4.MrgTp35")
    print(f"  page={p}: cards={len(cards2)}")