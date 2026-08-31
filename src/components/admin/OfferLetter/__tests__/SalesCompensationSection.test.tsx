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
    expect(screen.getByText('Grace Period + Reduced %')).toBeInTheDocument();
  });

  it('calls onToggleType when compensation type is clicked', () => {
    render(<SalesCompensationSection {...mockProps} />);

    fireEvent.click(screen.getByText('No Sale No Salary'));
    expect(mockProps.onToggleType).toHaveBeenCalledWith('no_sale_no_salary');

    fireEvent.click(screen.getByText('Grace Period + Reduced %'));
    expect(mockProps.onToggleType).toHaveBeenCalledWith('grace_period_reduced_percent');
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

  it('shows Grace Period + Reduced % options and breakdown when selected', () => {
    render(
      <SalesCompensationSection
        {...mockProps}
        salesCompensationType="grace_period_reduced_percent"
        gracePeriodMonths="3"
        reducedSalaryPercent="50"
      />
    );

    expect(screen.getByText('Initial Full Salary Period (Months)')).toBeInTheDocument();
    expect(screen.getByText('Post-Grace Salary (% on No Sale)')).toBeInTheDocument();
    expect(screen.getByText(/Phase 1: Initial 3 Months/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2: Month 4\+/i)).toBeInTheDocument();
    expect(screen.getByText(/₹25,000\/month/i)).toBeInTheDocument();
    expect(screen.getByText(/₹12,500\/month/i)).toBeInTheDocument();
  });

  it('calls onValueChange when input values change', () => {
    render(<SalesCompensationSection {...mockProps} salesCompensationType="no_sale_no_salary" />);

    const monthsSelect = document.querySelector('[name="noSaleMonths"]') as HTMLSelectElement;
    fireEvent.change(monthsSelect, { target: { value: '6' } });

    expect(mockProps.onValueChange).toHaveBeenCalledWith('noSaleMonths', '6');
  });

  it('calls onValueChange when grace period inputs change', () => {
    render(
      <SalesCompensationSection
        {...mockProps}
        salesCompensationType="grace_period_reduced_percent"
      />
    );

    const graceSelect = document.querySelector('[name="gracePeriodMonths"]') as HTMLSelectElement;
    fireEvent.change(graceSelect, { target: { value: '4' } });
    expect(mockProps.onValueChange).toHaveBeenCalledWith('gracePeriodMonths', '4');

    const percentInput = document.querySelector(
      '[name="reducedSalaryPercent"]'
    ) as HTMLInputElement;
    fireEvent.change(percentInput, { target: { value: '40' } });
    expect(mockProps.onValueChange).toHaveBeenCalledWith('reducedSalaryPercent', '40');
  });

  it('renders Target-Linked Pro-Rata & Zero-Sale Policy toggle and calls onValueChange', () => {
    render(<SalesCompensationSection {...mockProps} />);

    expect(screen.getByText(/Target-Linked Pro-Rata & Zero-Sale Policy/i)).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', {
      name: /Target-Linked Pro-Rata & Zero-Sale Policy/i,
    });
    fireEvent.click(checkbox);

    expect(mockProps.onValueChange).toHaveBeenCalledWith('enablePartialTargetRule', true);
  });

  it('renders 3-tier breakdown when enablePartialTargetRule is true', () => {
    render(
      <SalesCompensationSection
        {...mockProps}
        enablePartialTargetRule={true}
        salaryCtc="30000"
        target="300"
      />
    );

    expect(screen.getByText(/Tier 1 · 100%\+ Quota/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2 · Under Quota \(>0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 3 · Zero Sales \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/₹15,000/i)).toBeInTheDocument();
    expect(screen.getByText(/Applies from Month 1/i)).toBeInTheDocument();
  });
});
