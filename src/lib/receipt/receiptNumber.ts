import type { SupabaseClient } from '@supabase/supabase-js';

const RESERVED_RECEIPT_NUMBERS = new Set([2999]);

export const BASE_RECEIPT_NUMBER = 2056;

export interface ReceiptLike {
  form_data?: {
    receiptNo?: string | number | null;
    [key: string]: unknown;
  } | null;
  metadata?: {
    is_trashed?: boolean | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export type ReceiptDatabaseClient = Pick<SupabaseClient, 'from'>;

export function getNextReceiptNumber(receipts?: ReceiptLike[] | null): string {
  if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
    return String(BASE_RECEIPT_NUMBER);
  }

  let maxNumber = BASE_RECEIPT_NUMBER - 1;

  for (const item of receipts) {
    if (item?.metadata?.is_trashed === true) {
      continue;
    }
    const rawNo = item?.form_data?.receiptNo;
    if (rawNo !== undefined && rawNo !== null) {
      const parsed = parseInt(String(rawNo).trim(), 10);
      if (!Number.isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }

  let nextNumber = maxNumber + 1;
  while (RESERVED_RECEIPT_NUMBERS.has(nextNumber)) {
    nextNumber += 1;
  }
  return String(nextNumber);
}

export async function getNextReceiptNumberFromDb(
  supabaseClient: ReceiptDatabaseClient
): Promise<string> {
  const res = await supabaseClient
    .from('documents')
    .select('form_data, metadata')
    .eq('document_type', 'payment_receipt')
    .limit(10000);

  const rawData = res?.data;
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return String(BASE_RECEIPT_NUMBER);
  }

  return getNextReceiptNumber(rawData as ReceiptLike[]);
}

export async function verifyAndAssignUniqueReceiptNumber(
  supabaseClient: ReceiptDatabaseClient,
  requestedReceiptNo?: string | number | null
): Promise<string> {
  const rawNo = requestedReceiptNo ? String(requestedReceiptNo).trim() : '';

  if (rawNo && isValidReceiptNumber(rawNo) && !RESERVED_RECEIPT_NUMBERS.has(Number(rawNo))) {
    const res = await supabaseClient
      .from('documents')
      .select('id, metadata')
      .eq('document_type', 'payment_receipt')
      .filter('form_data->>receiptNo', 'eq', rawNo);

    const existingList = Array.isArray(res?.data)
      ? (res.data as Array<{ id: string; metadata?: { is_trashed?: boolean | null } | null }>)
      : [];

    const isTaken = existingList.some((doc) => doc?.metadata?.is_trashed !== true);

    if (!isTaken) {
      return rawNo;
    }
  }

  return await getNextReceiptNumberFromDb(supabaseClient);
}

export function isValidReceiptNumber(receiptNo?: string | number | null): boolean {
  if (receiptNo === undefined || receiptNo === null) return false;
  const str = String(receiptNo).trim();
  if (!str) return false;
  const num = parseInt(str, 10);
  return !Number.isNaN(num) && num > 0 && String(num) === str;
}
