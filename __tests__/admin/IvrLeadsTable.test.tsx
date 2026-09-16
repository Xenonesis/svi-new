import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IvrLeadsTable } from '@/src/components/admin/leads/IvrLeadsTable';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';

const mockRecords: IvrRecordItem[] = [
  {
    id: '1',
    customer_phone: '8744875331',
    agent_name: 'Shivam Yadav',
    agent_phone: '9311290543',
    dial_time: '2026-09-15T15:55:29Z',
    call_duration: 103,
    dial_status: 'ANSWER',
    pressed_key: '2',
    temperature: 'hot',
    campaign_name: 'IVR Sep 15',
    created_at: '2026-09-15T15:55:29Z',
  },
  {
    id: '2',
    customer_phone: '8920260621',
    agent_name: 'Shikha Tomar',
    agent_phone: '9870345702',
    dial_time: '2026-09-15T15:55:10Z',
    call_duration: 15,
    dial_status: 'NOANSWER',
    pressed_key: null,
    temperature: 'cold',
    campaign_name: 'IVR Sep 15',
    created_at: '2026-09-15T15:55:10Z',
  },
];

describe('IvrLeadsTable Component', () => {
  it('renders table columns, customer numbers, and prominent dial status badges', () => {
    render(
      <IvrLeadsTable
        records={mockRecords}
        totalCount={2}
        page={1}
        limit={25}
        loading={false}
        onPageChange={vi.fn()}
        onFilterChange={vi.fn()}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={[]}
      />
    );

    expect(screen.getByText('8744875331')).toBeDefined();
    expect(screen.getByText('8920260621')).toBeDefined();

    // Check Answered vs Not Answered badges and filters
    expect(screen.getAllByText('Answered').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Not Answered').length).toBeGreaterThanOrEqual(1);

    // Check Duration display
    expect(screen.getByText('01:43')).toBeDefined();
    expect(screen.getByText('00:15')).toBeDefined();
  });

  it('triggers onFilterChange when dial status filter is clicked', () => {
    const handleFilterChange = vi.fn();
    render(
      <IvrLeadsTable
        records={mockRecords}
        totalCount={2}
        page={1}
        limit={25}
        loading={false}
        onPageChange={vi.fn()}
        onFilterChange={handleFilterChange}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={[]}
      />
    );

    const answeredChip = screen.getAllByRole('button', { name: /answered/i })[0];
    fireEvent.click(answeredChip);

    expect(handleFilterChange).toHaveBeenCalled();
  });
});
