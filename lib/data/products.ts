import type {
  AttributeDef,
  Deal,
  PricePoint,
  Product,
  ProductVariant,
  RetailerOffer,
} from "@/lib/types";
import { RETAILER_SEEDS, getRetailer } from "@/lib/data/retailers";
import { findRealOffers } from "@/lib/data/scraped";

/**
 * DEMO PRODUCT CATALOGUE
 * ----------------------
 * Realistic mock data for the prototype. Prices are plausible LKR values but
 * are NOT real market prices. In production this is replaced by the
 * PostgreSQL catalogue populated by the Python scraper workers.
 *
 * Generation is deterministic (seeded PRNG) so server and client always agree.
 */

interface ProductSpec {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  description: string;
  accent: string;
  basePrice: number;
  attributes: AttributeDef[];
  variants: Record<string, string>[];
  modifiers?: Record<string, Record<string, number>>;
  specs: { label: string; value: string }[];
  popularity: number;
}

/* ------------------------------ seeded PRNG ------------------------------ */

/** Real product photos live in public/products/. A few sources are WebP. */
const PRODUCT_IMAGE_EXT: Record<string, string> = {
  "adidas-ultraboost-5": "webp",
  "anchor-full-cream-milk-powder": "webp",
  "sony-bravia-50": "webp",
};

function productImage(slug: string): string {
  return `/products/${slug}.${PRODUCT_IMAGE_EXT[slug] ?? "jpg"}`;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------- generation ------------------------------ */

function roundPrice(p: number): number {
  if (p >= 100_000) return Math.round(p / 100) * 100;
  if (p >= 10_000) return Math.round(p / 10) * 10;
  return Math.round(p);
}

function variantFactorFor(spec: ProductSpec, attrs: Record<string, string>): number {
  let factor = 1;
  for (const [key, value] of Object.entries(attrs)) {
    const m = spec.modifiers?.[key]?.[value];
    if (m) factor *= m;
  }
  return factor;
}

function generateOffers(spec: ProductSpec, variant: ProductVariant, rng: () => number): RetailerOffer[] {
  const pool = RETAILER_SEEDS.filter(
    (r) => r.focuses.includes(spec.category) || rng() < r.coverage * 0.4,
  );
  const shuffled = shuffle(pool, rng);
  const count = Math.min(shuffled.length, 3 + Math.floor(rng() * 3));
  const chosen = shuffled.slice(0, count);
  const variantFactor = variantFactorFor(spec, variant.attributes);

  return chosen.map((r, i) => {
    const jitter = 0.985 + rng() * 0.05;
    const price = roundPrice(spec.basePrice * r.priceFactor * variantFactor * jitter);
    const roll = rng();
    const availability = roll < 0.68 ? "in_stock" : roll < 0.9 ? "limited" : "out_of_stock";
    const minutesAgo = 4 + Math.floor(rng() * 240);
    const code = spec.id.replace(/[^a-z0-9]/g, "").slice(0, 8).toUpperCase();
    return {
      id: `${variant.id}--${r.id}`,
      retailerId: r.id,
      variantId: variant.id,
      price,
      currency: "LKR" as const,
      availability,
      lastChecked: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      url: `https://${r.domain}/products/${spec.slug}-${variant.id.split("--")[1]}`,
      sku: `${r.id.slice(0, 3).toUpperCase()}-${code}-${String(i + 1).padStart(3, "0")}`,
      exactMatch: true,
    };
  });
}

function generateHistory(rng: () => number, current: number): PricePoint[] {
  const points: PricePoint[] = [];
  let p = current;
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 3 * 86_400_000);
    points.push({ date: date.toISOString(), price: roundPrice(p) });
    const drift = (rng() - 0.42) * 0.03;
    p = p * (1 + drift);
  }
  points[points.length - 1] = { date: new Date(now).toISOString(), price: current };
  return points;
}

function buildProduct(spec: ProductSpec): Product {
  const variants: ProductVariant[] = spec.variants.map((attrs) => {
    const key = Object.values(attrs)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    return {
      id: `${spec.id}--${key}`,
      productId: spec.id,
      attributes: attrs,
      label: Object.values(attrs).join(" · "),
    };
  });

  const offers: RetailerOffer[] = [];
  const priceHistory: Record<string, PricePoint[]> = {};

  for (const variant of variants) {
    const rng = mulberry32(hashStr(variant.id));
    const vOffers = generateOffers(spec, variant, rng);
    offers.push(...vOffers);
    const inStock = vOffers.filter((o) => o.availability !== "out_of_stock");
    const current = (inStock[0] ?? vOffers[0]).price;
    priceHistory[variant.id] = generateHistory(rng, current);
  }

  return {
    id: spec.id,
    slug: spec.slug,
    name: spec.name,
    brand: spec.brand,
    category: spec.category,
    categoryName: spec.categoryName,
    description: spec.description,
    image: productImage(spec.slug),
    accent: spec.accent,
    attributes: spec.attributes,
    variants,
    offers,
    priceHistory,
    specs: spec.specs,
    popularity: spec.popularity,
  };
}

/* ------------------------------ product specs ---------------------------- */

const SPECS: ProductSpec[] = [
  // ── Phones ────────────────────────────────────────────────────────────────
  {
    id: "samsung-galaxy-s25",
    slug: "samsung-galaxy-s25",
    name: "Samsung Galaxy S25",
    brand: "Samsung",
    category: "phones",
    categoryName: "Phones",
    description:
      "Samsung's flagship Galaxy S25 with the Snapdragon 8 Elite for Galaxy, a 6.2\" Dynamic AMOLED 2X display and a 50MP main camera.",
    accent: "#4f46e5",
    basePrice: 184_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["8GB", "12GB", "16GB"] },
      { key: "storage", label: "Storage", options: ["128GB", "256GB", "512GB"] },
      { key: "colour", label: "Colour", options: ["Black", "Blue", "Silver"] },
    ],
    variants: [
      { ram: "8GB", storage: "128GB", colour: "Black" },
      { ram: "12GB", storage: "256GB", colour: "Black" },
      { ram: "12GB", storage: "256GB", colour: "Blue" },
      { ram: "12GB", storage: "256GB", colour: "Silver" },
      { ram: "12GB", storage: "512GB", colour: "Black" },
      { ram: "16GB", storage: "512GB", colour: "Black" },
    ],
    modifiers: {
      ram: { "8GB": 0.94, "12GB": 1, "16GB": 1.08 },
      storage: { "128GB": 0.9, "256GB": 1, "512GB": 1.14 },
      colour: { Black: 1, Blue: 1.005, Silver: 1.005 },
    },
    specs: [
      { label: "Display", value: "6.2\" Dynamic AMOLED 2X, 120Hz" },
      { label: "Processor", value: "Snapdragon 8 Elite for Galaxy" },
      { label: "Camera", value: "50MP + 12MP + 10MP" },
      { label: "Battery", value: "4000 mAh" },
      { label: "OS", value: "Android 15, One UI 7" },
    ],
    popularity: 99,
  },
  {
    id: "samsung-galaxy-a56",
    slug: "samsung-galaxy-a56",
    name: "Samsung Galaxy A56",
    brand: "Samsung",
    category: "phones",
    categoryName: "Phones",
    description:
      "The Galaxy A56 5G brings a 6.7\" Super AMOLED display, 50MP camera and a 5000 mAh battery to the mid-range.",
    accent: "#0ea5e9",
    basePrice: 89_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["8GB", "12GB"] },
      { key: "storage", label: "Storage", options: ["128GB", "256GB"] },
      { key: "colour", label: "Colour", options: ["Black", "Blue", "Silver"] },
    ],
    variants: [
      { ram: "8GB", storage: "128GB", colour: "Black" },
      { ram: "8GB", storage: "256GB", colour: "Blue" },
      { ram: "12GB", storage: "256GB", colour: "Silver" },
    ],
    modifiers: {
      ram: { "8GB": 1, "12GB": 1.06 },
      storage: { "128GB": 1, "256GB": 1.1 },
    },
    specs: [
      { label: "Display", value: "6.7\" Super AMOLED, 120Hz" },
      { label: "Processor", value: "Exynos 1580" },
      { label: "Camera", value: "50MP + 12MP + 5MP" },
      { label: "Battery", value: "5000 mAh" },
    ],
    popularity: 88,
  },
  {
    id: "apple-iphone-16",
    slug: "apple-iphone-16",
    name: "Apple iPhone 16",
    brand: "Apple",
    category: "phones",
    categoryName: "Phones",
    description:
      "iPhone 16 with the A18 chip, 6.1\" Super Retina XDR display and the new Camera Control button.",
    accent: "#18181b",
    basePrice: 249_990,
    attributes: [
      { key: "storage", label: "Storage", options: ["128GB", "256GB", "512GB"] },
      { key: "colour", label: "Colour", options: ["Black", "White", "Teal"] },
    ],
    variants: [
      { storage: "128GB", colour: "Black" },
      { storage: "128GB", colour: "White" },
      { storage: "256GB", colour: "Black" },
      { storage: "256GB", colour: "Teal" },
      { storage: "512GB", colour: "Black" },
    ],
    modifiers: {
      storage: { "128GB": 1, "256GB": 1.12, "512GB": 1.28 },
    },
    specs: [
      { label: "Display", value: "6.1\" Super Retina XDR" },
      { label: "Processor", value: "Apple A18" },
      { label: "Camera", value: "48MP Fusion + 12MP Ultra Wide" },
      { label: "Battery", value: "3561 mAh" },
    ],
    popularity: 95,
  },
  {
    id: "xiaomi-redmi-note-14",
    slug: "xiaomi-redmi-note-14",
    name: "Xiaomi Redmi Note 14",
    brand: "Xiaomi",
    category: "phones",
    categoryName: "Phones",
    description:
      "Redmi Note 14 5G with a 6.67\" AMOLED display, 108MP camera and 5110 mAh battery — great value for money.",
    accent: "#dc2626",
    basePrice: 74_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["8GB", "12GB"] },
      { key: "storage", label: "Storage", options: ["128GB", "256GB"] },
      { key: "colour", label: "Colour", options: ["Midnight Black", "Ocean Blue"] },
    ],
    variants: [
      { ram: "8GB", storage: "128GB", colour: "Midnight Black" },
      { ram: "8GB", storage: "256GB", colour: "Ocean Blue" },
      { ram: "12GB", storage: "256GB", colour: "Midnight Black" },
    ],
    modifiers: {
      ram: { "8GB": 1, "12GB": 1.05 },
      storage: { "128GB": 1, "256GB": 1.09 },
    },
    specs: [
      { label: "Display", value: "6.67\" AMOLED, 120Hz" },
      { label: "Processor", value: "Dimensity 7025 Ultra" },
      { label: "Camera", value: "108MP + 8MP + 2MP" },
      { label: "Battery", value: "5110 mAh" },
    ],
    popularity: 82,
  },
  {
    id: "oneplus-13r",
    slug: "oneplus-13r",
    name: "OnePlus 13R",
    brand: "OnePlus",
    category: "phones",
    categoryName: "Phones",
    description:
      "OnePlus 13R with Snapdragon 8 Gen 3, 6.78\" LTPO AMOLED and 6000 mAh battery with 80W charging.",
    accent: "#7c3aed",
    basePrice: 159_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["12GB", "16GB"] },
      { key: "storage", label: "Storage", options: ["256GB", "512GB"] },
      { key: "colour", label: "Colour", options: ["Black", "White"] },
    ],
    variants: [
      { ram: "12GB", storage: "256GB", colour: "Black" },
      { ram: "12GB", storage: "256GB", colour: "White" },
      { ram: "16GB", storage: "512GB", colour: "Black" },
    ],
    modifiers: {
      ram: { "12GB": 1, "16GB": 1.07 },
      storage: { "256GB": 1, "512GB": 1.13 },
    },
    specs: [
      { label: "Display", value: "6.78\" LTPO AMOLED, 120Hz" },
      { label: "Processor", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "50MP + 50MP + 8MP" },
      { label: "Battery", value: "6000 mAh, 80W" },
    ],
    popularity: 78,
  },

  // ── Laptops ───────────────────────────────────────────────────────────────
  {
    id: "macbook-air-13-m4",
    slug: "macbook-air-13-m4",
    name: "MacBook Air 13\" M4",
    brand: "Apple",
    category: "laptops",
    categoryName: "Laptops",
    description:
      "MacBook Air 13\" with the M4 chip, 16GB unified memory, Liquid Retina display and all-day battery life.",
    accent: "#334155",
    basePrice: 389_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["16GB", "24GB"] },
      { key: "storage", label: "Storage", options: ["256GB", "512GB"] },
      { key: "colour", label: "Colour", options: ["Midnight", "Silver"] },
    ],
    variants: [
      { ram: "16GB", storage: "256GB", colour: "Midnight" },
      { ram: "16GB", storage: "512GB", colour: "Silver" },
      { ram: "24GB", storage: "512GB", colour: "Midnight" },
    ],
    modifiers: {
      ram: { "16GB": 1, "24GB": 1.08 },
      storage: { "256GB": 1, "512GB": 1.12 },
    },
    specs: [
      { label: "Display", value: "13.6\" Liquid Retina" },
      { label: "Processor", value: "Apple M4" },
      { label: "Memory", value: "16GB / 24GB unified" },
      { label: "Battery", value: "Up to 18 hours" },
    ],
    popularity: 90,
  },
  {
    id: "dell-xps-13",
    slug: "dell-xps-13",
    name: "Dell XPS 13",
    brand: "Dell",
    category: "laptops",
    categoryName: "Laptops",
    description:
      "Dell XPS 13 with Intel Core Ultra 7, 13.4\" InfinityEdge display and a premium aluminium chassis.",
    accent: "#0f766e",
    basePrice: 429_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["16GB", "32GB"] },
      { key: "storage", label: "Storage", options: ["512GB", "1TB"] },
      { key: "colour", label: "Colour", options: ["Platinum", "Graphite"] },
    ],
    variants: [
      { ram: "16GB", storage: "512GB", colour: "Platinum" },
      { ram: "32GB", storage: "1TB", colour: "Graphite" },
    ],
    modifiers: {
      ram: { "16GB": 1, "32GB": 1.14 },
      storage: { "512GB": 1, "1TB": 1.16 },
    },
    specs: [
      { label: "Display", value: "13.4\" FHD+ InfinityEdge" },
      { label: "Processor", value: "Intel Core Ultra 7" },
      { label: "Memory", value: "16GB / 32GB LPDDR5X" },
      { label: "Weight", value: "1.17 kg" },
    ],
    popularity: 74,
  },
  {
    id: "lenovo-thinkpad-e14",
    slug: "lenovo-thinkpad-e14",
    name: "Lenovo ThinkPad E14 Gen 6",
    brand: "Lenovo",
    category: "laptops",
    categoryName: "Laptops",
    description:
      "Business-ready ThinkPad E14 with Intel Core Ultra 5, 14\" display and the legendary ThinkPad keyboard.",
    accent: "#1d4ed8",
    basePrice: 249_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["16GB", "32GB"] },
      { key: "storage", label: "Storage", options: ["512GB", "1TB"] },
    ],
    variants: [
      { ram: "16GB", storage: "512GB" },
      { ram: "32GB", storage: "1TB" },
    ],
    modifiers: {
      ram: { "16GB": 1, "32GB": 1.12 },
      storage: { "512GB": 1, "1TB": 1.14 },
    },
    specs: [
      { label: "Display", value: "14\" FHD IPS" },
      { label: "Processor", value: "Intel Core Ultra 5" },
      { label: "Memory", value: "16GB / 32GB" },
      { label: "Weight", value: "1.41 kg" },
    ],
    popularity: 70,
  },
  {
    id: "hp-pavilion-15",
    slug: "hp-pavilion-15",
    name: "HP Pavilion 15",
    brand: "HP",
    category: "laptops",
    categoryName: "Laptops",
    description:
      "HP Pavilion 15 with Intel Core i5, 15.6\" FHD display and fast SSD storage for everyday productivity.",
    accent: "#0891b2",
    basePrice: 219_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["8GB", "16GB"] },
      { key: "storage", label: "Storage", options: ["512GB", "1TB"] },
    ],
    variants: [
      { ram: "8GB", storage: "512GB" },
      { ram: "16GB", storage: "512GB" },
      { ram: "16GB", storage: "1TB" },
    ],
    modifiers: {
      ram: { "8GB": 1, "16GB": 1.08 },
      storage: { "512GB": 1, "1TB": 1.13 },
    },
    specs: [
      { label: "Display", value: "15.6\" FHD IPS" },
      { label: "Processor", value: "Intel Core i5-1335U" },
      { label: "Memory", value: "8GB / 16GB DDR4" },
      { label: "Weight", value: "1.75 kg" },
    ],
    popularity: 72,
  },
  {
    id: "asus-vivobook-16",
    slug: "asus-vivobook-16",
    name: "ASUS Vivobook 16",
    brand: "ASUS",
    category: "laptops",
    categoryName: "Laptops",
    description:
      "ASUS Vivobook 16 with AMD Ryzen 7, 16\" FHD+ display and a full numeric keypad.",
    accent: "#9333ea",
    basePrice: 189_990,
    attributes: [
      { key: "ram", label: "RAM", options: ["16GB"] },
      { key: "storage", label: "Storage", options: ["512GB", "1TB"] },
    ],
    variants: [
      { ram: "16GB", storage: "512GB" },
      { ram: "16GB", storage: "1TB" },
    ],
    modifiers: {
      storage: { "512GB": 1, "1TB": 1.13 },
    },
    specs: [
      { label: "Display", value: "16\" FHD+ IPS" },
      { label: "Processor", value: "AMD Ryzen 7 7730U" },
      { label: "Memory", value: "16GB DDR4" },
      { label: "Weight", value: "1.88 kg" },
    ],
    popularity: 68,
  },

  // ── TVs ───────────────────────────────────────────────────────────────────
  {
    id: "samsung-55-crystal-uhd",
    slug: "samsung-55-crystal-uhd",
    name: "Samsung 55\" Crystal UHD TV",
    brand: "Samsung",
    category: "tvs",
    categoryName: "TVs",
    description:
      "Samsung 55\" Crystal UHD 4K smart TV with Crystal Processor 4K and Tizen OS.",
    accent: "#2563eb",
    basePrice: 189_990,
    attributes: [
      { key: "screen", label: "Screen Size", options: ["55\"", "65\""] },
      { key: "resolution", label: "Resolution", options: ["4K UHD"] },
    ],
    variants: [
      { screen: "55\"", resolution: "4K UHD" },
      { screen: "65\"", resolution: "4K UHD" },
    ],
    modifiers: {
      screen: { "55\"": 1, "65\"": 1.35 },
    },
    specs: [
      { label: "Display", value: "55\" / 65\" Crystal UHD" },
      { label: "Resolution", value: "3840 x 2160 (4K)" },
      { label: "Smart TV", value: "Tizen OS" },
      { label: "HDR", value: "HDR10+" },
    ],
    popularity: 85,
  },
  {
    id: "lg-43-uhd",
    slug: "lg-43-uhd",
    name: "LG 43\" UHD TV",
    brand: "LG",
    category: "tvs",
    categoryName: "TVs",
    description:
      "LG 43\" UHD 4K smart TV with webOS and Active HDR for vivid picture quality.",
    accent: "#c026d3",
    basePrice: 129_990,
    attributes: [
      { key: "screen", label: "Screen Size", options: ["43\"", "50\""] },
      { key: "resolution", label: "Resolution", options: ["4K UHD"] },
    ],
    variants: [
      { screen: "43\"", resolution: "4K UHD" },
      { screen: "50\"", resolution: "4K UHD" },
    ],
    modifiers: {
      screen: { "43\"": 1, "50\"": 1.22 },
    },
    specs: [
      { label: "Display", value: "43\" / 50\" UHD" },
      { label: "Resolution", value: "3840 x 2160 (4K)" },
      { label: "Smart TV", value: "webOS 23" },
      { label: "HDR", value: "Active HDR" },
    ],
    popularity: 76,
  },
  {
    id: "sony-bravia-50",
    slug: "sony-bravia-50",
    name: "Sony Bravia 50\" 4K TV",
    brand: "Sony",
    category: "tvs",
    categoryName: "TVs",
    description:
      "Sony Bravia 50\" 4K HDR TV with Google TV and X1 processor for lifelike colour.",
    accent: "#0d9488",
    basePrice: 219_990,
    attributes: [
      { key: "screen", label: "Screen Size", options: ["50\"", "55\""] },
      { key: "resolution", label: "Resolution", options: ["4K HDR"] },
    ],
    variants: [
      { screen: "50\"", resolution: "4K HDR" },
      { screen: "55\"", resolution: "4K HDR" },
    ],
    modifiers: {
      screen: { "50\"": 1, "55\"": 1.18 },
    },
    specs: [
      { label: "Display", value: "50\" / 55\" LED" },
      { label: "Resolution", value: "3840 x 2160 (4K)" },
      { label: "Smart TV", value: "Google TV" },
      { label: "HDR", value: "HDR10 / HLG" },
    ],
    popularity: 71,
  },

  // ── Headphones ────────────────────────────────────────────────────────────
  {
    id: "sony-wh-1000xm6",
    slug: "sony-wh-1000xm6",
    name: "Sony WH-1000XM6",
    brand: "Sony",
    category: "headphones",
    categoryName: "Headphones",
    description:
      "Industry-leading noise cancelling wireless headphones with 30-hour battery life and multipoint connection.",
    accent: "#18181b",
    basePrice: 119_990,
    attributes: [
      { key: "colour", label: "Colour", options: ["Black", "Silver"] },
    ],
    variants: [
      { colour: "Black" },
      { colour: "Silver" },
    ],
    specs: [
      { label: "Type", value: "Over-ear, wireless" },
      { label: "Noise cancelling", value: "Yes (ANC)" },
      { label: "Battery", value: "30 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3, multipoint" },
    ],
    popularity: 89,
  },
  {
    id: "airpods-pro-3",
    slug: "airpods-pro-3",
    name: "Apple AirPods Pro 3",
    brand: "Apple",
    category: "headphones",
    categoryName: "Headphones",
    description:
      "AirPods Pro 3 with active noise cancellation, Adaptive Audio and USB-C charging case.",
    accent: "#e5e5e5",
    basePrice: 139_990,
    attributes: [{ key: "colour", label: "Colour", options: ["White"] }],
    variants: [{ colour: "White" }],
    specs: [
      { label: "Type", value: "In-ear, wireless" },
      { label: "Noise cancelling", value: "Yes (ANC)" },
      { label: "Battery", value: "6h + 24h case" },
      { label: "Chip", value: "H2" },
    ],
    popularity: 92,
  },
  {
    id: "jbl-tune-770nc",
    slug: "jbl-tune-770nc",
    name: "JBL Tune 770NC",
    brand: "JBL",
    category: "headphones",
    categoryName: "Headphones",
    description:
      "JBL Tune 770NC wireless over-ear headphones with adaptive noise cancelling and 70-hour battery life.",
    accent: "#2563eb",
    basePrice: 54_990,
    attributes: [
      { key: "colour", label: "Colour", options: ["Black", "Blue", "White"] },
    ],
    variants: [
      { colour: "Black" },
      { colour: "Blue" },
      { colour: "White" },
    ],
    specs: [
      { label: "Type", value: "Over-ear, wireless" },
      { label: "Noise cancelling", value: "Yes (ANC)" },
      { label: "Battery", value: "70 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
    ],
    popularity: 66,
  },

  // ── Home Appliances ───────────────────────────────────────────────────────
  {
    id: "samsung-washing-machine-7kg",
    slug: "samsung-washing-machine-7kg",
    name: "Samsung 7kg Washing Machine",
    brand: "Samsung",
    category: "appliances",
    categoryName: "Home Appliances",
    description:
      "Samsung 7kg front-load washing machine with EcoBubble technology and digital inverter motor.",
    accent: "#0284c7",
    basePrice: 149_990,
    attributes: [
      { key: "capacity", label: "Capacity", options: ["7kg", "8kg"] },
    ],
    variants: [
      { capacity: "7kg" },
      { capacity: "8kg" },
    ],
    modifiers: {
      capacity: { "7kg": 1, "8kg": 1.12 },
    },
    specs: [
      { label: "Type", value: "Front load" },
      { label: "Capacity", value: "7kg / 8kg" },
      { label: "Motor", value: "Digital inverter" },
      { label: "Spin speed", value: "1400 rpm" },
    ],
    popularity: 80,
  },
  {
    id: "lg-refrigerator-260l",
    slug: "lg-refrigerator-260l",
    name: "LG 260L Refrigerator",
    brand: "LG",
    category: "appliances",
    categoryName: "Home Appliances",
    description:
      "LG 260L double-door refrigerator with Smart Inverter compressor and moisture balance crisper.",
    accent: "#7c3aed",
    basePrice: 189_990,
    attributes: [
      { key: "capacity", label: "Capacity", options: ["260L", "320L"] },
    ],
    variants: [
      { capacity: "260L" },
      { capacity: "320L" },
    ],
    modifiers: {
      capacity: { "260L": 1, "320L": 1.18 },
    },
    specs: [
      { label: "Type", value: "Double door" },
      { label: "Capacity", value: "260L / 320L" },
      { label: "Compressor", value: "Smart Inverter" },
      { label: "Energy", value: "5 Star" },
    ],
    popularity: 77,
  },
  {
    id: "singer-rice-cooker",
    slug: "singer-rice-cooker",
    name: "Singer Rice Cooker 1.8L",
    brand: "Singer",
    category: "appliances",
    categoryName: "Home Appliances",
    description:
      "Singer 1.8L rice cooker with keep-warm function and non-stick inner pot.",
    accent: "#d97706",
    basePrice: 12_990,
    attributes: [
      { key: "capacity", label: "Capacity", options: ["1.8L", "2.8L"] },
    ],
    variants: [
      { capacity: "1.8L" },
      { capacity: "2.8L" },
    ],
    modifiers: {
      capacity: { "1.8L": 1, "2.8L": 1.25 },
    },
    specs: [
      { label: "Capacity", value: "1.8L / 2.8L" },
      { label: "Power", value: "500W" },
      { label: "Features", value: "Keep warm, non-stick pot" },
    ],
    popularity: 64,
  },

  // ── Milk Powder ───────────────────────────────────────────────────────────
  {
    id: "anchor-full-cream-milk-powder",
    slug: "anchor-full-cream-milk-powder",
    name: "Anchor Full Cream Milk Powder",
    brand: "Anchor",
    category: "milk-powder",
    categoryName: "Milk Powder",
    description:
      "Anchor Full Cream Milk Powder — rich and creamy, made from fresh New Zealand milk.",
    accent: "#2563eb",
    basePrice: 2_450,
    attributes: [
      { key: "weight", label: "Weight", options: ["400g", "1kg"] },
      { key: "type", label: "Type", options: ["Full Cream"] },
    ],
    variants: [
      { weight: "400g", type: "Full Cream" },
      { weight: "1kg", type: "Full Cream" },
    ],
    modifiers: {
      weight: { "400g": 0.42, "1kg": 1 },
    },
    specs: [
      { label: "Type", value: "Full cream" },
      { label: "Weight", value: "400g / 1kg" },
      { label: "Origin", value: "New Zealand" },
    ],
    popularity: 97,
  },
  {
    id: "anchor-non-fat-milk-powder",
    slug: "anchor-non-fat-milk-powder",
    name: "Anchor Non-Fat Milk Powder",
    brand: "Anchor",
    category: "milk-powder",
    categoryName: "Milk Powder",
    description:
      "Anchor Non-Fat Milk Powder — the everyday choice for tea and coffee.",
    accent: "#0ea5e9",
    basePrice: 2_350,
    attributes: [
      { key: "weight", label: "Weight", options: ["400g", "1kg"] },
      { key: "type", label: "Type", options: ["Non-Fat"] },
    ],
    variants: [
      { weight: "400g", type: "Non-Fat" },
      { weight: "1kg", type: "Non-Fat" },
    ],
    modifiers: {
      weight: { "400g": 0.42, "1kg": 1 },
    },
    specs: [
      { label: "Type", value: "Non-fat" },
      { label: "Weight", value: "400g / 1kg" },
      { label: "Origin", value: "New Zealand" },
    ],
    popularity: 84,
  },
  {
    id: "nespray-milk-powder",
    slug: "nespray-milk-powder",
    name: "Nespray Milk Powder",
    brand: "Nestlé",
    category: "milk-powder",
    categoryName: "Milk Powder",
    description:
      "Nespray full cream milk powder — trusted nutrition for the whole family.",
    accent: "#dc2626",
    basePrice: 1_450,
    attributes: [
      { key: "weight", label: "Weight", options: ["400g", "900g"] },
      { key: "type", label: "Type", options: ["Full Cream"] },
    ],
    variants: [
      { weight: "400g", type: "Full Cream" },
      { weight: "900g", type: "Full Cream" },
    ],
    modifiers: {
      weight: { "400g": 1, "900g": 2.05 },
    },
    specs: [
      { label: "Type", value: "Full cream" },
      { label: "Weight", value: "400g / 900g" },
      { label: "Origin", value: "Sri Lanka" },
    ],
    popularity: 86,
  },

  // ── Rice ──────────────────────────────────────────────────────────────────
  {
    id: "keells-basmati-rice",
    slug: "keells-basmati-rice",
    name: "Keells Basmati Rice 5kg",
    brand: "Keells",
    category: "rice",
    categoryName: "Rice",
    description:
      "Premium long-grain basmati rice, aged for extra aroma — 5kg pack.",
    accent: "#b45309",
    basePrice: 7_450,
    attributes: [
      { key: "weight", label: "Weight", options: ["5kg", "10kg"] },
      { key: "type", label: "Type", options: ["Basmati"] },
    ],
    variants: [
      { weight: "5kg", type: "Basmati" },
      { weight: "10kg", type: "Basmati" },
    ],
    modifiers: {
      weight: { "5kg": 1, "10kg": 1.9 },
    },
    specs: [
      { label: "Type", value: "Basmati" },
      { label: "Weight", value: "5kg / 10kg" },
      { label: "Origin", value: "Imported" },
    ],
    popularity: 83,
  },
  {
    id: "rathna-samba-rice",
    slug: "rathna-samba-rice",
    name: "Rathna Samba Rice 10kg",
    brand: "Rathna",
    category: "rice",
    categoryName: "Rice",
    description:
      "Sri Lankan white samba rice — the everyday staple, 10kg bag.",
    accent: "#65a30d",
    basePrice: 6_850,
    attributes: [
      { key: "weight", label: "Weight", options: ["5kg", "10kg"] },
      { key: "type", label: "Type", options: ["Samba"] },
    ],
    variants: [
      { weight: "5kg", type: "Samba" },
      { weight: "10kg", type: "Samba" },
    ],
    modifiers: {
      weight: { "5kg": 1, "10kg": 1.9 },
    },
    specs: [
      { label: "Type", value: "White samba" },
      { label: "Weight", value: "5kg / 10kg" },
      { label: "Origin", value: "Sri Lanka" },
    ],
    popularity: 87,
  },

  // ── Shoes ─────────────────────────────────────────────────────────────────
  {
    id: "nike-air-zoom-pegasus-41",
    slug: "nike-air-zoom-pegasus-41",
    name: "Nike Air Zoom Pegasus 41",
    brand: "Nike",
    category: "shoes",
    categoryName: "Shoes",
    description:
      "Everyday running shoe with responsive Zoom Air cushioning and a breathable mesh upper.",
    accent: "#dc2626",
    basePrice: 54_990,
    attributes: [
      { key: "size", label: "Size", options: ["UK 7", "UK 8", "UK 9", "UK 10"] },
      { key: "colour", label: "Colour", options: ["Black", "White"] },
      { key: "gender", label: "Gender", options: ["Men"] },
    ],
    variants: [
      { size: "UK 7", colour: "Black", gender: "Men" },
      { size: "UK 8", colour: "Black", gender: "Men" },
      { size: "UK 9", colour: "White", gender: "Men" },
      { size: "UK 10", colour: "White", gender: "Men" },
    ],
    specs: [
      { label: "Type", value: "Running" },
      { label: "Cushioning", value: "Zoom Air" },
      { label: "Upper", value: "Engineered mesh" },
    ],
    popularity: 75,
  },
  {
    id: "adidas-ultraboost-5",
    slug: "adidas-ultraboost-5",
    name: "Adidas Ultraboost 5",
    brand: "Adidas",
    category: "shoes",
    categoryName: "Shoes",
    description:
      "Ultraboost 5 with BOOST midsole energy return and a Primeknit upper.",
    accent: "#18181b",
    basePrice: 64_990,
    attributes: [
      { key: "size", label: "Size", options: ["UK 8", "UK 9", "UK 10"] },
      { key: "colour", label: "Colour", options: ["Core Black", "Cloud White"] },
      { key: "gender", label: "Gender", options: ["Men"] },
    ],
    variants: [
      { size: "UK 8", colour: "Core Black", gender: "Men" },
      { size: "UK 9", colour: "Core Black", gender: "Men" },
      { size: "UK 10", colour: "Cloud White", gender: "Men" },
    ],
    specs: [
      { label: "Type", value: "Running" },
      { label: "Cushioning", value: "BOOST" },
      { label: "Upper", value: "Primeknit" },
    ],
    popularity: 73,
  },
];

/* ------------------------------- catalogue ------------------------------- */

const PRODUCTS: Product[] = SPECS.map(buildProduct);

/**
 * Replace demo offers with real scraped offers wherever the scraper snapshot
 * has an exact variant match. Unmatched variants keep their demo offers so the
 * catalogue stays complete while real coverage grows.
 */
function mergeRealOffers(products: Product[]): void {
  for (const product of products) {
    for (const variant of product.variants) {
      const real = findRealOffers(product, variant);
      if (!real.length) continue;
      product.offers = [
        ...product.offers.filter((o) => o.variantId !== variant.id),
        ...real,
      ];
    }
  }
}

mergeRealOffers(PRODUCTS);

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));
}

export function getPopularProducts(n = 8): Product[] {
  return [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, n);
}

/** Lowest in-stock/limited offer price across all variants. */
export function getStartingPrice(product: Product): number {
  const prices = product.offers
    .filter((o) => o.availability !== "out_of_stock")
    .map((o) => o.price);
  return prices.length ? Math.min(...prices) : 0;
}

export function getStoreCount(product: Product): number {
  return new Set(product.offers.map((o) => o.retailerId)).size;
}

/** Unique retailer names carrying this product, cheapest offer first. */
export function getStoreNames(product: Product): string[] {
  const byRetailer = new Map<string, number>();
  for (const o of product.offers) {
    if (o.availability === "out_of_stock") continue;
    const current = byRetailer.get(o.retailerId);
    if (current == null || o.price < current) byRetailer.set(o.retailerId, o.price);
  }
  return [...byRetailer.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => getRetailer(id)?.name ?? "Store");
}

export function getLowestOfferForVariant(product: Product, variantId: string): RetailerOffer | undefined {
  return product.offers
    .filter((o) => o.variantId === variantId && o.availability !== "out_of_stock")
    .sort((a, b) => a.price - b.price)[0];
}

export function getVariant(product: Product, attrs: Record<string, string>): ProductVariant | undefined {
  return product.variants.find((v) =>
    Object.entries(attrs).every(([k, val]) => v.attributes[k] === val),
  );
}

/** Top price drops across the catalogue, for the Deals page & homepage. */
export function getDeals(n = 12): Deal[] {
  const deals: Deal[] = [];
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      const history = product.priceHistory[variant.id];
      if (!history || history.length < 2) continue;
      const current = history[history.length - 1].price;
      const prev = history[history.length - 2].price;
      if (prev > current) {
        const offer = getLowestOfferForVariant(product, variant.id);
        if (!offer) continue;
        deals.push({
          productSlug: product.slug,
          productName: product.name,
          brand: product.brand,
          image: product.image,
          accent: product.accent,
          variantLabel: variant.label,
          retailerName: getRetailer(offer.retailerId)?.name ?? "Store",
          retailerId: offer.retailerId,
          oldPrice: prev,
          newPrice: current,
          savings: prev - current,
          dropPercent: ((prev - current) / prev) * 100,
          lastChecked: offer.lastChecked,
          category: product.category,
          categoryName: product.categoryName,
        });
      }
    }
  }
  return deals.sort((a, b) => b.savings - a.savings).slice(0, n);
}

/** Distinct attribute values across a category — powers the filter sidebar. */
export function getCategoryFilterOptions(category: string): Record<string, string[]> {
  const products = getProductsByCategory(category);
  const map: Record<string, Set<string>> = {};
  for (const p of products) {
    for (const v of p.variants) {
      for (const [key, value] of Object.entries(v.attributes)) {
        (map[key] ??= new Set()).add(value);
      }
    }
  }
  const out: Record<string, string[]> = {};
  for (const [k, set] of Object.entries(map)) out[k] = [...set];
  return out;
}