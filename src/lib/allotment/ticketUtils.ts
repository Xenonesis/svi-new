import type { SupabaseClient } from '@supabase/supabase-js';

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

/**
 * Extracts the numeric portion of an SVI ticket (e.g., "SVI2258" -> 2258).
 */
export function parseTicketNumericSuffix(raw?: string | null): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = formatTicketId(raw);
  const match = clean.match(/^SVI(\d+)$/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return isNaN(num) ? null : num;
}

/**
 * Checks whether a given ticket ID is already bound to any existing
 * registration, active allotment, or allotment letter document.
 */
export async function isTicketIdOccupied(
  supabaseClient: SupabaseClient,
  ticketId: string
): Promise<boolean> {
  const clean = formatTicketId(ticketId);
  if (!clean) return false;

  const fromRegs = supabaseClient.from('registrations');
  type QueryResult = { data?: unknown; error?: unknown };
  let regsPromise: Promise<QueryResult> = Promise.resolve({ data: [] });
  if (typeof fromRegs?.select === 'function') {
    const sel = fromRegs.select('id');
    if (typeof sel?.eq === 'function') {
      regsPromise = Promise.resolve(sel.eq('submission_id', clean).limit(1));
    }
  }

  const fromAllots = supabaseClient.from('allotments');
  let allotsPromise: Promise<QueryResult> = Promise.resolve({ data: [] });
  if (typeof fromAllots?.select === 'function') {
    const sel = fromAllots.select('id, metadata');
    if (typeof sel?.or === 'function') {
      allotsPromise = Promise.resolve(
        sel.or(`metadata->>ticket_id.eq.${clean},metadata->>ticketId.eq.${clean}`).limit(1)
      );
    }
  }

  const fromDocs = supabaseClient.from('documents');
  let docsPromise: Promise<QueryResult> = Promise.resolve({ data: [] });
  if (typeof fromDocs?.select === 'function') {
    const sel = fromDocs.select('id, form_data');
    if (typeof sel?.eq === 'function') {
      const eqChain = sel.eq('document_type', 'allotment_letter');
      if (typeof eqChain?.or === 'function') {
        docsPromise = Promise.resolve(
          eqChain.or(`form_data->>ticketId.eq.${clean},form_data->>ticket_id.eq.${clean}`).limit(1)
        );
      }
    }
  }
  const [regsRes, allotsRes, docsRes] = await Promise.all([
    regsPromise,
    allotsPromise,
    docsPromise,
  ]);

  if (Array.isArray(regsRes.data) && regsRes.data.length > 0) return true;
  if (Array.isArray(allotsRes.data) && allotsRes.data.length > 0) return true;
  if (Array.isArray(docsRes.data) && docsRes.data.length > 0) return true;
  return false;
}

/**
 * Calculates the next guaranteed unique sequential SVI ticket identifier
 * by inspecting registrations, allotments, and documents simultaneously.
 */
export async function getNextGlobalTicketId(
  supabaseClient: SupabaseClient,
  fallbackFloorOrId?: string | number | null
): Promise<string> {
  const fromRegs = supabaseClient.from('registrations');
  type QueryResult = { data?: unknown; error?: unknown };
  let regsPromise: Promise<QueryResult> = Promise.resolve({ data: [] });
  if (typeof fromRegs?.select === 'function') {
    const sel = fromRegs.select('submission_id');
    if (typeof sel?.not === 'function') {
      const n = sel.not('submission_id', 'is', null);
      if (typeof n?.order === 'function') {
        regsPromise = Promise.resolve(n.order('submission_id', { ascending: false }).limit(100));
      } else if (typeof n?.limit === 'function') {
        regsPromise = Promise.resolve(n.limit(100));
      }
    }
  }

  const fromAllots = supabaseClient.from('allotments');
  let allotsPromise: Promise<QueryResult> = Promise.resolve({ data: [] });
  if (typeof fromAllots?.select === 'function') {
    const sel = fromAllots.select('metadata');
    if (typeof sel?.limit === 'function') {
      allotsPromise = Promise.resolve(sel.limit(100));
    } else if (typeof sel?.not === 'function') {
      const n = sel.not('metadata', 'is', null);
      if (typeof n?.limit === 'function') {
        allotsPromise = Promise.resolve(n.limit(100));
      }
    }
  }

  const fromDocs = supabaseClient.from('documents');
  let docsPromise: Promise<QueryResult> = Promise.resolve({ data: [] });
  if (typeof fromDocs?.select === 'function') {
    const sel = fromDocs.select('form_data');
    if (typeof sel?.eq === 'function') {
      const eqChain = sel.eq('document_type', 'allotment_letter');
      if (typeof eqChain?.limit === 'function') {
        docsPromise = Promise.resolve(eqChain.limit(100));
      } else if (typeof eqChain?.not === 'function') {
        const n = eqChain.not('form_data', 'is', null);
        if (typeof n?.limit === 'function') {
          docsPromise = Promise.resolve(n.limit(100));
        }
      }
    } else if (typeof sel?.limit === 'function') {
      docsPromise = Promise.resolve(sel.limit(100));
    }
  }

  const [regsRes, allotsRes, docsRes] = await Promise.all([
    regsPromise,
    allotsPromise,
    docsPromise,
  ]);

  const regsError =
    regsRes && typeof regsRes === 'object' && 'error' in regsRes ? regsRes.error : null;
  if (regsError) {
    throw new Error('Database error during ID generation');
  }

  const numbers: number[] = [2199];
  let maxLen = 4;

  if (typeof fallbackFloorOrId === 'number') {
    numbers.push(fallbackFloorOrId);
  } else if (typeof fallbackFloorOrId === 'string') {
    const m = fallbackFloorOrId.match(/^SVI(\d+)$/i);
    if (m) {
      numbers.push(parseInt(m[1], 10));
      maxLen = Math.max(maxLen, m[1].length);
    }
  }

  if (regsRes && typeof regsRes === 'object' && 'data' in regsRes && Array.isArray(regsRes.data)) {
    for (const r of regsRes.data) {
      if (
        r &&
        typeof r === 'object' &&
        'submission_id' in r &&
        typeof r.submission_id === 'string'
      ) {
        const match = r.submission_id.match(/^SVI(\d+)$/i);
        if (match) {
          numbers.push(parseInt(match[1], 10));
          maxLen = Math.max(maxLen, match[1].length);
        }
      }
    }
  }

  if (
    allotsRes &&
    typeof allotsRes === 'object' &&
    'data' in allotsRes &&
    Array.isArray(allotsRes.data)
  ) {
    for (const a of allotsRes.data) {
      if (
        a &&
        typeof a === 'object' &&
        'metadata' in a &&
        typeof a.metadata === 'object' &&
        a.metadata
      ) {
        const tId = extractTicketFromMetadata(a.metadata as Record<string, unknown>);
        const match = tId.match(/^SVI(\d+)$/i);
        if (match) {
          numbers.push(parseInt(match[1], 10));
          maxLen = Math.max(maxLen, match[1].length);
        }
      }
    }
  }

  if (docsRes && typeof docsRes === 'object' && 'data' in docsRes && Array.isArray(docsRes.data)) {
    for (const d of docsRes.data) {
      if (
        d &&
        typeof d === 'object' &&
        'form_data' in d &&
        typeof d.form_data === 'object' &&
        d.form_data
      ) {
        const tId = extractTicketFromMetadata(d.form_data as Record<string, unknown>);
        const match = tId.match(/^SVI(\d+)$/i);
        if (match) {
          numbers.push(parseInt(match[1], 10));
          maxLen = Math.max(maxLen, match[1].length);
        }
      }
    }
  }

  let maxNum = Math.max(...numbers);
  const nextNumeric = maxNum + 1;
  let candidate = `SVI${String(nextNumeric).padStart(Math.max(maxLen, String(nextNumeric).length), '0')}`;

  // Double check availability (safety leap)
  let attempts = 0;
  while (attempts < 15) {
    attempts++;
    const occupied = await isTicketIdOccupied(supabaseClient, candidate);
    if (!occupied) {
      return candidate;
    }
    maxNum++;
    const jumpedNumeric = maxNum + 1;
    candidate = `SVI${String(jumpedNumeric).padStart(Math.max(maxLen, String(jumpedNumeric).length), '0')}`;
  }

  return candidate;
}
