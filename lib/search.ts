import type { SearchResult } from "@/lib/types";
import { getRealProducts } from "@/lib/data/real-products";

/**
 * Search over the scraped Sri Lankan catalogue only.
 * No external/international sources are ever consulted, and no demo/fake
 * products appear here — every result is a real product with a live price
 * collected from a Sri Lankan retailer's website.
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Keywords that prove a product name actually describes its category. Used to
 * rank real category matches (e.g. a MacBook when searching "laptop") above
 * accessories that a retailer happened to file under that category (e.g. CMOS
 * batteries filed under laptops, or "Laptop Backpack" items).
 *
 * `strong` = model/type words that almost always mean the real product
 *            (macbook, thinkpad, oled, iphone, ...).
 * `generic` = the plain category word itself ("laptop", "tv", "phone"), which
 *             also appears in accessory names like "Laptop Power Cable".
 */
const CATEGORY_KEYWORDS: Record<string, { strong: string[]; generic: string[] }> = {
  laptops: {
    strong: [
      "macbook", "notebook", "thinkpad", "ideapad", "vivobook", "zenbook",
      "chromebook", "surface", "aspire", "pavilion", "gaming", "ultrabook",
    ],
    generic: ["laptop"],
  },
  phones: {
    strong: [
      "galaxy", "iphone", "pixel", "redmi", "xiaomi", "realme", "oppo",
      "vivo", "infinix", "nokia", "honor", "oneplus", "tecno",
    ],
    generic: ["phone", "smartphone"],
  },
  tvs: {
    strong: ["television", "oled", "qled", "nano"],
    generic: ["tv", "led"],
  },
  headphones: {
    strong: ["airpod", "earbud", "headset", "soundbar"],
    generic: ["headphone", "earphone", "speaker"],
  },
  appliances: {
    strong: [
      "washing", "washer", "dryer", "refrigerator", "fridge", "microwave",
      "oven", "vacuum", "kettle", "blender", "mixer", "conditioner", "heater",
    ],
    generic: ["iron", "fan", "cooker"],
  },
  refrigerators: {
    strong: ["refrigerator", "fridge", "freezer"],
    generic: [],
  },
  "rice-cookers": {
    strong: ["rice cooker", "cooker"],
    generic: [],
  },
  "milk-powder": {
    strong: ["milk"],
    generic: ["powder"],
  },
  rice: {
    strong: ["rice"],
    generic: [],
  },
};

/**
 * Words that mark a product as an accessory or consumable rather than the
 * category product itself ("Laptop Power Cable", "Notebook Cooling Pad",
 * "CMOS Battery", "Gaming Chair", "Barcode Scanner"). Used to keep accessories
 * below real products when the query is a category word.
 */
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

/** Unified search item: a real scraped product (single-offer). */
interface SearchItem {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  image: string;
  accent: string;
  price: number;
  storeNames: string[];
  attrs: Record<string, string[]>;
  url: string;
  retailerId: string;
  lastChecked: number;
}

function scoreItem(item: SearchItem, q: string): number {
  const nq = normalize(q);
  if (!nq) return 0;
  const name = normalize(item.name);
  const nameCompact = name.replace(/\s+/g, "");
  const brand = normalize(item.brand);
  const category = normalize(item.categoryName);
  const attrText = normalize(Object.values(item.attrs).flat().join(" "));
  const combined = `${name} ${brand} ${category} ${attrText}`;

  const tokens = nq.split(" ");
  // Multi-token queries must match EVERY token somewhere (name/brand/category/
  // attrs), so "samsung 55" does not return every Samsung phone.
  if (tokens.length > 1 && !tokens.every((t) => combined.includes(t))) return 0;

  // If the user explicitly searched for an accessory word ("monitor",
  // "keyboard", "cable"), accessories are the desired result — no cap.
  const queryIsAccessory = ACCESSORY_WORDS.includes(nq);
  const hasAccessory = !queryIsAccessory && ACCESSORY_WORDS.some((a) => name.includes(a));

  // Single-token category-word query ("laptop", "tv", "phone", ...): rank by
  // whether the name proves it is the real category product.
  if (tokens.length === 1 && category.includes(nq)) {
    const kw = CATEGORY_KEYWORDS[item.category];
    if (kw) {
      const hasStrong = kw.strong.some(
        (k) => name.includes(k) || nameCompact.includes(k.replace(/\s+/g, "")),
      );
      const hasGeneric = kw.generic.some((k) => name.includes(k));
      if (hasAccessory) return hasGeneric ? 550 : 500;
      if (hasStrong) return 800;
      if (hasGeneric) return 700;
      return 600; // category match, presumed real product
    }
  }

  let score: number;
  if (name === nq) score = 1000;
  else if (name.startsWith(nq)) score = 900;
  else if (name.includes(nq)) score = 700;
  else if (brand.startsWith(nq)) score = 600;
  else if (brand.includes(nq)) score = 500;
  else if (category.includes(nq)) score = 400;
  else if (attrText.includes(nq)) score = 300;
  else if (tokens.every((t) => name.includes(t))) score = 650;
  else if (tokens.some((t) => name.includes(t))) score = 350;
  else score = 0;

  // Accessory names that merely contain the query word ("TVS barcode scanner"
  // for "tv", "Gaming Chair" for "laptop") must not outrank real products.
  if (hasAccessory && score > 500) return 500;
  return score;
}

function realItems(): SearchItem[] {
  return getRealProducts().map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categoryName: p.categoryName,
    image: p.image,
    accent: p.accent,
    price: p.price,
    storeNames: [p.retailerName],
    attrs: Object.fromEntries(Object.entries(p.attrs).map(([k, v]) => [k, [v]])),
    url: p.url,
    retailerId: p.retailerId,
    lastChecked: Date.now(),
  }));
}

export interface SearchOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<string, string[]>;
  sort?: "lowest" | "highest" | "recent";
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  brands: string[];
  attributeOptions: Record<string, string[]>;
}

export function searchProducts(query: string, opts: SearchOptions = {}): SearchResponse {
  const q = query.trim();
  let items: SearchItem[] = realItems();

  // Relevance scores per slug — kept so the chosen sort never overrides the
  // query's ranking: with a query, score is primary and the sort is a tiebreak;
  // without a query, the sort applies fully.
  const scores = new Map<string, number>();

  if (q) {
    const ranked = items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.price - b.item.price);
    items = ranked.map((x) => {
      scores.set(x.item.slug, x.score);
      return x.item;
    });
  }

  if (opts.category) items = items.filter((i) => i.category === opts.category);
  if (opts.brand) items = items.filter((i) => i.brand === opts.brand);

  if (opts.minPrice != null || opts.maxPrice != null) {
    items = items.filter((i) => {
      if (opts.minPrice != null && i.price < opts.minPrice) return false;
      if (opts.maxPrice != null && i.price > opts.maxPrice) return false;
      return true;
    });
  }

  const attrs = opts.attributes;
  if (attrs) {
    items = items.filter((i) => {
      for (const [key, values] of Object.entries(attrs)) {
        if (!values.length) continue;
        const has = values.some((v) => (i.attrs[key] ?? []).includes(v));
        if (!has) return false;
      }
      return true;
    });
  }

  const brands = [...new Set(items.map((i) => i.brand))].sort();

  const attrSets: Record<string, Set<string>> = {};
  for (const i of items) {
    for (const [key, values] of Object.entries(i.attrs)) {
      for (const v of values) (attrSets[key] ??= new Set<string>()).add(v);
    }
  }
  const attributeOptions: Record<string, string[]> = {};
  for (const [k, set] of Object.entries(attrSets)) attributeOptions[k] = [...set];

  const withQuery = Boolean(q);
  const scoreOf = (i: SearchItem) => scores.get(i.slug) ?? 0;

  switch (opts.sort ?? "lowest") {
    case "lowest":
      items.sort((a, b) =>
        withQuery ? scoreOf(b) - scoreOf(a) || a.price - b.price : a.price - b.price,
      );
      break;
    case "highest":
      items.sort((a, b) =>
        withQuery ? scoreOf(b) - scoreOf(a) || b.price - a.price : b.price - a.price,
      );
      break;
    case "recent":
      items.sort((a, b) =>
        withQuery ? scoreOf(b) - scoreOf(a) || b.lastChecked - a.lastChecked : b.lastChecked - a.lastChecked,
      );
      break;
  }

  const total = items.length;
  const pageSize = opts.pageSize ?? 24;
  const page = Math.max(1, opts.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const slice = items.slice((page - 1) * pageSize, page * pageSize);

  const results: SearchResult[] = slice.map((i) => ({
    slug: i.slug,
    name: i.name,
    brand: i.brand,
    category: i.category,
    categoryName: i.categoryName,
    image: i.image,
    accent: i.accent,
    startingPrice: i.price,
    stores: 1,
    storeNames: i.storeNames,
    url: i.url,
    retailerId: i.retailerId,
    isReal: true,
  }));

  return { results, total, page, pageSize, totalPages, brands, attributeOptions };
}

/** Autocomplete: top 8 most relevant matches. */
export function autocomplete(query: string, limit = 8): SearchResult[] {
  const res = searchProducts(query, { pageSize: limit });
  return res.results;
}
