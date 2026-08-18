// Replicate the final scoring logic against the snapshot to verify ranking.
const s = require("../lib/data/scraped-snapshot.json");

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const CATEGORY_KEYWORDS = {
  laptops: {
    strong: ["macbook", "notebook", "thinkpad", "ideapad", "vivobook", "zenbook", "chromebook", "surface", "aspire", "pavilion", "gaming", "ultrabook"],
    generic: ["laptop"],
  },
  phones: {
    strong: ["galaxy", "iphone", "pixel", "redmi", "xiaomi", "realme", "oppo", "vivo", "infinix", "nokia", "honor", "oneplus", "tecno"],
    generic: ["phone", "smartphone"],
  },
  tvs: { strong: ["television", "oled", "qled", "nano"], generic: ["tv", "led"] },
  headphones: { strong: ["airpod", "earbud", "headset", "soundbar"], generic: ["headphone", "earphone", "speaker"] },
  appliances: { strong: ["washing", "washer", "dryer", "refrigerator", "fridge", "microwave", "oven", "vacuum", "kettle", "blender", "mixer", "conditioner", "heater"], generic: ["iron", "fan", "cooker"] },
  refrigerators: { strong: ["refrigerator", "fridge", "freezer"], generic: [] },
  "rice-cookers": { strong: ["rice cooker", "cooker"], generic: [] },
  "milk-powder": { strong: ["milk"], generic: ["powder"] },
  rice: { strong: ["rice"], generic: [] },
};

const ACCESSORY_WORDS = [
  "cable", "backpack", "bag", "sleeve", "stand", "cooler", "adapter",
  "charger", "battery", "keyboard", "mouse", "headset", "case", "cover",
  "protector", "holder", "mount", "strap", "dock", "hub", "cleaner", "mat",
  "pad", "light", "lamp", "fan", "filter", "cartridge", "ink", "toner",
  "paper", "glass", "film", "screen", "casing", "cabinet", "chair", "combo",
  "kit", "psu", "power supply", "monitor", "webcam", "microphone", "printer",
  "scanner", "thermal", "label", "barcode", "speaker", "earbud", "controller",
  "joystick", "cooling", "wrist", "glove", "sleeve", "bag", "backpack",
];

const CATEGORY_NAMES = {
  phones: "Phones", laptops: "Laptops", tvs: "TVs", headphones: "Headphones",
  appliances: "Home Appliances", "milk-powder": "Milk Powder", rice: "Rice", shoes: "Shoes",
};
const CATEGORY_MAP = { phones: "phones", laptops: "laptops", tvs: "tvs", audio: "headphones", appliances: "appliances", refrigerators: "appliances", "rice-cookers": "appliances", groceries: "milk-powder" };

function mapCategory(rc, name) {
  const base = CATEGORY_MAP[rc] ?? "appliances";
  if (rc === "groceries") {
    const n = name.toLowerCase();
    if (n.includes("rice")) return "rice";
    if (n.includes("milk")) return "milk-powder";
  }
  return base;
}

function scoreItem(name, brand, category, categoryName, attrs, q) {
  const nq = normalize(q);
  const nm = normalize(name);
  const nmc = nm.replace(/\s+/g, "");
  const br = normalize(brand);
  const cat = normalize(categoryName);
  const attrText = normalize(Object.values(attrs).flat().join(" "));
  const combined = `${nm} ${br} ${cat} ${attrText}`;
  const tokens = nq.split(" ");
  if (tokens.length > 1 && !tokens.every((t) => combined.includes(t))) return 0;
  const queryIsAccessory = ACCESSORY_WORDS.includes(nq);
  const hasAccessory = !queryIsAccessory && ACCESSORY_WORDS.some((a) => nm.includes(a));
  if (tokens.length === 1 && cat.includes(nq)) {
    const kw = CATEGORY_KEYWORDS[category];
    if (kw) {
      const hasStrong = kw.strong.some((k) => nm.includes(k) || nmc.includes(k.replace(/\s+/g, "")));
      const hasGeneric = kw.generic.some((k) => nm.includes(k));
      if (hasAccessory) return hasGeneric ? 550 : 500;
      if (hasStrong) return 800;
      if (hasGeneric) return 700;
      return 600;
    }
  }
  let score;
  if (nm === nq) score = 1000;
  else if (nm.startsWith(nq)) score = 900;
  else if (nm.includes(nq)) score = 700;
  else if (br.startsWith(nq)) score = 600;
  else if (br.includes(nq)) score = 500;
  else if (cat.includes(nq)) score = 400;
  else if (attrText.includes(nq)) score = 300;
  else if (tokens.every((t) => nm.includes(t))) score = 650;
  else if (tokens.some((t) => nm.includes(t))) score = 350;
  else score = 0;
  if (hasAccessory && score > 500) return 500;
  return score;
}

function run(q) {
  const rows = [];
  for (const r of s) {
    if (r.junk || r.price == null || r.price < 100) continue;
    const cat = mapCategory(r.category, r.name);
    const sc = scoreItem(r.name, r.brand ?? "Unknown", cat, CATEGORY_NAMES[cat] ?? "Products", r.attrs, q);
    if (sc > 0) rows.push({ sc, price: r.price, name: r.name.slice(0, 55), retailer: r.retailer });
  }
  rows.sort((a, b) => b.sc - a.sc || a.price - b.price);
  console.log("=== query:", q, "| matches:", rows.length, "===");
  for (const r of rows.slice(0, 12)) console.log(r.sc, "|", r.price, "|", r.name, "|", r.retailer);
  console.log();
}

run("laptop");
run("tv");
run("phone");
run("macbook");
run("samsung galaxy");