import { describe, it, expect } from 'vitest';
import {
  calculateQuotation,
  calculatePricingTiers,
  roundMoney,
} from '@/src/lib/quotation/calculateQuotation';
import type { PricingTier } from '@/src/lib/quotation/types';

describe('calculateQuotation', () => {
  it('calculates single quotation amounts accurately', () => {
    // Area: 100 sq. yd., Basic Rate: 7500, EDC: 150, PLC: 5%
    // Basic Price = 100 * 7500 = 750,000
    // EDC = 100 * 150 = 15,000
    // PLC Amount = 5% of 750,000 = 37,500
    // Grand Total = 750,000 + 15,000 + 37,500 = 802,500
    // Effective Rate = 802,500 / 100 = 8,025
    const result = calculateQuotation({
      area: 100,
      basicRate: 7500,
      edcRate: 150,
      plcPercent: 5,
    });

    expect(result.basicPrice).toBe(750000);
    expect(result.edcAmount).toBe(15000);
    expect(result.plcAmount).toBe(37500);
    expect(result.grandTotal).toBe(802500);
    expect(result.effectiveRate).toBe(8025);
  });

  it('handles 0% PLC and 0 EDC correctly', () => {
    const result = calculateQuotation({
      area: 200,
      basicRate: 8000,
      edcRate: 0,
      plcPercent: 0,
    });

    expect(result.basicPrice).toBe(1600000);
    expect(result.edcAmount).toBe(0);
    expect(result.plcAmount).toBe(0);
    expect(result.grandTotal).toBe(1600000);
    expect(result.effectiveRate).toBe(8000);
  });

  it('throws error for invalid area or rates', () => {
    expect(() =>
      calculateQuotation({ area: 0, basicRate: 7500, edcRate: 150, plcPercent: 5 })
    ).toThrow();
    expect(() =>
      calculateQuotation({ area: -10, basicRate: 7500, edcRate: 150, plcPercent: 5 })
    ).toThrow();
    expect(() =>
      calculateQuotation({ area: 100, basicRate: -1, edcRate: 150, plcPercent: 5 })
    ).toThrow();
    expect(() =>
      calculateQuotation({ area: 100, basicRate: 7500, edcRate: 150, plcPercent: 105 })
    ).toThrow();
  });
});

describe('calculatePricingTiers', () => {
  it('computes multiple pricing tiers correctly for comparison', () => {
    const area = 100;
    const tiers: PricingTier[] = [
      {
        id: 'tier-1',
        label: 'Option 1 (Standard Rate)',
        basicRate: '7500',
        edcRate: '150',
        plcPercent: '5',
      },
      {
        id: 'tier-2',
        label: 'Option 2 (Prime Rate)',
        basicRate: '8000',
        edcRate: '150',
        plcPercent: '5',
      },
      {
        id: 'tier-3',
        label: 'Option 3 (Premium Rate)',
        basicRate: '8500',
        edcRate: '150',
        plcPercent: '5',
      },
    ];

    const results = calculatePricingTiers(area, tiers);

    expect(results).toHaveLength(3);

    // Tier 1: 750,000 + 15,000 + 37,500 = 802,500 (Eff: 8,025)
    expect(results[0].id).toBe('tier-1');
    expect(results[0].label).toBe('Option 1 (Standard Rate)');
    expect(results[0].basicPrice).toBe(750000);
    expect(results[0].grandTotal).toBe(802500);
    expect(results[0].effectiveRate).toBe(8025);

    // Tier 2: 800,000 + 15,000 + 40,000 = 855,000 (Eff: 8,550)
    expect(results[1].id).toBe('tier-2');
    expect(results[1].label).toBe('Option 2 (Prime Rate)');
    expect(results[1].basicPrice).toBe(800000);
    expect(results[1].grandTotal).toBe(855000);
    expect(results[1].effectiveRate).toBe(8550);

    // Tier 3: 850,000 + 15,000 + 42,500 = 907,500 (Eff: 9,075)
    expect(results[2].id).toBe('tier-3');
    expect(results[2].label).toBe('Option 3 (Premium Rate)');
    expect(results[2].basicPrice).toBe(850000);
    expect(results[2].grandTotal).toBe(907500);
    expect(results[2].effectiveRate).toBe(9075);
  });
  it('computes monthly installment when paymentMonths is specified', () => {
    const area = 100;
    const tiers: PricingTier[] = [
      {
        id: 'tier-full',
        label: 'Full Payment',
        basicRate: '7500',
        edcRate: '150',
        plcPercent: '5',
        paymentMonths: '',
      },
      {
        id: 'tier-12m',
        label: '12 Months Plan',
        basicRate: '8000',
        edcRate: '150',
        plcPercent: '5',
        paymentMonths: '12',
      },
    ];

    const results = calculatePricingTiers(area, tiers);
    expect(results[0].paymentMonths).toBe('');
    expect(results[0].monthlyInstallment).toBeNull();

    expect(results[1].paymentMonths).toBe('12');
    expect(results[1].grandTotal).toBe(855000);
    expect(results[1].monthlyInstallment).toBe(71250);
  });

  it('returns empty array when tiers are empty or area is invalid', () => {
    expect(
      calculatePricingTiers(0, [
        { id: '1', label: 'Opt 1', basicRate: '7500', edcRate: '150', plcPercent: '5' },
      ])
    ).toEqual([]);
    expect(calculatePricingTiers(100, [])).toEqual([]);
    expect(
      calculatePricingTiers(NaN, [
        { id: '1', label: 'Opt 1', basicRate: '7500', edcRate: '150', plcPercent: '5' },
      ])
    ).toEqual([]);
  });
});
