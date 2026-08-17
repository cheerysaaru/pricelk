"""Singer: pagination check."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.singersl.com/products/electronics/laptops-notebooks", timeout=30, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href*='page=']"):
    t = a.get_text(strip=True)
    if re.match(r"^\d+$", t) or t.lower() in ("next", "»", "›"):
        print("PAGE:", t[:10], "->", a.get("href")[:150])