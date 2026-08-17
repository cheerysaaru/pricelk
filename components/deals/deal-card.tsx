import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import type { Deal } from "@/lib/types";
import { formatLKR, timeAgo } from "@/lib/format";
import { getRetailer } from "@/lib/data/retailers";

export function DealCard({ deal }: { deal: Deal }) {
  const retailer = getRetailer(deal.retailerId);
  // Real scraped deals link straight to the retailer product page; demo deals
  // link to the internal comparison page.
  const href = deal.url ?? `/products/${deal.productSlug}`;
  const external = Boolean(deal.url);
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <Link href={href} className="block" aria-label={deal.productName} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50">
          {deal.image.startsWith("http") ? (
            <Image
              src={deal.image}
              alt={deal.productName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: deal.accent }}
              aria-hidden
            >
              {deal.brand.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <TrendingDown className="h-3 w-3" aria-hidden />
            Save {formatLKR(deal.savings)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{deal.brand}</p>
        <Link
          href={href}
          className="mt-1 line-clamp-1 text-sm font-semibold text-zinc-900 transition-colors hover:text-brand-700"
          {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
        >
          {deal.productName}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{deal.variantLabel}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight tabular text-zinc-900">
            {formatLKR(deal.newPrice)}
          </span>
          <span className="text-sm text-zinc-400 line-through tabular">{formatLKR(deal.oldPrice)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span className="truncate">{retailer?.name ?? "Store"}</span>
          <span className="shrink-0">updated {timeAgo(deal.lastChecked)}</span>
        </div>

        <Link
          href={href}
          className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"
          {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
        >
          {external ? "View on store" : "View deal"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}