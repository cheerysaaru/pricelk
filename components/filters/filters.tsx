"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export interface FiltersProps {
  current: Record<string, string>;
  categories: { slug: string; name: string }[];
  brands: string[];
  attributeOptions: Record<string, string[]>;
  attributeLabels: Record<string, string>;
  resultCount: number;
}

const KNOWN = new Set(["q", "category", "brand", "min", "max", "sort", "page"]);

export function Filters({
  current,
  categories,
  brands,
  attributeOptions,
  attributeLabels,
  resultCount,
}: FiltersProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [min, setMin] = useState(current.min ?? "");
  const [max, setMax] = useState(current.max ?? "");

  const activeCount = useMemo(() => {
    let n = 0;
    if (current.category) n++;
    if (current.brand) n++;
    if (current.min || current.max) n++;
    for (const [k, v] of Object.entries(current)) {
      if (!KNOWN.has(k) && v) n++;
    }
    return n;
  }, [current]);

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(current)) {
        if (k === "page") continue;
        if (v) params.set(k, v);
      }
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`/search?${params.toString()}`);
    },
    [current, router],
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const existing = current[key] ? current[key].split(",") : [];
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      update(key, next.length ? next.join(",") : null);
    },
    [current, update],
  );

  const applyPrice = () => {
    update("min", min ? String(Number(min)) : null);
    update("max", max ? String(Number(max)) : null);
  };

  const clearAll = () => {
    router.replace("/search" + (current.q ? `?q=${encodeURIComponent(current.q)}` : ""));
  };

  const body = (
    <div className="space-y-7">
      {/* Category */}
      <section aria-label="Category">
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => update("category", null)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
              !current.category ? "bg-brand-50 font-medium text-brand-700" : "text-zinc-600 hover:bg-zinc-100",
            )}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => update("category", c.slug)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                current.category === c.slug
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Brand */}
      {brands.length > 0 ? (
        <section aria-label="Brand">
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Brand
          </h3>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {brands.map((b) => {
              const checked = current.brand === b;
              return (
                <label
                  key={b}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => update("brand", checked ? null : b)}
                    className="h-4 w-4 rounded border-zinc-300 accent-brand-600"
                  />
                  {b}
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Price */}
      <section aria-label="Price">
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Price (LKR)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="h-9 w-full rounded-lg border border-zinc-200 px-2.5 text-sm tabular focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <span className="text-zinc-400" aria-hidden>
            –
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="h-9 w-full rounded-lg border border-zinc-200 px-2.5 text-sm tabular focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Button variant="outline" size="sm" className="mt-2 w-full" onClick={applyPrice}>
          Apply price
        </Button>
      </section>

      {/* Category-aware attributes */}
      {Object.entries(attributeOptions).map(([key, options]) => {
        const label = attributeLabels[key] ?? key;
        const selected = current[key] ? current[key].split(",") : [];
        return (
          <section key={key} aria-label={label}>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {label}
            </h3>
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {options.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMulti(key, opt)}
                      className="h-4 w-4 rounded border-zinc-300 accent-brand-600"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}

      {activeCount > 0 ? (
        <button
          onClick={clearAll}
          className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pr-1">
          {body}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 ? (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-zinc-950/40 backdrop-blur-[2px] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">
                Filters
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  {resultCount} result{resultCount === 1 ? "" : "s"}
                </span>
              </h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {body}
            <Button className="mt-6 w-full" size="lg" onClick={() => setSheetOpen(false)}>
              Show {resultCount} result{resultCount === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SortSelect({ current }: { current: Record<string, string> }) {
  const router = useRouter();
  const options = [
    { value: "lowest", label: "Lowest price" },
    { value: "highest", label: "Highest price" },
    { value: "saving", label: "Biggest saving" },
    { value: "deal", label: "Best deal" },
    { value: "recent", label: "Recently updated" },
  ];
  const value = current.sort ?? "lowest";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(current)) {
            if (k === "page") continue;
            if (v) params.set(k, v);
          }
          params.set("sort", e.target.value);
          router.replace(`/search?${params.toString()}`);
        }}
        aria-label="Sort results"
        className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-9 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
    </div>
  );
}