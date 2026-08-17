"""Sellx: find product grid in shop page."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
r = requests.get("https://gallelaptop.com/shop?cat=laptops", timeout=25, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
# find all hrefs
for a in soup.select("a[href]"):
    h = a.get("href", "")
    if h and not h.startswith("#") and not h.startswith("http") and "javascript" not in h:
        print("LINK:", h[:100])
# find price text in main content area
for el in soup.find_all(string=re.compile(r"Rs\.?\s?[\d,]+\.\d{2}")):
    parent = el.find_parent(class_=True)
    if parent:
        cls = " ".join(parent.get("class", []))
        if "filter" not in cls:
            print("PRICE:", el.strip()[:40], "in", cls[:60])