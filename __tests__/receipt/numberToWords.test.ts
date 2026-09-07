import { describe, it, expect } from 'vitest';
import { numberToWords } from '@/src/lib/receipt/numberToWords';

describe('numberToWords', () => {
  describe('empty and invalid inputs', () => {
    it('returns empty string for empty, null, or undefined input', () => {
      expect(numberToWords('')).toBe('');
      expect(numberToWords('   ')).toBe('');
      expect(numberToWords(null as unknown as string)).toBe('');
      expect(numberToWords(undefined as unknown as string)).toBe('');
    });

    it('returns empty string for zero values', () => {
      expect(numberToWords('0')).toBe('');
      expect(numberToWords(0)).toBe('');
      expect(numberToWords('0.00')).toBe('');
    });

    it('returns empty string for non-numeric or negative values', () => {
      expect(numberToWords('abc')).toBe('');
      expect(numberToWords('xyz123')).toBe('');
      expect(numberToWords('-500')).toBe('');
      expect(numberToWords(-2100)).toBe('');
    });
  });

  describe('single digits, teens, and tens', () => {
    it('converts single digit numbers', () => {
      expect(numberToWords('1')).toBe('One Rupees Only');
      expect(numberToWords('5')).toBe('Five Rupees Only');
      expect(numberToWords('9')).toBe('Nine Rupees Only');
    });

    it('converts teens', () => {
      expect(numberToWords('10')).toBe('Ten Rupees Only');
      expect(numberToWords('11')).toBe('Eleven Rupees Only');
      expect(numberToWords('14')).toBe('Fourteen Rupees Only');
      expect(numberToWords('19')).toBe('Nineteen Rupees Only');
    });

    it('converts tens', () => {
      expect(numberToWords('20')).toBe('Twenty Rupees Only');
      expect(numberToWords('45')).toBe('Forty Five Rupees Only');
      expect(numberToWords('99')).toBe('Ninety Nine Rupees Only');
    });
  });

  describe('hundreds, thousands, lakhs, and crores', () => {
    it('converts hundreds correctly', () => {
      expect(numberToWords('500')).toBe('Five Hundred Rupees Only');
      expect(numberToWords('525')).toBe('Five Hundred Twenty Five Rupees Only');
    });

    it('converts thousands including key benchmark amounts', () => {
      expect(numberToWords('1000')).toBe('One Thousand Rupees Only');
      expect(numberToWords('2100')).toBe('Two Thousand One Hundred Rupees Only');
      expect(numberToWords('16042')).toBe('Sixteen Thousand Forty Two Rupees Only');
      expect(numberToWords(16042)).toBe('Sixteen Thousand Forty Two Rupees Only');
    });

    it('converts lakhs correctly', () => {
      expect(numberToWords('100000')).toBe('One Lakh Rupees Only');
      expect(numberToWords('2500000')).toBe('Twenty Five Lakh Rupees Only');
    });

    it('converts crores correctly', () => {
      expect(numberToWords('10000000')).toBe('One Crore Rupees Only');
      expect(numberToWords('120000000')).toBe('Twelve Crore Rupees Only');
    });
  });

  describe('decimal values (Paise)', () => {
    it('converts decimal amounts to Rupees and Paise', () => {
      expect(numberToWords('500.50')).toBe('Five Hundred Rupees and Fifty Paise Only');
      expect(numberToWords('2100.75')).toBe(
        'Two Thousand One Hundred Rupees and Seventy Five Paise Only'
      );
    });

    it('handles decimal amounts when integer part is zero', () => {
      expect(numberToWords('0.50')).toBe('Zero Rupees and Fifty Paise Only');
      expect(numberToWords('0.05')).toBe('Zero Rupees and Five Paise Only');
    });
  });

  describe('consistent formatting', () => {
    it('always ends with "Only" for valid positive amounts', () => {
      const amounts = ['5', '25', '500', '2100', '16042', '100000', '10000000', '500.50'];
      for (const amt of amounts) {
        expect(numberToWords(amt).endsWith('Only')).toBe(true);
      }
    });
  });
});
