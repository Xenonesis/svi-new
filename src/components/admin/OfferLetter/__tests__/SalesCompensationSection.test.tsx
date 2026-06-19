/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { SalesCompensationSection } from '../SalesCompensationSection';

describe('SalesCompensationSection', () => {
  const mockProps = {
    department: 'Sales',
    salesCompensationType: '',
    probationPeriod: '3',
    noSaleMonths: '',
    subsistenceAllowance: '',
    customSalaryPercent: '',
    salaryCtc: '25000',
    onValueChange: vi.fn(),
    onToggleType: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when department is not Sales', () => {
    const { container } = render(<SalesCompensationSection {...mockProps} department="IT" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders compensation type options when department is Sales', () => {
    render(<SalesCompensationSection {...mockProps} />);

    expect(screen.getByText('Sales Compensation Policy')).toBeInTheDocument();
    expect(screen.getByText('No Sale No Salary')).toBeInTheDocument();
    expect(screen.getByText('Custom % of Salary')).toBeInTheDocument();
  });

  it('calls onToggleType when compensation type is clicked', () => {
    render(<SalesCompensationSection {...mockProps} />);

    fireEvent.click(screen.getByText('No Sale No Salary'));

    expect(mockProps.onToggleType).toHaveBeenCalledWith('no_sale_no_salary');
  });

  it('shows No Sale No Salary options when selected', () => {
    render(<SalesCompensationSection {...mockProps} salesCompensationType="no_sale_no_salary" />);

    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Subsistence Allowance')).toBeInTheDocument();
  });

  it('shows Custom % options when selected', () => {
    render(<SalesCompensationSection {...mockProps} salesCompensationType="custom_percent" />);

    expect(screen.getByText('Guaranteed Salary (%)')).toBeInTheDocument();
  });

  it('calls onValueChange when input values change', () => {
    render(<SalesCompensationSection {...mockProps} salesCompensationType="no_sale_no_salary" />);

    const monthsSelect = document.querySelector('[name="noSaleMonths"]') as HTMLSelectElement;
    fireEvent.change(monthsSelect, { target: { value: '6' } });

    expect(mockProps.onValueChange).toHaveBeenCalledWith('noSaleMonths', '6');
  });
});
