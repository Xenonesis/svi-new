import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TelecallingDashboard } from '@/src/components/admin/leads/TelecallingDashboard';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('TelecallingDashboard Component', () => {
  const mockSummary = {
    total_calls: 8792,
    answered_calls: 4612,
    missed_calls: 4180,
    answer_rate: 52,
    total_talk_time_sec: 335964,
    avg_talk_time_sec: 73,
    hot_leads: 6342,
    key1_count: 6254,
    active_advisors: 7,
    total_roster_count: 14,
  };

  const mockLeaderboard = [
    {
      advisor_id: 'adv-khushi',
      advisor_name: 'Khushi Pal',
      phone: '9218300589',
      role: 'employee',
      total_calls: 1798,
      answered_calls: 989,
      missed_calls: 809,
      answer_rate: 55,
      total_talk_time_sec: 60235,
      avg_talk_time_sec: 61,
      hot_leads: 1343,
      site_visits_booked: 2,
      key1_count: 1329,
    },
    {
      advisor_id: 'adv-manish',
      advisor_name: 'Manish Sharma',
      phone: '9217085407',
      role: 'employee',
      total_calls: 1442,
      answered_calls: 762,
      missed_calls: 680,
      answer_rate: 53,
      total_talk_time_sec: 56660,
      avg_talk_time_sec: 74,
      hot_leads: 1051,
      site_visits_booked: 1,
      key1_count: 1039,
    },
    {
      advisor_id: 'adv-shikha',
      advisor_name: 'Shikha Tomar',
      phone: '9675792683',
      role: 'employee',
      total_calls: 1192,
      answered_calls: 587,
      missed_calls: 605,
      answer_rate: 49,
      total_talk_time_sec: 43833,
      avg_talk_time_sec: 75,
      hot_leads: 849,
      site_visits_booked: 0,
      key1_count: 843,
    },
  ];

  const mockCampaigns = [
    {
      name: 'IVR Campaign - 16 Sept 2026',
      total_calls: 8792,
      answered_calls: 4612,
      missed_calls: 4180,
      answer_rate: 52,
      hot_leads: 6342,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        summary: mockSummary,
        leaderboard: mockLeaderboard,
        campaigns: mockCampaigns,
      }),
    } as Response);
  });

  it('renders Telecalling Command Center header and executive KPI cards', async () => {
    render(<TelecallingDashboard token="test-token" />);

    expect(await screen.findByText('Telecalling & Conversion Command Center')).toBeDefined();

    // Check KPI metrics
    expect(await screen.findByText('8,792')).toBeDefined(); // Total calls
    expect(screen.getAllByText('4,612').length).toBeGreaterThanOrEqual(1); // Answered calls
    expect(screen.getAllByText('4,180').length).toBeGreaterThanOrEqual(1); // Missed calls
    expect(screen.getAllByText('6,342').length).toBeGreaterThanOrEqual(1); // Hot leads
    expect(screen.getByText('52% Connection Rate')).toBeDefined();
  });

  it('renders advisor leaderboard with rankings and functional view leads button', async () => {
    const onNavigateSpy = vi.fn();
    render(<TelecallingDashboard token="test-token" onNavigateToLeads={onNavigateSpy} />);

    // Ranks and advisors should appear
    expect(await screen.findByText('Khushi Pal')).toBeDefined();
    expect(screen.getByText('Manish Sharma')).toBeDefined();
    expect(screen.getByText('Shikha Tomar')).toBeDefined();

    // Check answer rate badges
    expect(screen.getByText('55% Ans')).toBeDefined();
    expect(screen.getByText('53% Ans')).toBeDefined();

    // Click "View Leads" for Khushi Pal
    const viewLeadsButtons = screen.getAllByRole('button', { name: /view leads/i });
    expect(viewLeadsButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(viewLeadsButtons[0]);
    expect(onNavigateSpy).toHaveBeenCalledWith('adv-khushi');
  });

  it('filters leaderboard by search query', async () => {
    render(<TelecallingDashboard token="test-token" />);

    expect(await screen.findByText('Khushi Pal')).toBeDefined();

    const searchInput = screen.getByPlaceholderText('Search advisor...');
    fireEvent.change(searchInput, { target: { value: 'Manish' } });

    expect(screen.getByText('Manish Sharma')).toBeDefined();
    expect(screen.queryByText('Khushi Pal')).toBeNull();
  });

  it('triggers time range filter and re-fetches data', async () => {
    render(<TelecallingDashboard token="test-token" />);

    await screen.findByText('Telecalling & Conversion Command Center');

    const todayButton = screen.getByRole('button', { name: 'Today' });
    fireEvent.click(todayButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeRange=today'),
        expect.anything()
      );
    });
  });
});
