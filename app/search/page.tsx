import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { searchProducts } from "@/lib/search";
import { getProductsBySlugs } from "@/lib/data/products";
import { getRealProductsBySlugs } from "@/lib/data/real-products";
import { CATEGORIES } from "@/lib/data/categories";
import { Filters, SortSelect } from "@/components/filters/filters";
import { ProductGrid, type GridProduct } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Search",
  description: "Search verified Sri Lankan retailers for the best prices.",
};

const KNOWN = new Set(["q", "category", "brand", "min", "max", "sort", "page"]);

const ATTRIBUTE_LABELS: Record<string, string> = {
  ram: "RAM",
  storage: "Storage",
  colour: "Colour",
  processor: "Processor",
  gpu: "GPU",
  screen: "Screen",
  os: "Operating System",
  resolution: "Resolution",
  type: "Type",
  connectivity: "Connectivity",
  capacity: "Capacity",
  weight: "Weight",
  pack: "Pack",
  size: "Size",
  gender: "Gender",
};

export default async function SearchPage() {
  const q = "";
  const category = undefined;
  const brand = undefined;
  const min = undefined;
  const max = undefined;
  const sort = "lowest";
  const page = 1;

  const res = searchProducts(q, {
    category,
    brand,
    minPrice: min,
    maxPrice: max,
    sort: sort as never,
    page,
    pageSize: 24,
  });

  const demoProducts = getProductsBySlugs(res.results.map((r) => r.slug));
  const realProducts = getRealProductsBySlugs(res.results.map((r) => r.slug));
  const products: GridProduct[] = [...demoProducts, ...realProducts];

  const current: Record<string, string> = {};
  if (q) current.q = q;
  if (category) current.category = category;
  if (brand) current.brand = brand;
  if (min != null) current.min = String(min);
  if (max != null) current.max = String(max);
  if (sort !== "lowest") current.sort = sort;

  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(current)) params.set(k, v);
    params.set("page", String(p));
    return `/search?${params.toString()}`;
  };

  const title = q ? `Results for “${q}”` : category ? CATEGORIES.find((c) => c.slug === category)?.name ?? "Search" : "All products";

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-500">
          {res.total.toLocaleString("en-US")} product{res.total === 1 ? "" : "s"} from verified Sri
          Lankan retailers
        </p>
      </div>

      <div className="mt-6 flex gap-8">
        <Filters
          current={current}
          categories={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))}
          brands={res.brands}
          attributeOptions={res.attributeOptions}
          attributeLabels={ATTRIBUTE_LABELS}
          resultCount={res.total}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="ml-auto">
              <SortSelect current={current} />
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="No matching products"
              description="Try removing one of your filters, or search for something else."
            />
          ) : (
            <>
              <ProductGrid products={products} />

              {res.totalPages > 1 ? (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                  {page > 1 ? (
                    <Link
                      href={pageUrl(page - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {Array.from({ length: res.totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <Link
                        key={p}
                        href={pageUrl(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={cn(
                          "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
                          p === page
                            ? "bg-brand-600 text-white"
                            : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                        )}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < res.totalPages ? (
                    <Link
                      href={pageUrl(page + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}