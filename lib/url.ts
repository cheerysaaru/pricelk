export function attrsToQuery(attrs: Record<string, string>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(attrs)) {
    if (v) p.set(k, v);
  }
  return p.toString();
}

export function mergeParams(
  current: URLSearchParams,
  attrs: Record<string, string>,
): string {
  const p = new URLSearchParams();
  for (const [k, v] of current.entries()) {
    if (!(k in attrs)) p.set(k, v);
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (v) p.set(k, v);
  }
  return p.toString();
}