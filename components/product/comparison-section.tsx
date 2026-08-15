"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Info } from "lucide-react";
import type { AttributeDef, OffersResponse, ProductVariant } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { attrsToQuery } from "@/lib/url";
import { OfferList } from "@/components/product/offer-list";
import { PriceHistoryChart } from "@/components/product/price-history-chart";
import { DealScore } from "@/components/product/deal-score";
import { PriceAlert } from "@/components/product/price-alert";
import { WatchlistButton } from "@/components/product/watchlist-button";
import { ChartSkeleton, OfferRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export function ComparisonSection({
  product,
  attributes,
  variants,
  defaultAttrs,
  initialData,
}: {
  product: {
    slug: string;
    name: string;
    brand: string;
    image: string;
    accent: string;
    categoryName: string;
  };
  attributes: AttributeDef[];
  variants: ProductVariant[];
  defaultAttrs: Record<string, string>;
  initialData: OffersResponse;
}) {
  const data = initialData;
  const loading = false;
  const error = false;
  const variant = data.variant;
  const offers = data.offers;
  const stats = data.stats;

  return (
    <div className="space-y-12">
      {/* ── Comparison ─────────────────────────────────────────────────── */}
      <section aria-labelledby="comparison-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="comparison-heading" className="text-xl font-semibold tracking-tight text-zinc-900">
            {loading ? "Checking offers…" : `${data.matchingCount} matching offer${data.matchingCount === 1 ? "" : "s"}`}
          </h2>
          {variant ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Exact match · {variant.label}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Verified Sri Lankan stores selling this exact configuration, cheapest first.
        </p>

        <div className="mt-5">
          {error ? (
            <ErrorState
              description="Last successful update: a few minutes ago. Showing the latest data we have."
              onRetry={() => window.location.reload()}
            />
          ) : loading ? (
            <div className="space-y-3">
              <OfferRowSkeleton />
              <OfferRowSkeleton />
              <OfferRowSkeleton />
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              title="No offers for this exact configuration"
              description="Try another configuration below, or check back soon — our retailers update prices throughout the day."
            />
          ) : (
            <OfferList offers={offers} />
          )}
        </div>
      </section>

      {/* ── Other configurations ────────────────────────────────────────── */}
      {data.otherConfigurations.length > 0 ? (
        <section aria-labelledby="other-configs-heading">
          <h2 id="other-configs-heading" className="text-xl font-semibold tracking-tight text-zinc-900">
            Other configurations
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cheaper or different versions of this product — kept separate so you never compare
            apples with oranges.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.otherConfigurations.map(({ variant: v, fromPrice }) => (
              <Link
                key={v.id}
                href={`/products/${product.slug}?${attrsToQuery(v.attributes)}`}
                className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-150 hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{v.label}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    From <span className="font-semibold tabular text-zinc-900">{formatLKR(fromPrice)}</span>
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-brand-600" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Price history ───────────────────────────────────────────────── */}
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-semibold tracking-tight text-zinc-900">
          Price history
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Last 90 days for this exact configuration.</p>

        {loading ? (
          <div className="mt-5">
            <ChartSkeleton />
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Current</p>
                <p className="mt-1 text-lg font-semibold tabular text-zinc-900">{formatLKR(stats.current)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Lowest</p>
                <p className="mt-1 text-lg font-semibold tabular text-emerald-600">{formatLKR(stats.lowest)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">90-day average</p>
                <p className="mt-1 text-lg font-semibold tabular text-zinc-900">{formatLKR(Math.round(stats.average))}</p>
              </div>
            </div>
            <div className="mt-5">
              <PriceHistoryChart history={data.priceHistory} current={stats.current} />
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Current price is{" "}
              <span className={stats.dropPercent >= 0 ? "font-medium text-emerald-600" : "font-medium text-amber-600"}>
                {Math.abs(stats.dropPercent).toFixed(0)}% {stats.dropPercent >= 0 ? "below" : "above"}
              </span>{" "}
              the 90-day average.
            </p>
          </div>
        )}
      </section>

      {/* ── Deal score + alerts ─────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2" aria-label="Deal score and alerts">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Deal score</h3>
          <div className="mt-4">
            <DealScore stats={stats} />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Track this price</h3>
          <WatchlistButton
            entry={{
              slug: product.slug,
              name: product.name,
              image: product.image,
              accent: product.accent,
              variantId: variant?.id ?? "",
              variantLabel: variant?.label ?? "",
              price: stats.current,
              addedAt: new Date().toISOString(),
            }}
          />
          <PriceAlert
            slug={product.slug}
            name={product.name}
            variantLabel={variant?.label ?? ""}
            currentPrice={stats.current}
          />
        </div>
      </section>

      {/* ── Trust note ──────────────────────────────────────────────────── */}
      <p className="flex items-start gap-2 rounded-xl bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-500 ring-1 ring-zinc-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        Prices are collected from retailer websites and may have changed. Always verify the final
        price on the retailer&apos;s website before purchasing. PriceLK compares stores — it does
        not sell products.
      </p>
    </div>
  );
}