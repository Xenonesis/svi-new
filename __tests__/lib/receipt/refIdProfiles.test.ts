import { describe, it, expect } from 'vitest';
import {
  normalizeRefId,
  extractRefIdNumber,
  buildRefIdProfiles,
  searchRefIdProfiles,
  compareProfilesBySortOption,
  filterAndSortRefIdProfiles,
  RefIdProfile,
} from '@/src/lib/receipt/refIdProfiles';
describe('refIdProfiles', () => {
  describe('normalizeRefId', () => {
    it('normalizes standard IDs by trimming, uppercasing, and removing non-alphanumeric chars', () => {
      expect(normalizeRefId('SVI-2024-001')).toBe('SVI2024001');
      expect(normalizeRefId('  svi 2024 001  ')).toBe('SVI2024001');
      expect(normalizeRefId('REF/1024#A')).toBe('REF1024A');
    });

    it('returns empty string for null, undefined, or empty values', () => {
      expect(normalizeRefId('')).toBe('');
      expect(normalizeRefId(null)).toBe('');
      expect(normalizeRefId(undefined)).toBe('');
      expect(normalizeRefId('   ---   ')).toBe('');
    });
  });

  describe('buildRefIdProfiles', () => {
    it('returns empty array when given null or empty inputs', () => {
      expect(buildRefIdProfiles(null, null)).toEqual([]);
      expect(buildRefIdProfiles(undefined, undefined)).toEqual([]);
      expect(buildRefIdProfiles([], [])).toEqual([]);
    });

    it('extracts profiles from candidates correctly', () => {
      const candidates = [
        {
          ticketId: ' TICK-101 ',
          clientName: 'Jane Smith',
          phone: '+91 9876543210',
          unitNo: 'A-12',
          area: 1200,
          projectName: 'Green Acres',
          bookingDate: '2026-01-15',
        },
      ];

      const profiles = buildRefIdProfiles([], candidates);
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toEqual({
        refId: 'TICK-101',
        name: 'Jane Smith',
        salutation: '',
        clientPhone: '+91 9876543210',
        plotNo: 'A-12',
        plotSize: '1200',
        account: 'Green Acres',
        source: 'candidate',
        date: '2026-01-15',
      });
    });

    it('falls back to normalizedId if ticketId is absent in candidate', () => {
      const candidates = [
        {
          normalizedId: 'NORM-99',
          clientName: 'Candidate Only',
        },
      ];
      const profiles = buildRefIdProfiles([], candidates);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].refId).toBe('NORM-99');
      expect(profiles[0].source).toBe('candidate');
    });

    it('extracts profiles from receipts correctly', () => {
      const receipts = [
        {
          form_data: {
            refId: ' REF-202 ',
            name: 'John Doe',
            salutation: 'Dr.',
            clientPhone: '+91 9999888877',
            plotNo: 'B-04',
            plotSize: '1500 sq ft',
            account: 'Sunrise Enclave',
            date: '2026-02-20',
          },
        },
      ];

      const profiles = buildRefIdProfiles(receipts, []);
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toEqual({
        refId: 'REF-202',
        name: 'John Doe',
        salutation: 'Dr.',
        clientPhone: '+91 9999888877',
        plotNo: 'B-04',
        plotSize: '1500 sq ft',
        account: 'Sunrise Enclave',
        source: 'receipt',
        date: '2026-02-20',
      });
    });

    it('supports alternative field names and created_at fallback in receipts', () => {
      const receipts = [
        {
          created_at: '2026-03-01T10:00:00Z',
          form_data: {
            ref_id: 'REF-ALT-1',
            name: 'Alt Name',
            phone: '1234567890',
            unitNo: 'U-10',
            area: 800,
            projectName: 'Alt Project',
          },
        },
      ];

      const profiles = buildRefIdProfiles(receipts, []);
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toMatchObject({
        refId: 'REF-ALT-1',
        name: 'Alt Name',
        clientPhone: '1234567890',
        plotNo: 'U-10',
        plotSize: '800',
        account: 'Alt Project',
        source: 'receipt',
        date: '2026-03-01T10:00:00Z',
      });
    });

    it('skips invalid candidate or receipt records', () => {
      const candidates = [
        null as unknown as { ticketId: string },
        { ticketId: '   ' },
        { ticketId: '---' },
      ];
      const receipts = [
        null as unknown as { form_data: { refId: string } },
        { form_data: null },
        { form_data: { refId: null } },
        { form_data: { refId: '   ' } },
      ];

      const profiles = buildRefIdProfiles(receipts, candidates);
      expect(profiles).toEqual([]);
    });

    it('deduplicates candidates with same normalized refId by latest bookingDate', () => {
      const candidates = [
        {
          ticketId: 'CAND-001',
          clientName: 'Older Candidate',
          bookingDate: '2026-01-01',
        },
        {
          ticketId: 'cand 001',
          clientName: 'Newer Candidate',
          bookingDate: '2026-02-01',
        },
      ];

      const profiles = buildRefIdProfiles([], candidates);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Newer Candidate');
      expect(profiles[0].date).toBe('2026-02-01');
    });

    it('deduplicates receipts with same normalized refId by latest date', () => {
      const receipts = [
        {
          form_data: {
            refId: 'RCPT-001',
            name: 'Older Receipt',
            date: '2026-01-01',
          },
        },
        {
          form_data: {
            refId: 'rcpt-001',
            name: 'Newer Receipt',
            date: '2026-02-01',
          },
        },
      ];

      const profiles = buildRefIdProfiles(receipts, []);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Newer Receipt');
      expect(profiles[0].date).toBe('2026-02-01');
    });

    it('gives precedence to receipt record over candidate with same normalized refId', () => {
      const candidates = [
        {
          ticketId: 'MATCH-777',
          clientName: 'Candidate Version',
          bookingDate: '2026-05-01',
        },
      ];
      const receipts = [
        {
          form_data: {
            refId: 'match 777',
            name: 'Receipt Version',
            salutation: 'Mr.',
            date: '2026-01-01',
          },
        },
      ];

      const profiles = buildRefIdProfiles(receipts, candidates);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].source).toBe('receipt');
      expect(profiles[0].name).toBe('Receipt Version');
      expect(profiles[0].salutation).toBe('Mr.');
    });

    it('handles invalid date strings gracefully', () => {
      const receipts = [
        {
          form_data: {
            refId: 'INV-DATE-1',
            name: 'Invalid Date',
            date: 'not-a-real-date',
          },
        },
      ];

      const profiles = buildRefIdProfiles(receipts, []);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].refId).toBe('INV-DATE-1');
    });
  });

  describe('searchRefIdProfiles', () => {
    const mockProfiles: RefIdProfile[] = [
      {
        refId: 'SVI-101',
        name: 'Alice Johnson',
        salutation: 'Ms.',
        clientPhone: '9876500001',
        plotNo: '10',
        plotSize: '1200',
        account: 'Project Alpha',
        source: 'receipt',
      },
      {
        refId: 'SVI-202',
        name: 'Bob Smith',
        salutation: 'Mr.',
        clientPhone: '9876500002',
        plotNo: '20',
        plotSize: '1500',
        account: 'Project Beta',
        source: 'candidate',
      },
      {
        refId: 'OLD-SVI-303',
        name: 'Charlie Brown',
        salutation: 'Mr.',
        clientPhone: '9876500003',
        plotNo: '30',
        plotSize: '1800',
        account: 'Project Gamma',
        source: 'receipt',
      },
      {
        refId: 'DEF-404',
        name: 'Diana Svi',
        salutation: 'Dr.',
        clientPhone: '9876500004',
        plotNo: '40',
        plotSize: '2000',
        account: 'Project Delta',
        source: 'candidate',
      },
      {
        refId: 'XYZ-505',
        name: 'Edward Norton',
        salutation: 'Mr.',
        clientPhone: '9999955555',
        plotNo: '50',
        plotSize: '2400',
        account: 'Project Epsilon',
        source: 'receipt',
      },
    ];

    it('returns empty array when profiles array is empty or limit <= 0', () => {
      expect(searchRefIdProfiles([], 'query')).toEqual([]);
      expect(searchRefIdProfiles(null as unknown as RefIdProfile[], 'query')).toEqual([]);
      expect(searchRefIdProfiles(mockProfiles, 'query', 0)).toEqual([]);
      expect(searchRefIdProfiles(mockProfiles, 'query', -1)).toEqual([]);
    });

    it('returns first limit profiles when query is empty, null, or whitespace', () => {
      expect(searchRefIdProfiles(mockProfiles, '', 2)).toEqual(mockProfiles.slice(0, 2));
      expect(searchRefIdProfiles(mockProfiles, '   ', 3)).toEqual(mockProfiles.slice(0, 3));
      expect(searchRefIdProfiles(mockProfiles, null, 2)).toEqual(mockProfiles.slice(0, 2));
      expect(searchRefIdProfiles(mockProfiles, undefined, 2)).toEqual(mockProfiles.slice(0, 2));
    });

    it('ranks exact refId prefix matches higher than general substring matches', () => {
      // Query "svi":
      // SVI-101 and SVI-202 start with SVI (rank 1)
      // OLD-SVI-303 contains SVI in refId (rank 2)
      // Diana Svi contains SVI in name (rank 4)
      const results = searchRefIdProfiles(mockProfiles, 'svi');
      expect(results.map((r) => r.refId)).toEqual(['SVI-101', 'SVI-202', 'OLD-SVI-303', 'DEF-404']);
    });

    it('ranks exact refId match highest', () => {
      const results = searchRefIdProfiles(mockProfiles, 'svi-202');
      expect(results[0].refId).toBe('SVI-202');
    });

    it('matches case-insensitively by name', () => {
      const results = searchRefIdProfiles(mockProfiles, 'alice');
      expect(results).toHaveLength(1);
      expect(results[0].refId).toBe('SVI-101');
    });

    it('matches by client phone substring', () => {
      const results = searchRefIdProfiles(mockProfiles, '55555');
      expect(results).toHaveLength(1);
      expect(results[0].refId).toBe('XYZ-505');
    });

    it('respects limit parameter', () => {
      const results = searchRefIdProfiles(mockProfiles, 'svi', 2);
      expect(results).toHaveLength(2);
      expect(results[0].refId).toBe('SVI-101');
      expect(results[1].refId).toBe('SVI-202');
    });

    it('returns empty array when no matches are found', () => {
      const results = searchRefIdProfiles(mockProfiles, 'nonexistent query 12345');
      expect(results).toEqual([]);
    });
  });

  describe('extractRefIdNumber', () => {
    it('extracts numeric sequences correctly', () => {
      expect(extractRefIdNumber('SVI2233')).toBe(2233);
      expect(extractRefIdNumber('SVI-108')).toBe(108);
      expect(extractRefIdNumber('TICK42')).toBe(42);
      expect(extractRefIdNumber('ABC')).toBe(0);
      expect(extractRefIdNumber('')).toBe(0);
      expect(extractRefIdNumber(null)).toBe(0);
      expect(extractRefIdNumber(undefined)).toBe(0);
    });
  });

  describe('filterAndSortRefIdProfiles', () => {
    const sampleProfiles: RefIdProfile[] = [
      {
        refId: 'SVI2233',
        name: 'Ashok Kumar',
        salutation: 'Mr.',
        clientPhone: '9773821042',
        plotNo: 'none',
        plotSize: '100',
        account: 'Krishnavali Enclave',
        source: 'candidate',
        date: '2026-05-10',
      },
      {
        refId: 'SVI2232',
        name: 'Sheela Rani',
        salutation: 'Mrs.',
        clientPhone: '7678308026',
        plotNo: '42',
        plotSize: '120',
        account: 'Govind City',
        source: 'receipt',
        date: '2026-06-01',
      },
      {
        refId: 'SVI2231',
        name: 'Ajeet Singh',
        salutation: 'Mr.',
        clientPhone: '9876543210',
        plotNo: 'main-road',
        plotSize: '150',
        account: 'Krishnavali Enclave',
        source: 'candidate',
        date: '2026-04-12',
      },
      {
        refId: 'SVI2230',
        name: 'Bhawna Kapoor',
        salutation: 'Mrs.',
        clientPhone: '9811122233',
        plotNo: '37,38',
        plotSize: '200',
        account: 'Sunrise Greens',
        source: 'receipt',
        date: '2026-07-20',
      },
    ];

    it('filters by source correctly', () => {
      const receiptsOnly = filterAndSortRefIdProfiles(sampleProfiles, {
        sourceFilter: 'receipt',
      });
      expect(receiptsOnly.map((r) => r.refId)).toEqual(['SVI2232', 'SVI2230']);

      const candidatesOnly = filterAndSortRefIdProfiles(sampleProfiles, {
        sourceFilter: 'candidate',
      });
      expect(candidatesOnly.map((r) => r.refId)).toEqual(['SVI2233', 'SVI2231']);
    });

    it('sorts by Ref ID descending (newest first) by default', () => {
      const result = filterAndSortRefIdProfiles(sampleProfiles, {
        sourceFilter: 'all',
        sortOption: 'refId-desc',
      });
      expect(result.map((r) => r.refId)).toEqual(['SVI2233', 'SVI2232', 'SVI2231', 'SVI2230']);
    });

    it('sorts by Ref ID ascending (oldest first)', () => {
      const result = filterAndSortRefIdProfiles(sampleProfiles, {
        sourceFilter: 'all',
        sortOption: 'refId-asc',
      });
      expect(result.map((r) => r.refId)).toEqual(['SVI2230', 'SVI2231', 'SVI2232', 'SVI2233']);
    });

    it('sorts by Client Name A to Z', () => {
      const result = filterAndSortRefIdProfiles(sampleProfiles, {
        sourceFilter: 'all',
        sortOption: 'name-asc',
      });
      expect(result.map((r) => r.name)).toEqual([
        'Ajeet Singh',
        'Ashok Kumar',
        'Bhawna Kapoor',
        'Sheela Rani',
      ]);
    });

    it('sorts by Client Name Z to A', () => {
      const result = filterAndSortRefIdProfiles(sampleProfiles, {
        sourceFilter: 'all',
        sortOption: 'name-desc',
      });
      expect(result.map((r) => r.name)).toEqual([
        'Sheela Rani',
        'Bhawna Kapoor',
        'Ashok Kumar',
        'Ajeet Singh',
      ]);
    });

    it('matches by plot number query', () => {
      const result = filterAndSortRefIdProfiles(sampleProfiles, {
        query: '42',
      });
      // SVI2232 has plotNo: '42', SVI2233 has phone ending in 42
      expect(result.some((r) => r.refId === 'SVI2232')).toBe(true);
    });

    it('matches by project / account name query', () => {
      const result = filterAndSortRefIdProfiles(sampleProfiles, {
        query: 'Govind',
      });
      expect(result).toHaveLength(1);
      expect(result[0].refId).toBe('SVI2232');
    });
  });
});
