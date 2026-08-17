"""Lapshop pagination + sellx card structure."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

print("=== LAPSHOP PAGINATION ===")
r = requests.get("https://www.lapshop.lk/brand-new-laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    t = a.get_text(strip=True)
    if re.match(r"^\d+$", t) or t.lower() in ("next", "»", "›"):
        print("PAGE:", t[:10], "->", a.get("href"))

print("\n=== SELLX ===")
r2 = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA, allow_redirects=True)
print("status:", r2.status_code, "final:", r2.url, "len:", len(r2.text))
soup2 = BeautifulSoup(r2.text, "lxml")
for el in soup2.find_all(string=re.compile(r"Rs\.?\s?[\d,]+")):
    parent = el.find_parent(class_=True)
    if parent:
        print("PRICE PARENT:", parent.get("class"))
        print(str(parent)[:1200])
        break
links = [a for a in soup2.select("a[href]") if re.search(r"(product|item)", a.get("href", ""), re.I)]
print("PROD LINKS:", len(links))
for a in links[:5]:
    print("  ", a.get_text(strip=True)[:60], "->", a.get("href"))