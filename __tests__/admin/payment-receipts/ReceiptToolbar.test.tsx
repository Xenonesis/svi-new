import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  ReceiptToolbar,
  ReceiptToolbarProps,
} from '@/src/components/admin/payment-receipts/ReceiptToolbar';

describe('ReceiptToolbar', () => {
  const defaultProps: ReceiptToolbarProps = {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    methodFilter: '',
    setMethodFilter: vi.fn(),
    sortConfig: { key: 'date', direction: 'desc' },
    setSortConfig: vi.fn(),
    dateRange: { start: '', end: '' },
    setDateRange: vi.fn(),
    handleClearFilters: vi.fn(),
    onExportCsv: vi.fn(),
    onExportExcel: vi.fn(),
    onOpenLedgers: vi.fn(),
    activeTab: 'active',
    setActiveTab: vi.fn(),
    trashedCount: 2,
    pageSize: 25,
    setPageSize: vi.fn(),
  };

  it('renders primary search and triggers setSearchQuery', () => {
    const setSearchQuery = vi.fn();
    render(<ReceiptToolbar {...defaultProps} setSearchQuery={setSearchQuery} />);

    const searchInput = screen.getByPlaceholderText(/Search by client, receipt or ref ID/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    expect(setSearchQuery).toHaveBeenCalledWith('John Doe');
  });

  it('renders quick clear button inside search when searchQuery is present', () => {
    const setSearchQuery = vi.fn();
    render(
      <ReceiptToolbar {...defaultProps} searchQuery="John Doe" setSearchQuery={setSearchQuery} />
    );

    const clearButton = screen.getByLabelText(/Clear search input/i);
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(setSearchQuery).toHaveBeenCalledWith('');
  });

  it('triggers setMethodFilter when method dropdown selection changes', () => {
    const setMethodFilter = vi.fn();
    render(<ReceiptToolbar {...defaultProps} setMethodFilter={setMethodFilter} />);

    const select = screen.getByLabelText(/Filter by payment method/i);
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'UPI' } });
    expect(setMethodFilter).toHaveBeenCalledWith('UPI');
  });

  it('triggers setSortConfig when sort dropdown selection changes', () => {
    const setSortConfig = vi.fn();
    render(<ReceiptToolbar {...defaultProps} setSortConfig={setSortConfig} />);

    const sortSelect = screen.getByLabelText(/Sort receipts/i);
    expect(sortSelect).toBeInTheDocument();

    fireEvent.change(sortSelect, { target: { value: 'amount-desc' } });
    expect(setSortConfig).toHaveBeenCalledWith({ key: 'amount', direction: 'desc' });
  });

  it('triggers setDateRange when start and end date inputs change', () => {
    const setDateRange = vi.fn();
    render(<ReceiptToolbar {...defaultProps} setDateRange={setDateRange} />);

    const startDateInput = screen.getByLabelText(/Start date/i);
    const endDateInput = screen.getByLabelText(/End date/i);

    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } });
    expect(setDateRange).toHaveBeenCalled();

    fireEvent.change(endDateInput, { target: { value: '2026-01-31' } });
    expect(setDateRange).toHaveBeenCalled();
  });

  it('renders page size dropdown and triggers setPageSize', () => {
    const setPageSize = vi.fn();
    render(<ReceiptToolbar {...defaultProps} pageSize={25} setPageSize={setPageSize} />);

    const pageSizeSelect = screen.getByLabelText(/Page size/i);
    expect(pageSizeSelect).toBeInTheDocument();

    fireEvent.change(pageSizeSelect, { target: { value: '50' } });
    expect(setPageSize).toHaveBeenCalledWith(50);
  });

  it('opens export menu and triggers CSV and Excel callbacks', () => {
    const onExportCsv = vi.fn();
    const onExportExcel = vi.fn();
    render(
      <ReceiptToolbar {...defaultProps} onExportCsv={onExportCsv} onExportExcel={onExportExcel} />
    );

    const exportBtn = screen.getByLabelText(/Export options/i);
    expect(exportBtn).toBeInTheDocument();

    // Menu initially closed
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    expect(screen.queryByText('Export Excel')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(exportBtn);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export Excel')).toBeInTheDocument();

    // Click Export CSV
    fireEvent.click(screen.getByText('Export CSV'));
    expect(onExportCsv).toHaveBeenCalledTimes(1);

    // Menu closes after export selection
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();

    // Reopen and test Excel
    fireEvent.click(exportBtn);
    fireEvent.click(screen.getByText('Export Excel'));
    expect(onExportExcel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Export Excel')).not.toBeInTheDocument();
  });

  it('closes export menu on Escape key press and outside click', () => {
    render(<ReceiptToolbar {...defaultProps} onExportCsv={vi.fn()} />);

    const exportBtn = screen.getByLabelText(/Export options/i);
    fireEvent.click(exportBtn);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();

    // Escape closes menu
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();

    // Click outside closes menu
    fireEvent.click(exportBtn);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('triggers onOpenLedgers when ledgers button is clicked', () => {
    const onOpenLedgers = vi.fn();
    render(<ReceiptToolbar {...defaultProps} onOpenLedgers={onOpenLedgers} />);

    const ledgersBtn = screen.getByTitle(/Customer Ledgers Overview/i);
    fireEvent.click(ledgersBtn);
    expect(onOpenLedgers).toHaveBeenCalledTimes(1);
  });

  it('renders trash / active toggle button and triggers setActiveTab', () => {
    const setActiveTab = vi.fn();
    render(
      <ReceiptToolbar
        {...defaultProps}
        activeTab="active"
        setActiveTab={setActiveTab}
        trashedCount={3}
      />
    );

    const trashBtn = screen.getByTitle(/View Trash & Recover Deleted Receipts/i);
    expect(trashBtn).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(trashBtn);
    expect(setActiveTab).toHaveBeenCalledWith('trash');
  });

  it('renders active filters banner and triggers handleClearFilters', () => {
    const handleClearFilters = vi.fn();
    const setSearchQuery = vi.fn();
    const setMethodFilter = vi.fn();
    const setDateRange = vi.fn();

    const { rerender } = render(
      <ReceiptToolbar
        {...defaultProps}
        searchQuery=""
        methodFilter=""
        dateRange={{ start: '', end: '' }}
      />
    );

    // No banner when no filters active
    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();

    // Rerender with active filters
    rerender(
      <ReceiptToolbar
        {...defaultProps}
        searchQuery="Plot 42"
        methodFilter="UPI"
        dateRange={{ start: '2026-01-01', end: '2026-01-31' }}
        handleClearFilters={handleClearFilters}
        setSearchQuery={setSearchQuery}
        setMethodFilter={setMethodFilter}
        setDateRange={setDateRange}
      />
    );

    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText(/"Plot 42"/)).toBeInTheDocument();
    expect(screen.getByText(/Method:/)).toBeInTheDocument();
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument();

    // Individual clear buttons work
    const removeSearchBtn = screen.getByLabelText(/Remove search filter/i);
    fireEvent.click(removeSearchBtn);
    expect(setSearchQuery).toHaveBeenCalledWith('');

    const removeMethodBtn = screen.getByLabelText(/Remove method filter/i);
    fireEvent.click(removeMethodBtn);
    expect(setMethodFilter).toHaveBeenCalledWith('');

    const removeDateBtn = screen.getByLabelText(/Remove date filter/i);
    fireEvent.click(removeDateBtn);
    expect(setDateRange).toHaveBeenCalledWith({ start: '', end: '' });

    // Clear all filters button
    const clearAllBtn = screen.getByText(/Clear All Filters/i);
    fireEvent.click(clearAllBtn);
    expect(handleClearFilters).toHaveBeenCalledTimes(1);
  });
});
