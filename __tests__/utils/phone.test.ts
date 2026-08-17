import { describe, it, expect } from 'vitest';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';

describe('normalizeIndianPhone', () => {
  it('should normalize bare 10-digit numbers', () => {
    expect(normalizeIndianPhone('9876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('6123456789')).toBe('6123456789');
  });

  it('should reject numbers starting with 0-5', () => {
    expect(normalizeIndianPhone('5876543210')).toBeNull();
    expect(normalizeIndianPhone('0123456789')).toBeNull();
  });

  it('should strip valid prefixes', () => {
    expect(normalizeIndianPhone('+919876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('00919876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('919876543210')).toBe('9876543210');
  });

  it('should strip spaces and hyphens', () => {
    expect(normalizeIndianPhone('+91 98765-43210')).toBe('9876543210');
    expect(normalizeIndianPhone('91 98 76 54 32 10')).toBe('9876543210');
    expect(normalizeIndianPhone('98765 43210')).toBe('9876543210');
  });

  it('should not strip prefix if the rest is not a valid 10-digit mobile', () => {
    // 91 followed by 8 digits - lookahead fails, no prefix stripped, then 10 digits total check
    expect(normalizeIndianPhone('9198765432')).toBe('9198765432');
  });

  it('should reject invalid formats', () => {
    expect(normalizeIndianPhone('')).toBeNull();
    expect(normalizeIndianPhone('123')).toBeNull();
    expect(normalizeIndianPhone('+91987654321')).toBeNull(); // 9 digits
    expect(normalizeIndianPhone('98765abcde')).toBeNull();
  });
});
