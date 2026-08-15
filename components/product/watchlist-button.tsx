"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export interface WatchlistEntry {
  slug: string;
  name: string;
  image: string;
  accent: string;
  variantId: string;
  variantLabel: string;
  price: number;
  addedAt: string;
}

const KEY = "pricelk_watchlist";

export function getWatchlist(): WatchlistEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as WatchlistEntry[];
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function WatchlistButton({
  entry,
  className,
}: {
  entry: WatchlistEntry;
  className?: string;
}) {
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(getWatchlist());
    setReady(true);
  }, []);

  const isWatched = items.some(
    (i) => i.slug === entry.slug && i.variantId === entry.variantId,
  );

  const toggle = () => {
    const next = isWatched
      ? items.filter((i) => !(i.slug === entry.slug && i.variantId === entry.variantId))
      : [...items, entry];
    setItems(next);
    saveWatchlist(next);
  };

  if (!ready) {
    return <div className={cn("h-10 w-full rounded-lg bg-zinc-100", className)} aria-hidden />;
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.97 }}
      aria-pressed={isWatched}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
        isWatched
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-zinc-200 bg-white text-zinc-800 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600",
        className,
      )}
    >
      <motion.span
        key={isWatched ? "on" : "off"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="inline-flex items-center gap-2"
      >
        <Heart
          className={cn("h-4 w-4", isWatched && "fill-red-500 text-red-500")}
          aria-hidden
        />
        {isWatched ? "Added to watchlist" : "Add to watchlist"}
      </motion.span>
    </motion.button>
  );
}