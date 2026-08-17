"""Check pagination + price format for redline."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.redlinetech.lk/category/laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href*='page']"):
    print("PAGE LINK:", a.get_text(strip=True)[:20], a.get("href"))
prices = [x.get_text(strip=True) for x in soup.select("span.ty-price")][:5]
print("prices:", prices)
# any next button
for a in soup.select("a"):
    t = a.get_text(strip=True)
    if t.lower() in ("next", "next page", "»", "›"):
        print("NEXT:", a.get("href"))