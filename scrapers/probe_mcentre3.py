"""mCentre: dump card content (title + price)."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.mcentre.lk/store/categories/laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# find the card wrapper containing b-prod-card__thumb
thumb = soup.select_one(".b-prod-card__thumb")
if thumb:
    card = thumb.find_parent(class_=True)
    print("CARD CLASS:", card.get("class"))
    print(str(card)[:3000])