import { SortOrder } from '../enums/SortOrder.enum';

export function normalizeSortOrder(
  input?: unknown,
  fallback: SortOrder = SortOrder.DESC,
): SortOrder {
  if (typeof input !== 'string') return fallback;
  const s = String(input).toUpperCase();
  return s === 'ASC' ? SortOrder.ASC : SortOrder.DESC;
}
