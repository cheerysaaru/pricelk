import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "green" | "amber" | "red" | "brand";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  red: "bg-red-50 text-red-700 ring-1 ring-red-100",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}