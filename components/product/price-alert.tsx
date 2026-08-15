"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/lib/hooks/use-auth";
import { formatLKR } from "@/lib/format";

interface AlertEntry {
  slug: string;
  name: string;
  variantLabel: string;
  target: number;
}

const KEY = "pricelk_alerts";

export function PriceAlert({
  slug,
  name,
  variantLabel,
  currentPrice,
}: {
  slug: string;
  name: string;
  variantLabel: string;
  currentPrice: number;
}) {
  const { user, ready } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    try {
      setAlerts(JSON.parse(localStorage.getItem(KEY) ?? "[]") as AlertEntry[]);
    } catch {
      /* ignore */
    }
  }, []);

  const existing = alerts.find((a) => a.slug === slug && a.variantLabel === variantLabel);

  const save = () => {
    const value = Number(target);
    if (!value || value <= 0) return;
    const next = [
      ...alerts.filter((a) => !(a.slug === slug && a.variantLabel === variantLabel)),
      { slug, name, variantLabel, target: value },
    ];
    setAlerts(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setJustSaved(true);
    setFormOpen(false);
    setTimeout(() => setJustSaved(false), 4000);
  };

  const remove = () => {
    const next = alerts.filter((a) => !(a.slug === slug && a.variantLabel === variantLabel));
    setAlerts(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  if (existing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <BellRing className="h-4 w-4" aria-hidden />
          Alert active — we&apos;ll notify you below {formatLKR(existing.target)}
        </p>
        <button
          onClick={remove}
          className="self-start text-xs font-medium text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline"
        >
          Remove alert
        </button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (!ready) return;
          if (!user) {
            setAuthOpen(true);
            return;
          }
          setTarget(String(Math.round(currentPrice * 0.95)));
          setFormOpen(true);
        }}
        className="w-full"
      >
        <Bell className="h-4 w-4" aria-hidden />
        Set price alert
      </Button>

      {justSaved ? (
        <p className="text-center text-xs font-medium text-emerald-600">
          Alert saved — we&apos;ll email you when the price drops.
        </p>
      ) : null}

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Set price alert"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Get notified when the price drops
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {name} · {variantLabel} — currently {formatLKR(currentPrice)}
            </p>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Notify me below
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-3.5 text-sm tabular text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    placeholder="180000"
                  />
                </div>
              </label>
              <Button type="submit" className="w-full" size="lg">
                <Bell className="h-4 w-4" aria-hidden />
                Set price alert
              </Button>
              <p className="text-center text-xs text-zinc-400">
                Demo prototype — alerts are stored locally in your browser.
              </p>
            </form>
          </div>
        </div>
      ) : null}

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setTarget(String(Math.round(currentPrice * 0.95)));
          setFormOpen(true);
        }}
        title="Sign in to set a price alert"
        description="We'll email you the moment this product drops below your target price."
      />
    </>
  );
}