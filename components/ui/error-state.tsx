"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Prices couldn't be updated.",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{description}</p> : null}
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
      ) : null}
    </div>
  );
}