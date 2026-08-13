import type { QuotationCalculationInput, QuotationCalculationResult } from './types';

/**
 * Rounds a currency value to 2 decimal places using banker's rounding avoidance.
 * Prevents floating-point noise in currency display.
 */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates all quotation amounts from raw inputs.
 *
 * Formula:
 *   Basic Price = area × basicRate
 *   EDC         = area × edcRate
 *   PLC Amount  = Basic Price × plcPercent / 100   (PLC is on Basic Price ONLY)
 *   Grand Total = Basic Price + EDC + PLC Amount
 *   Eff. Rate   = Grand Total / area
 *
 * @throws Error for any invalid/rejected input values
 */
export function calculateQuotation(input: QuotationCalculationInput): QuotationCalculationResult {
  const { area, basicRate, edcRate, plcPercent } = input;

  // ── Validation ────────────────────────────────────────────────────────────

  if (!isFinite(area) || isNaN(area) || area <= 0) {
    throw new Error('Plot area must be a finite number greater than 0.');
  }
  if (!isFinite(basicRate) || isNaN(basicRate) || basicRate < 0) {
    throw new Error('Basic Rate must be a non-negative finite number.');
  }
  if (!isFinite(edcRate) || isNaN(edcRate) || edcRate < 0) {
    throw new Error('EDC Rate must be a non-negative finite number.');
  }
  if (!isFinite(plcPercent) || isNaN(plcPercent) || plcPercent < 0 || plcPercent > 100) {
    throw new Error('PLC percent must be between 0 and 100.');
  }

  // ── Calculation ───────────────────────────────────────────────────────────

  const basicPrice = roundMoney(area * basicRate);
  const edcAmount = roundMoney(area * edcRate);
  // PLC is calculated ONLY on Basic Price, NOT on Basic Price + EDC
  const plcAmount = roundMoney((basicPrice * plcPercent) / 100);
  const grandTotal = roundMoney(basicPrice + edcAmount + plcAmount);
  const effectiveRate = roundMoney(grandTotal / area);

  return {
    area,
    basicRate,
    basicPrice,
    edcRate,
    edcAmount,
    plcPercent,
    plcAmount,
    grandTotal,
    effectiveRate,
  };
}
