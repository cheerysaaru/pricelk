import type {
  OfferWithRetailer,
  PriceStats,
  Product,
  ProductVariant,
  RetailerOffer,
} from "@/lib/types";
import { getRetailer } from "@/lib/data/retailers";
import { getVariant } from "@/lib/data/products";

/**
 * Exact variant matching — the core business rule.
 * Only offers whose variant matches EVERY selected attribute are comparable.
 */

export function findVariant(product: Product, attrs: Record<string, string>): ProductVariant | undefined {
  return getVariant(product, attrs);
}

/**
 * Attribute options still valid given the current selection.
 * Selecting "12GB" hides storage options that only exist with "8GB".
 */
export function validOptionsFor(
  attributes: { key: string; options: string[] }[],
  variants: ProductVariant[],
  current: Record<string, string>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const def of attributes) {
    const options = variants
      .filter((v) =>
        Object.entries(current).every(
          ([k, val]) => k === def.key || v.attributes[k] === val,
        ),
      )
      .map((v) => v.attributes[def.key])
      .filter((v): v is string => Boolean(v));
    out[def.key] = [...new Set(options)];
  }
  return out;
}

/**
 * Resolve URL params into a valid variant selection.
 * Falls back to `defaults` when the combination doesn't exist, so the UI
 * never shows a comparison that contradicts the selected chips.
 */
export function resolveAttrs(
  attributes: { key: string; options: string[] }[],
  variants: ProductVariant[],
  params: URLSearchParams,
  defaults: Record<string, string>,
): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const def of attributes) {
    raw[def.key] = params.get(def.key) ?? defaults[def.key] ?? def.options[0] ?? "";
  }
  const exact = variants.find((v) =>
    Object.entries(raw).every(([k, val]) => v.attributes[k] === val),
  );
  if (exact) return raw;

  // Auto-correct dependent selections, e.g. storage after a RAM change.
  const corrected = { ...raw };
  for (const def of attributes) {
    const valid = validOptionsFor(attributes, variants, corrected);
    if (!valid[def.key].includes(corrected[def.key] ?? "")) {
      corrected[def.key] = valid[def.key][0] ?? defaults[def.key] ?? "";
    }
  }
  const exact2 = variants.find((v) =>
    Object.entries(corrected).every(([k, val]) => v.attributes[k] === val),
  );
  return exact2 ? corrected : defaults;
}

/** Correct a single attribute selection so dependent options stay consistent. */
export function correctSelection(
  attributes: { key: string; options: string[] }[],
  variants: ProductVariant[],
  current: Record<string, string>,
  key: string,
  value: string,
): Record<string, string> {
  const next = { ...current, [key]: value };
  // Preserve the user's explicit choice; correct the dependent attributes.
  for (const def of attributes) {
    if (def.key === key) continue;
    const valid = validOptionsFor(attributes, variants, next);
    if (!valid[def.key].includes(next[def.key] ?? "")) {
      next[def.key] = valid[def.key][0] ?? next[def.key];
    }
  }
  // Last resort: if the combination still doesn't exist, correct the user's key too.
  const exact = variants.find((v) =>
    Object.entries(next).every(([k, val]) => v.attributes[k] === val),
  );
  if (!exact) {
    for (const def of attributes) {
      const valid = validOptionsFor(attributes, variants, next);
      if (!valid[def.key].includes(next[def.key] ?? "")) {
        next[def.key] = valid[def.key][0] ?? next[def.key];
      }
    }
  }
  return next;
}

export function offersForVariant(product: Product, variantId: string): RetailerOffer[] {
  return product.offers.filter((o) => o.variantId === variantId);
}

export function offersWithRetailer(product: Product, variantId: string): OfferWithRetailer[] {
  return offersForVariant(product, variantId)
    .map((offer) => {
      const retailer = getRetailer(offer.retailerId);
      const variant = product.variants.find((v) => v.id === variantId);
      if (!retailer || !variant) return null;
      return { ...offer, retailer, variant };
    })
    .filter((x): x is OfferWithRetailer => x !== null)
    .sort((a, b) => a.price - b.price);
}

/** Other configurations of the same product, each with its lowest price. */
export function otherConfigurations(product: Product, currentVariantId: string) {
  return product.variants
    .filter((v) => v.id !== currentVariantId)
    .map((v) => {
      const offers = offersForVariant(product, v.id).filter((o) => o.availability !== "out_of_stock");
      const price = offers.length ? Math.min(...offers.map((o) => o.price)) : null;
      return { variant: v, fromPrice: price };
    })
    .filter((x): x is { variant: ProductVariant; fromPrice: number } => x.fromPrice !== null)
    .sort((a, b) => a.fromPrice - b.fromPrice);
}

/** Price statistics + deal score from the variant's price history. */
export function priceStats(history: { price: number }[] | undefined, current: number): PriceStats {
  if (!history || history.length < 2) {
    return {
      current,
      lowest: current,
      average: current,
      dropPercent: 0,
      dealScore: 50,
      dealLabel: "Average price",
      dealReason: "Not enough price history yet to score this deal.",
    };
  }
  const prices = history.map((h) => h.price);
  const lowest = Math.min(...prices);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  const dropPercent = average > 0 ? ((average - current) / average) * 100 : 0;

  const dealScore = Math.round(Math.min(99, Math.max(30, 50 + dropPercent * 9)));
  let dealLabel: string;
  let dealReason: string;
  if (dealScore >= 85) {
    dealLabel = "Excellent deal";
    dealReason = "Current price is significantly below the recent average.";
  } else if (dealScore >= 70) {
    dealLabel = "Great deal";
    dealReason = "Current price is below the recent average.";
  } else if (dealScore >= 55) {
    dealLabel = "Good deal";
    dealReason = "Current price is close to the recent average.";
  } else {
    dealLabel = "Average price";
    dealReason = "Current price is at or above the recent average.";
  }

  return { current, lowest, average, dropPercent, dealScore, dealLabel, dealReason };
}

export function isBestPrice(offer: RetailerOffer, offers: RetailerOffer[]): boolean {
  const buyable = offers.filter((o) => o.availability !== "out_of_stock");
  if (!buyable.length) return false;
  const best = Math.min(...buyable.map((o) => o.price));
  return offer.price === best && offer.availability !== "out_of_stock";
}