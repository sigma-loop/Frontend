/**
 * Formatting utilities for the SigmaLoop Frontend.
 */

/**
 * Format a date string or Date object to a human-readable locale string.
 *
 * @example
 * formatDate("2025-01-15T10:30:00Z") // → "Jan 15, 2025"
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

/**
 * Format a number with commas (e.g., 1234 → "1,234").
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Calculate and format a progress percentage.
 *
 * @example
 * formatProgress(3, 10) // → "30%"
 */
export function formatProgress(completed: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((completed / total) * 100)}%`;
}

/**
 * Truncate a string to a max length with ellipsis.
 *
 * @example
 * truncate("Hello World", 8) // → "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
