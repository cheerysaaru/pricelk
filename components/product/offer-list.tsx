import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CircleCheck, CircleAlert, Trophy } from "lucide-react";
import type { OfferWithRetailer } from "@/lib/types";
import { formatLKR, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

function StockBadge({ availability }: { availability: OfferWithRetailer["availability"] }) {
  if (availability === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CircleCheck className="h-3.5 w-3.5" aria-hidden />
        In stock
      </span>
    );
  }
  if (availability === "limited") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <CircleAlert className="h-3.5 w-3.5" aria-hidden />
        Limited availability
      </span>
    );
  }
  return <span className="text-xs font-medium text-zinc-400">Out of stock</span>;
}

export function OfferList({ offers }: { offers: OfferWithRetailer[] }) {
  const buyable = offers.filter((o) => o.availability !== "out_of_stock");
  const bestPrice = buyable.length ? Math.min(...buyable.map((o) => o.price)) : null;

  return (
    <ol className="space-y-3">
      {offers.map((offer, i) => {
        const isBest = bestPrice !== null && offer.price === bestPrice && offer.availability !== "out_of_stock";
        const diff = bestPrice !== null && !isBest ? offer.price - bestPrice : 0;
        const disabled = offer.availability === "out_of_stock";

        return (
          <li
            key={offer.id}
            className={cn(
              "rounded-xl border bg-white p-4 transition-shadow sm:p-5",
              isBest ? "border-emerald-200 ring-1 ring-emerald-100" : "border-zinc-200",
              disabled && "opacity-70",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Retailer */}
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: offer.retailer.logoColor }}
                  aria-hidden
                >
                  {offer.retailer.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-zinc-900">{offer.retailer.name}</p>
                    {isBest ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        <Trophy className="h-3 w-3" aria-hidden />
                        Best price
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-brand-100">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Exact match
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <StockBadge availability={offer.availability} />
                    <span>Checked {timeAgo(offer.lastChecked)}</span>
                    <span className="hidden sm:inline">SKU {offer.sku}</span>
                  </div>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                <div className="text-right">
                  <p className="text-xl font-semibold tracking-tight tabular text-zinc-900">
                    {formatLKR(offer.price)}
                  </p>
                  {isBest && bestPrice !== null ? (
                    <p className="text-xs font-medium text-emerald-600">
                      {formatLKR(bestPrice)} cheaper than the next store
                    </p>
                  ) : diff > 0 ? (
                    <p className="text-xs font-medium text-zinc-400">+ {formatLKR(diff)} vs best</p>
                  ) : null}
                </div>
                <Link
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : undefined}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors",
                    disabled
                      ? "pointer-events-none bg-zinc-100 text-zinc-400"
                      : "bg-zinc-900 text-white hover:bg-zinc-700",
                  )}
                >
                  View at Store
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}