"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { autocomplete } from "@/lib/search";

export function SearchBar({
  size = "lg",
  popular = [],
  placeholder = "Search for a product…",
}: {
  size?: "lg" | "md";
  popular?: string[];
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    try {
      const nextResults = autocomplete(debounced, 8);
      if (!cancelled) {
        setResults(nextResults);
        setOpen(true);
      }
    } catch {
      if (!cancelled) setResults([]);
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const submit = (q: string) => {
    const t = q.trim();
    if (!t) return;
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) submit(results[active].name);
      else submit(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const large = size === "lg";

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-white shadow-sm transition-all duration-150",
            large ? "h-14 border-zinc-200 px-4 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100" : "h-11 border-zinc-200 px-3.5",
          )}
        >
          <Search className={cn("shrink-0 text-zinc-400", large ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
            }}
            onFocus={() => {
              if (results.length) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Search products, brands or categories"
            autoComplete="off"
            className={cn(
              "w-full bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none",
              large ? "text-base" : "text-sm",
            )}
          />
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" aria-hidden />
          ) : null}
        </div>
      </form>

      {popular.length > 0 && !query ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-zinc-400">Popular:</span>
          {popular.map((p) => (
            <button
              key={p}
              onClick={() => submit(p)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {p}
            </button>
          ))}
        </div>
      ) : null}

      {open && query.trim() ? (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
          role="listbox"
          aria-label="Search suggestions"
        >
          {results.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">
              No matches in our Sri Lankan catalogue.
            </p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.slug}>
                  <button
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => submit(r.name)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                      i === active ? "bg-zinc-50" : "bg-white",
                    )}
                  >
                    <Image
                      src={r.image}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-lg border border-zinc-100 object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-900">{r.name}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {r.categoryName} · {r.stores} store{r.stores === 1 ? "" : "s"}
                      </span>
                      <span className="block truncate text-xs text-zinc-400">
                        Available at{" "}
                        {r.storeNames.slice(0, 3).join(", ")}
                        {r.storeNames.length > 3 ? ` +${r.storeNames.length - 3} more` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular text-zinc-900">
                      {formatLKR(r.startingPrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => submit(query)}
            className="flex w-full items-center justify-between border-t border-zinc-100 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            View all results
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}