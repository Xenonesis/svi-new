import { describe, it, expect } from 'vitest';
import {
  getProjectLegalLocation,
  getProjectShortLocation,
  getProjectCoverLocation,
  getProjectCity,
  registerDynamicProjectLocations,
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

    it.each(testCases)(
      'resolves Basri Khurd / बासंडी खुर्द, Kishangarh Renwal location for %s',
      (name) => {
        expect(getProjectLegalLocation(name, 'hi')).toContain(
          'ग्राम बासंडी खुर्द, तहसील किशनगढ़ रेनवाल'
        );
        expect(getProjectLegalLocation(name, 'en')).toContain(
          'Village Basri Khurd, Tehsil Kishan Garh Renwal'
        );
        expect(getProjectCoverLocation(name, 'hi')).toBe(
          '(ग्राम बासंडी खुर्द, तहसील किशनगढ़ रेनवाल, जिला जयपुर, राजस्थान)'
        );
        expect(getProjectCoverLocation(name, 'en')).toBe(
          '(Village Basri Khurd, Tehsil Kishangarh Renwal, District Jaipur, Rajasthan)'
        );
        expect(getProjectShortLocation(name, 'hi')).toContain('बासंडी खुर्द');
        expect(getProjectShortLocation(name, 'en')).toContain('BASRI KHURD');
      }
    );
  });

  describe('Dynamic Project Registration from /admin/properties', () => {
    it('resolves dynamically registered project legal locations correctly', () => {
      registerDynamicProjectLocations([
        {
          name: 'Green City Enclave',
          slug: 'green-city-enclave',
          location: JSON.stringify({
            legalHi: 'ग्राम बगरू, तहसील सांगानेर, जिला जयपुर, राज्य – राजस्थान',
            legalEn: 'Village Bagru, Tehsil Sanganer, District Jaipur, State – Rajasthan',
          }),
        },
      ]);

      expect(getProjectLegalLocation('Green City Enclave', 'hi')).toBe(
        'ग्राम बगरू, तहसील सांगानेर, जिला जयपुर, राज्य – राजस्थान'
      );
      expect(getProjectLegalLocation('green-city-enclave', 'en')).toBe(
        'Village Bagru, Tehsil Sanganer, District Jaipur, State – Rajasthan'
      );
      expect(getProjectCoverLocation('Green City Enclave', 'hi')).toBe(
        '(ग्राम बगरू, तहसील सांगानेर, जिला जयपुर, राज्य – राजस्थान)'
      );
    });
  });

  describe('Unknown / Custom Project with NO fallback', () => {
    const testCases = ['Unknown Enclave', 'Unconfigured Heights', ''];

    it.each(testCases)(
      'returns empty string and does not fallback to any other project or generic city for %s',
      (name) => {
        expect(getProjectLegalLocation(name, 'hi')).toBe('');
        expect(getProjectLegalLocation(name, 'en')).toBe('');
        expect(getProjectShortLocation(name, 'hi')).toBe('');
        expect(getProjectShortLocation(name, 'en')).toBe('');
        expect(getProjectCoverLocation(name, 'hi')).toBe('');
        expect(getProjectCoverLocation(name, 'en')).toBe('');
      }
    );
  });
});
