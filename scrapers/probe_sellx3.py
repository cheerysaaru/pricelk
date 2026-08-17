"""Sellx: dump body text to understand page structure."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
text = soup.get_text(" ", strip=True)
print(text[:2000])