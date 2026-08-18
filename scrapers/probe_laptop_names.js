const s = require("../lib/data/scraped-snapshot.json");
const laps = s.filter((r) => r.category === "laptops" && !r.junk && r.price >= 100);
console.log("total laptop-category records:", laps.length);
const withWord = laps.filter((r) => /laptop/i.test(r.name));
console.log('name contains "laptop":', withWord.length);
const sample = laps.slice(0, 12).map((r) => r.retailer + " | " + r.name.slice(0, 70));
console.log(sample.join("\n"));