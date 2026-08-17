/**
 * Core domain types for PRICE LK.
 *
 * These mirror the production PostgreSQL/Drizzle schema (see README) so the
 * prototype can be swapped to real data without changing the UI layer.
 */

export type Availability = "in_stock" | "limited" | "out_of_stock";

export interface Retailer {
  id: string;
  name: string;
  domain: string;
  countryCode: "LK";
  currency: "LKR";
  isSriLankan: true;
  isVerified: true;
  isActive: true;
  lastVerified: string;
  logoColor: string;
  initials: string;
  description: string;
  productCount: number;
  updatedMinutesAgo: number;
  /** Demo-only flag: fictional placeholder retailer (false = real scraped store). */
  isDemo: boolean;
}

export interface AttributeDef {
  key: string;
  label: string;
  options: string[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  attributes: Record<string, string>;
  label: string;
}

export interface RetailerOffer {
  id: string;
  retailerId: string;
  variantId: string;
  price: number;
  currency: "LKR";
  availability: Availability;
  lastChecked: string;
  url: string;
  sku: string;
  exactMatch: true;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  description: string;
  image: string;
  accent: string;
  attributes: AttributeDef[];
  variants: ProductVariant[];
  offers: RetailerOffer[];
  priceHistory: Record<string, PricePoint[]>;
  specs: { label: string; value: string }[];
  popularity: number;
}

export interface SearchResult {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  image: string;
  accent: string;
  startingPrice: number;
  stores: number;
  /** Retailer names carrying this product, cheapest first. */
  storeNames: string[];
  /** Real scraped product: direct link to the retailer product page. */
  url?: string;
  retailerId?: string;
  isReal?: boolean;
}

/** A single-offer product from the scraper snapshot (one store, one price). */
export interface RealProduct {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  image: string;
  accent: string;
  price: number;
  retailerId: string;
  retailerName: string;
  url: string;
  sku: string;
  attrs: Record<string, string>;
  isReal: true;
}

export interface OfferWithRetailer extends RetailerOffer {
  retailer: Retailer;
  variant: ProductVariant;
}

export interface PriceStats {
  current: number;
  lowest: number;
  average: number;
  dropPercent: number;
  dealScore: number;
  dealLabel: string;
  dealReason: string;
}

export interface Deal {
  productSlug: string;
  productName: string;
  brand: string;
  image: string;
  accent: string;
  variantLabel: string;
  retailerName: string;
  retailerId: string;
  oldPrice: number;
  newPrice: number;
  savings: number;
  dropPercent: number;
  lastChecked: string;
  category: string;
  categoryName: string;
  /** Real scraped deal: direct link to the retailer product page. */
  url?: string;
}

/** Response of GET /api/offers — the exact-match comparison payload. */
export interface OffersResponse {
  product: {
    slug: string;
    name: string;
    brand: string;
    image: string;
    accent: string;
    categoryName: string;
  };
  variant: ProductVariant | null;
  offers: OfferWithRetailer[];
  matchingCount: number;
  otherConfigurations: { variant: ProductVariant; fromPrice: number }[];
  priceHistory: PricePoint[];
  stats: PriceStats;
  notFound: boolean;
}