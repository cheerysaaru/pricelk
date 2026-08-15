import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <InfoPage title="About PriceLK">
      <p>
        PriceLK is a Sri Lankan price comparison platform. We collect prices from verified Sri
        Lankan online retailers and bring them together in one place, so you can find where the
        exact product you want is cheapest.
      </p>
      <p>
        We do not sell products. When you choose an offer, you are redirected to the original
        retailer&apos;s website to complete your purchase.
      </p>
      <p>
        PriceLK only indexes retailers that operate in Sri Lanka — Sri Lankan domains, LKR pricing,
        local delivery and local support. We never fall back to international marketplaces.
      </p>
      <p className="rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
        This is a demo prototype. Retailers and prices shown are fictional placeholders.
      </p>
    </InfoPage>
  );
}