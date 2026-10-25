import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { IvrLeadsTable } from '@/src/components/admin/leads/IvrLeadsTable';
import { IvrLeadDesktopRow } from '@/src/components/admin/leads/table/IvrLeadDesktopRow';
import { IvrLeadMobileCard } from '@/src/components/admin/leads/table/IvrLeadMobileCard';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    full_name: 'Ananya Sharma',
    email: 'ananya@sviinfra.com',
    phone: '9876500001',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'emp-2',
    full_name: 'Rahul Verma',
    email: 'rahul@sviinfra.com',
    phone: '9876500002',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
  },
];

const mockRecords: IvrRecordItem[] = [
  {
    id: 'rec-1',
    customer_phone: '9876543210',
    agent_name: 'Ananya Sharma',
    agent_phone: '9876500001',
    dial_time: '2026-10-25T10:00:00Z',
    call_duration: 85,
    dial_status: 'ANSWER',
    pressed_key: '1',
    temperature: 'hot',
    campaign_name: 'Jaipur Ring Road Plots',
    created_at: '2026-10-25T10:00:00Z',
    recording_url: 'https://storage.sviinfra.com/recordings/audio1.mp3',
    has_recording: true,
    raw_payload: {
      recording_url: 'https://storage.sviinfra.com/recordings/audio1.mp3',
      ai_intelligence: {
        summary:
          'Customer is actively looking for a 200 sq yd plot on Ring Road with immediate registry.',
        interest_level: 'Hot',
        sentiment: 'Positive',
        intent: 'Site Visit Requested',
        budget: '45 Lakhs',
        property_interest: 'Ring Road 200 SqYd',
        transcript: 'Telecaller: Hello sir. Customer: I want to visit the site this Sunday.',
      },
    },
    ai_intelligence: {
      summary:
        'Customer is actively looking for a 200 sq yd plot on Ring Road with immediate registry.',
      interest_level: 'Hot',
      sentiment: 'Positive',
      intent: 'Site Visit Requested',
      budget: '45 Lakhs',
      property_interest: 'Ring Road 200 SqYd',
    },
  },
  {
    id: 'rec-2',
    customer_phone: '9876543211',
    agent_name: 'Rahul Verma',
    agent_phone: '9876500002',
    dial_time: '2026-10-25T10:15:00Z',
    call_duration: 35,
    dial_status: 'ANSWER',
    pressed_key: null,
    temperature: 'warm',
    campaign_name: 'Jaipur Ring Road Plots',
    created_at: '2026-10-25T10:15:00Z',
    recording_url: 'https://storage.sviinfra.com/recordings/audio2.mp3',
    has_recording: true,
    raw_payload: null,
    ai_intelligence: null,
  },
  {
    id: 'rec-3',
    customer_phone: '9876543212',
    agent_name: 'Rahul Verma',
    dial_time: '2026-10-25T10:20:00Z',
    call_duration: 0,
    dial_status: 'NOANSWER',
    pressed_key: null,
    temperature: 'cold',
    campaign_name: 'Jaipur Ring Road Plots',
    created_at: '2026-10-25T10:20:00Z',
    recording_url: null,
    has_recording: false,
    raw_payload: null,
    ai_intelligence: null,
  },
  {
    id: 'rec-4',
    customer_phone: '9876543213',
    agent_name: 'Ananya Sharma',
    dial_time: '2026-10-25T10:30:00Z',
    call_duration: 65,
    dial_status: 'ANSWER',
    pressed_key: '2',
    temperature: 'warm',
    campaign_name: 'Jaipur Ring Road Plots',
    created_at: '2026-10-25T10:30:00Z',
    recording_url: null,
    has_recording: true,
    raw_payload: {
      ai_intelligence: {
        summary:
          'Customer has price concerns regarding Khatu Shyam plots and requested a callback next week.',
        interest_level: 'Warm',
        sentiment: 'Skeptical',
        intent: 'Price Enquiry',
        budget: '25 Lakhs',
        property_interest: 'Khatu Shyam Ji Plot',
      },
    },
    ai_intelligence: {
      summary:
        'Customer has price concerns regarding Khatu Shyam plots and requested a callback next week.',
      interest_level: 'Warm',
      sentiment: 'Skeptical',
      intent: 'Price Enquiry',
      budget: '25 Lakhs',
      property_interest: 'Khatu Shyam Ji Plot',
    },
  },
];

describe('IvrLeadsTable AI Call Intelligence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            cached: false,
            intelligence: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
  });

  it('renders AI Insight trigger button for rows that have recordings, and hides for rows without', () => {
    render(
      <IvrLeadsTable
        records={mockRecords}
        totalCount={4}
        page={1}
        limit={25}
        loading={false}
        onPageChange={vi.fn()}
        onFilterChange={vi.fn()}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={mockEmployees}
      />
    );

    // Records 1, 2, and 4 have recordings (via recording_url or has_recording), record 3 does not.
    const desktopAiButtons = screen.getAllByTestId('row-ai-insight-btn');
    expect(desktopAiButtons).toHaveLength(3);

    const mobileAiButtons = screen.getAllByTestId('mobile-ai-insight-btn');
    expect(mobileAiButtons).toHaveLength(3);
  });
  it('renders cached sentiment and interest level badges when AI intelligence is available', () => {
    render(
      <IvrLeadsTable
        records={mockRecords}
        totalCount={4}
        page={1}
        limit={25}
        loading={false}
        onPageChange={vi.fn()}
        onFilterChange={vi.fn()}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={mockEmployees}
      />
    );

    // Record 1 has Positive sentiment and Hot interest level cached
    const positiveBadges = screen.getAllByTestId('ai-sentiment-badge');
    expect(positiveBadges.some((b) => b.textContent === 'Positive')).toBe(true);

    const hotBadges = screen.getAllByTestId('ai-interest-badge');
    expect(hotBadges.some((b) => b.textContent === 'Hot')).toBe(true);

    // Record 4 has Skeptical sentiment and Warm interest level cached
    expect(positiveBadges.some((b) => b.textContent === 'Skeptical')).toBe(true);
    expect(hotBadges.some((b) => b.textContent === 'Warm')).toBe(true);
  });

  it('opens AiCallSummaryModal when the AI Insights button is clicked', () => {
    render(
      <IvrLeadsTable
        records={mockRecords}
        totalCount={4}
        page={1}
        limit={25}
        loading={false}
        onPageChange={vi.fn()}
        onFilterChange={vi.fn()}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={mockEmployees}
      />
    );

    // Modal is initially not open
    expect(screen.queryByText('AI Call Intelligence & Voice Insights')).toBeNull();

    // Click the first desktop AI Insights button (for rec-1)
    const desktopAiButtons = screen.getAllByTestId('row-ai-insight-btn');
    fireEvent.click(desktopAiButtons[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('AI Call Intelligence & Voice Insights')).toBeInTheDocument();
    expect(within(dialog).getAllByText(/\+91 9876543210/).length).toBeGreaterThanOrEqual(1);

    // Pre-cached summary is rendered inside modal
    expect(
      within(dialog).getByText(/Customer is actively looking for a 200 sq yd plot on Ring Road/i)
    ).toBeInTheDocument();

    // Close modal via close button
    const closeBtn = within(dialog).getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('AI Call Intelligence & Voice Insights')).toBeNull();
  });

  it('opens AiCallSummaryModal when Mobile Card AI Insight button is clicked', () => {
    render(
      <IvrLeadsTable
        records={mockRecords}
        totalCount={4}
        page={1}
        limit={25}
        loading={false}
        onPageChange={vi.fn()}
        onFilterChange={vi.fn()}
        onTemperatureChange={vi.fn()}
        onReassignAdvisor={vi.fn()}
        employees={mockEmployees}
      />
    );

    const mobileAiButtons = screen.getAllByTestId('mobile-ai-insight-btn');
    fireEvent.click(mobileAiButtons[0]);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('AI Call Intelligence & Voice Insights')).toBeInTheDocument();
    expect(within(dialog).getAllByText(/\+91 9876543210/).length).toBeGreaterThanOrEqual(1);
  });
  it('invokes onOpenAiSummary callback in IvrLeadDesktopRow', () => {
    const handleOpenAiSummary = vi.fn();
    render(
      <table>
        <tbody>
          <IvrLeadDesktopRow
            record={mockRecords[0]}
            isSelected={false}
            toggleSelectPhone={vi.fn()}
            setDrawerLead={vi.fn()}
            employees={mockEmployees}
            onReassignAdvisor={vi.fn()}
            onTemperatureChange={vi.fn()}
            formatDuration={(s) => `${s}s`}
            onOpenAiSummary={handleOpenAiSummary}
          />
        </tbody>
      </table>
    );

    const aiBtn = screen.getByTestId('row-ai-insight-btn');
    fireEvent.click(aiBtn);

    expect(handleOpenAiSummary).toHaveBeenCalledWith('rec-1');
  });

  it('invokes onOpenAiSummary callback in IvrLeadMobileCard', () => {
    const handleOpenAiSummary = vi.fn();
    render(
      <IvrLeadMobileCard
        record={mockRecords[0]}
        isSelected={false}
        toggleSelectPhone={vi.fn()}
        setDrawerLead={vi.fn()}
        employees={mockEmployees}
        onReassignAdvisor={vi.fn()}
        onTemperatureChange={vi.fn()}
        formatDuration={(s) => `${s}s`}
        onOpenAiSummary={handleOpenAiSummary}
      />
    );

    const aiBtn = screen.getByTestId('mobile-ai-insight-btn');
    fireEvent.click(aiBtn);

    expect(handleOpenAiSummary).toHaveBeenCalledWith('rec-1');
  });
});
