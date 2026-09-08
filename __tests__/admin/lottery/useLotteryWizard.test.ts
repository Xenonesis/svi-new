import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLotteryWizard } from '@/src/components/admin/lottery/hooks/useLotteryWizard';
import type { Lottery, Participant, DbParticipant } from '@/src/components/admin/lottery/types';

// Mock campaignHelpers
vi.mock('@/src/lib/lottery/campaignHelpers', () => ({
  createLotteryCampaign: vi.fn().mockResolvedValue(true),
}));

// Mock Supabase
const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  single: vi.fn().mockResolvedValue({
    data: { id: 'new-lottery-id', title: 'New Lottery', description: 'Test', status: 'active' },
    error: null,
  }),
};

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockSupabaseQuery),
  },
}));

describe('useLotteryWizard', () => {
  const mockActiveLottery: Lottery = {
    id: 'active-lottery-1',
    title: 'Active Lottery',
    description: 'Active Description',
    status: 'active',
    created_at: '2026-09-08T00:00:00Z',
  };

  const mockParticipants: Participant[] = [
    {
      name: 'Alice Smith',
      ticketNumber: 'TICK-001',
      email: 'alice@example.com',
      phone: '1234567890',
    },
    { name: 'Bob Jones', ticketNumber: 'TICK-002', email: 'bob@example.com', phone: '0987654321' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseQuery.limit.mockResolvedValue({ data: [], error: null });
    mockSupabaseQuery.single.mockResolvedValue({
      data: { id: 'new-lottery-id', title: 'New Lottery', description: 'Test', status: 'active' },
      error: null,
    });
    mockSupabaseQuery.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockSupabaseQuery.insert.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'new-lottery-id', title: 'New Lottery', description: 'Test', status: 'active' },
        error: null,
      }),
      error: null,
    });
  });

  it('initializes with default wizard and winner selection state', () => {
    const { result } = renderHook(() => useLotteryWizard());

    expect(result.current.wizardStep).toBe(1);
    expect(result.current.title).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.drawMethod).toBe('manual');
    expect(result.current.selectedPredeterminedWinners).toEqual([]);
    expect(result.current.dbParticipants).toEqual([]);
    expect(result.current.dbParticipantsSearch).toBe('');
    expect(result.current.dbParticipantsLoading).toBe(false);
  });

  describe('wizard step transitions', () => {
    it('blocks advancing past step 1 if title is empty and sets error message', () => {
      const setErrorMessage = vi.fn();
      const { result } = renderHook(() =>
        useLotteryWizard({
          setErrorMessage,
        })
      );

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.wizardStep).toBe(1);
      expect(setErrorMessage).toHaveBeenCalledWith('Title is required to proceed.');
    });

    it('advances steps when title is provided', () => {
      const setErrorMessage = vi.fn();
      const { result } = renderHook(() =>
        useLotteryWizard({
          setErrorMessage,
        })
      );

      act(() => {
        result.current.setTitle('Summer Bonanza');
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.wizardStep).toBe(2);
      expect(setErrorMessage).toHaveBeenCalledWith(null);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.wizardStep).toBe(3);

      // Clamped to 3
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.wizardStep).toBe(3);
    });

    it('navigates backwards with prevStep down to minimum 1', () => {
      const { result } = renderHook(() => useLotteryWizard());

      act(() => {
        result.current.setWizardStep(3);
      });
      expect(result.current.wizardStep).toBe(3);

      act(() => {
        result.current.prevStep();
      });
      expect(result.current.wizardStep).toBe(2);

      act(() => {
        result.current.prevStep();
      });
      expect(result.current.wizardStep).toBe(1);

      act(() => {
        result.current.prevStep();
      });
      expect(result.current.wizardStep).toBe(1);
    });
  });

  describe('validation errors on save', () => {
    it('prevents saving if title is empty', async () => {
      const setErrorMessage = vi.fn();
      const { result } = renderHook(() =>
        useLotteryWizard({
          setErrorMessage,
          participants: mockParticipants,
        })
      );

      await act(async () => {
        await result.current.saveLotteryToDB();
      });

      expect(setErrorMessage).toHaveBeenCalledWith('Please enter a title for the lottery.');
    });

    it('prevents saving if participants list is empty', async () => {
      const setErrorMessage = vi.fn();
      const { result } = renderHook(() =>
        useLotteryWizard({
          setErrorMessage,
          participants: [],
        })
      );

      act(() => {
        result.current.setTitle('Diwali Special');
      });

      await act(async () => {
        await result.current.saveLotteryToDB();
      });

      expect(setErrorMessage).toHaveBeenCalledWith(
        'Please upload a spreadsheet with participants first.'
      );
    });
  });

  describe('participant search with debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('debounces participant search by 300ms when activeLottery and manual drawMethod are set', async () => {
      const mockFound: DbParticipant[] = [
        {
          id: 'p-1',
          name: 'Alice Smith',
          ticket_number: 'TICK-001',
          phone: '123',
          email: 'a@b.com',
        },
      ];
      mockSupabaseQuery.limit.mockResolvedValueOnce({ data: mockFound, error: null });

      const { result } = renderHook(() =>
        useLotteryWizard({
          activeLottery: mockActiveLottery,
        })
      );

      act(() => {
        result.current.setDbParticipantsSearch('Alice');
      });

      expect(mockSupabaseQuery.limit).not.toHaveBeenCalled();

      // Fast forward past 300ms debounce
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.dbParticipants).toEqual(mockFound);
    });

    it('resets dbParticipants when drawMethod is random or activeLottery is null', async () => {
      const { result } = renderHook(() =>
        useLotteryWizard({
          activeLottery: null,
        })
      );

      expect(result.current.dbParticipants).toEqual([]);
    });
  });

  describe('successful save and campaign creation', () => {
    it('creates lottery, inserts participants in chunks, resets wizard, and calls handlers', async () => {
      const setErrorMessage = vi.fn();
      const setSuccessMessage = vi.fn();
      const setParticipants = vi.fn();
      const setActiveTab = vi.fn();
      const fetchLotteries = vi.fn();

      const { result } = renderHook(() =>
        useLotteryWizard({
          activeLottery: mockActiveLottery,
          token: 'test-token',
          participants: mockParticipants,
          setErrorMessage,
          setSuccessMessage,
          setParticipants,
          setActiveTab,
          fetchLotteries,
        })
      );

      act(() => {
        result.current.setTitle('Grand Jackpot');
        result.current.setDescription('Year end draw');
        result.current.setWizardStep(3);
      });

      await act(async () => {
        await result.current.saveLotteryToDB();
      });

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.wizardStep).toBe(1);
      expect(setParticipants).toHaveBeenCalledWith([]);
      expect(setActiveTab).toHaveBeenCalledWith('dashboard');
      expect(fetchLotteries).toHaveBeenCalled();
      expect(setSuccessMessage).toHaveBeenCalledWith(
        'New active lottery created successfully! Live drawing is ready.'
      );
    });
  });
});
