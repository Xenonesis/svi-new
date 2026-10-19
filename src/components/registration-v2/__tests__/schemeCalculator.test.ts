import { describe, it, expect } from 'vitest';
import { calculateSchemeDetails, formatAadhaarNumber, isValidPan } from '../schemeCalculator';

describe('schemeCalculator', () => {
  it('calculates square feet and token amount accurately for standard size', () => {
    const details = calculateSchemeDetails('100-200', 'shyam-aangan', 'one-time');
    expect(details.sqYards).toBe(100);
    expect(details.sqFeet).toBe(900);
    expect(details.tokenAmount).toBe(21000);
    expect(details.planDescription).toContain('Full Lump-sum Payment');
  });

  it('calculates square feet and token amount for other sizes and plans', () => {
    const d50 = calculateSchemeDetails('50-100', 'shyam-aangan', '3-months');
    expect(d50.sqYards).toBe(50);
    expect(d50.sqFeet).toBe(450);
    expect(d50.tokenAmount).toBe(11000);
    expect(d50.planDescription).toBe('3 Equal Monthly Installments');

    const d200 = calculateSchemeDetails('200-400', 'any', '6-months');
    expect(d200.sqYards).toBe(200);
    expect(d200.sqFeet).toBe(1800);
    expect(d200.tokenAmount).toBe(31000);
    expect(d200.planDescription).toBe('6 Equal Monthly Installments');

    const d400 = calculateSchemeDetails('400-700', 'any', '12-months');
    expect(d400.sqYards).toBe(400);
    expect(d400.sqFeet).toBe(3600);
    expect(d400.tokenAmount).toBe(51000);
    expect(d400.planDescription).toBe('12 Months Flexible Payment Plan');

    const d700 = calculateSchemeDetails('700-1000', 'any', '18-months');
    expect(d700.sqYards).toBe(700);
    expect(d700.sqFeet).toBe(6300);
    expect(d700.tokenAmount).toBe(75000);
    expect(d700.planDescription).toBe('18 Months Extended Scheme');

    const d1000 = calculateSchemeDetails('1000-1500', 'any', '24-months');
    expect(d1000.sqYards).toBe(1000);
    expect(d1000.sqFeet).toBe(9000);
    expect(d1000.tokenAmount).toBe(100000);
    expect(d1000.planDescription).toBe('24 Months Milestone Plan');

    const d1500 = calculateSchemeDetails('1500-2000', 'any', 'one-time');
    expect(d1500.sqYards).toBe(1500);
    expect(d1500.sqFeet).toBe(13500);
    expect(d1500.tokenAmount).toBe(150000);
    expect(d1500.planDescription).toBe('Full Lump-sum Payment');
  });

  it('formats Aadhaar numbers with 4-digit spacing and caps at 12 digits', () => {
    expect(formatAadhaarNumber('123456789012')).toBe('1234 5678 9012');
    expect(formatAadhaarNumber('123456')).toBe('1234 56');
    expect(formatAadhaarNumber('1234567890123456')).toBe('1234 5678 9012');
    expect(formatAadhaarNumber('1234 5678 9012')).toBe('1234 5678 9012');
    expect(formatAadhaarNumber('abcd 1234 xyz 5678')).toBe('1234 5678');
  });

  it('validates standard Indian PAN format', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('ABCDE12345')).toBe(false);
    expect(isValidPan('abcde1234f')).toBe(true); // Case-insensitive check
    expect(isValidPan('12345')).toBe(false);
    expect(isValidPan(' ABCDE1234F ')).toBe(true); // Whitespace trimmed
    expect(isValidPan('')).toBe(false);
  });
});
