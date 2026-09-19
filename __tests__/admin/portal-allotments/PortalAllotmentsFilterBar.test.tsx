import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortalAllotmentsFilterBar } from '@/src/components/admin/portal-allotments/PortalAllotmentsFilterBar';
import type { PortalAllotmentsFilterBarProps } from '@/src/components/admin/portal-allotments/PortalAllotmentsFilterBar';

describe('PortalAllotmentsFilterBar', () => {
  const defaultProps: PortalAllotmentsFilterBarProps = {
    searchTerm: '',
    onSearchChange: vi.fn(),
    searchPlaceholder: 'Search by client, property, unit...',
    selectedProperty: 'all',
    onPropertyChange: vi.fn(),
    properties: [
      { id: 'prop-1', name: 'Shyam Aangan' },
      { id: 'prop-2', name: 'Emerald Heights' },
    ],
    selectedPaymentStatus: 'all',
    onPaymentStatusChange: vi.fn(),
    selectedSaleMode: 'all',
    onSaleModeChange: vi.fn(),
    selectedAdvisor: 'all',
    onAdvisorChange: vi.fn(),
    advisors: ['Aarav Patel', 'Priya Sharma'],
    activeFilterCount: 0,
    onResetFilters: vi.fn(),
    viewMode: 'table',
    onViewModeChange: vi.fn(),
  };

  it('renders search input and all 4 dropdown filters', () => {
    render(<PortalAllotmentsFilterBar {...defaultProps} />);

    // 1. Search input
    const searchInput = screen.getByPlaceholderText('Search by client, property, unit...');
    expect(searchInput).toBeDefined();

    // 2. Property dropdown
    const propertySelect = screen.getByLabelText(/property/i);
    expect(propertySelect).toBeDefined();
    expect(screen.getByRole('option', { name: /all properties/i })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Shyam Aangan' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Emerald Heights' })).toBeDefined();

    // 3. Payment Status dropdown
    const paymentSelect = screen.getByLabelText(/payment status/i);
    expect(paymentSelect).toBeDefined();
    expect(screen.getByRole('option', { name: /all payment statuses/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /100% fully paid/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /partially paid/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /overdue milestones/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /unpaid \(0%\)/i })).toBeDefined();

    // 4. Sale Mode dropdown
    const saleModeSelect = screen.getByLabelText(/sale mode/i);
    expect(saleModeSelect).toBeDefined();
    expect(screen.getByRole('option', { name: /all sale modes/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /direct sell/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /draw allotment/i })).toBeDefined();

    // 5. Advisor dropdown
    const advisorSelect = screen.getByLabelText(/advisor/i);
    expect(advisorSelect).toBeDefined();
    expect(screen.getByRole('option', { name: /all advisors/i })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Aarav Patel' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Priya Sharma' })).toBeDefined();
  });

  it('triggers onSearchChange when typing into search input', () => {
    const onSearchChange = vi.fn();
    render(<PortalAllotmentsFilterBar {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search by client, property, unit...');
    fireEvent.change(searchInput, { target: { value: 'Rajesh' } });

    expect(onSearchChange).toHaveBeenCalledWith('Rajesh');
  });

  it('triggers onSearchChange with empty string when clicking clear button', () => {
    const onSearchChange = vi.fn();
    render(
      <PortalAllotmentsFilterBar
        {...defaultProps}
        searchTerm="Villa 42"
        onSearchChange={onSearchChange}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeDefined();
    fireEvent.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('triggers onPropertyChange when selecting a property', () => {
    const onPropertyChange = vi.fn();
    render(<PortalAllotmentsFilterBar {...defaultProps} onPropertyChange={onPropertyChange} />);

    const propertySelect = screen.getByLabelText(/property/i);
    fireEvent.change(propertySelect, { target: { value: 'prop-1' } });

    expect(onPropertyChange).toHaveBeenCalledWith('prop-1');
  });

  it('triggers onPaymentStatusChange when selecting a payment status', () => {
    const onPaymentStatusChange = vi.fn();
    render(
      <PortalAllotmentsFilterBar {...defaultProps} onPaymentStatusChange={onPaymentStatusChange} />
    );

    const paymentSelect = screen.getByLabelText(/payment status/i);
    fireEvent.change(paymentSelect, { target: { value: 'fully_paid' } });

    expect(onPaymentStatusChange).toHaveBeenCalledWith('fully_paid');
  });

  it('triggers onSaleModeChange when selecting a sale mode', () => {
    const onSaleModeChange = vi.fn();
    render(<PortalAllotmentsFilterBar {...defaultProps} onSaleModeChange={onSaleModeChange} />);

    const saleModeSelect = screen.getByLabelText(/sale mode/i);
    fireEvent.change(saleModeSelect, { target: { value: 'Direct Sell' } });

    expect(onSaleModeChange).toHaveBeenCalledWith('Direct Sell');
  });

  it('triggers onAdvisorChange when selecting an advisor', () => {
    const onAdvisorChange = vi.fn();
    render(<PortalAllotmentsFilterBar {...defaultProps} onAdvisorChange={onAdvisorChange} />);

    const advisorSelect = screen.getByLabelText(/advisor/i);
    fireEvent.change(advisorSelect, { target: { value: 'Aarav Patel' } });

    expect(onAdvisorChange).toHaveBeenCalledWith('Aarav Patel');
  });

  it('renders active filter badge and triggers onResetFilters when clicked', () => {
    const onResetFilters = vi.fn();
    render(
      <PortalAllotmentsFilterBar
        {...defaultProps}
        activeFilterCount={3}
        onResetFilters={onResetFilters}
      />
    );

    // Active filter count badge
    expect(screen.getByText('3')).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });

  it('toggles view mode between table and cards', () => {
    const onViewModeChange = vi.fn();
    render(
      <PortalAllotmentsFilterBar
        {...defaultProps}
        viewMode="table"
        onViewModeChange={onViewModeChange}
      />
    );

    const cardsButton = screen.getByRole('button', { name: /card view/i });
    fireEvent.click(cardsButton);

    expect(onViewModeChange).toHaveBeenCalledWith('cards');

    const tableButton = screen.getByRole('button', { name: /table view/i });
    fireEvent.click(tableButton);

    expect(onViewModeChange).toHaveBeenCalledWith('table');
  });
});
