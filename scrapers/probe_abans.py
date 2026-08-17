"""Show pagination links for a category."""
import sys

import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest"}


def main() -> None:
    url = sys.argv[1]
    r = requests.get(url, timeout=25, headers=UA)
    data = r.json()
    links = data.get("links") or []
    print(f"links count: {len(links)}")
    for l in links:
        print(f"  label={l.get('label')!r} active={l.get('active')} url={l.get('url')}")


if __name__ == "__main__":
    main()