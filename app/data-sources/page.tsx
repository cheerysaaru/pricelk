import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Data sources" };

export default function DataSourcesPage() {
  return (
    <InfoPage title="Data sources">
      <p>
        Prices on PriceLK are collected from publicly available Sri Lankan retailer websites by
        automated background workers. Every price shown links back to the original retailer product
        page it was collected from.
      </p>
      <p>
        Retailers are only included after verification that they operate in Sri Lanka — Sri Lankan
        domain, physical presence, LKR pricing, local delivery and local customer support.
      </p>
      <p>
        Prices are collected periodically and may have changed by the time you visit a store. Always
        verify the final price on the retailer&apos;s website before purchasing.
      </p>
      <p className="rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
        Live data is currently collected from Wasi.lk, iDealz and Takas. Products without a live
        match show demo placeholder prices until real coverage grows.
      </p>
    </InfoPage>
  );
}