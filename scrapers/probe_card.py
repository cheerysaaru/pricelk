"""Dump product card HTML structure for a bespoke site."""
import re
import sys

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def main() -> None:
    url = sys.argv[1]
    r = requests.get(url, timeout=25, headers=UA, allow_redirects=True)
    print("status:", r.status_code, "final:", r.url, "len:", len(r.text))
    soup = BeautifulSoup(r.text, "lxml")
    # find the most common product-ish container
    for cls in ["product-item", "product-card", "product", "card", "item", "product-list-item", "product-box", "product-tile"]:
        els = soup.select(f"[class*='{cls}']")
        if len(els) >= 3:
            print(f"\n=== class '{cls}': {len(els)} elements ===")
            # print first element's outer HTML (truncated)
            html = str(els[0])
            print(html[:1800])
            break
    else:
        print("\nno obvious product container; dumping body text sample:")
        print(soup.get_text(" ", strip=True)[:800])


if __name__ == "__main__":
    main()