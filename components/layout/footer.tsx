import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV = [
  { href: "/", label: "Compare" },
  { href: "/deals", label: "Deals" },
  { href: "/stores", label: "Stores" },
  { href: "/watchlist", label: "Watchlist" },
];

const INFO = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/data-sources", label: "Data sources" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              Compare before you buy. Find the best prices from Sri Lankan online stores — all in
              one place.
            </p>
            <p className="mt-4 max-w-sm rounded-lg bg-white p-3 text-xs leading-relaxed text-zinc-500 ring-1 ring-zinc-200">
              Prices are collected from publicly available retailer websites. Always verify the
              final price on the retailer&apos;s website before purchasing.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold text-zinc-900">Navigation</h3>
            <ul className="mt-3 space-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Information">
            <h3 className="text-sm font-semibold text-zinc-900">Information</h3>
            <ul className="mt-3 space-y-2">
              {INFO.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PriceLK. Sri Lanka only.</p>
          <p className="rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-700 ring-1 ring-amber-100">
            Demo prototype — retailers and prices shown are fictional placeholders.
          </p>
        </div>
      </div>
    </footer>
  );
}