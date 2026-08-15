import type { OffersResponse } from "@/lib/types";
import { cn } from "@/lib/cn";

const LABELS: Record<number, { label: string; tone: "green" | "brand" | "amber" | "neutral" }> = {
  90: { label: "Excellent deal", tone: "green" },
  70: { label: "Great deal", tone: "green" },
  55: { label: "Good deal", tone: "brand" },
  40: { label: "Average price", tone: "amber" },
  0: { label: "Fair price", tone: "neutral" },
};

export function DealScore({ stats }: { stats: OffersResponse["stats"] }) {
  const tier = [90, 70, 55, 40, 0].find((t) => stats.dealScore >= t) ?? 0;
  const meta = LABELS[tier];
  const toneClasses = {
    green: "text-emerald-600",
    brand: "text-brand-600",
    amber: "text-amber-600",
    neutral: "text-zinc-600",
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <span className={cn("text-3xl font-semibold tracking-tight tabular", toneClasses[meta.tone])}>
          {stats.dealScore}
        </span>
        <span className="mb-1 text-sm text-zinc-400">/ 100</span>
      </div>
      <p className={cn("mt-1 text-sm font-medium", toneClasses[meta.tone])}>{meta.label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{stats.dealReason}</p>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"
        role="meter"
        aria-valuenow={stats.dealScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Deal score"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClasses[meta.tone])}
          style={{ width: `${Math.max(4, stats.dealScore)}%` }}
        />
      </div>
    </div>
  );
}