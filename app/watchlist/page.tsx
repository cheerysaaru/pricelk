"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Heart, Minus, Trash2 } from "lucide-react";
import {
  getWatchlist,
  saveWatchlist,
  type WatchlistEntry,
} from "@/components/product/watchlist-button";
import { getProductBySlug } from "@/lib/data/products";
import { formatLKR } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

interface AlertEntry {
  slug: string;
  variantLabel: string;
  target: number;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(getWatchlist());
    try {
      setAlerts(JSON.parse(localStorage.getItem("pricelk_alerts") ?? "[]") as AlertEntry[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const rows = useMemo(
    () =>
      items
        .map((entry) => {
          const product = getProductBySlug(entry.slug);
          if (!product) return null;
          const variant = product.variants.find((v) => v.id === entry.variantId);
          const offers = product.offers.filter(
            (o) => o.variantId === entry.variantId && o.availability !== "out_of_stock",
          );
          const current = offers.length ? Math.min(...offers.map((o) => o.price)) : null;
          const history = variant ? product.priceHistory[variant.id] : undefined;
          const lowest = history?.length ? Math.min(...history.map((h) => h.price)) : current;
          const prev = history && history.length >= 3 ? history[history.length - 3].price : current;
          const movement = current != null && prev != null ? current - prev : 0;
          const alert = alerts.find(
            (a) => a.slug === entry.slug && a.variantLabel === entry.variantLabel,
          );
          return { entry, product, variant, current, lowest, movement, alert };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null),
    [items, alerts],
  );

  const remove = (entry: WatchlistEntry) => {
    const next = items.filter(
      (i) => !(i.slug === entry.slug && i.variantId === entry.variantId),
    );
    setItems(next);
    saveWatchlist(next);
  };

  if (!ready) {
    return (
      <div className="container-page py-8">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-200/70" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-200/70" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">My Watchlist</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Products you&apos;re tracking across Sri Lankan stores.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your watchlist is empty"
            description="Tap the heart on any product page to track its price here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-400 md:grid">
            <span>Product</span>
            <span>Current price</span>
            <span>Target price</span>
            <span>Movement</span>
            <span>Lowest (90d)</span>
            <span aria-hidden />
          </div>
          <ul className="divide-y divide-zinc-100">
            {rows.map(({ entry, product, variant, current, lowest, movement, alert }) => (
              <li key={`${entry.slug}-${entry.variantId}`} className="flex flex-col gap-3 p-4 md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={product.image}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-lg border border-zinc-100 object-cover"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="block truncate text-sm font-semibold text-zinc-900 transition-colors hover:text-brand-700"
                    >
                      {product.name}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">
                      {variant?.label ?? entry.variantLabel}
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold tabular text-zinc-900">
                  {current != null ? formatLKR(current) : "—"}
                </p>

                <p className="text-sm tabular text-zinc-600">
                  {alert ? (
                    <span className="font-medium text-emerald-600">below {formatLKR(alert.target)}</span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </p>

                <p
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium tabular",
                    movement < 0 ? "text-emerald-600" : movement > 0 ? "text-amber-600" : "text-zinc-400",
                  )}
                >
                  {movement < 0 ? (
                    <ArrowDownRight className="h-4 w-4" aria-hidden />
                  ) : movement > 0 ? (
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  ) : (
                    <Minus className="h-4 w-4" aria-hidden />
                  )}
                  {movement !== 0 ? formatLKR(Math.abs(movement)) : "No change"}
                </p>

                <p className="text-sm tabular text-zinc-600">
                  {lowest != null ? formatLKR(lowest) : "—"}
                </p>

                <button
                  onClick={() => remove(entry)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${product.name} from watchlist`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-xs text-zinc-400">
        <Heart className="h-3.5 w-3.5" aria-hidden />
        Watchlist is stored locally in your browser for this demo.
      </p>
    </div>
  );
}