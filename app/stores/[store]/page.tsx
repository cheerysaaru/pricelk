import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, Globe } from "lucide-react";
import { ALL_RETAILERS, getRetailer } from "@/lib/data/retailers";
import { getAllProducts, getLowestOfferForVariant } from "@/lib/data/products";
import { getScrapedRecords, RETAILER_IDS } from "@/lib/data/scraped";
import { ProductCard } from "@/components/product/product-card";
import { RealProductCard } from "@/components/product/real-product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { timeAgo } from "@/lib/format";

export function generateStaticParams() {
  return ALL_RETAILERS.map((retailer) => ({ store: retailer.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store: string }>;
}): Promise<Metadata> {
  const { store } = await params;
  const retailer = getRetailer(store);
  if (!retailer) return { title: "Store not found" };
  return {
    title: `${retailer.name} — Sri Lankan Online Store`,
    description: retailer.description,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const retailer = getRetailer(store);
  if (!retailer) notFound();

  const products = getAllProducts().filter((p) =>
    p.offers.some((o) => o.retailerId === retailer.id),
  );

  // Real scraped offers from this store (one card per product record).
  const realProducts = getScrapedRecords()
    .filter((r) => RETAILER_IDS[r.retailer] === retailer.id && !r.junk && r.price != null)
    .map((r) => ({
      slug: `real-${retailer.id}-${r.name.slice(0, 24)}`,
      name: r.name,
      brand: r.brand ?? "Unknown",
      category: r.category,
      categoryName: r.category,
      image: r.image,
      accent: retailer.logoColor ?? "#71717a",
      price: r.price as number,
      retailerId: retailer.id,
      retailerName: retailer.name,
      url: r.url,
      sku: r.sku,
      attrs: r.attrs,
      isReal: true as const,
    }));

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Stores", href: "/stores" }, { label: retailer.name }]} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ backgroundColor: retailer.logoColor }}
          aria-hidden
        >
          {retailer.initials}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{retailer.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              Verified Sri Lankan retailer
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {retailer.domain}
            </span>
            <span>Prices in LKR</span>
            <span>Checked {timeAgo(retailer.lastVerified)}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-zinc-500">{retailer.description}</p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-900">
        Tracked products at {retailer.name}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        {products.length + realProducts.length} products with prices from this store.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {realProducts.map((p) => (
          <RealProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}