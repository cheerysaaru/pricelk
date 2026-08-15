/**
 * REAL SCRAPED DATA
 * -----------------
 * Loads the merged scraper snapshot (lib/data/scraped-snapshot.json, produced
 * by scrapers/run_batch.py) and matches records to demo catalogue variants.
 *
 * Matching is exact-variant: brand + model tokens + storage/RAM must all agree,
 * and the scraped name must not carry a model qualifier the demo product lacks
 * (e.g. "S25 Ultra" never matches the "S25" product).
 *
 * The snapshot is bundled JSON, so this module is safe on server and client.
 */
import type { Product, ProductVariant, RetailerOffer } from "@/lib/types";
import snapshot from "./scraped-snapshot.json";

export interface ScrapedRecord {
  retailer: string;
  name: string;
  brand: string | null;
  sku: string;
  price: number | null;
  regular_price: number | null;
  sale_price: number | null;
  currency: string;
  url: string;
  image: string;
  category: string;
  attrs: Record<string, string>;
  on_sale: boolean;
  junk: boolean;
}

const RECORDS = snapshot as unknown as ScrapedRecord[];

/** Model qualifiers that distinguish a different model (block match if extra). */
const MODEL_QUALIFIERS = new Set([
  "ultra", "plus", "pro", "max", "edge", "mini", "lite", "fe", "se",
  "note", "fold", "flip", "xl", "xr", "s", "e", "c", "t", "a", "m", "p",
]);

export const RETAILER_IDS: Record<string, string> = {
  "Wasi.lk": "wasi",
  "iDealz": "idealz",
  "Takas": "takas",
  "Abans": "abans",
  "Acecom": "acecom",
  "PC.LK": "pclk",
  "ComputerCare": "computercare",
  "Laptop.lk": "laptop_lk",
  "Toplaps": "toplaps",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

/** Product name tokens minus the brand, e.g. "Samsung Galaxy S25" -> ["galaxy", "s25"]. */
function modelTokens(product: Product): string[] {
  const brandTokens = new Set(tokens(product.brand));
  return tokens(product.name).filter((t) => !brandTokens.has(t));
}

function matchesProduct(record: ScrapedRecord, product: Product): boolean {
  if (!record.brand || normalize(record.brand) !== normalize(product.brand)) return false;
  if (record.price == null) return false;
  const mt = modelTokens(product);
  if (!mt.length) return false;
  const rt = new Set(tokens(record.name));
  if (!mt.every((t) => rt.has(t))) return false;
  for (const q of MODEL_QUALIFIERS) {
    if (rt.has(q) && !mt.includes(q)) return false;
  }
  return true;
}

function matchesVariant(record: ScrapedRecord, variant: ProductVariant): boolean {
  const attrs = variant.attributes;
  for (const [key, value] of Object.entries(attrs)) {
    const recVal = record.attrs[key];
    if (recVal && normalize(recVal) !== normalize(value)) return false;
  }
  return true;
}

/** Real offers for one variant, or [] when the retailer has no exact match. */
export function findRealOffers(product: Product, variant: ProductVariant): RetailerOffer[] {
  const offers: RetailerOffer[] = [];
  for (const record of RECORDS) {
    if (!matchesProduct(record, product) || !matchesVariant(record, variant)) continue;
    const retailerId = RETAILER_IDS[record.retailer];
    if (!retailerId) continue;
    offers.push({
      id: `real-${retailerId}-${record.sku || record.name.slice(0, 24)}`,
      retailerId,
      variantId: variant.id,
      price: record.price as number,
      currency: "LKR",
      availability: "in_stock",
      lastChecked: new Date().toISOString(),
      url: record.url,
      sku: record.sku,
      exactMatch: true,
    });
  }
  return offers;
}

/** Number of real (non-demo) records in the snapshot. */
export function getScrapedCount(): number {
  return RECORDS.length;
}

/** All scraped records (used to build the searchable real-product index). */
export function getScrapedRecords(): ScrapedRecord[] {
  return RECORDS;
}

const RETAILER_NAMES: Record<string, string> = {
  wasi: "Wasi.lk",
  idealz: "iDealz",
  takas: "Takas",
  abans: "Abans",
  acecom: "Acecom",
  pclk: "PC.LK",
  computercare: "ComputerCare",
  laptop_lk: "Laptop.lk",
  toplaps: "Toplaps",
};

/** Real retailers present in the snapshot, with record counts. */
export function getScrapedRetailers(): { id: string; name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of RECORDS) {
    const id = RETAILER_IDS[r.retailer];
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()].map(([id, count]) => ({
    id,
    name: RETAILER_NAMES[id] ?? id,
    count,
  }));
}