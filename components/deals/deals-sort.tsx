"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function DealsSort({ current, base = "/deals" }: { current: string; base?: string }) {
  const router = useRouter();
  const options = [
    { value: "biggest", label: "Biggest price drop" },
    { value: "lowest", label: "Lowest price" },
    { value: "deal", label: "Best deal" },
  ];
  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => router.replace(`${base}?sort=${e.target.value}`)}
        aria-label="Sort deals"
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