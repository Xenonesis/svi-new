import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RefIdAutocomplete from '@/app/admin/payment-receipt/components/RefIdAutocomplete';
import { RefIdProfile } from '@/src/lib/receipt/refIdProfiles';

const mockProfiles: RefIdProfile[] = [
  {
    refId: 'SVI-2051',
    name: 'Piyush Sharma',
    salutation: 'Mr.',
    clientPhone: '9876543210',
    plotNo: '42',
    plotSize: '1000 sq ft',
    account: 'SVI Residency',
    source: 'receipt',
    date: '2026-09-01',
  },
  {
    refId: 'SVI-2052',
    name: 'Anita Verma',
    salutation: 'Mrs.',
    clientPhone: '9811122233',
    plotNo: '108',
    plotSize: '1500 sq ft',
    account: 'Green Palms',
    source: 'candidate',
    date: '2026-08-15',
  },
  {
    refId: 'SVI-9999',
    name: 'Rahul Gupta',
    salutation: 'Mr.',
    clientPhone: '9700011122',
    plotNo: '',
    plotSize: '800 sq ft',
    account: 'City Park',
    source: 'receipt',
  },
];

describe('RefIdAutocomplete', () => {
  it('renders with initial value and combobox attributes', () => {
    const handleChange = vi.fn();
    render(
      <RefIdAutocomplete
        value="SVI-2051"
        onChange={handleChange}
        profiles={mockProfiles}
        id="test-ref-id"
      />
    );

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('SVI-2051');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(screen.queryByRole('listbox')).toBeNull();

    // Clear button should be present when value is non-empty
    const clearButton = screen.getByLabelText('Clear Ref. ID');
    expect(clearButton).toBeDefined();
  });

  it('typing opens dropdown and shows filtered suggestions', () => {
    const handleChange = vi.fn();
    render(<RefIdAutocomplete value="" onChange={handleChange} profiles={mockProfiles} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Anita' } });

    expect(handleChange).toHaveBeenCalledWith('Anita');
    expect(input.getAttribute('aria-expanded')).toBe('true');

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeDefined();

    // SVI-2052 Anita Verma should be displayed
    expect(screen.getByText('SVI-2052')).toBeDefined();
    expect(screen.getByText('Anita Verma')).toBeDefined();
    expect(screen.getByText('Allotment')).toBeDefined();
    expect(
      screen.getByText('Phone: 9811122233 • Plot: 108 • Size: 1500 sq ft • Project: Green Palms')
    ).toBeDefined();

    // Other non-matching profiles should not be in the filtered list
    expect(screen.queryByText('Piyush Sharma')).toBeNull();
  });

  it('clicking suggestion invokes onChange and onSelectProfile', () => {
    const handleChange = vi.fn();
    const handleSelectProfile = vi.fn();

    render(
      <RefIdAutocomplete
        value=""
        onChange={handleChange}
        onSelectProfile={handleSelectProfile}
        profiles={mockProfiles}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByRole('listbox')).toBeDefined();
    const firstOption = screen.getByText('Piyush Sharma').closest('li');
    expect(firstOption).not.toBeNull();

    if (firstOption) {
      fireEvent.click(firstOption);
    }

    expect(handleChange).toHaveBeenCalledWith('SVI-2051');
    expect(handleSelectProfile).toHaveBeenCalledWith(mockProfiles[0]);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('clearing query with X button calls onChange with empty string', () => {
    const handleChange = vi.fn();
    render(<RefIdAutocomplete value="SVI-2051" onChange={handleChange} profiles={mockProfiles} />);

    const clearButton = screen.getByLabelText('Clear Ref. ID');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('keyboard ArrowDown and Enter selects active item', () => {
    const handleChange = vi.fn();
    const handleSelectProfile = vi.fn();

    render(
      <RefIdAutocomplete
        value=""
        onChange={handleChange}
        onSelectProfile={handleSelectProfile}
        profiles={mockProfiles}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    // ArrowDown highlights first suggestion (SVI-2051)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBe('true');

    // ArrowDown again highlights second suggestion (SVI-2052)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(options[1].getAttribute('aria-selected')).toBe('true');

    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('SVI-2052');
    expect(handleSelectProfile).toHaveBeenCalledWith(mockProfiles[1]);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('keyboard ArrowUp navigates backwards', () => {
    const handleChange = vi.fn();
    const handleSelectProfile = vi.fn();

    render(
      <RefIdAutocomplete
        value=""
        onChange={handleChange}
        onSelectProfile={handleSelectProfile}
        profiles={mockProfiles}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    // ArrowDown then ArrowDown
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[1].getAttribute('aria-selected')).toBe('true');

    // ArrowUp goes back to first item
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(options[0].getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith('SVI-2051');
  });

  it('Escape closes dropdown', () => {
    render(<RefIdAutocomplete value="" onChange={vi.fn()} profiles={mockProfiles} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeDefined();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('Tab closes dropdown cleanly', () => {
    render(<RefIdAutocomplete value="" onChange={vi.fn()} profiles={mockProfiles} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeDefined();

    fireEvent.keyDown(input, { key: 'Tab' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('clicking outside closes dropdown', () => {
    render(
      <div>
        <RefIdAutocomplete value="" onChange={vi.fn()} profiles={mockProfiles} />
        <button data-testid="outside-button">Outside</button>
      </div>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId('outside-button'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('handles disabled state properly', () => {
    render(
      <RefIdAutocomplete
        value="SVI-2051"
        onChange={vi.fn()}
        profiles={mockProfiles}
        disabled={true}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input.hasAttribute('disabled')).toBe(true);

    // Clear button should not appear when disabled
    expect(screen.queryByLabelText('Clear Ref. ID')).toBeNull();

    // Focusing or typing does not open dropdown
    fireEvent.focus(input);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('shows empty fallback when no matching profile is found', () => {
    render(
      <RefIdAutocomplete value="NONEXISTENT-999" onChange={vi.fn()} profiles={mockProfiles} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByText('No matching Ref. IDs found. Enter custom Ref ID.')).toBeDefined();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('handles N/A fallback for missing plotNo', () => {
    render(<RefIdAutocomplete value="SVI-9999" onChange={vi.fn()} profiles={mockProfiles} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(
      screen.getByText('Phone: 9700011122 • Plot: N/A • Size: 800 sq ft • Project: City Park')
    ).toBeDefined();
    expect(screen.getByText('Receipt')).toBeDefined();
  });

  it('filters suggestions by Receipts and Allotments tabs', () => {
    render(<RefIdAutocomplete value="" onChange={vi.fn()} profiles={mockProfiles} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    // All tab is default: all 3 profiles visible
    expect(screen.getByText('SVI-2051')).toBeDefined();
    expect(screen.getByText('SVI-2052')).toBeDefined();
    expect(screen.getByText('SVI-9999')).toBeDefined();

    // Click "Receipts" tab
    const receiptsTab = screen.getByRole('button', { name: 'Filter receipts' });
    fireEvent.click(receiptsTab);

    // Only receipts should remain
    expect(screen.getByText('SVI-2051')).toBeDefined();
    expect(screen.getByText('SVI-9999')).toBeDefined();
    expect(screen.queryByText('SVI-2052')).toBeNull();

    // Click "Allotments" tab
    const allotmentsTab = screen.getByRole('button', { name: 'Filter allotments' });
    fireEvent.click(allotmentsTab);

    // Only allotment should remain
    expect(screen.getByText('SVI-2052')).toBeDefined();
    expect(screen.queryByText('SVI-2051')).toBeNull();
    expect(screen.queryByText('SVI-9999')).toBeNull();

    // Click "All" tab to restore
    const allTab = screen.getByRole('button', { name: 'Filter all' });
    fireEvent.click(allTab);
    expect(screen.getByText('SVI-2051')).toBeDefined();
    expect(screen.getByText('SVI-2052')).toBeDefined();
    expect(screen.getByText('SVI-9999')).toBeDefined();
  });

  it('sorts suggestions when sort option is selected', () => {
    render(<RefIdAutocomplete value="" onChange={vi.fn()} profiles={mockProfiles} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    // Open sort menu
    const sortTrigger = screen.getByRole('button', { name: 'Sort options' });
    fireEvent.click(sortTrigger);

    // Select "Name (A → Z)"
    const nameSortBtn = screen.getByRole('button', { name: /Name \(A → Z\)/i });
    fireEvent.click(nameSortBtn);

    // List items should now be sorted: Anita Verma (SVI-2052), Piyush Sharma (SVI-2051), Rahul Gupta (SVI-9999)
    const options = screen.getAllByRole('option');
    expect(options[0].textContent).toContain('Anita Verma');
    expect(options[1].textContent).toContain('Piyush Sharma');
    expect(options[2].textContent).toContain('Rahul Gupta');
  });
});
