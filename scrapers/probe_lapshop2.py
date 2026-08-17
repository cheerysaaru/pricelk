"""Lapshop: find actual product listing structure."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.lapshop.lk/laptops-desktops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# find elements containing price-like text
for el in soup.find_all(string=re.compile(r"Rs\.?\s?[\d,]+")):
    parent = el.find_parent(class_=True)
    if parent:
        print("PRICE PARENT:", parent.get("class"))
        print(str(parent)[:1200])
        break
# product links
links = [a for a in soup.select("a[href]") if re.search(r"(product|item|laptop)", a.get("href", ""), re.I)]
print("\nPROD LINKS:", len(links))
for a in links[:5]:
    print("  ", a.get_text(strip=True)[:60], "->", a.get("href"))