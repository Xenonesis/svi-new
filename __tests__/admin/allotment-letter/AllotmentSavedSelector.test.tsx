import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AllotmentSavedSelector } from '@/src/components/admin/allotment-letter/AllotmentSavedSelector';
import { AllotmentRecordPickerModal } from '@/src/components/admin/allotment-letter/AllotmentRecordPickerModal';

describe('AllotmentSavedSelector', () => {
  const mockRecords = [
    {
      id: 'rec-1',
      created_at: '2026-09-01T10:00:00Z',
      form_data: {
        clientName: 'Aditya Kumar',
        ticketId: 'TKT-1001',
        projectName: 'Shyam Aangan',
        unitNumber: 'Plot-12',
        area: '100',
        paymentPlan: '12',
      },
    },
    {
      id: 'rec-2',
      created_at: '2026-09-02T12:00:00Z',
      form_data: {
        clientName: 'Priya Sharma',
        ticketId: 'TKT-1002',
        projectName: 'Shivani Vatika 11th',
        unitNumber: 'Unit-44',
        area: '150',
        paymentPlan: '24',
      },
    },
  ];

  const defaultProps = {
    savedAllotments: mockRecords,
    loadingRecords: false,
    selectedRecordId: '',
    onSelectRecord: vi.fn(),
    onRefreshRecords: vi.fn(),
    onClearRecord: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders load from records badge and record count', () => {
    render(<AllotmentSavedSelector {...defaultProps} />);

    expect(screen.getByText('Load from Records')).toBeInTheDocument();
    expect(screen.getByText('2 saved')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse All/i })).toBeInTheDocument();
  });

  it('calls onSelectRecord when option is chosen from dropdown', () => {
    render(<AllotmentSavedSelector {...defaultProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'rec-1' } });

    expect(defaultProps.onSelectRecord).toHaveBeenCalledWith('rec-1');
  });

  it('calls onRefreshRecords when refresh button is clicked', () => {
    render(<AllotmentSavedSelector {...defaultProps} />);

    const refreshBtn = screen.getByTitle('Refresh allotment records from database');
    fireEvent.click(refreshBtn);

    expect(defaultProps.onRefreshRecords).toHaveBeenCalledTimes(1);
  });

  it('renders reset button when a record is selected and triggers onClearRecord', () => {
    render(<AllotmentSavedSelector {...defaultProps} selectedRecordId="rec-1" />);

    const resetBtn = screen.getByTitle('Clear selected record and reset form');
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(defaultProps.onClearRecord).toHaveBeenCalledTimes(1);
  });

  it('opens search modal when Browse All button is clicked', () => {
    render(<AllotmentSavedSelector {...defaultProps} />);

    expect(screen.queryByText('Load Allotment from Records')).not.toBeInTheDocument();

    const browseBtn = screen.getByRole('button', { name: /Browse All/i });
    fireEvent.click(browseBtn);

    expect(screen.getByText('Load Allotment from Records')).toBeInTheDocument();
    expect(screen.getByText('Aditya Kumar')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
  });
});

describe('AllotmentRecordPickerModal', () => {
  const mockRecords = [
    {
      id: 'rec-1',
      created_at: '2026-09-01T10:00:00Z',
      form_data: {
        salutation: 'Mr.',
        clientName: 'Aditya Kumar',
        ticketId: 'TKT-1001',
        projectName: 'Shyam Aangan',
        unitNumber: 'Plot-12',
        area: '100',
        paymentPlan: '12',
      },
    },
    {
      id: 'rec-2',
      created_at: '2026-09-02T12:00:00Z',
      form_data: {
        salutation: 'Mrs.',
        clientName: 'Priya Sharma',
        ticketId: 'TKT-1002',
        projectName: 'Shivani Vatika 11th',
        unitNumber: 'Unit-44',
        area: '150',
        paymentPlan: '24',
      },
    },
  ];

  const modalProps = {
    isOpen: true,
    onClose: vi.fn(),
    records: mockRecords,
    selectedRecordId: '',
    onSelectRecord: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters records by search input', () => {
    render(<AllotmentRecordPickerModal {...modalProps} />);

    const searchInput = screen.getByPlaceholderText(/Search by client name/i);
    fireEvent.change(searchInput, { target: { value: 'Priya' } });

    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
    expect(screen.queryByText(/Aditya Kumar/i)).not.toBeInTheDocument();
  });

  it('calls onSelectRecord and onClose when a card is clicked', () => {
    render(<AllotmentRecordPickerModal {...modalProps} />);

    const recordCard = screen.getByText(/Aditya Kumar/i);
    fireEvent.click(recordCard);
    expect(modalProps.onSelectRecord).toHaveBeenCalledWith(mockRecords[0]);
    expect(modalProps.onClose).toHaveBeenCalledTimes(1);
  });
});
