import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <InfoPage title="How it works">
      <ol className="list-decimal space-y-3 pl-5">
        <li>
          <strong className="text-zinc-900">Search.</strong> Search our catalogue of verified Sri
          Lankan retailers by product, brand or category.
        </li>
        <li>
          <strong className="text-zinc-900">Choose your exact product.</strong> Select the exact
          configuration you want — RAM, storage, colour, size, weight and more.
        </li>
        <li>
          <strong className="text-zinc-900">Compare prices.</strong> See every Sri Lankan store
          selling that exact configuration, sorted from cheapest to most expensive.
        </li>
        <li>
          <strong className="text-zinc-900">Buy from the retailer.</strong> Tap “View at Store” to
          go to the original retailer&apos;s product page. PriceLK never sells products.
        </li>
      </ol>
      <p>
        Only offers that match your exact configuration are compared — we never mix different
        variants, generations or pack sizes into the same comparison.
      </p>
    </InfoPage>
  );
}