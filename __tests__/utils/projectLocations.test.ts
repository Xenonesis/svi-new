import { describe, it, expect } from 'vitest';
import {
  getProjectLegalLocation,
  getProjectShortLocation,
  getProjectCoverLocation,
  getProjectCity,
  getProjectLocationDetail,
} from '@/src/lib/utils/projectLocations';

describe('projectLocations utility', () => {
  describe('Shivani Vatika 11th', () => {
    const testCases = [
      'Shivani Vatika 11th',
      'shivani-vatika-11th',
      'SHIVANI VATIKA 11',
      'Shivani Vatika 11th ',
    ];

    it.each(testCases)('resolves Harsoli, Renwal location for %s', (name) => {
      expect(getProjectLegalLocation(name, 'hi')).toContain('ग्राम हरसोली, तहसील रेनवाल');
      expect(getProjectLegalLocation(name, 'en')).toContain('Village Harsoli, Tehsil Renwal');
      expect(getProjectCoverLocation(name, 'hi')).toBe(
        '(ग्राम हरसोली, तहसील रेनवाल, जिला जयपुर, राजस्थान)'
      );
      expect(getProjectCoverLocation(name, 'en')).toBe(
        '(Village Harsoli, Tehsil Renwal, District Jaipur, Rajasthan)'
      );
      expect(getProjectShortLocation(name, 'hi')).toContain('हरसोली');
      expect(getProjectShortLocation(name, 'en')).toContain('HARSOLI');
    });
  });

  describe('Shivani Vatika (Original / Manpura Machedi)', () => {
    const testCases = ['Shivani Vatika', 'shivani-vatika', 'SHIVANI VATIKA'];

    it.each(testCases)('resolves Manpura Machedi location for %s', (name) => {
      expect(getProjectLegalLocation(name, 'hi')).toContain('ग्राम मानपुरा माचेड़ी, तहसील आमेर');
      expect(getProjectLegalLocation(name, 'en')).toContain('Village Manpura Machedi, Tehsil Amer');
      expect(getProjectCoverLocation(name, 'hi')).toBe(
        '(ग्राम मानपुरा माचेड़ी, तहसील आमेर, जिला जयपुर, राजस्थान)'
      );
      expect(getProjectCoverLocation(name, 'en')).toBe(
        '(Village Manpura Machedi, Tehsil Amer, District Jaipur, Rajasthan)'
      );
      expect(getProjectShortLocation(name, 'hi')).toContain('मानपुरा माचेड़ी');
      expect(getProjectShortLocation(name, 'en')).toContain('MANPURA MACHEDI');
    });
  });

  describe('Shyam Aangan', () => {
    const testCases = [
      'Shyam Aangan',
      'shyam-aangan',
      'Shyam Aangan Farm House',
      'Shyam Aangan Phase 1',
    ];

    it.each(testCases)('resolves Basadi, Kishangarh Renwal location for %s', (name) => {
      expect(getProjectLegalLocation(name, 'hi')).toContain('ग्राम बसादी, तहसील किशनगढ़ रेनवाल');
      expect(getProjectLegalLocation(name, 'en')).toContain(
        'Village Basadi, Tehsil Kishan Garh Renwal'
      );
      expect(getProjectCoverLocation(name, 'hi')).toBe(
        '(ग्राम बसादी, तहसील किशनगढ़ रेनवाल, जिला जयपुर, राजस्थान)'
      );
      expect(getProjectCoverLocation(name, 'en')).toBe(
        '(Village Basadi, Tehsil Kishangarh Renwal, District Jaipur, Rajasthan)'
      );
      expect(getProjectShortLocation(name, 'hi')).toContain('बसादी');
      expect(getProjectShortLocation(name, 'en')).toContain('BASADI');
    });
  });

  describe('Unknown / Custom Project', () => {
    const testCases = ['Royal City', 'Green Valley', ''];

    it.each(testCases)(
      'does not default to another project village like Basadi or Harsoli',
      (name) => {
        const legalHi = getProjectLegalLocation(name, 'hi');
        const legalEn = getProjectLegalLocation(name, 'en');

        expect(legalHi).not.toContain('बसादी');
        expect(legalHi).not.toContain('हरसोली');
        expect(legalEn).not.toContain('Basadi');
        expect(legalEn).not.toContain('Harsoli');

        expect(legalHi).toContain('जयपुर');
        expect(legalEn).toContain('Jaipur');
      }
    );
  });
});
