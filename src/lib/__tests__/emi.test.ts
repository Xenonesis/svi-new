import { describe, it, expect } from 'vitest';
import { calculateEMI } from '../emi';

describe('calculateEMI', () => {
  it('computes standard EMI math for a 25L / 5yr / 8.5% loan', () => {
    const result = calculateEMI(25, 5, 8.5);
    // Verified against standard EMI formula
    expect(result.monthlyEmi).toBe(51291);
    expect(result.totalPayment).toBeGreaterThan(25 * 100000);
    expect(result.totalInterest).toBe(result.totalPayment - 25 * 100000);
  });

  it('returns zero interest with plain principal division at 0% rate', () => {
    const result = calculateEMI(12, 2, 0);
    expect(result.monthlyEmi).toBe(50000); // 12L / 24 months
    expect(result.totalPayment).toBe(12 * 100000);
    expect(result.totalInterest).toBe(0);
    expect(Number.isNaN(result.monthlyEmi)).toBe(false);
  });

  it('projects 5-year valuation using default 14% appreciation', () => {
    const result = calculateEMI(10, 1, 10);
    expect(result.projectedValuation).toBe(Math.round(10 * 100000 * Math.pow(1.14, 5)));
  });

  it('handles sub-year tenure (1 month)', () => {
    const result = calculateEMI(5, 0.083, 10);
    expect(result.monthlyEmi).toBeGreaterThan(500000); // principal + 1mo interest
    expect(result.totalPayment).toBeGreaterThan(500000);
  });

  it('rejects negative inputs as NaN-free nonsense (guards crash)', () => {
    const result = calculateEMI(0, 5, 8.5);
    expect(result.monthlyEmi).toBe(0);
    expect(result.totalPayment).toBe(0);
  });
});
