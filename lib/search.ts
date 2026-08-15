import type { Product, SearchResult } from "@/lib/types";
import { getAllProducts, getStartingPrice, getStoreCount, getStoreNames } from "@/lib/data/products";
import { getRealProducts } from "@/lib/data/real-products";

/**
 * Search over the internal Sri Lankan catalogue only.
 * No external/international sources are ever consulted.
 *
 * The index is the demo catalogue PLUS every real product collected by the
 * scraper pipeline, so a search like "laptop" surfaces real laptops from all
 * scraped Sri Lankan stores, not just the demo products.
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Unified search item: demo product or real scraped product. */
interface SearchItem {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  image: string;
  accent: string;
  price: number;
  stores: number;
  storeNames: string[];
  popularity: number;
  attrs: Record<string, string[]>;
  url?: string;
  retailerId?: string;
  isReal?: boolean;
  /** Demo-only: the source product (for saving/deal/recent sorts). */
  product?: Product;
}

function scoreItem(item: SearchItem, q: string): number {
  const nq = normalize(q);
  if (!nq) return 0;
  const name = normalize(item.name);
  const brand = normalize(item.brand);
  const category = normalize(item.categoryName);
  const attrText = normalize(Object.values(item.attrs).flat().join(" "));
  const combined = `${name} ${brand} ${category} ${attrText}`;

  const tokens = nq.split(" ");
  // Multi-token queries must match EVERY token somewhere (name/brand/category/
  // attrs), so "samsung 55" does not return every Samsung phone.
  if (tokens.length > 1 && !tokens.every((t) => combined.includes(t))) return 0;

  if (name === nq) return 1000;
  if (name.startsWith(nq)) return 900;
  if (name.includes(nq)) return 700;
  if (brand.startsWith(nq)) return 600;
  if (brand.includes(nq)) return 500;
  if (category.includes(nq)) return 400;
  if (attrText.includes(nq)) return 300;

  if (tokens.every((t) => name.includes(t))) return 650;
  if (tokens.some((t) => name.includes(t))) return 350;

  return 0;
}

function demoItems(): SearchItem[] {
  return getAllProducts().map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categoryName: p.categoryName,
    image: p.image,
    accent: p.accent,
    price: getStartingPrice(p),
    stores: getStoreCount(p),
    storeNames: getStoreNames(p),
    popularity: p.popularity,
    attrs: aggregateVariantAttrs(p),
    product: p,
  }));
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
    stores: 1,
    storeNames: [p.retailerName],
    popularity: 0,
    attrs: Object.fromEntries(Object.entries(p.attrs).map(([k, v]) => [k, [v]])),
    url: p.url,
    retailerId: p.retailerId,
    isReal: true,
  }));
}

function aggregateVariantAttrs(p: Product): Record<string, string[]> {
  const sets: Record<string, Set<string>> = {};
  for (const v of p.variants) {
    for (const [key, value] of Object.entries(v.attributes)) {
      (sets[key] ??= new Set<string>()).add(value);
    }
  }
  return Object.fromEntries(Object.entries(sets).map(([k, s]) => [k, [...s]]));
}

export interface SearchOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<string, string[]>;
  sort?: "lowest" | "highest" | "saving" | "deal" | "recent";
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
  let items: SearchItem[] = [...demoItems(), ...realItems()];

  if (q) {
    items = items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
      .map((x) => x.item);
  } else {
    items = [...items].sort((a, b) => b.popularity - a.popularity || a.price - b.price);
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

  switch (opts.sort ?? "lowest") {
    case "lowest":
      items.sort((a, b) => a.price - b.price);
      break;
    case "highest":
      items.sort((a, b) => b.price - a.price);
      break;
    case "saving":
      items.sort((a, b) => biggestSaving(b) - biggestSaving(a));
      break;
    case "deal":
      items.sort((a, b) => b.popularity - a.popularity || a.price - b.price);
      break;
    case "recent":
      items.sort((a, b) => newestOffer(b) - newestOffer(a));
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
    stores: i.stores,
    storeNames: i.storeNames,
    url: i.url,
    retailerId: i.retailerId,
    isReal: i.isReal,
  }));

  return { results, total, page, pageSize, totalPages, brands, attributeOptions };
}

function biggestSaving(i: SearchItem): number {
  const p = i.product;
  if (!p) return 0;
  let best = 0;
  for (const variant of p.variants) {
    const h = p.priceHistory[variant.id];
    if (!h || h.length < 2) continue;
    const current = h[h.length - 1].price;
    const prev = h[h.length - 2].price;
    best = Math.max(best, prev - current);
  }
  return best;
}

function newestOffer(i: SearchItem): number {
  const p = i.product;
  if (!p) return 0;
  return Math.max(...p.offers.map((o) => new Date(o.lastChecked).getTime()));
}

/** Autocomplete: top 8 matches with starting price. */
export function autocomplete(query: string, limit = 8): SearchResult[] {
  const res = searchProducts(query, { sort: "deal", pageSize: limit });
  return res.results;
}