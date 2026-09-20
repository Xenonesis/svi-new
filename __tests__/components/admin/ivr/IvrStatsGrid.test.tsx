import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { IvrStatsGrid, type IvrStatics } from '@/src/components/admin/ivr/IvrStatsGrid';

describe('IvrStatsGrid', () => {
  it('renders all three stat cards with correct labels and metric values', () => {
    const mockStatics: IvrStatics = {
      total: 150,
      answered: 110,
      missed: 40,
    };

    render(<IvrStatsGrid statics={mockStatics} />);

    // Verify all 3 labels are rendered
    expect(screen.getByText('Total Logs Found')).toBeDefined();
    expect(screen.getByText('Answered Calls')).toBeDefined();
    expect(screen.getByText('Missed Calls')).toBeDefined();

    // Verify values are displayed
    expect(screen.getByText('150')).toBeDefined();
    expect(screen.getByText('110')).toBeDefined();
    expect(screen.getByText('40')).toBeDefined();
  });

  it('renders correctly with zero values', () => {
    const zeroStatics: IvrStatics = {
      total: 0,
      answered: 0,
      missed: 0,
    };

    render(<IvrStatsGrid statics={zeroStatics} />);

    expect(screen.getByText('Total Logs Found')).toBeDefined();
    expect(screen.getByText('Answered Calls')).toBeDefined();
    expect(screen.getByText('Missed Calls')).toBeDefined();

    const zeroValues = screen.getAllByText('0');
    expect(zeroValues).toHaveLength(3);
  });

  it('applies correct styling colors to stat values', () => {
    const mockStatics: IvrStatics = {
      total: 50,
      answered: 35,
      missed: 15,
    };

    render(<IvrStatsGrid statics={mockStatics} />);

    const totalEl = screen.getByText('50');
    const answeredEl = screen.getByText('35');
    const missedEl = screen.getByText('15');

    expect(totalEl.className).toContain('text-brand-gold');
    expect(answeredEl.className).toContain('text-emerald-500');
    expect(missedEl.className).toContain('text-red-500');
  });
});
