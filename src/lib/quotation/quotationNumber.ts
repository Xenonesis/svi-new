import { localDateString } from './format';

/**
 * Generates a unique quotation number in the format:
 *   SVI-QTN-YYYYMMDD-XXXX
 *
 * The suffix is a 4-digit random number padded to 4 chars to reduce collisions.
 * This should be called once during component initialization (e.g., useState initializer
 * or useRef), NOT on every render.
 */
export function generateQuotationNumber(): string {
  const today = localDateString();
  const datePart = today.replace(/-/g, ''); // e.g., "20260812"
  const suffix = String(Math.floor(1000 + Math.random() * 9000)); // 1000–9999
  return `SVI-QTN-${datePart}-${suffix}`;
}
