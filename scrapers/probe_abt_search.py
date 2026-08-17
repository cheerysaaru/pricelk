"""Abtronics: test woodmart_ajax_search for product harvesting."""
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}
s = requests.Session()
s.headers.update(UA)
r0 = s.get("https://abtronics.lk/product-category/laptop/", timeout=25)

queries = ["laptop", "gaming", "asus", "lenovo", "acer", "msi", "hp", "dell"]
seen = set()
for q in queries:
    r = s.post("https://abtronics.lk/wp-admin/admin-ajax.php", data={
        "action": "woodmart_ajax_search",
        "autocomplete": "1",
        "number": "20",
        "search": q,
    }, headers={"X-Requested-With": "XMLHttpRequest"})
    if r.status_code != 200:
        print(f"{q}: {r.status_code}")
        continue
    data = r.json()
    suggs = data.get("suggestions", [])
    print(f"{q}: {len(suggs)} suggestions")
    for sg in suggs[:3]:
        print("   ", sg.get("value", "")[:60], "|", sg.get("price", "")[:60])
        seen.add(sg.get("value", ""))
print("unique products:", len(seen))