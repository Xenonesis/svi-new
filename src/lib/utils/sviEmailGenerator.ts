/**
 * Utility functions for SVI corporate email generation, slugification,
 * and contact uniqueness normalization.
 */

export const DEFAULT_SVI_DOMAIN = 'sviinfra.com';

/**
 * Converts a person's full name into a clean, URL-safe and email-safe slug.
 * Example: "Rajesh Kumar" -> "rajesh.kumar"
 * Example: "Amit  Sharma (Lead)" -> "amit.sharma"
 */
export function slugifyName(fullName: string): string {
  if (!fullName) return '';

  return fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '.') // spaces/underscores to dot
    .replace(/[^a-z0-9.]/g, '') // remove remaining special symbols
    .replace(/\.+/g, '.') // collapse multiple dots
    .replace(/^\.+|\.+$/g, ''); // trim leading/trailing dots
}

/**
 * Generates an SVI corporate email from a full name, with automatic
 * uniqueness suffix resolution against known existing emails.
 *
 * Example:
 *   generateSviEmail('Rajesh Kumar') => 'rajesh.kumar@sviinfra.com'
 *   generateSviEmail('Rajesh Kumar', ['rajesh.kumar@sviinfra.com']) => 'rajesh.kumar2@sviinfra.com'
 */
export function generateSviEmail(
  fullName: string,
  existingEmails: string[] = [],
  domain: string = DEFAULT_SVI_DOMAIN
): string {
  const slug = slugifyName(fullName);
  if (!slug) return '';

  const cleanDomain = domain.replace(/^@/, '').toLowerCase().trim();
  const baseEmail = `${slug}@${cleanDomain}`.toLowerCase();

  if (!existingEmails || existingEmails.length === 0) {
    return baseEmail;
  }

  const existingSet = new Set(
    existingEmails.map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
  );

  if (!existingSet.has(baseEmail)) {
    return baseEmail;
  }

  // Find next available suffix (e.g. rajesh.kumar2, rajesh.kumar3...)
  let counter = 2;
  while (counter < 1000) {
    const candidate = `${slug}${counter}@${cleanDomain}`.toLowerCase();
    if (!existingSet.has(candidate)) {
      return candidate;
    }
    counter++;
  }

  return `${slug}.${Date.now()}@${cleanDomain}`;
}

/**
 * Normalizes phone numbers to standard digit strings for reliable uniqueness checks.
 */
export function normalizePhoneNumber(phone: string): {
  raw: string;
  digits: string;
  last10: string;
} {
  const raw = (phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

  return { raw, digits, last10 };
}

/**
 * Compares two phone strings to determine if they represent the same phone number.
 */
export function isPhoneMatching(phoneA: string, phoneB: string): boolean {
  if (!phoneA || !phoneB) return false;

  const normA = normalizePhoneNumber(phoneA);
  const normB = normalizePhoneNumber(phoneB);

  if (!normA.digits || !normB.digits) return false;

  // Exact digits match
  if (normA.digits === normB.digits) return true;

  // 10-digit standard Indian/international mobile match
  if (normA.last10.length === 10 && normB.last10.length === 10) {
    return normA.last10 === normB.last10;
  }

  return false;
}
