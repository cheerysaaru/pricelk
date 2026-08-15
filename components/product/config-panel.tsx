"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Settings2, X } from "lucide-react";
import type { AttributeDef, ProductVariant } from "@/lib/types";
import { VariantSelector } from "@/components/product/variant-selector";
import { Button } from "@/components/ui/button";
import { mergeParams } from "@/lib/url";
import { correctSelection, resolveAttrs } from "@/lib/matching";

export function ConfigPanel({
  slug,
  attributes,
  variants,
  defaultAttrs,
}: {
  slug: string;
  attributes: AttributeDef[];
  variants: ProductVariant[];
  defaultAttrs: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const selected = useMemo(
    () => resolveAttrs(attributes, variants, searchParams, defaultAttrs),
    [searchParams, attributes, variants, defaultAttrs],
  );

  const select = (key: string, value: string) => {
    const next = correctSelection(attributes, variants, selected, key, value);
    router.replace(`/products/${slug}?${mergeParams(searchParams, next)}`, { scroll: false });
  };

  const chips = (
    <VariantSelector attributes={attributes} selected={selected} onSelect={select} />
  );

  return (
    <>
      {/* Desktop: inline chips */}
      <div className="hidden sm:block">{chips}</div>

      {/* Mobile: sheet trigger */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSheetOpen(true)}
        >
          <Settings2 className="h-4 w-4" aria-hidden />
          Configure product
        </Button>

        {sheetOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-end bg-zinc-950/40 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-label="Configure product"
            onClick={() => setSheetOpen(false)}
          >
            <div
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900">Configure product</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {chips}
              <Button className="mt-6 w-full" size="lg" onClick={() => setSheetOpen(false)}>
                Show matching offers
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}