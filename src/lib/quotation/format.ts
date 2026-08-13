/**
 * Indian currency formatting utilities.
 * Uses en-IN locale for lakhs / crore grouping.
 */

/**
 * Formats a number as Indian currency.
 * Omits trailing zeros unless significant decimal places exist.
 *
 * Examples:
 *   5015772   → "₹50,15,772"
 *   8550      → "₹8,550"
 *   8550.50   → "₹8,550.50"
 */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '₹0';
  const hasDecimals = value % 1 !== 0;
  return (
    '₹' +
    value.toLocaleString('en-IN', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Formats a number as Indian currency always showing 2 decimal places.
 */
export function formatINRFixed(value: number): string {
  if (!Number.isFinite(value)) return '₹0.00';
  return (
    '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/**
 * Parses a string to a number, returning NaN if invalid.
 */
export function parseNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  const n = parseFloat(val);
  return isNaN(n) ? NaN : n;
}

/**
 * Returns a safe local date string (YYYY-MM-DD) avoiding UTC/local midnight bugs.
 */
export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adds N days to an ISO date string (YYYY-MM-DD) and returns a new date string.
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return localDateString(d);
}

/**
 * Formats YYYY-MM-DD to DD/MM/YYYY for display on quotation documents.
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
