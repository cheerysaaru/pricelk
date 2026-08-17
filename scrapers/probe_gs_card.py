"""Dump full product card for gamestreet."""
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://www.gamestreet.lk/products.php?cat=MQ%3D%3D&scat=Mzc%3D", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# find the container that holds product_img
for el in soup.select(".product_img"):
    parent = el.find_parent(class_=True)
    if parent:
        print("PARENT CLASS:", parent.get("class"))
        print(str(parent)[:2000])
        break