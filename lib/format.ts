/** Formatting helpers. All prices are LKR only. */

export function formatLKR(price: number): string {
  return "Rs." + Math.round(price).toLocaleString("en-US");
}

export function formatLKRCompact(price: number): string {
  if (price >= 1_000_000) return "Rs." + (price / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (price >= 1_000) return "Rs." + (price / 1_000).toFixed(0) + "K";
  return "Rs." + Math.round(price).toLocaleString("en-US");
}

export function formatSavings(price: number): string {
  return "Rs." + Math.round(price).toLocaleString("en-US");
}

export function formatPercent(value: number): string {
  return value.toFixed(0) + "%";
}

/** "12 minutes ago" / "Checked today" style relative time. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function checkedLabel(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 24 * 60 * 60_000) return "Checked today";
  return `Checked ${timeAgo(iso)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}