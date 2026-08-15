import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy">
      <p>
        PriceLK collects the minimum information needed to provide the service. We do not collect
        unnecessary personal information.
      </p>
      <p>
        In this demo prototype, your watchlist, price alerts and sign-in are stored locally in your
        browser. Nothing is sent to a server.
      </p>
      <p>
        In production, we would collect only what is required for accounts, price alerts and
        analytics — and never sell your data.
      </p>
    </InfoPage>
  );
}