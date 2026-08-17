import Image from "next/image";
import { ExternalLink, Store } from "lucide-react";
import type { RealProduct } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { getRetailer } from "@/lib/data/retailers";

/**
 * Card for a single real scraped offer: one store, one price,
 * linking directly to the retailer product page.
 */
export function RealProductCard({ product }: { product: RealProduct }) {
  const retailer = getRetailer(product.retailerId);
  const image = product.image && product.image.startsWith("http") ? product.image : "";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`${product.name} at ${product.retailerName}`}
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-50">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
              <span className="text-4xl font-bold text-zinc-300">
                {product.brand.charAt(0)}
              </span>
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Live
          </span>
        </div>
      </a>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {product.brand}
        </p>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 line-clamp-1 text-sm font-semibold text-zinc-900 transition-colors hover:text-brand-700"
        >
          {product.name}
        </a>
        {Object.keys(product.attrs).length ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
            {Object.entries(product.attrs)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ")}
          </p>
        ) : null}

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight tabular text-zinc-900">
              {formatLKR(product.price)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <Store className="h-3 w-3" aria-hidden />
              {product.retailerName}
            </p>
          </div>
          {retailer ? (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: retailer.logoColor ?? "#71717a" }}
              title={retailer.name}
            >
              {retailer.initials}
            </span>
          ) : null}
        </div>

        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"
        >
          View at {product.retailerName}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </article>
  );
}