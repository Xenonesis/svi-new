import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IvrStatsKpiGrid } from '@/src/components/admin/leads/IvrStatsKpiGrid';

describe('IvrStatsKpiGrid', () => {
  it('renders all four KPI cards with calculated connection rate when total calls > 0', () => {
    const summary = {
      total_calls: 1250,
      answered_calls: 850,
      missed_calls: 400,
      hot_count: 120,
      warm_count: 300,
      cold_count: 430,
    };

    render(<IvrStatsKpiGrid summary={summary} />);

    // Check headings
    expect(screen.getByText('Total Calls')).toBeDefined();
    expect(screen.getByText('Answered')).toBeDefined();
    expect(screen.getByText('Not Answered')).toBeDefined();
    expect(screen.getByText('Hot Intent')).toBeDefined();

    // Check values
    expect(screen.getByText('1,250')).toBeDefined();
    expect(screen.getByText('850')).toBeDefined();
    expect(screen.getByText('400')).toBeDefined();
    expect(screen.getByText('120')).toBeDefined();

    // Connection rate calculation: (850 / 1250) * 100 = 68%
    expect(screen.getByText('68% connection rate')).toBeDefined();
    expect(screen.getByText('Missed / Unanswered')).toBeDefined();
  });

  it('renders default fallback connection text when total calls is 0', () => {
    const summary = {
      total_calls: 0,
      answered_calls: 0,
      missed_calls: 0,
      hot_count: 0,
    };

    render(<IvrStatsKpiGrid summary={summary} />);

    expect(screen.getByText('Connected calls')).toBeDefined();
  });
});
