import type { Product, RealProduct } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { RealProductCard } from "@/components/product/real-product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

export type GridProduct = Product | RealProduct;

export function ProductGrid({ products }: { products: GridProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) =>
        "isReal" in p ? (
          <RealProductCard key={p.slug} product={p} />
        ) : (
          <ProductCard key={p.id} product={p} />
        ),
      )}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}