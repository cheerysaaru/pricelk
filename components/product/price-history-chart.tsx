"use client";

import { useMemo } from "react";
import type { PricePoint } from "@/lib/types";
import { formatLKR, formatDate } from "@/lib/format";

const W = 640;
const H = 220;
const PAD = { top: 18, right: 16, bottom: 30, left: 8 };

export function PriceHistoryChart({
  history,
  current,
}: {
  history: PricePoint[];
  current: number;
}) {
  const { points, min, max, linePath, areaPath } = useMemo(() => {
    if (history.length < 2) {
      return { points: [], min: current, max: current, linePath: "", areaPath: "" };
    }
    const prices = history.map((p) => p.price);
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    const range = hi - lo || 1;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const pts = history.map((p, i) => ({
      x: PAD.left + (i / (history.length - 1)) * innerW,
      y: PAD.top + (1 - (p.price - lo) / range) * innerH,
      price: p.price,
      date: p.date,
    }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H - PAD.bottom} L${pts[0].x.toFixed(1)},${H - PAD.bottom} Z`;
    return { points: pts, min: lo, max: hi, linePath: line, areaPath: area };
  }, [history, current]);

  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-zinc-400">
        Not enough price history for this configuration yet.
      </p>
    );
  }

  const last = points[points.length - 1];
  const first = points[0];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Price history line chart"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + f * (H - PAD.top - PAD.bottom)}
            y2={PAD.top + f * (H - PAD.top - PAD.bottom)}
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#areaFill)" />
        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* last point */}
        <circle cx={last.x} cy={last.y} r="5" fill="#059669" stroke="#fff" strokeWidth="2" />

        {/* labels */}
        <text x={PAD.left} y={PAD.top - 6} fontSize="11" fill="#71717a" className="tabular">
          {formatLKR(max)}
        </text>
        <text x={PAD.left} y={H - PAD.bottom + 18} fontSize="11" fill="#71717a" className="tabular">
          {formatLKR(min)}
        </text>
        <text x={first.x} y={H - 6} fontSize="11" fill="#a1a1aa">
          {formatDate(first.date)}
        </text>
        <text x={last.x} y={H - 6} fontSize="11" fill="#a1a1aa" textAnchor="end">
          {formatDate(last.date)}
        </text>
      </svg>
    </div>
  );
}