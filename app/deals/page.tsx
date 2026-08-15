import type { Metadata } from "next";
import Link from "next/link";
import { getDeals } from "@/lib/data/products";
import { CATEGORIES } from "@/lib/data/categories";
import { RETAILERS } from "@/lib/data/retailers";
import { DealCard } from "@/components/deals/deal-card";
import { DealsSort } from "@/components/deals/deals-sort";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Today's best deals",
  description: "The biggest price drops right now across verified Sri Lankan online retailers.",
};

export default async function DealsPage() {
  const category = "";
  const store = "";
  const sort: string = "biggest";

  let deals = getDeals(48);
  if (category) deals = deals.filter((d) => d.category === category);
  if (store) deals = deals.filter((d) => d.retailerId === store);

  if (sort === "lowest") deals = [...deals].sort((a, b) => a.newPrice - b.newPrice);
  else if (sort === "deal") deals = [...deals].sort((a, b) => b.dropPercent - a.dropPercent);
  else deals = [...deals].sort((a, b) => b.savings - a.savings);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Today&apos;s best deals</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Real price drops detected across our Sri Lankan stores — not invented discounts.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/deals"
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              !category
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
            )}
          >
            All
          </Link>
          {CATEGORIES.map((c) => {
            const params = new URLSearchParams();
            if (store) params.set("store", store);
            params.set("category", c.slug);
            return (
              <Link
                key={c.slug}
                href={`/deals?${params.toString()}`}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === c.slug
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                )}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto">
          <DealsSort current={sort} />
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No deals right now"
            description="Try another category or check back soon — prices update throughout the day."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {deals.map((d) => (
            <DealCard key={`${d.productSlug}-${d.variantLabel}-${d.retailerId}`} deal={d} />
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-zinc-400">
        All retailers shown are demo placeholders. In production, every deal is verified against the
        retailer&apos;s website.
      </p>
    </div>
  );
}