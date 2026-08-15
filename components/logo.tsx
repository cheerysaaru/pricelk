import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="PriceLK — compare before you buy"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path
            d="M4 8.5h16M4 8.5l2.5-3.5h11L20 8.5M4 8.5v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-zinc-900">
        PRICE<span className="text-brand-600">LK</span>
      </span>
    </Link>
  );
}