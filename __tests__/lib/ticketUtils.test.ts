import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, it, expect, vi } from 'vitest';
import {
  formatTicketId,
  isValidTicketFormat,
  extractTicketFromMetadata,
  parseTicketNumericSuffix,
  isTicketIdOccupied,
  getNextGlobalTicketId,
} from '@/src/lib/allotment/ticketUtils';

describe('ticketUtils - Canonical Ticket & Identifier Utilities', () => {
  describe('formatTicketId', () => {
    it('normalizes spaced and lowercase strings to uppercase non-spaced format', () => {
      expect(formatTicketId('svi 2236')).toBe('SVI2236');
      expect(formatTicketId('SVI-2236')).toBe('SVI2236');
      expect(formatTicketId('  pl 2075  ')).toBe('PL2075');
      expect(formatTicketId('svi_2255')).toBe('SVI2255');
      expect(formatTicketId(null)).toBe('');
      expect(formatTicketId(undefined)).toBe('');
    });
  });

  describe('isValidTicketFormat', () => {
    it('validates canonical alphanumeric ticket identifiers', () => {
      expect(isValidTicketFormat('SVI2236')).toBe(true);
      expect(isValidTicketFormat('PL2075')).toBe(true);
      expect(isValidTicketFormat('svi 2258')).toBe(true);
      expect(isValidTicketFormat('   ')).toBe(false);
      expect(isValidTicketFormat('12')).toBe(false);
    });
  });

  describe('parseTicketNumericSuffix', () => {
    it('extracts numeric integer value from SVI tickets', () => {
      expect(parseTicketNumericSuffix('SVI2258')).toBe(2258);
      expect(parseTicketNumericSuffix('svi 2255')).toBe(2255);
      expect(parseTicketNumericSuffix('SVI-002106')).toBe(2106);
      expect(parseTicketNumericSuffix('PL2075')).toBe(null);
      expect(parseTicketNumericSuffix('INVALID')).toBe(null);
      expect(parseTicketNumericSuffix(null)).toBe(null);
    });
  });

  describe('extractTicketFromMetadata', () => {
    it('extracts ticket ID from diverse metadata keys', () => {
      expect(extractTicketFromMetadata({ ticket_id: 'SVI2255' })).toBe('SVI2255');
      expect(extractTicketFromMetadata({ ticketId: 'svi 2258' })).toBe('SVI2258');
      expect(extractTicketFromMetadata({ submission_id: 'SVI-2236' })).toBe('SVI2236');
      expect(extractTicketFromMetadata({ refId: 'PL2075' })).toBe('PL2075');
      expect(extractTicketFromMetadata(null)).toBe('');
      expect(extractTicketFromMetadata({})).toBe('');
    });
  });

  describe('isTicketIdOccupied', () => {
    it('returns true if ticket exists in registrations', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'registrations') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [{ id: 'reg-1' }], error: null }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
              eq: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }),
      } as unknown as SupabaseClient;

      const occupied = await isTicketIdOccupied(mockSupabase, 'SVI2258');
      expect(occupied).toBe(true);
    });

    it('returns true if ticket exists in allotments metadata', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'allotments') {
            return {
              select: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [{ id: 'allot-1', metadata: { ticket_id: 'SVI2255' } }],
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                or: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }),
      } as unknown as SupabaseClient;

      const occupied = await isTicketIdOccupied(mockSupabase, 'SVI2255');
      expect(occupied).toBe(true);
    });

    it('returns false if ticket does not exist anywhere', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              or: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            or: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        })),
      } as unknown as SupabaseClient;

      const occupied = await isTicketIdOccupied(mockSupabase, 'SVI2299');
      expect(occupied).toBe(false);
    });
  });

  describe('getNextGlobalTicketId', () => {
    it('calculates the maximum across registrations, allotments, and documents and returns max + 1', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'registrations') {
            return {
              select: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [{ submission_id: 'SVI2250' }, { submission_id: 'SVI2254' }],
                    error: null,
                  }),
                }),
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            };
          }
          if (table === 'allotments') {
            return {
              select: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    // Allotments had SVI2255!
                    data: [{ metadata: { ticket_id: 'SVI2255' } }],
                    error: null,
                  }),
                }),
                or: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            };
          }
          if (table === 'documents') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  not: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [{ form_data: { ticketId: 'SVI2258' } }],
                      error: null,
                    }),
                  }),
                  or: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            };
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                or: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
              or: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }),
      } as unknown as SupabaseClient;

      const nextId = await getNextGlobalTicketId(mockSupabase, 2258);
      // Max across mock data is 2258 -> next candidate is SVI2259
      expect(nextId).toBe('SVI2259');
    });

    it('enforces floor number when database numbers are lower than floor', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              or: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            or: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        })),
      } as unknown as SupabaseClient;

      const nextId = await getNextGlobalTicketId(mockSupabase, 2258);
      expect(nextId).toBe('SVI2259');
    });
  });
});
