"""Singer: dump product card around /product/ link."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.singersl.com/products/electronics/laptops-notebooks", timeout=30, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
a = soup.select_one('a[href*="/product/"]')
if a:
    for depth in range(1, 6):
        parent = a
        for _ in range(depth):
            parent = parent.parent
            if parent is None:
                break
        if parent is not None and parent.name in ("div", "li", "article"):
            cls = parent.get("class")
            if cls:
                print(f"DEPTH {depth} class={cls}")
                print(str(parent)[:2500])
                break