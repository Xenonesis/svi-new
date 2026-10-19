import type { SchemeBreakdown } from './types';

export function calculateSchemeDetails(
  size: string,
  _project: string,
  plan: string
): SchemeBreakdown {
  const sizeMap: Record<string, { yards: number; token: number }> = {
    '50-100': { yards: 50, token: 11000 },
    '100-200': { yards: 100, token: 21000 },
    '200-400': { yards: 200, token: 31000 },
    '400-700': { yards: 400, token: 51000 },
    '700-1000': { yards: 700, token: 75000 },
    '1000-1500': { yards: 1000, token: 100000 },
    '1500-2000': { yards: 1500, token: 150000 },
  };

  const parsed = sizeMap[size] || { yards: 100, token: 21000 };
  const sqFeet = parsed.yards * 9;

  let planDescription = 'Full Lump-sum Payment';
  if (plan === '3-months') {
    planDescription = '3 Equal Monthly Installments';
  } else if (plan === '6-months') {
    planDescription = '6 Equal Monthly Installments';
  } else if (plan === '12-months') {
    planDescription = '12 Months Flexible Payment Plan';
  } else if (plan === '18-months') {
    planDescription = '18 Months Extended Scheme';
  } else if (plan === '24-months') {
    planDescription = '24 Months Milestone Plan';
  }

  return {
    sqYards: parsed.yards,
    sqFeet,
    tokenAmount: parsed.token,
    planDescription,
  };
}

export function formatAadhaarNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function isValidPan(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan.trim());
}
