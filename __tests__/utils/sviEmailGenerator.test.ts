import { describe, it, expect } from 'vitest';
import {
  slugifyName,
  generateSviEmail,
  normalizePhoneNumber,
  isPhoneMatching,
  DEFAULT_SVI_DOMAIN,
} from '@/src/lib/utils/sviEmailGenerator';

describe('sviEmailGenerator utility', () => {
  describe('slugifyName', () => {
    it('handles empty or null-like values', () => {
      expect(slugifyName('')).toBe('');
      expect(slugifyName('   ')).toBe('');
    });

    it('converts simple full name to dot-separated lower-case slug', () => {
      expect(slugifyName('Rajesh Kumar')).toBe('rajesh.kumar');
      expect(slugifyName('John Doe')).toBe('john.doe');
    });

    it('removes accents and diacritics', () => {
      expect(slugifyName('Hélène Müller')).toBe('helene.muller');
      expect(slugifyName('José García')).toBe('jose.garcia');
    });

    it('strips special characters, symbols and parentheses', () => {
      expect(slugifyName('Amit  Sharma (Lead)')).toBe('amit.sharma.lead');
      expect(slugifyName('Dr. Shivam Yadav, MD')).toBe('dr.shivam.yadav.md');
      expect(slugifyName('Priya #1 (Sales!)')).toBe('priya.1.sales');
    });

    it('collapses multiple spaces, underscores and dots', () => {
      expect(slugifyName('  Aman___Deep ... Singh  ')).toBe('aman.deep.singh');
    });
  });

  describe('generateSviEmail', () => {
    it('returns empty string if name is empty', () => {
      expect(generateSviEmail('')).toBe('');
    });

    it('generates base corporate email with default domain', () => {
      expect(generateSviEmail('Rajesh Kumar')).toBe(`rajesh.kumar@${DEFAULT_SVI_DOMAIN}`);
    });

    it('resolves unique suffix when base email is already in existing list', () => {
      const existing = ['rajesh.kumar@sviinfra.com'];
      expect(generateSviEmail('Rajesh Kumar', existing)).toBe('rajesh.kumar2@sviinfra.com');
    });

    it('increments suffix sequentially to find next available email', () => {
      const existing = [
        'rajesh.kumar@sviinfra.com',
        'rajesh.kumar2@sviinfra.com',
        'rajesh.kumar3@sviinfra.com',
      ];
      expect(generateSviEmail('Rajesh Kumar', existing)).toBe('rajesh.kumar4@sviinfra.com');
    });

    it('supports custom corporate domains', () => {
      expect(generateSviEmail('Vikram Singh', [], 'sviinfrasolutions.com')).toBe(
        'vikram.singh@sviinfrasolutions.com'
      );
    });
  });

  describe('normalizePhoneNumber', () => {
    it('extracts digits and last 10 digits', () => {
      expect(normalizePhoneNumber('+91 98765-43210')).toEqual({
        raw: '+91 98765-43210',
        digits: '919876543210',
        last10: '9876543210',
      });
      expect(normalizePhoneNumber('9876543210')).toEqual({
        raw: '9876543210',
        digits: '9876543210',
        last10: '9876543210',
      });
    });

    it('handles empty and short phone numbers', () => {
      expect(normalizePhoneNumber('')).toEqual({
        raw: '',
        digits: '',
        last10: '',
      });
      expect(normalizePhoneNumber('12345')).toEqual({
        raw: '12345',
        digits: '12345',
        last10: '12345',
      });
    });
  });

  describe('isPhoneMatching', () => {
    it('returns true when phones match despite formatting differences', () => {
      expect(isPhoneMatching('+91 98765 43210', '9876543210')).toBe(true);
      expect(isPhoneMatching('09876543210', '+91-98765-43210')).toBe(true);
      expect(isPhoneMatching('9876543210', '9876543210')).toBe(true);
    });

    it('returns false when phones do not match', () => {
      expect(isPhoneMatching('+91 98765 43210', '+91 98765 43211')).toBe(false);
      expect(isPhoneMatching('', '9876543210')).toBe(false);
      expect(isPhoneMatching('9876543210', '')).toBe(false);
    });
  });
});
