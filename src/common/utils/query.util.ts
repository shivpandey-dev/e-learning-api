import type { ParsedQs } from 'qs';

export function toQueryParams(q: ParsedQs): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v == null) out[k] = '';
    else if (Array.isArray(v)) {
      out[k] = v.map((x) =>
        typeof x === 'object' && x !== null ? JSON.stringify(x) : String(x),
      );
    } else if (typeof v === 'object') out[k] = JSON.stringify(v);
    else out[k] = String(v);
  }
  return out;
}
