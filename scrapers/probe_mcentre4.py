"""mCentre: dump price block fully."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.mcentre.lk/store/categories/laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
card = soup.select_one(".b-prod-card")
price = card.select_one(".b-prod-card__price")
print(str(price)[:800])