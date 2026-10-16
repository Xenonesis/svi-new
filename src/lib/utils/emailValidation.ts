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

/**
 * Common typo mappings for popular email providers in India and globally.
 */
const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'ymail.co': 'ymail.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'redifmail.com': 'rediffmail.com',
  'rediff.com': 'rediffmail.com',
  'icoud.com': 'icloud.com',
  'iclud.com': 'icloud.com',
};

export interface EmailTypoSuggestion {
  original: string;
  suggested: string;
  domain: string;
  suggestedDomain: string;
}

/**
 * Checks an email string for common typo domains (e.g. gamil.com -> gmail.com).
 * Returns null if no known typo is found.
 */
export function detectEmailTypo(email: string): EmailTypoSuggestion | null {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  const atIdx = trimmed.lastIndexOf('@');
  if (atIdx === -1) return null;

  const localPart = trimmed.slice(0, atIdx);
  const domainPart = trimmed.slice(atIdx + 1);

  if (COMMON_DOMAIN_TYPOS[domainPart]) {
    const suggestedDomain = COMMON_DOMAIN_TYPOS[domainPart];
    return {
      original: email,
      suggested: `${localPart}@${suggestedDomain}`,
      domain: domainPart,
      suggestedDomain,
    };
  }

  return null;
}
