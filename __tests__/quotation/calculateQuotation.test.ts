import { describe, it, expect } from 'vitest';
import { calculateQuotation } from '../../src/lib/quotation/calculateQuotation';

describe('calculateQuotation', () => {
  // ── Mandatory acceptance test ────────────────────────────────────────────
  it('should produce exactly ₹50,15,772 grand total for the acceptance example', () => {
    const result = calculateQuotation({
      area: 586.64,
      basicRate: 8000,
      edcRate: 150,
      plcPercent: 5,
    });

    expect(result.basicPrice).toBe(4693120);
    expect(result.edcAmount).toBe(87996);
    expect(result.plcAmount).toBe(234656);
    expect(result.grandTotal).toBe(5015772);
    expect(result.effectiveRate).toBe(8550);
  });

  // ── PLC is on Basic Price ONLY, not on Basic Price + EDC ─────────────────
  it('should compute PLC on Basic Price only', () => {
    const result = calculateQuotation({
      area: 100,
      basicRate: 10000,
      edcRate: 200,
      plcPercent: 10,
    });
    // basicPrice = 1,000,000
    // plcAmount  = 1,000,000 * 0.10 = 100,000   (not on 1,020,000)
    expect(result.basicPrice).toBe(1000000);
    expect(result.plcAmount).toBe(100000);
    expect(result.grandTotal).toBe(1120000); // 1,000,000 + 20,000 + 100,000
  });

  // ── PLC zero ─────────────────────────────────────────────────────────────
  it('should return plcAmount = 0 when plcPercent = 0', () => {
    const result = calculateQuotation({
      area: 200,
      basicRate: 5000,
      edcRate: 100,
      plcPercent: 0,
    });
    expect(result.plcAmount).toBe(0);
    expect(result.grandTotal).toBe(result.basicPrice + result.edcAmount);
  });

  // ── EDC zero ─────────────────────────────────────────────────────────────
  it('should allow edcRate = 0 (EDC is optional)', () => {
    const result = calculateQuotation({
      area: 500,
      basicRate: 6000,
      edcRate: 0,
      plcPercent: 5,
    });
    expect(result.edcAmount).toBe(0);
    expect(result.grandTotal).toBe(result.basicPrice + result.plcAmount);
  });

  // ── Decimal area ─────────────────────────────────────────────────────────
  it('should handle decimal area', () => {
    const result = calculateQuotation({
      area: 100.5,
      basicRate: 8000,
      edcRate: 0,
      plcPercent: 0,
    });
    expect(result.basicPrice).toBe(804000);
    expect(result.grandTotal).toBe(804000);
  });

  // ── Decimal rates ─────────────────────────────────────────────────────────
  it('should handle decimal basic rates', () => {
    const result = calculateQuotation({
      area: 100,
      basicRate: 8125.5,
      edcRate: 0,
      plcPercent: 0,
    });
    expect(result.basicPrice).toBe(812550);
    expect(result.grandTotal).toBe(812550);
  });

  // ── Floating point precision ──────────────────────────────────────────────
  it('should produce rounded stable outputs without floating point noise', () => {
    const result = calculateQuotation({
      area: 333.33,
      basicRate: 3333.33,
      edcRate: 100,
      plcPercent: 5,
    });
    expect(Number.isFinite(result.grandTotal)).toBe(true);
    expect(result.grandTotal.toString()).not.toContain('e');
    // Verify no excessive decimals
    expect(result.basicPrice.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
    expect(result.plcAmount.toString().split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });

  // ── Effective rate ────────────────────────────────────────────────────────
  it('should compute effective rate as grand total / area', () => {
    const result = calculateQuotation({
      area: 586.64,
      basicRate: 8000,
      edcRate: 150,
      plcPercent: 5,
    });
    expect(result.effectiveRate).toBe(8550);
  });

  // ── Invalid area — reject zero and negatives ──────────────────────────────
  it('should throw on area = 0', () => {
    expect(() =>
      calculateQuotation({ area: 0, basicRate: 8000, edcRate: 150, plcPercent: 5 })
    ).toThrow();
  });

  it('should throw on area < 0', () => {
    expect(() =>
      calculateQuotation({ area: -1, basicRate: 8000, edcRate: 150, plcPercent: 5 })
    ).toThrow();
  });

  it('should throw on area = NaN', () => {
    expect(() =>
      calculateQuotation({ area: NaN, basicRate: 8000, edcRate: 150, plcPercent: 5 })
    ).toThrow();
  });

  it('should throw on area = Infinity', () => {
    expect(() =>
      calculateQuotation({ area: Infinity, basicRate: 8000, edcRate: 150, plcPercent: 5 })
    ).toThrow();
  });

  // ── Invalid rate ──────────────────────────────────────────────────────────
  it('should throw on negative basicRate', () => {
    expect(() =>
      calculateQuotation({ area: 100, basicRate: -1, edcRate: 150, plcPercent: 5 })
    ).toThrow();
  });

  it('should throw on negative edcRate', () => {
    expect(() =>
      calculateQuotation({ area: 100, basicRate: 8000, edcRate: -10, plcPercent: 5 })
    ).toThrow();
  });

  // ── Invalid PLC ───────────────────────────────────────────────────────────
  it('should throw on plcPercent = -1', () => {
    expect(() =>
      calculateQuotation({ area: 100, basicRate: 8000, edcRate: 150, plcPercent: -1 })
    ).toThrow();
  });

  it('should throw on plcPercent = 101', () => {
    expect(() =>
      calculateQuotation({ area: 100, basicRate: 8000, edcRate: 150, plcPercent: 101 })
    ).toThrow();
  });

  it('should throw on plcPercent = NaN', () => {
    expect(() =>
      calculateQuotation({ area: 100, basicRate: 8000, edcRate: 150, plcPercent: NaN })
    ).toThrow();
  });
});
