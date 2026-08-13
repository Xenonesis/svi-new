/**
 * Converts a non-negative integer to Indian number words.
 *
 * Supports up to Crores. Example:
 *   5015772 → "Fifty Lakh Fifteen Thousand Seven Hundred Seventy Two"
 */

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TEENS = [
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(n: number): string {
  let result = '';
  if (n >= 100) {
    result += ONES[Math.floor(n / 100)] + ' Hundred';
    n %= 100;
    if (n > 0) result += ' ';
  }
  if (n >= 20) {
    result += TENS[Math.floor(n / 10)];
    const rem = n % 10;
    if (rem > 0) result += ' ' + ONES[rem];
  } else if (n >= 10) {
    result += TEENS[n - 10];
  } else if (n > 0) {
    result += ONES[n];
  }
  return result;
}

/**
 * Returns the words for an integer in the Indian numbering system.
 * Does NOT include "Rupees" prefix or "Only" suffix.
 */
export function integerToIndianWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) {
    throw new Error('integerToIndianWords: n must be a non-negative finite integer');
  }
  const int = Math.floor(n);
  if (int === 0) return 'Zero';

  const parts: string[] = [];
  let remaining = int;

  if (remaining >= 10_000_000) {
    parts.push(convertHundreds(Math.floor(remaining / 10_000_000)) + ' Crore');
    remaining %= 10_000_000;
  }
  if (remaining >= 100_000) {
    parts.push(convertHundreds(Math.floor(remaining / 100_000)) + ' Lakh');
    remaining %= 100_000;
  }
  if (remaining >= 1_000) {
    parts.push(convertHundreds(Math.floor(remaining / 1_000)) + ' Thousand');
    remaining %= 1_000;
  }
  if (remaining > 0) {
    parts.push(convertHundreds(remaining));
  }

  return parts.join(' ');
}

/**
 * Returns the full "Rupees X Only" string for a non-negative number.
 * Paise are ignored (whole rupees only for quotation purposes).
 */
export function numberToIndianWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '';
  const int = Math.floor(value);
  if (int === 0) return 'Rupees Zero Only';
  return 'Rupees ' + integerToIndianWords(int) + ' Only';
}
