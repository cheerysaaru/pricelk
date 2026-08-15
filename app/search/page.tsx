import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchContent } from "./search-content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search verified Sri Lankan retailers for the best prices.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-8">
          <div className="h-7 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-100" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}