import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { HeaderSearch } from "@/components/search/header-search";
import { LoginButton } from "@/components/auth/login-button";

const NAV = [
  { href: "/", label: "Compare" },
  { href: "/deals", label: "Deals" },
  { href: "/stores", label: "Stores" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <HeaderSearch />
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/watchlist"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Watchlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}