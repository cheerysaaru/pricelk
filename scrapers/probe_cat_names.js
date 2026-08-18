const s = require("../lib/data/scraped-snapshot.json");
const cats = {};
for (const r of s) {
  if (r.junk || r.price == null || r.price < 100) continue;
  (cats[r.category] ??= []).push(r.name);
}
for (const [cat, names] of Object.entries(cats)) {
  console.log("=== " + cat + " (" + names.length + ") ===");
  console.log(names.slice(0, 8).map((n) => n.slice(0, 60)).join("\n"));
  console.log();
}