import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Settings2, Store } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { ProductGrid } from "@/components/product/product-grid";
import { DealCard } from "@/components/deals/deal-card";
import { getDeals, getPopularProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Compare before you buy",
  description:
    "Find the best prices from verified Sri Lankan online retailers — all in one place.",
};

const POPULAR = ["Milk Powder", "Rice", "Phones", "Laptops", "TVs", "Headphones", "Appliances"];

const STEPS = [
  {
    icon: Search,
    title: "1. Search",
    text: "Search our Sri Lankan catalogue by product, brand or category.",
  },
  {
    icon: Settings2,
    title: "2. Choose your exact product",
    text: "Pick the exact RAM, storage, colour or size you want.",
  },
  {
    icon: Store,
    title: "3. Compare prices",
    text: "See verified Sri Lankan stores side by side, cheapest first.",
  },
];

export default function HomePage() {
  const deals = getDeals(6);
  const popular = getPopularProducts(8);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-200 bg-zinc-50/60">
        <div className="container-page flex flex-col items-center pb-16 pt-16 text-center sm:pt-20">
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Compare before you buy.
          </h1>
          <p className="mt-4 max-w-xl text-balance text-lg text-zinc-500">
            Find the best prices from Sri Lankan online stores — all in one place.
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <SearchBar popular={POPULAR} />
          </div>

          <p className="mt-6 text-xs text-zinc-400">
            Search only our catalogue of verified Sri Lankan retailers · Prices in LKR
          </p>
        </div>
      </section>

      {/* ── Price drops ──────────────────────────────────────────────────── */}
      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Price drops today
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              The biggest savings across our Sri Lankan stores right now.
            </p>
          </div>
          <Link
            href="/deals"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 sm:inline-flex"
          >
            View all deals
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {deals.map((d) => (
            <DealCard key={`${d.productSlug}-${d.variantLabel}`} deal={d} />
          ))}
        </div>
        <Link
          href="/deals"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 sm:hidden"
        >
          View all deals
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* ── Popular comparisons ──────────────────────────────────────────── */}
      <section className="border-t border-zinc-200 bg-zinc-50/60">
        <div className="container-page py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Popular comparisons
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            What shoppers in Sri Lanka are comparing right now.
          </p>
          <div className="mt-6">
            <ProductGrid products={popular} />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="container-page py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          How it works
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-zinc-500">
          Three steps between you and the best price in Sri Lanka.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <Icon className="h-5 w-5 text-brand-600" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <div className="flex flex-col items-center rounded-2xl bg-zinc-900 px-6 py-16 text-center">
          <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight text-white">
            Stop checking stores one by one.
          </h2>
          <p className="mt-3 max-w-md text-balance text-zinc-400">
            Let us compare them for you.
          </p>
          <div className="mt-8 w-full max-w-xl">
            <SearchBar
              size="md"
              placeholder="Try 'Samsung Galaxy S25'…"
            />
          </div>
        </div>
      </section>
    </div>
  );
}