"""Discover correct category URLs for 404 sites + gamestreet pagination."""
import re
import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

print("=== NANOTEK ===")
r = requests.get("https://www.nanotek.lk", timeout=20, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    h = a.get("href", "")
    t = a.get_text(strip=True)
    if re.search(r"(laptop|category)", h, re.I) and len(t) < 40:
        print("  ", t[:40], "->", h[:80])

print("\n=== MCENTRE ===")
r = requests.get("https://www.mcentre.lk", timeout=20, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    h = a.get("href", "")
    t = a.get_text(strip=True)
    if re.search(r"(laptop|category|product)", h, re.I) and len(t) < 40:
        print("  ", t[:40], "->", h[:80])

print("\n=== SINGERSL ===")
r = requests.get("https://www.singersl.com/products/electronics", timeout=20, headers=UA)
print("status:", r.status_code, "len:", len(r.text))
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    h = a.get("href", "")
    t = a.get_text(strip=True)
    if re.search(r"(laptop|computer)", h, re.I) and len(t) < 40:
        print("  ", t[:40], "->", h[:80])

print("\n=== SOFTLOGIC ===")
r = requests.get("https://www.softlogic.lk", timeout=20, headers=UA)
print("status:", r.status_code, "len:", len(r.text))
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    h = a.get("href", "")
    t = a.get_text(strip=True)
    if re.search(r"(laptop|computer)", h, re.I) and len(t) < 40:
        print("  ", t[:40], "->", h[:80])

print("\n=== GAMESTREET PAGINATION ===")
r = requests.get("https://www.gamestreet.lk/products.php?cat=MQ%3D%3D&scat=Mzc%3D", timeout=20, headers=UA)
soup = BeautifulSoup(r.text, "lxml")
for a in soup.select("a[href]"):
    t = a.get_text(strip=True)
    if re.match(r"^\d+$", t) or t.lower() in ("next", "»", "›", "last"):
        print("  PAGE:", t[:10], "->", a.get("href")[:100])