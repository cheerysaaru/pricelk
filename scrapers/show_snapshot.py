"""Print a sample of a scraped JSON snapshot."""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

path = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
rows = json.load(open(path, encoding="utf-8"))
print(f"total {len(rows)}")
for r in rows[:limit]:
    price = r["price"] if r["price"] is not None else 0.0
    print(f"{r['category']:<12} {price:>12,.2f}  {r['name'][:75]}")