/**
 * Normalize user-entered phone input to a bare 10-digit Indian mobile number.
 * Accepts: "98765 43210", "+91 98765-43210", "0091-9876543210", "919876543210".
 * Returns the bare number, or null if it is not a valid Indian mobile.
 */
export function normalizeIndianPhone(phone: string): string | null {
  if (!phone) return null;
  let clean = phone.replace(/[\s\-().]/g, '');
  // Strip international prefixes only when a valid 10-digit number remains
  clean = clean.replace(/^(\+91|0091|91(?=[6-9]\d{9}$))/, '');
  return /^[6-9]\d{9}$/.test(clean) ? clean : null;
}
