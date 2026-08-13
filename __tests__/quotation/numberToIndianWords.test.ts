import { describe, it, expect } from 'vitest';
import {
  integerToIndianWords,
  numberToIndianWords,
} from '../../src/lib/quotation/numberToIndianWords';

describe('integerToIndianWords', () => {
  it('should convert 5015772 to correct words', () => {
    expect(integerToIndianWords(5015772)).toBe(
      'Fifty Lakh Fifteen Thousand Seven Hundred Seventy Two'
    );
  });

  it('should convert 0 to "Zero"', () => {
    expect(integerToIndianWords(0)).toBe('Zero');
  });

  it('should convert a simple number like 100000 to One Lakh', () => {
    expect(integerToIndianWords(100000)).toBe('One Lakh');
  });

  it('should convert 10000000 to One Crore', () => {
    expect(integerToIndianWords(10000000)).toBe('One Crore');
  });

  it('should convert 1000 to One Thousand', () => {
    expect(integerToIndianWords(1000)).toBe('One Thousand');
  });

  it('should convert 4693120 (basic price) correctly', () => {
    expect(integerToIndianWords(4693120)).toBe(
      'Forty Six Lakh Ninety Three Thousand One Hundred Twenty'
    );
  });

  it('should throw for negative numbers', () => {
    expect(() => integerToIndianWords(-1)).toThrow();
  });
});

describe('numberToIndianWords', () => {
  it('should add Rupees prefix and Only suffix', () => {
    expect(numberToIndianWords(5015772)).toBe(
      'Rupees Fifty Lakh Fifteen Thousand Seven Hundred Seventy Two Only'
    );
  });

  it('should handle zero', () => {
    expect(numberToIndianWords(0)).toBe('Rupees Zero Only');
  });

  it('should return empty string for NaN', () => {
    expect(numberToIndianWords(NaN)).toBe('');
  });

  it('should return empty string for Infinity', () => {
    expect(numberToIndianWords(Infinity)).toBe('');
  });
});
