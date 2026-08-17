import type { Metadata } from "next";
import { Suspense } from "react";
import { DealsContent } from "./deals-content";

export const metadata: Metadata = {
  title: "Today's best deals",
  description: "The biggest real price drops right now across verified Sri Lankan online retailers.",
};

export default function DealsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-8">
          <div className="h-7 w-56 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-zinc-100" />
          <div className="mt-6 flex gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-zinc-100" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        </div>
      }
    >
      <DealsContent />
    </Suspense>
  );
}
