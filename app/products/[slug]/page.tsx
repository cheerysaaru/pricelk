import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { OffersResponse } from "@/lib/types";
import { getAllProducts, getProductBySlug } from "@/lib/data/products";
import {
  findVariant,
  offersWithRetailer,
  otherConfigurations,
  priceStats,
  resolveAttrs,
} from "@/lib/matching";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfigPanel } from "@/components/product/config-panel";
import { ComparisonSection } from "@/components/product/comparison-section";
import { EmptyState } from "@/components/ui/empty-state";
import { OfferRowSkeleton } from "@/components/ui/skeleton";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: `${product.name} Price Comparison Sri Lanka`,
    description: `Compare prices for the ${product.name} across verified Sri Lankan online retailers. Find the lowest price in LKR.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} — Price Comparison Sri Lanka`,
      description: `Compare prices for the ${product.name} across verified Sri Lankan online retailers.`,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="We couldn't find this product from our Sri Lankan retailers."
          description="Try another product or configuration."
        />
      </div>
    );
  }

  const defaultVariant = product.variants[0];
  const defaultAttrs = defaultVariant.attributes;

  const variant = defaultVariant;
  const offers = offersWithRetailer(product, variant.id);
  const others = otherConfigurations(product, variant.id);
  const history = product.priceHistory[variant.id] ?? [];
  const current = offers.length ? offers[0].price : 0;
  const stats = priceStats(history, current);

  const initialData: OffersResponse = {
    product: {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.image,
      accent: product.accent,
      categoryName: product.categoryName,
    },
    variant,
    offers,
    matchingCount: offers.length,
    otherConfigurations: others,
    priceHistory: history,
    stats,
    notFound: false,
  };

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: product.categoryName, href: `/categories/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Specs */}
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white">
            <h2 className="border-b border-zinc-100 px-5 py-3.5 text-sm font-semibold text-zinc-900">
              Specifications
            </h2>
            <dl className="divide-y divide-zinc-100">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="text-sm text-zinc-500">{spec.label}</dt>
                  <dd className="text-right text-sm font-medium text-zinc-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Config */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{product.description}</p>

          <div className="mt-7">
            <p className="mb-4 text-sm font-medium text-zinc-700">
              Choose your exact configuration
            </p>
            <Suspense fallback={<div className="text-sm text-zinc-500">Loading configuration…</div>}>
              <ConfigPanel
                slug={product.slug}
                attributes={product.attributes}
                variants={product.variants}
                defaultAttrs={defaultAttrs}
              />
            </Suspense>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-zinc-400">
            Only stores selling this exact configuration are compared — never mixed with other
            variants. Prices in Sri Lankan Rupees (LKR).
          </p>
        </div>
      </div>

      {/* Comparison (client, URL-synced) */}
      <div className="mt-14">
        <Suspense
          fallback={
            <div className="space-y-3">
              <OfferRowSkeleton />
              <OfferRowSkeleton />
              <OfferRowSkeleton />
            </div>
          }
        >
          <ComparisonSection
            product={{
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              image: product.image,
              accent: product.accent,
              categoryName: product.categoryName,
            }}
            attributes={product.attributes}
            variants={product.variants}
            defaultAttrs={defaultAttrs}
            initialData={initialData}
          />
        </Suspense>
      </div>
    </div>
  );
}