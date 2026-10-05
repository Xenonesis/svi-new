import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  ReceiptStatsCards,
  StatCardSkeleton,
} from '@/src/components/admin/payment-receipts/ReceiptStatsCards';

describe('ReceiptStatsCards', () => {
  it('renders 4 skeleton cards when loading is true', () => {
    const { container } = render(
      <ReceiptStatsCards
        loading={true}
        totalCount={100}
        totalAmount={500000}
        upiCount={60}
        cashCount={40}
      />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
    expect(screen.queryByText('Total Receipts')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Collected')).not.toBeInTheDocument();
  });

  it('renders StatCardSkeleton component directly', () => {
    const { container } = render(<StatCardSkeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders all 4 executive metric cards when loaded', () => {
    render(
      <ReceiptStatsCards
        loading={false}
        totalCount={200}
        totalAmount={2550000}
        upiCount={140}
        cashCount={60}
      />
    );

    // Card 1: Total Receipts
    expect(screen.getByText('Total Receipts')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Active client transactions')).toBeInTheDocument();

    // Card 2: Total Collected (Hero Card)
    expect(screen.getByText('Total Collected')).toBeInTheDocument();
    expect(screen.getByText('₹25,50,000')).toBeInTheDocument();
    expect(screen.getByText('Audited real estate payments')).toBeInTheDocument();

    // Card 3: UPI Receipts with volume share
    expect(screen.getByText('UPI Receipts')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('70% of receipts')).toBeInTheDocument();

    // Card 4: Cash Receipts with direct branch share
    expect(screen.getByText('Cash Receipts')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('30% direct branch receipts')).toBeInTheDocument();
  });

  it('handles zero state safely without NaN or division by zero errors', () => {
    render(
      <ReceiptStatsCards
        loading={false}
        totalCount={0}
        totalAmount={0}
        upiCount={0}
        cashCount={0}
      />
    );

    expect(screen.getByText('Total Receipts')).toBeInTheDocument();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('₹0')).toBeInTheDocument();
    expect(screen.getByText('0% of receipts')).toBeInTheDocument();
    expect(screen.getByText('0% direct branch receipts')).toBeInTheDocument();
  });

  it('formats large values using Indian number system (en-IN)', () => {
    render(
      <ReceiptStatsCards
        loading={false}
        totalCount={12500}
        totalAmount={150000000}
        upiCount={10000}
        cashCount={2500}
      />
    );

    expect(screen.getByText('12,500')).toBeInTheDocument();
    expect(screen.getByText('₹15,00,00,000')).toBeInTheDocument();
    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText('80% of receipts')).toBeInTheDocument();
    expect(screen.getByText('20% direct branch receipts')).toBeInTheDocument();
  });
});
