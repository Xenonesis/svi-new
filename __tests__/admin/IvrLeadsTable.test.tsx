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

    // Check dual advisor columns: Attended By & Follow-up Advisor
    expect(screen.getByText('Attended By')).toBeDefined();
    expect(screen.getByText('Follow-up Advisor')).toBeDefined();
    expect(
      screen.getByRole('combobox', { name: 'Follow-up advisor for 8744875331' })
    ).toBeDefined();
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

  it('opens advisor filter dropdown and triggers onFilterChange when an advisor is selected', () => {
    const handleFilterChange = vi.fn();
    const mockEmployees = [
      {
        id: 'emp-shivam',
        full_name: 'Shivam Yadav',
        email: 'shivam@svi.com',
        phone: '9218300593',
        role: 'employee' as const,
        notes: '',
        created_at: '',
      },
      {
        id: 'emp-kajal',
        full_name: 'Kajal Vishu',
        email: 'kajal@svi.com',
        phone: '9218300590',
        role: 'employee' as const,
        notes: '',
        created_at: '',
      },
    ];

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
        employees={mockEmployees}
      />
    );

    // Open the advisor dropdown button
    const advisorButton = screen.getByRole('button', { name: /filter by assigned advisor/i });
    fireEvent.click(advisorButton);

    // Options should be visible
    expect(screen.getAllByText('Kajal Vishu').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Shivam Yadav').length).toBeGreaterThanOrEqual(1);
    // Click on Kajal Vishu from the dropdown
    const kajalOption = screen.getAllByRole('option', { name: /kajal vishu/i })[0];
    fireEvent.click(kajalOption);

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ advisor_id: 'emp-kajal' })
    );
  });

  it('selects leads with checkboxes and renders floating bulk action dock', () => {
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

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all leads/i });
    fireEvent.click(selectAllCheckbox);

    // Bulk Action Dock should appear
    expect(screen.getByText('Leads Selected')).toBeDefined();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
  });

  it('opens 1-click WhatsApp templates dropdown', () => {
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

    const waBtn = screen.getByRole('button', { name: /send whatsapp template to 8744875331/i });
    fireEvent.click(waBtn);

    expect(screen.getByText('1-Click WhatsApp Templates')).toBeDefined();
    expect(screen.getByText('Brochure & Maps Location')).toBeDefined();
    expect(screen.getByText('Free Site Visit (Pick & Drop)')).toBeDefined();
  });

  it('opens slide-over LeadDrawer when customer phone or note icon is clicked', () => {
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

    const phoneBtn = screen.getByRole('button', { name: '8744875331' });
    fireEvent.click(phoneBtn);
    expect(screen.getByRole('heading', { name: /lead 8744875331/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /close drawer/i })).toBeDefined();
  });

  it('renders realistic animated skeleton rows when loading is true to eliminate layout shifts', () => {
    render(
      <IvrLeadsTable
        records={[]}
        totalCount={0}
        page={1}
        limit={25}
        loading={true}
        onPageChange={vi.fn()}
        onFilterChange={vi.fn()}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={[]}
        summary={{
          total_calls: 0,
          answered_calls: 0,
          missed_calls: 0,
          hot_count: 0,
          warm_count: 0,
          cold_count: 0,
        }}
      />
    );

    const skeletonRows = screen.getAllByTestId('ivr-table-skeleton-row');
    expect(skeletonRows).toHaveLength(8);
    expect(screen.queryByText('Loading IVR call records...')).toBeNull();
  });
});
