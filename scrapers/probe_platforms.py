"""Probe Sri Lankan laptop retailers for e-commerce platform.

Checks public, unauthenticated endpoints:
  - WooCommerce Store API:  /wp-json/wc/store/v1/products?per_page=1
  - WooCommerce REST:       /wp-json/wc/v3/products?per_page=1 (usually auth'd)
  - WordPress:              /wp-json (any response = WP)
  - Shopify:                /products.json?limit=1
  - Magento:                /rest/V1/products?searchCriteria[pageSize]=1
  - OpenCart:               /index.php?route=product/search (weak signal)
"""
from __future__ import annotations

import json
import sys
import time

import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}

SITES = [
    ("nanotek", "https://www.nanotek.lk"),
    ("redline", "https://www.redlinetech.lk"),
    ("laptop.lk", "https://www.laptop.lk"),
    ("laptopcare", "https://www.laptopcare.lk"),
    ("laptopstore", "https://www.laptopstore.lk"),
    ("techzone", "https://techzone.lk"),
    ("sellx", "https://gallelaptop.com"),
    ("chama", "https://www.chamacomputers.lk"),
    ("wsg", "https://wsg.lk"),
    ("mcentre", "https://www.mcentre.lk"),
    ("acecom", "https://acecomlanka.lk"),
    ("gamestreet", "https://www.gamestreet.lk"),
    ("pc.lk", "https://www.pc.lk"),
    ("computercare", "https://computercare.lk"),
    ("lapshop", "https://www.lapshop.lk"),
    ("toplaps", "https://toplaps.lk"),
    ("singersl", "https://www.singersl.com"),
    ("softlogic", "https://softlogic.lk"),
    ("mysoftlogic", "https://mysoftlogic.lk"),
    ("istore", "https://istore.lk"),
    ("kapruka", "https://www.kapruka.com"),
    ("abtronics", "https://abtronics.lk"),
    ("trx", "https://www.trxcomputers.lk"),
    ("smartstorelk", "https://smartstorelk.com"),
    ("bestlap", "https://bestlap.lk"),
]

PROBES = {
    "woo_store": ("/wp-json/wc/store/v1/products?per_page=1", "json"),
    "woo_v3": ("/wp-json/wc/v3/products?per_page=1", "json"),
    "wp": ("/wp-json", "json"),
    "shopify": ("/products.json?limit=1", "json"),
    "magento": ("/rest/V1/products?searchCriteria%5BpageSize%5D=1", "json"),
}


def probe(site: str, base: str) -> dict:
    result: dict = {"site": site, "base": base}
    for name, (path, kind) in PROBES.items():
        url = base + path
        try:
            r = requests.get(url, timeout=12, headers=UA, allow_redirects=True)
            ct = r.headers.get("content-type", "")
            body = r.text[:300] if r.text else ""
            if r.status_code == 200 and "json" in ct:
                try:
                    data = r.json()
                    result[name] = "OK"
                    if name == "woo_store" and isinstance(data, list):
                        result["woo_store_count"] = len(data)
                    elif name == "shopify" and isinstance(data, dict):
                        result["shopify_count"] = len(data.get("products", []))
                except ValueError:
                    result[name] = f"200-notjson:{body[:60]}"
            elif r.status_code == 200:
                result[name] = f"200:{ct.split(';')[0]}"
            else:
                result[name] = str(r.status_code)
        except Exception as e:  # noqa: BLE001
            result[name] = f"ERR:{type(e).__name__}"
        time.sleep(0.3)
    return result


def main() -> None:
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    out = []
    for site, base in SITES:
        if only and site not in only:
            continue
        res = probe(site, base)
        out.append(res)
        print(json.dumps(res))
    with open("data/platform-probe.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"\nwrote data/platform-probe.json ({len(out)} sites)")


if __name__ == "__main__":
    main()