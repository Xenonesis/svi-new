/** Normalize provider or user input to E.164. Indian local numbers default to +91. */
export function normalizeE164(input: string, defaultCountryCode = '91'): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 10 && /^[6-9]/.test(digits)) digits = `${defaultCountryCode}${digits}`;

  return /^[1-9][0-9]{7,14}$/.test(digits) ? `+${digits}` : null;
}

export function toMetaRecipient(phoneE164: string): string {
  return phoneE164.replace(/^\+/, '');
}
