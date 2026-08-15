/**
 * REAL PRODUCTS
 * -------------
 * Converts every scraped record into a searchable single-offer product so
 * search covers the FULL scraped catalogue (all stores), not just the demo
 * products. Each real product links directly to its retailer product page.
 */
import type { RealProduct } from "@/lib/types";
import { getRetailer } from "@/lib/data/retailers";
import { getScrapedRecords, RETAILER_IDS } from "@/lib/data/scraped";

const CATEGORY_MAP: Record<string, string> = {
  phones: "phones",
  laptops: "laptops",
  tvs: "tvs",
  audio: "headphones",
  appliances: "appliances",
  refrigerators: "appliances",
  "rice-cookers": "appliances",
  groceries: "milk-powder",
};

const CATEGORY_NAMES: Record<string, string> = {
  phones: "Phones",
  laptops: "Laptops",
  tvs: "TVs",
  headphones: "Headphones",
  appliances: "Home Appliances",
  "milk-powder": "Milk Powder",
  rice: "Rice",
  shoes: "Shoes",
};

const ACCENTS = [
  "#4f46e5", "#0ea5e9", "#dc2626", "#16a34a",
  "#b45309", "#7c3aed", "#0284c7", "#e11d48",
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mapCategory(recordCategory: string, name: string): string {
  const base = CATEGORY_MAP[recordCategory] ?? "appliances";
  if (recordCategory === "groceries") {
    const n = name.toLowerCase();
    if (n.includes("rice")) return "rice";
    if (n.includes("milk")) return "milk-powder";
  }
  return base;
}

function buildRealProducts(): RealProduct[] {
  const out: RealProduct[] = [];
  for (const r of getScrapedRecords()) {
    // Skip junk records and placeholder prices (e.g. Rs.1 listings).
    if (r.junk || r.price == null || r.price < 100) continue;
    const retailerId = RETAILER_IDS[r.retailer];
    if (!retailerId) continue;
    const retailer = getRetailer(retailerId);
    const category = mapCategory(r.category, r.name);
    out.push({
      slug: `real-${retailerId}-${hashStr(r.name + r.price).toString(36)}`,
      name: r.name,
      brand: r.brand ?? "Unknown",
      category,
      categoryName: CATEGORY_NAMES[category] ?? "Products",
      image: r.image,
      accent: ACCENTS[hashStr(r.brand ?? r.name) % ACCENTS.length],
      price: r.price,
      retailerId,
      retailerName: retailer?.name ?? r.retailer,
      url: r.url,
      sku: r.sku,
      attrs: r.attrs,
      isReal: true,
    });
  }
  return out;
}

const REAL_PRODUCTS: RealProduct[] = buildRealProducts();

export function getRealProducts(): RealProduct[] {
  return REAL_PRODUCTS;
}

export function getRealProductsBySlugs(slugs: string[]): RealProduct[] {
  const bySlug = new Map(REAL_PRODUCTS.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter((p): p is RealProduct => Boolean(p));
}

export function getRealProductCount(): number {
  return REAL_PRODUCTS.length;
}