import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentPlanPreview } from '@/src/components/admin/payment-plan/PaymentPlanPreview';
import {
  PaymentPlanFormData,
  PaymentPlanTotals,
  PaymentPlanScheduleItem,
} from '@/src/components/admin/payment-plan/types';

describe('PaymentPlanPreview', () => {
  const mockFormData: PaymentPlanFormData = {
    unitNo: 'A-101',
    plotSize: '200',
    propertyType: 'Residential Farm House',
    costPerSqYd: '3000',
    bookingAmount: '100000',
    emis: '3',
    startDate: '2026-09-07',
  };

  const mockTotals: PaymentPlanTotals = {
    totalCost: 600000,
    balance: 500000,
    emiAmount: 166666.67,
  };

  const mockSchedule: PaymentPlanScheduleItem[] = [
    { month: 1, date: '07/10/2026', amount: '166666.67' },
    { month: 2, date: '07/11/2026', amount: '166666.67' },
    { month: 3, date: '07/12/2026', amount: '166666.67' },
  ];

  it('renders payment plan title, property type, and summary details', () => {
    render(
      <PaymentPlanPreview formData={mockFormData} totals={mockTotals} schedule={mockSchedule} />
    );

    expect(screen.getByText('Payment Plan (3 Months)')).toBeInTheDocument();
    expect(screen.getByText('Residential Farm House')).toBeInTheDocument();
    expect(screen.getByText('A-101')).toBeInTheDocument();
    expect(screen.getByText('200 Sq. Yds.')).toBeInTheDocument();
  });

  it('renders initial payment and installments in schedule', () => {
    render(
      <PaymentPlanPreview formData={mockFormData} totals={mockTotals} schedule={mockSchedule} />
    );

    expect(screen.getByText('Initial Payment')).toBeInTheDocument();
    expect(screen.getByText('Installment 1')).toBeInTheDocument();
    expect(screen.getByText('Installment 2')).toBeInTheDocument();
    expect(screen.getByText('Installment 3')).toBeInTheDocument();
    expect(screen.getByText('07/10/2026')).toBeInTheDocument();
    expect(screen.getByText('07/11/2026')).toBeInTheDocument();
    expect(screen.getByText('07/12/2026')).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    render(
      <PaymentPlanPreview formData={mockFormData} totals={mockTotals} schedule={mockSchedule} />
    );

    expect(
      screen.getByText(/Disclaimer: This is a computer generated document/i)
    ).toBeInTheDocument();
  });
});
