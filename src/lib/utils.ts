import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse an integer safely with explicit radix 10. Returns `fallback` when the
// input is empty, non-numeric, or NaN. Avoids the classic parseInt-without-radix
// pitfall and silent NaN propagation.
export function safeParseInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : fallback;
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (trimmed === '') return fallback;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// Same as safeParseInt but for floats. Useful for monetary/quantity fields.
export function safeParseFloat(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(',', '.');
  if (trimmed === '') return fallback;
  const parsed = Number.parseFloat(trimmed);
  return Number.isNaN(parsed) ? fallback : parsed;
}
