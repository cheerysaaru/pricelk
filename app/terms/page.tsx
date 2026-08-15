import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <InfoPage title="Terms">
      <p>
        PriceLK is a price comparison service. We compare prices from Sri Lankan retailers and
        redirect you to their websites — we do not sell products and are not a party to any
        transaction between you and a retailer.
      </p>
      <p>
        Prices are collected from publicly available retailer websites and may be inaccurate or out
        of date. Always verify the final price, availability and terms on the retailer&apos;s
        website before purchasing.
      </p>
      <p>
        This is a demo prototype provided for evaluation purposes only.
      </p>
    </InfoPage>
  );
}