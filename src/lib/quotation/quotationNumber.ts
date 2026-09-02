import { localDateString } from './format';
import type { SupabaseClient } from '@supabase/supabase-js';

export const BASE_QUOTATION_PREFIX = 'SVI-QTN';

export interface QuotationDocLike {
  form_data?: {
    quotationNo?: string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

/**
 * Validates whether a quotation number matches standard format:
 * SVI-QTN-YYYYMMDD-XXXX (or sequential 4+ digit numeric suffix)
 */
export function isValidQuotationNumber(quotationNo?: string | null): boolean {
  if (!quotationNo || typeof quotationNo !== 'string') return false;
  const str = quotationNo.trim();
  if (!str) return false;
  // Match standard SVI-QTN-YYYYMMDD-XXXX or similar pattern
  return /^SVI-QTN-\d{8}-\d{1,8}$/.test(str);
}

/**
 * Formats a quotation number given a date string (YYYY-MM-DD or YYYYMMDD) and a sequence integer.
 */
export function formatQuotationNumber(dateInput?: string, sequence: number = 1): string {
  const dateStr = dateInput ? dateInput.replace(/-/g, '') : localDateString().replace(/-/g, '');
  const seqStr = String(Math.max(1, sequence)).padStart(4, '0');
  return `${BASE_QUOTATION_PREFIX}-${dateStr}-${seqStr}`;
}

/**
 * Extracts datePart and sequence integer from a quotation number string if it matches.
 */
export function parseQuotationNumber(
  quotationNo?: string | null
): { datePart: string; sequence: number } | null {
  if (!quotationNo || typeof quotationNo !== 'string') return null;
  const match = quotationNo.trim().match(/^SVI-QTN-(\d{8})-(\d+)$/);
  if (!match) return null;
  return {
    datePart: match[1],
    sequence: parseInt(match[2], 10),
  };
}

/**
 * Computes the next unique quotation number from a list of existing quotation records/numbers
 * for a target date (defaults to today).
 * Scans existing records for the highest sequence on that date, increments by 1,
 * and ensures collision-free uniqueness.
 */
export function computeNextQuotationNumber(
  existingRecords: Array<string | QuotationDocLike> = [],
  targetDate?: string
): string {
  const dateStr = targetDate ? targetDate.replace(/-/g, '') : localDateString().replace(/-/g, '');
  const prefix = `${BASE_QUOTATION_PREFIX}-${dateStr}-`;

  const existingNumbers = new Set<string>();
  let maxSeq = 0;

  for (const item of existingRecords) {
    let rawNo: string | undefined;
    if (typeof item === 'string') {
      rawNo = item;
    } else if (item && typeof item === 'object' && item.form_data?.quotationNo) {
      rawNo = String(item.form_data.quotationNo);
    }

    if (rawNo) {
      const trimmed = rawNo.trim();
      existingNumbers.add(trimmed);

      if (trimmed.startsWith(prefix)) {
        const suffix = trimmed.slice(prefix.length);
        const parsed = parseInt(suffix, 10);
        if (!Number.isNaN(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }
  }

  // Find the next available unique sequence
  let candidateSeq = maxSeq + 1;
  let candidateNo = `${prefix}${String(candidateSeq).padStart(4, '0')}`;

  while (existingNumbers.has(candidateNo)) {
    candidateSeq += 1;
    candidateNo = `${prefix}${String(candidateSeq).padStart(4, '0')}`;
  }

  return candidateNo;
}

/**
 * Synchronous client-side fallback quotation number generator.
 * Used during offline/initial local state before DB response arrives.
 */
export function generateQuotationNumber(targetDate?: string): string {
  return computeNextQuotationNumber([], targetDate);
}

/**
 * Queries the database to calculate and return the next unique quotation number.
 * Tries the database RPC function first; if unavailable, falls back to querying the
 * documents table and computing the next sequence in-app.
 */
export async function getNextQuotationNumberFromDb(
  supabaseClient: Pick<SupabaseClient, 'rpc' | 'from'>,
  targetDate?: string
): Promise<string> {
  const dateStr = targetDate ? targetDate.replace(/-/g, '') : localDateString().replace(/-/g, '');

  // 1. Try calling the PostgreSQL stored procedure if present
  try {
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
      'get_next_quotation_number',
      { target_date: dateStr }
    );

    if (!rpcError && rpcData && typeof rpcData === 'string') {
      return rpcData.trim();
    }
  } catch {
    // Ignore RPC failure and fallback to direct table query
  }

  // 2. Direct database query fallback
  const prefix = `${BASE_QUOTATION_PREFIX}-${dateStr}-`;
  const { data, error } = await supabaseClient
    .from('documents')
    .select('form_data')
    .eq('document_type', 'quotation')
    .limit(5000);

  if (error) {
    // In case of query error, return default sequence for today
    return formatQuotationNumber(dateStr, 1);
  }

  const existingDocs = (data || []) as QuotationDocLike[];
  return computeNextQuotationNumber(existingDocs, dateStr);
}
