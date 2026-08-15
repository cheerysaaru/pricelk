import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Globe, Radio } from "lucide-react";
import { ALL_RETAILERS } from "@/lib/data/retailers";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = {
  title: "Stores",
  description: "Verified Sri Lankan online retailers tracked by PriceLK.",
};

export default function StoresPage() {
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Stores</h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Every retailer on PriceLK is verified as a Sri Lankan online store — Sri Lankan domain,
        LKR pricing, local delivery and support.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_RETAILERS.map((r) => (
          <article
            key={r.id}
            className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: r.logoColor }}
                aria-hidden
              >
                {r.initials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-zinc-900">{r.name}</h2>
                <p className="flex items-center gap-1 text-xs text-zinc-500">
                  <Globe className="h-3 w-3" aria-hidden />
                  {r.domain}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{r.description}</p>

            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-100">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Verified · Sri Lanka
              </span>
              {!r.isDemo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700 ring-1 ring-sky-100">
                  <Radio className="h-3 w-3" aria-hidden />
                  Live data
                </span>
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-sm">
              <div>
                <dt className="text-xs text-zinc-400">Products tracked</dt>
                <dd className="mt-0.5 font-semibold tabular text-zinc-900">
                  {r.productCount.toLocaleString("en-US")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">Last updated</dt>
                <dd className="mt-0.5 font-semibold text-zinc-900">{timeAgo(r.lastVerified)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex gap-2">
              <Link
                href={`/stores/${r.id}`}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                View store
              </Link>
              <a
                href={`https://${r.domain}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                Website
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 rounded-lg bg-amber-50 p-3 text-center text-xs font-medium text-amber-700 ring-1 ring-amber-100">
        Stores marked “Live data” are real Sri Lankan retailers whose prices are collected by the
        scraper pipeline. Other stores are demo placeholders shown while real coverage grows.
      </p>
    </div>
  );
}