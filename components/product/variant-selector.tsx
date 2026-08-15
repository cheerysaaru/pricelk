import type { AttributeDef } from "@/lib/types";
import { cn } from "@/lib/cn";

export function VariantSelector({
  attributes,
  selected,
  onSelect,
}: {
  attributes: AttributeDef[];
  selected: Record<string, string>;
  onSelect: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      {attributes.map((attr) => (
        <div key={attr.key}>
          <p className="text-sm font-medium text-zinc-700">{attr.label}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={attr.label}>
            {attr.options.map((option) => {
              const isSelected = selected[attr.key] === option;
              return (
                <button
                  key={option}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelect(attr.key, option)}
                  className={cn(
                    "rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-150",
                    isSelected
                      ? "border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}