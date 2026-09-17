import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportLeadsModal } from '@/src/components/admin/leads/ExportLeadsModal';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';

// Mock export helpers
vi.mock('@/src/lib/leads/exportIvrLeads', () => ({
  exportIvrLeadsToExcel: vi.fn().mockResolvedValue(undefined),
  exportIvrLeadsToPdf: vi.fn().mockResolvedValue(undefined),
  exportIvrLeadsToCsv: vi.fn(),
}));

const mockRecords: IvrRecordItem[] = [
  {
    id: '1',
    customer_phone: '8744875331',
    agent_name: 'Shivam Yadav',
    dial_status: 'ANSWER',
    call_duration: 112,
    pressed_key: '1',
    temperature: 'hot',
    dial_time: '2026-09-15T15:50:33Z',
    campaign_name: 'IVR Campaign',
    created_at: '2026-09-15T15:50:33Z',
  },
  {
    id: '2',
    customer_phone: '8920260621',
    agent_name: 'Shikha Tomar',
    dial_status: 'NOANSWER',
    call_duration: 15,
    pressed_key: null,
    temperature: 'cold',
    dial_time: '2026-09-15T15:50:10Z',
    campaign_name: 'IVR Campaign',
    created_at: '2026-09-15T15:50:10Z',
  },
];

const mockEmployees = [
  { id: 'emp-1', full_name: 'Shivam Yadav' },
  { id: 'emp-2', full_name: 'Shikha Tomar' },
];

describe('ExportLeadsModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: mockRecords, total_count: 2 }),
    } as unknown as Response);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ExportLeadsModal
        isOpen={false}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentRecords={mockRecords}
        totalRecordsCount={2}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with format toggles, advisor selector, and date options when isOpen is true', () => {
    render(
      <ExportLeadsModal
        isOpen={true}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentRecords={mockRecords}
        totalRecordsCount={120}
      />
    );

    expect(screen.getByText('Export Telecalling Leads Studio')).toBeDefined();
    expect(screen.getByText('Excel (.xlsx)')).toBeDefined();
    expect(screen.getByText('PDF Document')).toBeDefined();
    expect(screen.getByText('Raw CSV')).toBeDefined();

    // Advisors
    expect(screen.getByText('All Advisors (Full Team)')).toBeDefined();
    expect(screen.getByText('Shivam Yadav')).toBeDefined();
    // Date scopes
    expect(screen.getByRole('button', { name: 'All Time' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Today' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Yesterday' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Specific Day' })).toBeDefined();
  });

  it('allows switching formats to PDF and CSV', () => {
    render(
      <ExportLeadsModal
        isOpen={true}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentRecords={mockRecords}
        totalRecordsCount={50}
      />
    );

    const pdfBtn = screen.getByRole('button', { name: /pdf document/i });
    fireEvent.click(pdfBtn);
    expect(screen.getByText(/Export PDF/i)).toBeDefined();

    const csvBtn = screen.getByRole('button', { name: /raw csv/i });
    fireEvent.click(csvBtn);
    expect(screen.getByText(/Export CSV/i)).toBeDefined();
  });

  it('calls export function when submit button is clicked', async () => {
    const { exportIvrLeadsToExcel } = await import('@/src/lib/leads/exportIvrLeads');
    const handleClose = vi.fn();

    render(
      <ExportLeadsModal
        isOpen={true}
        onClose={handleClose}
        employees={mockEmployees}
        currentRecords={mockRecords}
        totalRecordsCount={50}
      />
    );

    const exportBtn = screen.getByRole('button', { name: /export excel/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(exportIvrLeadsToExcel).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
