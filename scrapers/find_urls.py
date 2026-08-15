"""Find correct store URLs for Sri Lankan retailers."""
import re

import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

CANDIDATES = {
    "Keells online": [
        "https://keells.lk/online",
        "https://keellssuper.lk/",
        "https://www.keellssuper.lk/",
        "https://keells.lk/supermarket",
        "https://keells.lk/keells-super",
    ],
    "Singer": [
        "https://singersl.com/",
        "https://www.singersl.com/",
    ],
    "Abans": [
        "https://buyabans.com/",
        "https://www.buyabans.com/",
    ],
    "Takas": [
        "https://takas.lk/",
        "https://www.takas.lk/",
    ],
    "Wasi": [
        "https://wasi.lk/",
        "https://www.wasi.lk/",
    ],
    "Cargills": [
        "https://www.cargillsceylon.com/",
        "https://cargillsfoodcity.lk/",
    ],
}

for name, urls in CANDIDATES.items():
    for u in urls:
        try:
            r = requests.get(u, headers=HEADERS, timeout=15, allow_redirects=True)
            c = r.text
            # find product-ish links
            links = re.findall(r'href="([^"]+)"', c)
            prod_links = [l for l in links if re.search(r"product|item|shop|category|collection|buy", l, re.I)]
            print(f"{name}: {u} -> {r.status_code} len={len(c)} prodlinks={len(prod_links)}")
            if prod_links:
                print("   ", " | ".join(dict.fromkeys(prod_links))[:250])
        except Exception as e:  # noqa: BLE001
            print(f"{name}: {u} -> FAIL {type(e).__name__}: {str(e)[:80]}")
    print()