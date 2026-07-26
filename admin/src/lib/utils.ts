import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date without letting one bad value take down the page.
 * date-fns `format()` throws RangeError on an invalid Date, and a table cell
 * inside .map() has no error boundary — so a single null/malformed timestamp
 * blanks the whole list.
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  pattern = "dd/MM/yyyy",
  fallback = "—",
): string {
  if (value === null || value === undefined || value === "") return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return format(date, pattern)
}
