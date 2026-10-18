/**
 * Canonical Ticket & Registration Identifier Standardization Utilities
 *
 * Enforces uniform, uppercase, non-spaced formatting for all customer tickets
 * across Registrations (submission_id) and Allotments (metadata.ticket_id).
 */

/**
 * Normalizes any ticket/ref ID into a canonical clean string.
 * Examples:
 *   "svi 2236" -> "SVI2236"
 *   "SVI-2236" -> "SVI2236"
 *   " pl 2075 " -> "PL2075"
 */
export function formatTicketId(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s\-_]/g, '');
}

/**
 * Checks whether a given string has a valid ticket format.
 * Matches standard schemes: SVI followed by digits, PL followed by digits, or general alphanumeric ticket refs.
 */
export function isValidTicketFormat(raw?: string | null): boolean {
  const clean = formatTicketId(raw);
  if (!clean || clean.length < 3) return false;
  return /^[A-Z0-9]+$/.test(clean);
}

/**
 * Extracts candidate ticket from an allotment record metadata safely.
 */
export function extractTicketFromMetadata(metadata?: Record<string, unknown> | null): string {
  if (!metadata || typeof metadata !== 'object') return '';
  const raw =
    metadata.ticket_id ||
    metadata.ticketId ||
    metadata.ref_id ||
    metadata.refId ||
    metadata.submission_id ||
    metadata.submissionId;
  return typeof raw === 'string' ? formatTicketId(raw) : '';
}
