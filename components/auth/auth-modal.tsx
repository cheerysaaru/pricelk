"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export function AuthModal({
  open,
  onClose,
  title = "Sign in to PriceLK",
  description = "Save your watchlist and get price alerts across devices.",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  const { signIn } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const email = inputRef.current?.value.trim();
            if (!email) return;
            signIn(email);
            onClose();
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Email address</span>
            <input
              ref={inputRef}
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <Button type="submit" className="w-full" size="lg">
            Continue
          </Button>
          <p className="text-center text-xs text-zinc-400">
            Demo prototype — no real account is created.
          </p>
        </form>
      </div>
    </div>
  );
}