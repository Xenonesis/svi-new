import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaderboardCard } from '@/src/components/admin/leads/LeaderboardCard';

describe('LeaderboardCard Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders overall handled calls, connection rate, and hot leads', () => {
    render(<LeaderboardCard totalCalls={100} answeredCalls={65} hotLeads={12} />);

    expect(screen.getByText('Telecalling & Conversion Hub')).toBeDefined();
    expect(screen.getByText('100')).toBeDefined();
    expect(screen.getByText('65%')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
  });

  it('toggles leaderboard expand on button click', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        leaderboard: [
          {
            advisor_id: 'emp-1',
            advisor_name: 'Shivam Yadav',
            total_calls: 50,
            answered_calls: 35,
            missed_calls: 15,
            answer_rate: 70,
            total_talk_time_sec: 1800,
            avg_talk_time_sec: 51,
            hot_leads: 8,
            site_visits_booked: 2,
          },
        ],
      }),
    } as Response);

    render(<LeaderboardCard totalCalls={100} answeredCalls={65} hotLeads={12} />);

    const toggleBtn = screen.getByRole('button', { name: /leaderboard/i });
    fireEvent.click(toggleBtn);

    expect(await screen.findByText('Advisor Leaderboard & Connected Volume')).toBeDefined();
    expect(await screen.findByText('Shivam Yadav')).toBeDefined();
    expect(screen.getByText(/70% connected/i)).toBeDefined();
  });
});
