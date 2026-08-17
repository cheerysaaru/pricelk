"""Abtronics card price + pagination."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://abtronics.lk/product-category/laptop/", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
cards = soup.select("div.wd-product")
if cards:
    html = str(cards[0])
    # find price area
    idx = html.find("price")
    print("PRICE AREA:", html[max(0, idx - 200):idx + 400])
# pagination
for a in soup.select("a.page-numbers"):
    print("PAGE:", a.get_text(strip=True)[:10], a.get("href"))