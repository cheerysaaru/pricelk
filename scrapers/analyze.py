"""Analyze a retailer page structure: dump product-card HTML snippets."""
import re
import sys

import requests

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def dump(url: str, needle: str, max_chars: int = 1200) -> None:
    r = requests.get(url, headers=HEADERS, timeout=25, allow_redirects=True)
    c = re.sub(r"\s+", " ", r.text)
    print(f"URL: {url}  status={r.status_code} len={len(c)}")
    idx = c.find(needle)
    if idx < 0:
        print(f"  needle '{needle}' NOT FOUND")
        return
    print(f"  ...{c[max(0, idx - 200): idx + max_chars]}...")
    print()


if __name__ == "__main__":
    url = sys.argv[1]
    needle = sys.argv[2] if len(sys.argv) > 2 else "Rs."
    dump(url, needle)