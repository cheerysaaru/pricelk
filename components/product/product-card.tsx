import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import type { Product, RetailerOffer, ProductVariant } from "@/lib/types";
import { formatLKR, timeAgo } from "@/lib/format";
import { getRetailer } from "@/lib/data/retailers";
import { getStoreNames } from "@/lib/data/products";

export function bestVariantInfo(product: Product): {
  variant: ProductVariant;
  offer: RetailerOffer;
} | null {
  let best: { variant: ProductVariant; offer: RetailerOffer } | null = null;
  for (const v of product.variants) {
    const offers = product.offers.filter(
      (o) => o.variantId === v.id && o.availability !== "out_of_stock",
    );
    if (!offers.length) continue;
    const min = offers.reduce((a, b) => (a.price < b.price ? a : b));
    if (!best || min.price < best.offer.price) best = { variant: v, offer: min };
  }
  return best;
}

export function ProductCard({ product }: { product: Product }) {
  const best = bestVariantInfo(product);
  const stores = new Set(product.offers.map((o) => o.retailerId)).size;
  const storeNames = getStoreNames(product);
  const retailer = best ? getRetailer(best.offer.retailerId) : undefined;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-square overflow-hidden bg-zinc-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{product.brand}</p>
        <Link
          href={`/products/${product.slug}`}
          className="mt-1 line-clamp-1 text-sm font-semibold text-zinc-900 transition-colors hover:text-brand-700"
        >
          {product.name}
        </Link>
        {best ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{best.variant.label}</p>
        ) : null}

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight tabular text-zinc-900">
              {best ? formatLKR(best.offer.price) : "—"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <Store className="h-3 w-3" aria-hidden />
              {stores} store{stores === 1 ? "" : "s"}
              {best ? (
                <>
                  <span aria-hidden>·</span>
                  <span>updated {timeAgo(best.offer.lastChecked)}</span>
                </>
              ) : null}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
              {storeNames.slice(0, 3).join(", ")}
              {storeNames.length > 3 ? ` +${storeNames.length - 3} more` : ""}
            </p>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"
        >
          Compare prices
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}