const s = require("../lib/data/scraped-snapshot.json");
const laps = s.filter((r) => r.category === "laptops" && !r.junk && r.price >= 100);
// Extract distinctive model words from names
const words = new Set();
for (const r of laps) {
  const n = r.name.toLowerCase();
  for (const w of ["macbook", "thinkpad", "ideapad", "vivobook", "zenbook", "aspire", "pavilion", "inspiron", "latitude", "xps", "legion", "predator", "nitro", "rog", "tuf", "swift", "expertbook", "yoga", "thinkbook", "vaio", "envy", "spectre", "elitebook", "probook", "notebook", "chromebook", "surface", "gaming", "ultrabook", "gram", "omen", "victus", "g14", "g15", "g16", "book", "pro", "air"]) {
    if (n.includes(w)) words.add(w);
  }
}
console.log("model words found:", [...words].join(", "));
// How many laptop-category records have NO strong model word and no "laptop"?
const strong = ["macbook", "thinkpad", "ideapad", "vivobook", "zenbook", "aspire", "pavilion", "inspiron", "latitude", "xps", "legion", "predator", "nitro", "rog", "tuf", "swift", "expertbook", "yoga", "thinkbook", "vaio", "envy", "spectre", "elitebook", "probook", "notebook", "chromebook", "surface", "gaming", "ultrabook", "gram", "omen", "victus"];
const noStrong = laps.filter((r) => {
  const n = r.name.toLowerCase();
  return !strong.some((w) => n.includes(w)) && !n.includes("laptop");
});
console.log("laptop-category records with no strong word and no 'laptop':", noStrong.length);
console.log(noStrong.slice(0, 15).map((r) => r.name.slice(0, 60)).join("\n"));