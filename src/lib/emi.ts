/**
 * Pure EMI calculation functions.
 * Computes monthly installment, total interest, and projected property valuation.
 */

export interface EMIInput {
  loanAmountLakhs: number;
  tenureYears: number;
  interestRate: number;
}

export interface EMIResult {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  projectedValuation: number;
}

/**
 * Calculate EMI and related financials.
 * @param loanAmountLakhs - Loan amount in lakhs (e.g. 25 = ₹25 Lakhs)
 * @param tenureYears - Loan tenure in years
 * @param interestRate - Annual interest rate in percent (e.g. 8.5)
 * @param appreciationRate - Annual appreciation rate (default 14%)
 */
export function calculateEMI(
  loanAmountLakhs: number,
  tenureYears: number,
  interestRate: number,
  appreciationRate = 0.14
): EMIResult {
  const P = loanAmountLakhs * 100000;
  const r = interestRate / 12 / 100;
  const n = tenureYears * 12;

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - P;
  const appreciated5yr = P * Math.pow(1 + appreciationRate, 5);

  return {
    monthlyEmi: Math.round(emi),
    totalPayment: Math.round(total),
    totalInterest: Math.round(interest),
    projectedValuation: Math.round(appreciated5yr),
  };
}
