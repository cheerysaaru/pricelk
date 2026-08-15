import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        <li>
          <Link href="/" className="transition-colors hover:text-zinc-900">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-zinc-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-zinc-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}