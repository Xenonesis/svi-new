import { describe, it, expect } from 'vitest';
import {
  calculateQuotationMilestones,
  STANDARD_QUOTATION_PAYMENT_POINTS,
} from '@/src/lib/quotation/calculateQuotation';

describe('Quotation Payment Milestones & Terms', () => {
  it('should define standard 4-point payment terms accurately', () => {
    expect(STANDARD_QUOTATION_PAYMENT_POINTS).toHaveLength(4);
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[0]).toContain('10%');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[0]).toContain('2–3 days after draw');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[1]).toContain('20%');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[1]).toContain('15–30 days');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[2]).toContain('remaining amount');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[2]).toContain('agreed EMI plan');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[2]).toContain('rate/square yard');
    expect(STANDARD_QUOTATION_PAYMENT_POINTS[3]).toContain('No-Cost EMI');
  });

  it('should calculate 10%, 20%, and 70% milestones correctly for standard amounts', () => {
    const total = 1000000; // 10 Lakhs
    const milestones = calculateQuotationMilestones(total);

    expect(milestones.tokenPercent).toBe(10);
    expect(milestones.tokenAmount).toBe(100000);
    expect(milestones.tokenTimeline).toBe('Within 2–3 days after draw');

    expect(milestones.allotmentPercent).toBe(20);
    expect(milestones.allotmentAmount).toBe(200000);
    expect(milestones.allotmentTimeline).toBe('Within 15–30 days');

    expect(milestones.remainingPercent).toBe(70);
    expect(milestones.remainingAmount).toBe(700000);
    expect(milestones.remainingTimeline).toContain('agreed EMI plan');

    expect(milestones.isNoCostEmi).toBe(true);
    expect(milestones.tokenAmount + milestones.allotmentAmount + milestones.remainingAmount).toBe(
      total
    );
  });

  it('should calculate monthly EMI on the remaining 70% balance when tenure > 1 month', () => {
    const total = 1200000;
    // 70% of 1,200,000 is 840,000
    // 840,000 / 12 = 70,000
    const milestones12 = calculateQuotationMilestones(total, 12);
    expect(milestones12.paymentMonths).toBe(12);
    expect(milestones12.monthlyEmiOnRemaining).toBe(70000);

    // 840,000 / 24 = 35,000
    const milestones24 = calculateQuotationMilestones(total, '24');
    expect(milestones24.paymentMonths).toBe(24);
    expect(milestones24.monthlyEmiOnRemaining).toBe(35000);
  });

  it('should not compute monthly EMI when paymentMonths is 0, 1, or undefined', () => {
    const total = 500000;
    expect(calculateQuotationMilestones(total, 0).monthlyEmiOnRemaining).toBeNull();
    expect(calculateQuotationMilestones(total, 1).monthlyEmiOnRemaining).toBeNull();
    expect(calculateQuotationMilestones(total, undefined).monthlyEmiOnRemaining).toBeNull();
  });

  it('should handle zero or negative edge cases safely without NaN or infinite values', () => {
    const zeroMilestones = calculateQuotationMilestones(0);
    expect(zeroMilestones.tokenAmount).toBe(0);
    expect(zeroMilestones.allotmentAmount).toBe(0);
    expect(zeroMilestones.remainingAmount).toBe(0);
    expect(zeroMilestones.monthlyEmiOnRemaining).toBeNull();

    const negativeMilestones = calculateQuotationMilestones(-500);
    expect(negativeMilestones.tokenAmount).toBe(0);
    expect(negativeMilestones.allotmentAmount).toBe(0);
    expect(negativeMilestones.remainingAmount).toBe(0);
  });
});
