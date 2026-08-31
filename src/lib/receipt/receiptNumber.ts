/**
 * Utility functions for generating and validating payment receipt numbers.
 * The baseline receipt number sequence begins at 2056.
 */

export const BASE_RECEIPT_NUMBER = 2056;
export interface ReceiptLike {
  form_data?: {
    receiptNo?: string | number | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

/**
 * Calculates the next sequential receipt number based on existing receipt documents.
 * Scans for the maximum valid numeric receipt number (minimum base 2055) and adds 1.
 */
export function getNextReceiptNumber(receipts?: ReceiptLike[] | null): string {
  if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
    return String(BASE_RECEIPT_NUMBER);
  }

  let maxNumber = BASE_RECEIPT_NUMBER - 1; // 2055

  for (const item of receipts) {
    const rawNo = item?.form_data?.receiptNo;
    if (rawNo !== undefined && rawNo !== null) {
      const parsed = parseInt(String(rawNo).trim(), 10);
      if (!Number.isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }
  }

  return String(maxNumber + 1);
}

/**
 * Validates if a given receipt number is a valid positive integer string/number.
 */
export function isValidReceiptNumber(receiptNo?: string | number | null): boolean {
  if (receiptNo === undefined || receiptNo === null) return false;
  const str = String(receiptNo).trim();
  if (!str) return false;
  const num = parseInt(str, 10);
  return !Number.isNaN(num) && num > 0 && String(num) === str;
}
