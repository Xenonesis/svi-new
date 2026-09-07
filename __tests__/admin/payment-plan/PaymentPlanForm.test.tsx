import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentPlanForm } from '@/src/components/admin/payment-plan/PaymentPlanForm';
import { PaymentPlanFormData } from '@/src/components/admin/payment-plan/types';

describe('PaymentPlanForm', () => {
  const defaultFormData: PaymentPlanFormData = {
    unitNo: 'B-202',
    plotSize: '150',
    propertyType: 'Residential Farm House',
    costPerSqYd: '3500',
    bookingAmount: '100000',
    emis: '6',
    startDate: '2026-09-07',
  };

  it('renders form inputs and submit button', () => {
    const mockOnChange = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <PaymentPlanForm formData={defaultFormData} onChange={mockOnChange} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByText('Plan Configuration')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B-202')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-09-07')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Calculate & Generate Plan/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('triggers onChange when input values change', () => {
    const mockOnChange = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <PaymentPlanForm formData={defaultFormData} onChange={mockOnChange} onSubmit={mockOnSubmit} />
    );

    const unitInput = screen.getByDisplayValue('B-202');
    fireEvent.change(unitInput, { target: { name: 'unitNo', value: 'C-303' } });

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('triggers onSubmit when form is submitted', () => {
    const mockOnChange = vi.fn();
    const mockOnSubmit = vi.fn((e) => e.preventDefault());

    render(
      <PaymentPlanForm formData={defaultFormData} onChange={mockOnChange} onSubmit={mockOnSubmit} />
    );

    const submitBtn = screen.getByRole('button', { name: /Calculate & Generate Plan/i });
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
