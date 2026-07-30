/**
 * Validates an email address using a lightweight RFC 5322 subset regex.
 * Catches obvious typos: empty, missing @, whitespace, double dots, invalid chars.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;

  // RFC 5322 simplified: local@domain.tld
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/** Trims whitespace and lowercases an email address. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
