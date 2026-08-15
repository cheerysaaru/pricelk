"""Probe Sri Lankan retailers for scrapability with plain HTTP (no browser)."""
import re
import sys

import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

TESTS = [
    ("Singer phones", "https://singersl.com/collections/mobile-phones"),
    ("Abans phones", "https://buyabans.com/phones-tablets"),
    ("Keells search", "https://keells.lk/search?q=milk+powder"),
    ("Daraz search", "https://www.daraz.lk/catalog/?q=samsung+galaxy+s25"),
    ("Softlogic search", "https://www.softlogic.lk/search?q=samsung"),
    ("Kapruka phones", "https://www.kapruka.com/online/electronics/price/mobile_phones"),
    ("Wow search", "https://wow.lk/search?q=samsung"),
    ("Wasi search", "https://wasi.lk/search?q=samsung"),
    ("Takas search", "https://takas.lk/search?q=samsung"),
    ("Cargills search", "https://www.cargillsceylon.com/search?q=milk"),
    ("Arpico search", "https://www.arpico.com/search?q=milk"),
    ("Glomark search", "https://glomark.lk/search?q=milk"),
]


def main() -> None:
    for name, url in TESTS:
        try:
            r = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
            c = r.text
            names = re.findall(r'alt="([^"]{8,90})"', c)
            prices = re.findall(r"(?:Rs\.|LKR)\s?([\d,]+\.?\d*)", c)
            usd = re.findall(r"US\$([\d,]+\.?\d*)", c)
            print(f"{name}: {r.status_code} len={len(c)} names={len(names)} LKR={len(prices)} USD={len(usd)}")
            if names:
                print("   names:", " | ".join(dict.fromkeys(names))[:180])
            if prices:
                print("   LKR:", " | ".join(dict.fromkeys(prices))[:100])
            if usd:
                print("   USD:", " | ".join(dict.fromkeys(usd))[:100])
        except Exception as e:  # noqa: BLE001
            print(f"{name}: FAIL {type(e).__name__}: {str(e)[:100]}")


if __name__ == "__main__":
    sys.exit(main())