"""Abtronics: try WooCommerce AJAX product loop endpoint."""
import re
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest"}
s = requests.Session()
s.headers.update(UA)
r0 = s.get("https://abtronics.lk/product-category/laptop/", timeout=25)
# extract nonce
m = re.search(r'woodmart_settings\s*=\s*(\{.*?\})\s*;', r0.text, re.S)
nonce = None
if m:
    try:
        import json
        settings = json.loads(m.group(1))
        nonce = settings.get("ajax_shop_nonce") or settings.get("nonce")
        print("nonce:", nonce)
    except Exception as e:
        print("settings parse err:", e)
# try admin-ajax with action
for action in ["woodmart_ajax_shop", "woodmart_get_products", "woodmart_ajax_search"]:
    r = s.post("https://abtronics.lk/wp-admin/admin-ajax.php", data={
        "action": action,
        "nonce": nonce or "",
        "per_page": "24",
        "paged": "1",
        "product_cat": "laptop",
    }, headers={"X-Requested-With": "XMLHttpRequest"})
    print(f"action {action}: {r.status_code} len={len(r.text)}")
    if r.status_code == 200 and len(r.text) > 500:
        print("  ", r.text[:300])
        break